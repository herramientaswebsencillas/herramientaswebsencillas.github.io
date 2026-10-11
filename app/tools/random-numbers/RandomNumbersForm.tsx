"use client";
import { useState } from "react";
import ErrorMessage from "@/components/ErrorMessage";
import { RandomRangeError, randomInt, randomUniqueInts } from "@/lib/random";
import { copyLabel, useCopy } from "@/lib/useCopy";

export default function RandomNumbersForm() {
  const [result, setResult] = useState<number[]>([]);
  const [error, setError] = useState("");
  const { copy, statusOf, reset: resetCopy } = useCopy();
  const copyStatus = statusOf();
  const copied = copyStatus === "copied";
  const [config, setConfig] = useState({
    count: 5,
    min: 1,
    max: 100,
    allowRepeats: false,
  });

  const generateNumbers = () => {
    const { count, min, max, allowRepeats } = config;

    if (min >= max) {
      setError("El valor mínimo debe ser menor que el máximo.");
      return;
    }

    try {
      setResult(
        allowRepeats
          ? Array.from({ length: count }, () => randomInt(min, max))
          : randomUniqueInts(count, min, max)
      );
      setError("");
    } catch (e) {
      setResult([]);
      setError(e instanceof RandomRangeError ? e.message : "No se pudieron generar los números.");
    }
    resetCopy();
  };

  const copyToClipboard = () => copy(result.join(", "));

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-4">
      <div className="max-w-md mx-auto bg-surface rounded-3xl shadow-xl border border-gray-100 p-8">
        <h2 className="text-2xl font-extrabold mb-6 text-slate-800 tracking-tight text-center">
          Generador de Números
        </h2>

        <div className="space-y-6 mb-8">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2 text-center">
                Mínimo
              </label>
              <input
                type="number"
                step={1}
                value={config.min}
                onChange={(e) => setConfig({ ...config, min: Number(e.target.value) })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold focus:ring-2 focus:ring-blue-500 outline-none text-center"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2 text-center">
                Máximo
              </label>
              <input
                type="number"
                step={1}
                value={config.max}
                onChange={(e) => setConfig({ ...config, max: Number(e.target.value) })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold focus:ring-2 focus:ring-blue-500 outline-none text-center"
              />
            </div>
          </div>

          <div>
            <label className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
              <span>Cantidad de números</span>
              <span className="text-blue-600 font-black">{config.count}</span>
            </label>
            <input
              type="range"
              min="1"
              max="50"
              value={config.count}
              onChange={(e) => setConfig({ ...config, count: Number(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-xl border border-slate-100 bg-slate-50">
            <input
              type="checkbox"
              checked={config.allowRepeats}
              onChange={() => setConfig({ ...config, allowRepeats: !config.allowRepeats })}
              className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-semibold text-slate-600">Permitir números repetidos</span>
          </label>
        </div>

        <button
          onClick={generateNumbers}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-[0.97] mb-6"
        >
          Generar Números
        </button>

        {error && <ErrorMessage className="mb-6 text-center">{error}</ErrorMessage>}

        {result.length > 0 && (
          <div className="relative group cursor-pointer" onClick={copyToClipboard}>
            <div
              className={`p-6 rounded-2xl text-center transition-all border-2 ${
                copied
                  ? "bg-green-50 border-green-200"
                  : "bg-slate-50 border-slate-200 group-hover:border-blue-300"
              }`}
            >
              <div className="flex flex-wrap justify-center gap-2">
                {result.map((n, i) => (
                  <span
                    key={i}
                    className={`text-xl font-mono font-bold ${copied ? "text-green-600" : "text-slate-800"}`}
                  >
                    {n}
                    {i < result.length - 1 ? "," : ""}
                  </span>
                ))}
              </div>

              <div
                className={`absolute inset-0 flex items-center justify-center rounded-2xl transition-opacity ${
                  copied
                    ? "opacity-100 bg-green-600/90"
                    : copyStatus === "failed"
                      ? "opacity-100 bg-red-600/90"
                      : "opacity-0 group-hover:opacity-100 bg-slate-800/80"
                }`}
              >
                <span className="text-white text-xs font-bold uppercase tracking-widest">
                  {copyLabel(copyStatus, "Click para copiar lista")}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
