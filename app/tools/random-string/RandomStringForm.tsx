"use client";
import { useState } from 'react';

export default function GeneradorDeTexto() {
  const [resultado, setResultado] = useState("");
  const [longitud, setLongitud] = useState(12);
  const [copiado, setCopiado] = useState(false);
  const [opciones, setOpciones] = useState({
    mayúsculas: true,
    minúsculas: true,
    símbolos: false,
    números: true,
  });

  const generarCadena = () => {
    let caracteres = "";
    if (opciones.mayúsculas) caracteres += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (opciones.minúsculas) caracteres += "abcdefghijklmnopqrstuvwxyz";
    if (opciones.símbolos) caracteres += "!@#$%^&*()_+~`|}{[]:;?><,./-=";
    if (opciones.números) caracteres += "0123456789";

    if (caracteres === "") {
      setResultado("⚠️ Selecciona una opción");
      return;
    }

    let nuevaCadena = "";
    for (let i = 0; i < longitud; i++) {
      nuevaCadena += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    setResultado(nuevaCadena);
    setCopiado(false);
  };

  const copiarAlPortapapeles = () => {
    if (resultado && !resultado.startsWith("⚠️")) {
      navigator.clipboard.writeText(resultado);
      setCopiado(true);
      
      setTimeout(() => {
        setCopiado(false);
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-4">
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <h2 className="text-2xl font-extrabold mb-6 text-slate-800 tracking-tight text-center">
          Generador de Texto
        </h2>

        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <label className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
              Longitud
            </label>
            <span className="text-blue-600 font-bold bg-blue-50 px-3 py-1 rounded-full text-xs">
              {longitud} caracteres
            </span>
          </div>
          <input 
            type="range" min="1" max="64" value={longitud} 
            onChange={(e) => setLongitud(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        <div className="space-y-4 mb-8">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Configuración</p>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(opciones).map(([key, value]) => (
              <label key={key} className="group flex items-center space-x-3 cursor-pointer p-3 rounded-xl border border-transparent hover:border-slate-100 hover:bg-slate-50 transition-all">
                <input 
                  type="checkbox" checked={value}
                  onChange={() => setOpciones({...opciones, [key]: !value})}
                  className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500 transition-all"
                />
                <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 capitalize">
                  {key}
                </span>
              </label>
            ))}
          </div>
        </div>

        <button 
          onClick={generarCadena}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-[0.97] mb-6"
        >
          Generar Texto
        </button>

        {resultado && (
          <div className="space-y-2">
            <div 
              onClick={copiarAlPortapapeles}
              className={`p-5 rounded-2xl break-all font-mono text-center cursor-pointer transition-all group relative border-2 ${
                copiado ? 'bg-green-50 border-green-200' : 'bg-slate-900 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <span className={`text-lg ${copiado ? 'text-green-700' : 'text-blue-400'}`}>
                {resultado}
              </span>
              
              <div className={`absolute inset-0 flex items-center justify-center rounded-2xl transition-opacity ${
                copiado ? 'opacity-100 bg-green-600' : 'opacity-0 group-hover:opacity-100 bg-slate-800/90'
              }`}>
                <span className="text-white text-xs font-bold uppercase tracking-widest">
                  {copiado ? "¡Copiado!" : "Copiar"}
                </span>
              </div>
            </div>
            <p className="text-center text-[10px] text-slate-400 font-medium">
              {copiado ? "Texto guardado en el portapapeles" : "Clic sobre el texto para copiar"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}