"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import VoiceInstallGuide from "./VoiceInstallGuide";

/* ---------------------------- Soporte del navegador -----------------------
   Se lee con useSyncExternalStore para que el HTML estático y la hidratación
   coincidan: en el servidor devuelve null y solo en el cliente se resuelve. */

function getSupportSnapshot() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

// El soporte no cambia durante la vida de la página: no hay nada a lo que suscribirse.
const subscribeToSupport = () => () => {};
const getServerSupport = () => null;

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

export default function TextToSpeechForm() {
  // Soporte del navegador: null durante el render del servidor y la hidratación.
  const isSupported = useSyncExternalStore<boolean | null>(
    subscribeToSupport,
    getSupportSnapshot,
    getServerSupport
  );

  const [text, setText] = useState("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceURI, setVoiceURI] = useState("");
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState("");
  // Chrome puede recolectar las locuciones en curso; mantenerlas referenciadas.
  const utterancesRef = useRef<SpeechSynthesisUtterance[]>([]);

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

  const stopSpeaking = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    utterancesRef.current = [];
    setIsSpeaking(false);
    setIsPaused(false);
    setProgress({ current: 0, total: 0 });
  }, []);

  const speak = () => {
    if (!isSupported) return;

    const chunks = splitIntoChunks(text);
    if (!chunks.length) return;

    const synth = window.speechSynthesis;
    synth.cancel();
    setError("");

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
          setError("No se pudo reproducir el texto. Intenta de nuevo.");
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
    if (!isSupported) return;
    const synth = window.speechSynthesis;
    if (isPaused) {
      synth.resume();
      setIsPaused(false);
    } else {
      synth.pause();
      setIsPaused(true);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Convertidor de Texto a Voz
          </h1>
          <p className="text-slate-500">
            Escucha cualquier texto en voz alta con las voces de tu sistema.
            Todo ocurre en tu navegador.
          </p>
        </div>

        <div className="bg-surface rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-indigo-700 p-4">
            <h2 className="text-white font-semibold flex items-center gap-2">
              🔊 Texto a voz
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {isSupported === false && (
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
                className="w-full px-4 py-2 bg-surface border border-slate-200 rounded-xl text-slate-700 text-sm font-medium shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-slate-100 disabled:text-slate-400"
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
                disabled={!isSupported || !text.trim() || isSpeaking}
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
                className="flex-1 min-w-[8rem] py-3 bg-surface border border-slate-300 hover:border-red-300 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 font-bold rounded-xl transition-colors"
              >
                ⏹ Detener
              </button>
            </div>

            {error && <p className="text-xs text-red-500 text-center">{error}</p>}

            <p className="text-xs text-slate-400 text-center">
              Las voces disponibles las aporta tu sistema operativo y navegador,
              por lo que cambian de un equipo a otro. Si falta tu idioma, revisa
              la guía del final de la página.
            </p>
          </div>
        </div>

        <VoiceInstallGuide />
      </div>
    </main>
  );
}
