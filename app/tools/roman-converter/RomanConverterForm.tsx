"use client";

import { useState } from "react";

/* --------------------------- Lógica de conversión --------------------------- */

const ROMAN_MAP: [number, string][] = [
  [1000, "M"],
  [900, "CM"],
  [500, "D"],
  [400, "CD"],
  [100, "C"],
  [90, "XC"],
  [50, "L"],
  [40, "XL"],
  [10, "X"],
  [9, "IX"],
  [5, "V"],
  [4, "IV"],
  [1, "I"],
];

const MIN_VALUE = 1;
const MAX_VALUE = 3999;

const ROMAN_TO_DECIMAL: Record<string, number> = {
  I: 1,
  V: 5,
  X: 10,
  L: 50,
  C: 100,
  D: 500,
  M: 1000,
};

function decimalToRoman(value: number): string {
  if (!Number.isInteger(value) || value < MIN_VALUE || value > MAX_VALUE) {
    throw new Error(`Ingresa un número entero entre ${MIN_VALUE} y ${MAX_VALUE}.`);
  }
  let remaining = value;
  let result = "";
  for (const [num, symbol] of ROMAN_MAP) {
    while (remaining >= num) {
      result += symbol;
      remaining -= num;
    }
  }
  return result;
}

function romanToDecimal(roman: string): number {
  const clean = roman.trim().toUpperCase();
  if (!clean) throw new Error("Ingresa un número romano.");
  if (!/^[MDCLXVI]+$/.test(clean)) {
    throw new Error("Solo se permiten los símbolos M, D, C, L, X, V, I.");
  }

  let total = 0;
  for (let i = 0; i < clean.length; i++) {
    const current = ROMAN_TO_DECIMAL[clean[i]];
    const next = ROMAN_TO_DECIMAL[clean[i + 1]];
    if (next && current < next) {
      total -= current;
    } else {
      total += current;
    }
  }

  if (decimalToRoman(total) !== clean) {
    throw new Error("Ese no es un número romano válido.");
  }
  return total;
}

/* -------------------------------- Página -------------------------------- */

export default function RomanConverterForm() {
  const [decimalInput, setDecimalInput] = useState("");
  const [romanOutput, setRomanOutput] = useState("");
  const [romanInput, setRomanInput] = useState("");
  const [decimalOutput, setDecimalOutput] = useState("");

  const convertToRoman = () => {
    try {
      setRomanOutput(decimalToRoman(Number(decimalInput)));
    } catch (e) {
      setRomanOutput(e instanceof Error ? `Error: ${e.message}` : "Error: Entrada inválida.");
    }
  };

  const convertToDecimal = () => {
    try {
      setDecimalOutput(romanToDecimal(romanInput).toString());
    } catch (e) {
      setDecimalOutput(e instanceof Error ? `Error: ${e.message}` : "Error: Entrada inválida.");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("¡Copiado al portapapeles!");
  };

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Convertidor de Números Romanos</h1>
          <p className="text-slate-500">Convierte números decimales a romanos y viceversa de forma instantánea.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* SECCIÓN: DECIMAL A ROMANO */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-800 p-4">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <span className="text-emerald-400 font-mono">123</span> Decimal a Romano
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <input
                type="text"
                inputMode="numeric"
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-700 font-mono text-sm"
                placeholder="Ej. 1994"
                value={decimalInput}
                onChange={(e) => setDecimalInput(e.target.value)}
              />
              <button
                onClick={convertToRoman}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-indigo-200"
              >
                Convertir
              </button>
              <div className="relative">
                <input
                  type="text"
                  className="w-full p-4 bg-slate-100 border border-dashed border-slate-300 text-slate-700 rounded-xl font-mono text-sm"
                  placeholder="Resultado en números romanos..."
                  value={romanOutput}
                  readOnly
                />
                {romanOutput && !romanOutput.includes("Error") && (
                  <button
                    onClick={() => copyToClipboard(romanOutput)}
                    className="absolute top-1/2 -translate-y-1/2 right-2 p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs text-white transition-colors"
                  >
                    Copiar
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* SECCIÓN: ROMANO A DECIMAL */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-800 p-4">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <span className="text-blue-400 font-mono">MD</span> Romano a Decimal
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <input
                type="text"
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-700 font-mono text-sm uppercase"
                placeholder="Ej. MCMXCIV"
                value={romanInput}
                onChange={(e) => setRomanInput(e.target.value)}
              />
              <button
                onClick={convertToDecimal}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-200"
              >
                Convertir
              </button>
              <div className="relative">
                <input
                  type="text"
                  className="w-full p-4 bg-slate-100 border border-dashed border-slate-300 text-slate-700 rounded-xl font-mono text-sm"
                  placeholder="Resultado en número decimal..."
                  value={decimalOutput}
                  readOnly
                />
                {decimalOutput && !decimalOutput.includes("Error") && (
                  <button
                    onClick={() => copyToClipboard(decimalOutput)}
                    className="absolute top-1/2 -translate-y-1/2 right-2 p-2 bg-slate-200 hover:bg-slate-300 rounded-lg text-xs text-slate-600 transition-colors"
                  >
                    Copiar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center text-slate-400 text-sm">
          <p>Herramienta procesada localmente en tu navegador para mayor privacidad.</p>
          <p>Rango válido: del {MIN_VALUE} al {MAX_VALUE} (el sistema romano clásico no representa números mayores).</p>
        </div>
      </div>
    </main>
  );
}
