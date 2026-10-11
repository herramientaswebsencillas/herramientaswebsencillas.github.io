"use client";
import { useState } from "react";
import ErrorMessage from "@/components/ErrorMessage";
import { randomString } from "@/lib/random";
import { copyLabel, useCopy } from "@/lib/useCopy";

/* Conjuntos de caracteres que se pueden combinar, con su etiqueta visible. */
const CHARSETS = {
  uppercase: { label: "Mayúsculas", chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ" },
  lowercase: { label: "Minúsculas", chars: "abcdefghijklmnopqrstuvwxyz" },
  symbols: { label: "Símbolos", chars: "!@#$%^&*()_+~`|}{[]:;?><,./-=" },
  digits: { label: "Números", chars: "0123456789" },
};

type Charset = keyof typeof CHARSETS;

export default function RandomStringForm() {
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [length, setLength] = useState(12);
  const { copy, statusOf, reset: resetCopy } = useCopy();
  const copyStatus = statusOf();
  const copied = copyStatus === "copied";
  const [enabled, setEnabled] = useState<Record<Charset, boolean>>({
    uppercase: true,
    lowercase: true,
    symbols: false,
    digits: true,
  });

  const generateString = () => {
    const alphabet = (Object.keys(CHARSETS) as Charset[])
      .filter((charset) => enabled[charset])
      .map((charset) => CHARSETS[charset].chars)
      .join("");

    if (alphabet === "") {
      setResult("");
      setError("Selecciona al menos un tipo de carácter.");
      return;
    }

    setError("");
    setResult(randomString(length, alphabet));
    resetCopy();
  };

  const copyToClipboard = () => copy(result);

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-4">
      <div className="max-w-md mx-auto bg-surface rounded-3xl shadow-xl border border-gray-100 p-8">
        <h2 className="text-2xl font-extrabold mb-6 text-slate-800 tracking-tight text-center">
          Generador de Cadena de Caracteres
        </h2>

        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <label className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
              Longitud
            </label>
            <span className="text-blue-600 font-bold bg-blue-50 px-3 py-1 rounded-full text-xs">
              {length} caracteres
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="64"
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        <div className="space-y-4 mb-8">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Configuración
          </p>
          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(CHARSETS) as Charset[]).map((charset) => (
              <label
                key={charset}
                className="group flex items-center space-x-3 cursor-pointer p-3 rounded-xl border border-transparent hover:border-slate-100 hover:bg-slate-50 transition-all"
              >
                <input
                  type="checkbox"
                  checked={enabled[charset]}
                  onChange={() => setEnabled({ ...enabled, [charset]: !enabled[charset] })}
                  className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500 transition-all"
                />
                <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900">
                  {CHARSETS[charset].label}
                </span>
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={generateString}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-[0.97] mb-6"
        >
          Generar Cadena de Caracteres
        </button>

        {error && <ErrorMessage className="mb-6 text-center">{error}</ErrorMessage>}

        {result && (
          <div className="space-y-2">
            <div
              onClick={copyToClipboard}
              className={`p-5 rounded-2xl break-all font-mono text-center cursor-pointer transition-all group relative border-2 ${
                copied
                  ? "bg-green-50 border-green-200"
                  : "bg-slate-900 border-slate-800 hover:bg-slate-800"
              }`}
            >
              <span className={`text-lg ${copied ? "text-green-700" : "text-blue-400"}`}>
                {result}
              </span>

              <div
                className={`absolute inset-0 flex items-center justify-center rounded-2xl transition-opacity ${
                  copied
                    ? "opacity-100 bg-green-600"
                    : copyStatus === "failed"
                      ? "opacity-100 bg-red-600"
                      : "opacity-0 group-hover:opacity-100 bg-slate-800/90"
                }`}
              >
                <span className="text-white text-xs font-bold uppercase tracking-widest">
                  {copyLabel(copyStatus)}
                </span>
              </div>
            </div>
            <p className="text-center text-[10px] text-slate-400 font-medium">
              {copied
                ? "Texto guardado en el portapapeles"
                : copyStatus === "failed"
                  ? "El navegador no permitió copiar al portapapeles"
                  : "Clic sobre el texto para copiar"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
