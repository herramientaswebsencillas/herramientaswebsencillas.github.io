"use client";
import type { ReactNode } from "react";
import React, { useState } from "react";
import ErrorMessage from "@/components/ErrorMessage";
import { BinaryError, binaryToText, textToBinary } from "@/lib/binary";

/** `header` y `guide` son la cabecera (ToolHeader) y la guía de uso
    (ToolGuide), que page.tsx renderiza en el servidor para que el catálogo y
    sus textos no lleguen al JavaScript. */
export default function TextToBinaryForm({
  header,
  guide,
}: {
  header: ReactNode;
  guide: ReactNode;
}) {
  const [text, setText] = useState("");
  const [binary, setBinary] = useState("");
  const [error, setError] = useState("");

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setText(value);
    setBinary(textToBinary(value));
    setError("");
  };

  // Mientras el binario no sea válido, el texto se queda como estaba en lugar
  // de sustituirse por el mensaje de error.
  const handleBinaryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setBinary(value);
    try {
      setText(binaryToText(value));
      setError("");
    } catch (err) {
      setError(err instanceof BinaryError ? err.message : "El código binario no es válido.");
    }
  };

  const handleClear = () => {
    setText("");
    setBinary("");
    setError("");
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 font-sans p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        {header}

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
            {error && (
              <ErrorMessage tone="dark" className="mt-2 ml-1">
                {error}
              </ErrorMessage>
            )}
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

        <footer className="mt-20 pt-8 border-t border-slate-900 text-center text-slate-400 text-sm">
          <p>Codifica el texto en UTF-8: cada byte es un grupo de 8 bits.</p>
        </footer>
      </div>
      {guide}
    </main>
  );
}
