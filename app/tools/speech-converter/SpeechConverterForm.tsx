"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import VoiceInstallGuide from "./VoiceInstallGuide";

/* ------------------------- Tipos de reconocimiento -------------------------
   La Web Speech API de reconocimiento no forma parte de lib.dom de TypeScript,
   así que se declaran los mínimos que usamos. Los nombres llevan sufijo para
   no chocar con futuras definiciones nativas. */

interface RecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface RecognitionResult {
  readonly length: number;
  readonly isFinal: boolean;
  [index: number]: RecognitionAlternative;
}

interface RecognitionResultList {
  readonly length: number;
  [index: number]: RecognitionResult;
}

interface RecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: RecognitionResultList;
}

interface RecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface RecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: RecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

type RecognitionConstructor = new () => RecognitionInstance;

function getRecognitionConstructor(): RecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionConstructor;
    webkitSpeechRecognition?: RecognitionConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/* ---------------------------- Soporte del navegador -----------------------
   Se lee con useSyncExternalStore para que el HTML estático y la hidratación
   coincidan: en el servidor devuelve null y solo en el cliente se resuelve. */

interface BrowserSupport {
  tts: boolean;
  stt: boolean;
}

let cachedSupport: BrowserSupport | null = null;

function getSupportSnapshot(): BrowserSupport {
  if (!cachedSupport) {
    cachedSupport = {
      tts: typeof window !== "undefined" && "speechSynthesis" in window,
      stt: getRecognitionConstructor() !== null,
    };
  }
  return cachedSupport;
}

// El soporte no cambia durante la vida de la página: no hay nada a lo que suscribirse.
const subscribeToSupport = () => () => {};
const getServerSupport = () => null;

/* --------------------------------- Datos --------------------------------- */

const RECOGNITION_LANGUAGES = [
  { code: "es-MX", label: "Español (México)" },
  { code: "es-ES", label: "Español (España)" },
  { code: "es-AR", label: "Español (Argentina)" },
  { code: "es-CO", label: "Español (Colombia)" },
  { code: "en-US", label: "Inglés (EE. UU.)" },
  { code: "en-GB", label: "Inglés (Reino Unido)" },
  { code: "pt-BR", label: "Portugués (Brasil)" },
  { code: "fr-FR", label: "Francés" },
  { code: "de-DE", label: "Alemán" },
  { code: "it-IT", label: "Italiano" },
  { code: "nl-NL", label: "Neerlandés" },
  { code: "ru-RU", label: "Ruso" },
  { code: "ja-JP", label: "Japonés" },
  { code: "zh-CN", label: "Chino (simplificado)" },
  { code: "ko-KR", label: "Coreano" },
  { code: "ar-SA", label: "Árabe" },
];

const RECOGNITION_ERRORS: Record<string, string> = {
  "not-allowed":
    "El navegador bloqueó el micrófono. Concede el permiso desde el candado de la barra de direcciones.",
  "service-not-allowed":
    "El servicio de reconocimiento no está disponible en este navegador o está bloqueado.",
  "audio-capture":
    "No se detectó ningún micrófono. Conecta uno y vuelve a intentarlo.",
  network: "Error de red durante el reconocimiento de voz. Revisa tu conexión.",
  "no-speech": "No se detectó ninguna voz. Habla más cerca del micrófono.",
};

// Chrome corta las locuciones largas a los ~15 segundos. Trocear el texto en
// fragmentos cortos y encolarlos evita ese corte sin hacks de pause/resume.
const MAX_CHUNK_LENGTH = 180;

function splitIntoChunks(text: string, max = MAX_CHUNK_LENGTH): string[] {
  const clean = text.trim();
  if (!clean) return [];

  const sentences = clean.match(/[^.!?…]+[.!?…]*/g) ?? [clean];
  const chunks: string[] = [];
  let current = "";

  const push = () => {
    if (current) chunks.push(current);
    current = "";
  };

  const append = (piece: string) => {
    const next = current ? `${current} ${piece}` : piece;
    if (next.length > max) {
      push();
      current = piece;
    } else {
      current = next;
    }
  };

  for (const sentence of sentences) {
    const piece = sentence.trim();
    if (!piece) continue;

    if (piece.length > max) {
      // Frase demasiado larga: se reparte palabra por palabra.
      for (const word of piece.split(/\s+/)) append(word);
      continue;
    }
    append(piece);
  }

  push();
  return chunks;
}

