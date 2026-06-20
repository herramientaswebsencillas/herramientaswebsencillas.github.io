"use client";
import React, { useState } from "react";

const textToBin = (str: string): string => {
  return str
    .split("")
    .map((char) => char.charCodeAt(0).toString(2).padStart(8, "0"))
    .join(" ");
};

const binToText = (bin: string): string => {
  try {
    const cleanBin = bin.trim();
    if (!cleanBin) return "";

    return cleanBin
      .split(/\s+/)
      .map((b) => {
        if (!/^[01]+$/.test(b)) throw new Error("No es binario");
        return String.fromCharCode(parseInt(b, 2));
      })
      .join("");
  } catch (e) {
    return "Entrada binaria no válida...";
  }
};

export default function TextToBinaryForm() {
  const [text, setText] = useState("");
  const [binary, setBinary] = useState("");

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setText(value);
    setBinary(textToBin(value));
  };

  const handleBinaryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setBinary(value);
    setText(binToText(value));
  };

  const handleClear = () => {
    setText("");
    setBinary("");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent mb-4">
            Texto a Binario
          </h1>
          <p className="text-slate-400 text-lg">
            Convierte texto a codificación binaria y viceversa en tiempo real.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="flex flex-col">
            <label className="mb-2 ml-1 text-sm font-semibold text-blue-400 uppercase tracking-wider">
              Entrada de Texto
            </label>
            <textarea
              value={text}
              onChange={handleTextChange}
              placeholder="Escribe algo aquí..."
              className="w-full h-64 p-4 bg-slate-900 border border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none shadow-inner text-lg"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-2 ml-1 text-sm font-semibold text-emerald-400 uppercase tracking-wider">
              Código Binario (8-bits)
            </label>
            <textarea
              value={binary}
              onChange={handleBinaryChange}
              placeholder="01001000 01101111 01101100 01100001..."
              className="w-full h-64 p-4 bg-slate-900 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none shadow-inner font-mono text-sm leading-relaxed"
            />
          </div>
        </div>

        <div className="flex justify-center mt-10">
          <button
            onClick={handleClear}
            className="px-8 py-3 bg-slate-800 hover:bg-red-900/40 text-slate-300 hover:text-red-400 border border-slate-700 hover:border-red-900/50 rounded-full font-medium transition-all duration-300 shadow-lg"
          >
            Limpiar todo
          </button>
        </div>

        <footer className="mt-20 pt-8 border-t border-slate-900 text-center text-slate-500 text-sm">
          <p>Utiliza el estándar UTF-16 / ASCII para la conversión de caracteres.</p>
        </footer>
      </div>
    </div>
  );
}