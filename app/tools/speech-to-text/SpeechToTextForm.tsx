"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

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

function getSupportSnapshot() {
  return getRecognitionConstructor() !== null;
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

/* -------------------------------- Componente ------------------------------ */

export default function SpeechToTextForm() {
  // Soporte del navegador: null durante el render del servidor y la hidratación.
  const isSupported = useSyncExternalStore<boolean | null>(
    subscribeToSupport,
    getSupportSnapshot,
    getServerSupport
  );

  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [lang, setLang] = useState("es-MX");
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const recognitionRef = useRef<RecognitionInstance | null>(null);
  const keepListeningRef = useRef(false);

  useEffect(() => {
    return () => {
      keepListeningRef.current = false;
      recognitionRef.current?.abort();
    };
  }, []);

  const startListening = () => {
    const Recognition = getRecognitionConstructor();
    if (!Recognition) return;

    const recognition = new Recognition();
    recognition.lang = lang;
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
      setError(
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
    setError("");

    try {
      recognition.start();
      setIsListening(true);
    } catch {
      keepListeningRef.current = false;
      setIsListening(false);
      setError("No se pudo iniciar el micrófono. Intenta de nuevo.");
    }
  };

  const stopListening = () => {
    keepListeningRef.current = false;
    recognitionRef.current?.stop();
    setIsListening(false);
    setInterim("");
  };

  const copyTranscript = async () => {
    if (!transcript) return;
    try {
      await navigator.clipboard.writeText(transcript);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("El navegador no permitió copiar al portapapeles.");
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

  const clearTranscript = () => {
    setTranscript("");
    setInterim("");
    setError("");
  };

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Convertidor de Voz a Texto
          </h1>
          <p className="text-slate-500">
            Dicta con el micrófono y convierte tu voz en texto que puedes
            editar, copiar o descargar.
          </p>
        </div>

        <div className="bg-surface rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-rose-700 p-4">
            <h2 className="text-white font-semibold flex items-center gap-2">
              🎤 Voz a texto
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {isSupported === false && (
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
                Tu navegador no admite el reconocimiento de voz. Está disponible
                en Chrome, Edge y Safari; Firefox aún no lo implementa.
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
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                disabled={isListening}
                className="w-full px-4 py-2 bg-surface border border-slate-200 rounded-xl text-slate-700 text-sm font-medium shadow-sm focus:ring-2 focus:ring-rose-500 outline-none disabled:bg-slate-100 disabled:text-slate-400"
              >
                {RECOGNITION_LANGUAGES.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={isListening ? stopListening : startListening}
              disabled={!isSupported}
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
                <span className="text-rose-600 font-semibold">Escuchando...</span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                className="py-2.5 bg-surface border border-slate-300 hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 text-sm font-semibold rounded-xl transition-colors"
              >
                Descargar .txt
              </button>
              <button
                onClick={clearTranscript}
                disabled={!transcript && !error}
                className="py-2.5 bg-surface border border-slate-300 hover:border-red-300 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 text-sm font-semibold rounded-xl transition-colors"
              >
                Limpiar
              </button>
            </div>

            {error && <p className="text-xs text-red-500 text-center">{error}</p>}

            <p className="text-xs text-slate-400 text-center">
              El dictado necesita permiso del micrófono. En Chrome y Edge el
              audio se procesa en los servidores del navegador, no en esta
              página.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
