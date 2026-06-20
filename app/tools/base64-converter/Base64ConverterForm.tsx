"use client";

import { useState } from "react";

export default function Base64ConverterForm() {
  const [textInput, setTextInput] = useState("");
  const [base64Output, setBase64Output] = useState("");
  const [base64Input, setBase64Input] = useState("");
  const [textOutput, setTextOutput] = useState("");

  const encodeToBase64 = () => {
    try {
      const encoded = btoa(unescape(encodeURIComponent(textInput)));
      setBase64Output(encoded);
    } catch (e) {
      setBase64Output("Error: No se pudo codificar el texto.");
    }
  };

  const decodeFromBase64 = () => {
    try {
      const decoded = decodeURIComponent(escape(atob(base64Input.trim())));
      setTextOutput(decoded);
    } catch (e) {
      setTextOutput("Error: El código Base64 no es válido.");
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
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Convertidor Base64</h1>
          <p className="text-slate-500">Codifica y decodifica texto en formato Base64 de forma segura y rápida.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* SECCIÓN: ENCODE */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-800 p-4">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <span className="text-emerald-400">{"<>"}</span> Texto a Base64
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <textarea
                className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none text-slate-700 font-mono text-sm"
                placeholder="Ingresa el texto normal aquí..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
              />
              <button
                onClick={encodeToBase64}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-indigo-200"
              >
                Codificar 
              </button>
              <div className="relative">
                <textarea
                  className="w-full h-32 p-4 bg-slate-100 border border-dashed border-slate-300 text-slate-700 rounded-xl font-mono text-sm resize-none"
                  placeholder="Resultado en Base64..."
                  value={base64Output}
                  readOnly
                />
                {base64Output && !base64Output.includes("Error") && (
                  <button 
                    onClick={() => copyToClipboard(base64Output)}
                    className="absolute top-2 right-2 p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs text-white transition-colors"
                  >
                    Copiar
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* SECCIÓN: DECODE */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-800 p-4">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <span className="text-blue-400">{"</>"}</span> Base64 a Texto
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <textarea
                className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none text-slate-700 font-mono text-sm"
                placeholder="Pega el código Base64 aquí..."
                value={base64Input}
                onChange={(e) => setBase64Input(e.target.value)}
              />
              <button
                onClick={decodeFromBase64}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-200"
              >
                Decodificar
              </button>
              <div className="relative">
                <textarea
                  className="w-full h-32 p-4 bg-slate-100 border border-dashed border-slate-300 text-slate-700 rounded-xl font-mono text-sm resize-none"
                  placeholder="Texto original..."
                  value={textOutput}
                  readOnly
                />
                {textOutput && !textOutput.includes("Error") && (
                  <button 
                    onClick={() => copyToClipboard(textOutput)}
                    className="absolute top-2 right-2 p-2 bg-slate-200 hover:bg-slate-300 rounded-lg text-xs text-slate-600 transition-colors"
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
          <p>Base64 es codificación, no cifrado. No protege datos sensibles como contraseñas o tokens.</p>
        </div>
      </div>
    </main>
  );
}