/* -------------------------------- Componente ------------------------------ */

export default function SpeechConverterForm() {
  // Soporte del navegador: null durante el render del servidor y la hidratación.
  const support = useSyncExternalStore<BrowserSupport | null>(
    subscribeToSupport,
    getSupportSnapshot,
    getServerSupport
  );

  // Texto a voz
  const [text, setText] = useState("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceURI, setVoiceURI] = useState("");
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [ttsError, setTtsError] = useState("");
  // Chrome puede recolectar las locuciones en curso; mantenerlas referenciadas.
  const utterancesRef = useRef<SpeechSynthesisUtterance[]>([]);

  // Voz a texto
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [sttLang, setSttLang] = useState("es-MX");
  const [isListening, setIsListening] = useState(false);
  const [sttError, setSttError] = useState("");
  const [copied, setCopied] = useState(false);
  const recognitionRef = useRef<RecognitionInstance | null>(null);
  const keepListeningRef = useRef(false);

  /* ------------------------------ Inicialización --------------------------- */

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const synth = window.speechSynthesis;
    const loadVoices = () => {
      const available = synth.getVoices();
      if (!available.length) return;
      setVoices(available);
      setVoiceURI((previous) => {
        if (previous && available.some((v) => v.voiceURI === previous)) {
          return previous;
        }
        const spanish = available.find((v) => v.lang.toLowerCase().startsWith("es"));
        return (spanish ?? available[0]).voiceURI;
      });
    };

    loadVoices();
    // La lista llega de forma asíncrona en Chrome.
    synth.addEventListener("voiceschanged", loadVoices);

    return () => {
      synth.removeEventListener("voiceschanged", loadVoices);
      synth.cancel();
    };
  }, []);

  useEffect(() => {
    return () => {
      keepListeningRef.current = false;
      recognitionRef.current?.abort();
    };
  }, []);

  /* -------------------------------- Texto a voz ---------------------------- */

  const stopSpeaking = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    utterancesRef.current = [];
    setIsSpeaking(false);
    setIsPaused(false);
    setProgress({ current: 0, total: 0 });
  }, []);

  const speak = () => {
    if (!support?.tts) return;

    const chunks = splitIntoChunks(text);
    if (!chunks.length) return;

    const synth = window.speechSynthesis;
    synth.cancel();
    setTtsError("");

    const selectedVoice = voices.find((v) => v.voiceURI === voiceURI) ?? null;

    const utterances = chunks.map((chunk, index) => {
      const utterance = new SpeechSynthesisUtterance(chunk);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang;
      }
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;

      utterance.onstart = () =>
        setProgress({ current: index + 1, total: chunks.length });

      utterance.onerror = (event) => {
        // "interrupted"/"canceled" son consecuencia de pulsar Detener.
        if (event.error !== "interrupted" && event.error !== "canceled") {
          setTtsError("No se pudo reproducir el texto. Intenta de nuevo.");
        }
        setIsSpeaking(false);
        setIsPaused(false);
        setProgress({ current: 0, total: 0 });
      };

      if (index === chunks.length - 1) {
        utterance.onend = () => {
          setIsSpeaking(false);
          setIsPaused(false);
          setProgress({ current: 0, total: 0 });
          utterancesRef.current = [];
        };
      }

      return utterance;
    });

    utterancesRef.current = utterances;
    setIsSpeaking(true);
    setIsPaused(false);
    setProgress({ current: 0, total: chunks.length });
    utterances.forEach((utterance) => synth.speak(utterance));
  };

  const togglePause = () => {
    if (!support?.tts) return;
    const synth = window.speechSynthesis;
    if (isPaused) {
      synth.resume();
      setIsPaused(false);
    } else {
      synth.pause();
      setIsPaused(true);
    }
  };

  /* -------------------------------- Voz a texto ---------------------------- */

  const startListening = () => {
    const Recognition = getRecognitionConstructor();
    if (!Recognition) return;

    const recognition = new Recognition();
    recognition.lang = sttLang;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result.isFinal) finalText += result[0].transcript;
        else interimText += result[0].transcript;
      }

      if (finalText.trim()) {
        setTranscript((previous) =>
          previous ? `${previous.trimEnd()} ${finalText.trim()}` : finalText.trim()
        );
      }
      setInterim(interimText);
    };

    recognition.onerror = (event) => {
      if (event.error === "aborted") return;
      setSttError(
        RECOGNITION_ERRORS[event.error] ??
          "Ocurrió un error durante el reconocimiento de voz."
      );
      // Ante un fallo de permisos o de hardware no tiene sentido reintentar.
      if (event.error !== "no-speech") {
        keepListeningRef.current = false;
      }
    };

    recognition.onend = () => {
      setInterim("");
      // El navegador corta la sesión tras unos segundos de silencio: se reanuda
      // mientras el usuario no haya pulsado Detener.
      if (keepListeningRef.current) {
        try {
          recognition.start();
          return;
        } catch {
          keepListeningRef.current = false;
        }
      }
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    keepListeningRef.current = true;
    setSttError("");

    try {
      recognition.start();
      setIsListening(true);
    } catch {
      keepListeningRef.current = false;
      setIsListening(false);
      setSttError("No se pudo iniciar el micrófono. Intenta de nuevo.");
    }
  };

  const stopListening = () => {
    keepListeningRef.current = false;
    recognitionRef.current?.stop();
    setIsListening(false);
    setInterim("");
  };

  /* --------------------------------- Utilidades ---------------------------- */

  const copyTranscript = async () => {
    if (!transcript) return;
    try {
      await navigator.clipboard.writeText(transcript);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setSttError("El navegador no permitió copiar al portapapeles.");
    }
  };

  const downloadTranscript = () => {
    if (!transcript) return;
    const blob = new Blob([transcript], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "transcripcion.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  const sendToReader = () => {
    if (!transcript) return;
    setText(transcript);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearTranscript = () => {
    setTranscript("");
    setInterim("");
    setSttError("");
  };

  /* --------------------------------- Render -------------------------------- */

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Convertidor de Texto a Voz y Voz a Texto
          </h1>
          <p className="text-slate-500">
            Escucha cualquier texto en voz alta o dicta con el micrófono para
            convertirlo en texto. Todo ocurre en tu navegador.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ------------------------- Texto a voz ------------------------- */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-indigo-700 p-4">
              <h2 className="text-white font-semibold flex items-center gap-2">
                🔊 Texto a voz
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {support && !support.tts && (
                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
                  Tu navegador no admite la síntesis de voz. Prueba con Chrome,
                  Edge o Safari actualizados.
                </p>
              )}

              <textarea
                className="w-full h-40 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none text-slate-700 text-sm"
                placeholder="Escribe o pega el texto que quieres escuchar..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{text.length} caracteres</span>
                {progress.total > 0 && (
                  <span className="text-indigo-600 font-semibold">
                    Fragmento {progress.current} de {progress.total}
                  </span>
                )}
              </div>

              <div>
                <label
                  htmlFor="voice"
                  className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1"
                >
                  Voz
                </label>
                <select
                  id="voice"
                  value={voiceURI}
                  onChange={(e) => setVoiceURI(e.target.value)}
                  disabled={!voices.length || isSpeaking}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm font-medium shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-slate-100 disabled:text-slate-400"
                >
                  {voices.length === 0 && (
                    <option value="">Cargando voces disponibles...</option>
                  )}
                  {voices.map((voice) => (
                    <option key={voice.voiceURI} value={voice.voiceURI}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="rate"
                    className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1"
                  >
                    Velocidad {rate.toFixed(1)}x
                  </label>
                  <input
                    id="rate"
                    type="range"
                    min={0.5}
                    max={2}
                    step={0.1}
                    value={rate}
                    onChange={(e) => setRate(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>
                <div>
                  <label
                    htmlFor="pitch"
                    className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1"
                  >
                    Tono {pitch.toFixed(1)}
                  </label>
                  <input
                    id="pitch"
                    type="range"
                    min={0}
                    max={2}
                    step={0.1}
                    value={pitch}
                    onChange={(e) => setPitch(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>
                <div>
                  <label
                    htmlFor="volume"
                    className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1"
                  >
                    Volumen {Math.round(volume * 100)}%
                  </label>
                  <input
                    id="volume"
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={speak}
                  disabled={!support?.tts || !text.trim() || isSpeaking}
                  className="flex-1 min-w-[8rem] py-3 bg-indigo-700 hover:bg-indigo-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors shadow-lg shadow-indigo-100"
                >
                  ▶ Reproducir
                </button>
                <button
                  onClick={togglePause}
                  disabled={!isSpeaking}
                  className="flex-1 min-w-[8rem] py-3 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors"
                >
                  {isPaused ? "▶ Continuar" : "⏸ Pausar"}
                </button>
                <button
                  onClick={stopSpeaking}
                  disabled={!isSpeaking}
                  className="flex-1 min-w-[8rem] py-3 bg-white border border-slate-300 hover:border-red-300 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 font-bold rounded-xl transition-colors"
                >
                  ⏹ Detener
                </button>
              </div>

              {ttsError && (
                <p className="text-xs text-red-500 text-center">{ttsError}</p>
              )}

              <p className="text-xs text-slate-400 text-center">
                Las voces disponibles las aporta tu sistema operativo y
                navegador, por lo que cambian de un equipo a otro. Si falta tu
                idioma, revisa la guía del final de la página.
              </p>
            </div>
          </div>

          {/* ------------------------- Voz a texto ------------------------- */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-rose-700 p-4">
              <h2 className="text-white font-semibold flex items-center gap-2">
                🎤 Voz a texto
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {support && !support.stt && (
                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
                  Tu navegador no admite el reconocimiento de voz. Está
                  disponible en Chrome, Edge y Safari; Firefox aún no lo
                  implementa.
                </p>
              )}

              <div>
                <label
                  htmlFor="stt-lang"
                  className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1"
                >
                  Idioma del dictado
                </label>
                <select
                  id="stt-lang"
                  value={sttLang}
                  onChange={(e) => setSttLang(e.target.value)}
                  disabled={isListening}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm font-medium shadow-sm focus:ring-2 focus:ring-rose-500 outline-none disabled:bg-slate-100 disabled:text-slate-400"
                >
                  {RECOGNITION_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={isListening ? stopListening : startListening}
                disabled={!support?.stt}
                className={`w-full py-3 font-bold rounded-xl transition-colors shadow-lg ${
                  isListening
                    ? "bg-red-600 hover:bg-red-700 text-white shadow-red-100 animate-pulse"
                    : "bg-rose-700 hover:bg-rose-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white shadow-rose-100"
                }`}
              >
                {isListening ? "⏹ Detener dictado" : "🎙 Iniciar dictado"}
              </button>

              <textarea
                className="w-full h-40 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition-all resize-none text-slate-700 text-sm"
                placeholder="El texto dictado aparecerá aquí. También puedes editarlo."
                value={interim ? `${transcript} ${interim}`.trim() : transcript}
                onChange={(e) => {
                  setTranscript(e.target.value);
                  setInterim("");
                }}
              />

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{transcript.length} caracteres</span>
                {isListening && (
                  <span className="text-rose-600 font-semibold">
                    Escuchando...
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={copyTranscript}
                  disabled={!transcript}
                  className="py-2.5 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  {copied ? "¡Copiado!" : "Copiar"}
                </button>
                <button
                  onClick={downloadTranscript}
                  disabled={!transcript}
                  className="py-2.5 bg-white border border-slate-300 hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 text-sm font-semibold rounded-xl transition-colors"
                >
                  Descargar .txt
                </button>
                <button
                  onClick={sendToReader}
                  disabled={!transcript}
                  className="py-2.5 bg-white border border-slate-300 hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 text-sm font-semibold rounded-xl transition-colors"
                >
                  Enviar a texto a voz
                </button>
                <button
                  onClick={clearTranscript}
                  disabled={!transcript && !sttError}
                  className="py-2.5 bg-white border border-slate-300 hover:border-red-300 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 text-sm font-semibold rounded-xl transition-colors"
                >
                  Limpiar
                </button>
              </div>

              {sttError && (
                <p className="text-xs text-red-500 text-center">{sttError}</p>
              )}

              <p className="text-xs text-slate-400 text-center">
                El dictado necesita permiso del micrófono. En Chrome y Edge el
                audio se procesa en los servidores del navegador, no en esta
                página.
              </p>
            </div>
          </div>
        </div>

        <VoiceInstallGuide />
      </div>
    </main>
  );
}
