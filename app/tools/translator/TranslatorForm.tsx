"use client";
import { useState, ChangeEvent } from "react";

const LANGUAGES = [
  { code: "es", label: "Español" },
  { code: "en", label: "Inglés" },
  { code: "fr", label: "Francés" },
  { code: "de", label: "Alemán" },
  { code: "it", label: "Italiano" },
  { code: "pt", label: "Portugués" },
  { code: "nl", label: "Neerlandés" },
  { code: "ru", label: "Ruso" },
  { code: "ja", label: "Japonés" },
  { code: "zh", label: "Chino" },
  { code: "ko", label: "Coreano" },
  { code: "ar", label: "Árabe" },
];

const MAX_CHARS = 450; // margen de seguridad bajo el límite de ~500 bytes de MyMemory

function getByteSize(str: string) {
  return new Blob([str]).size;
}

export default function TranslatorForm() {
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLang, setSourceLang] = useState("es");
  const [targetLang, setTargetLang] = useState("en");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const charCount = sourceText.length;
  const byteCount = getByteSize(sourceText);
  const isOverLimit = byteCount > MAX_CHARS;

  const handleSourceChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setSourceText(e.target.value);
    setError("");
  };

  const swapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  const translateText = async () => {
    if (!sourceText.trim()) return;
    if (isOverLimit) {
      setError(`El texto supera el límite de ${MAX_CHARS} bytes permitido por solicitud.`);
      return;
    }

    setIsLoading(true);
    setError("");
    setTranslatedText("");

    try {
      const res = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
          sourceText
        )}&langpair=${sourceLang}|${targetLang}`
      );

      if (!res.ok) throw new Error("La solicitud a la API falló.");

      const data = await res.json();

      if (data.responseStatus !== 200 && data.responseStatus !== "200") {
        throw new Error(data.responseDetails || "No se pudo traducir el texto.");
      }

      setTranslatedText(data.responseData.translatedText);
    } catch (e) {
      setError("Error: No se pudo completar la traducción. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    alert("¡Copiado al portapapeles!");
  };

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Traductor de Texto</h1>
          <p className="text-slate-500">Traduce texto entre múltiples idiomas usando una API gratuita.</p>
        </div>

        {/* Selector de idiomas */}
        <div className="flex items-center justify-center gap-4 mb-6 flex-wrap">
          <select
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>

          <button
            onClick={swapLanguages}
            title="Intercambiar idiomas"
            className="p-2 bg-slate-700 hover:bg-slate-600 rounded-full text-white transition-colors"
          >
            ⇄
          </button>

          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Texto origen */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-emerald-700 p-4">
              <h2 className="text-white font-semibold flex items-center gap-2">
                📝 Texto original
              </h2>
            </div>
            <div className="p-6 space-y-3">
              <textarea
                className="w-full h-48 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none text-slate-700 text-sm"
                placeholder="Escribe o pega el texto que deseas traducir..."
                value={sourceText}
                onChange={handleSourceChange}
              />
              <div className="flex items-center justify-between text-xs">
                <span className={isOverLimit ? "text-red-500 font-semibold" : "text-slate-400"}>
                  {charCount} caracteres · {byteCount} / {MAX_CHARS} bytes
                </span>
                {isOverLimit && (
                  <span className="text-red-500 font-semibold">Límite excedido</span>
                )}
              </div>
              <button
                onClick={translateText}
                disabled={isLoading || !sourceText.trim() || isOverLimit}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors shadow-lg shadow-emerald-100"
              >
                {isLoading ? "Traduciendo..." : "Traducir"}
              </button>
              {error && <p className="text-xs text-red-500 text-center">{error}</p>}
            </div>
          </div>

          {/* Texto traducido */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-blue-700 p-4">
              <h2 className="text-white font-semibold flex items-center gap-2">
                🌐 Traducción
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="relative">
                <textarea
                  className="w-full h-48 p-4 bg-slate-100 border border-dashed border-slate-300 text-slate-700 rounded-xl text-sm resize-none"
                  placeholder="La traducción aparecerá aquí..."
                  value={translatedText}
                  readOnly
                />
                {translatedText && (
                  <button
                    onClick={() => copyToClipboard(translatedText)}
                    className="absolute top-2 right-2 p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs text-white transition-colors"
                  >
                    Copiar
                  </button>
                )}
              </div>
              <p className="text-sm text-slate-500 italic text-center">
                Traducción automática vía{" "}
                <a
                  href="https://mymemory.translated.net/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold underline-offset-2 hover:text-blue-600 hover:underline"
                >
                  MyMemory API
                </a>{" "}
                · calidad variable. El texto que ingreses se comparte con este servicio.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
