"use client";
import { useState } from 'react';

export default function GeneradorDeNumeros() {
  const [resultado, setResultado] = useState<number[]>([]);
  const [copiado, setCopiado] = useState(false);
  const [config, setConfig] = useState({
    cantidad: 5,
    min: 1,
    max: 100,
    permitirRepetidos: false
  });

  const generarNumeros = () => {
    const { cantidad, min, max, permitirRepetidos } = config;
    
    if (min >= max) {
      alert("El valor mínimo debe ser menor que el máximo");
      return;
    }

    const nuevosNumeros: number[] = [];
    
    if (permitirRepetidos) {
      for (let i = 0; i < cantidad; i++) {
        nuevosNumeros.push(Math.floor(Math.random() * (max - min + 1)) + min);
      }
    } else {
      const seleccionados = new Set<number>();
      const rangoDisponible = max - min + 1;
      const limiteEfectivo = Math.min(cantidad, rangoDisponible);

      while (seleccionados.size < limiteEfectivo) {
        seleccionados.add(Math.floor(Math.random() * (max - min + 1)) + min);
      }
      nuevosNumeros.push(...Array.from(seleccionados).sort((a, b) => a - b));
    }

    setResultado(nuevosNumeros);
    setCopiado(false);
  };

  const copiarAlPortapapeles = () => {
    if (resultado.length > 0) {
      navigator.clipboard.writeText(resultado.join(", "));
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-4">
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <h2 className="text-2xl font-extrabold mb-6 text-slate-800 tracking-tight text-center">
          Generador de Números
        </h2>

        <div className="space-y-6 mb-8">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2 text-center">Mínimo</label>
              <input 
                type="number" value={config.min}
                onChange={(e) => setConfig({...config, min: Number(e.target.value)})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold focus:ring-2 focus:ring-blue-500 outline-none text-center"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2 text-center">Máximo</label>
              <input 
                type="number" value={config.max}
                onChange={(e) => setConfig({...config, max: Number(e.target.value)})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold focus:ring-2 focus:ring-blue-500 outline-none text-center"
              />
            </div>
          </div>

          <div>
            <label className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
              <span>Cantidad de números</span>
              <span className="text-blue-600 font-black">{config.cantidad}</span>
            </label>
            <input 
              type="range" min="1" max="50" value={config.cantidad} 
              onChange={(e) => setConfig({...config, cantidad: Number(e.target.value)})}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-xl border border-slate-100 bg-slate-50">
            <input 
              type="checkbox" checked={config.permitirRepetidos}
              onChange={() => setConfig({...config, permitirRepetidos: !config.permitirRepetidos})}
              className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-semibold text-slate-600">Permitir números repetidos</span>
          </label>
        </div>

        <button 
          onClick={generarNumeros}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-[0.97] mb-6"
        >
          Generar Números
        </button>

        {resultado.length > 0 && (
          <div className="relative group cursor-pointer" onClick={copiarAlPortapapeles}>
            <div className={`p-6 rounded-2xl text-center transition-all border-2 ${
              copiado ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200 group-hover:border-blue-300'
            }`}>
              <div className="flex flex-wrap justify-center gap-2">
                {resultado.map((n, i) => (
                  <span key={i} className={`text-xl font-mono font-bold ${copiado ? 'text-green-600' : 'text-slate-800'}`}>
                    {n}{i < resultado.length - 1 ? "," : ""}
                  </span>
                ))}
              </div>
              
              <div className={`absolute inset-0 flex items-center justify-center rounded-2xl transition-opacity ${
                copiado ? 'opacity-100 bg-green-600/90' : 'opacity-0 group-hover:opacity-100 bg-slate-800/80'
              }`}>
                <span className="text-white text-xs font-bold uppercase tracking-widest">
                  {copiado ? "¡Copiado!" : "Click para copiar lista"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}