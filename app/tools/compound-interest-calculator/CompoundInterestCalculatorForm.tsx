"use client";

import React, { useState, useEffect } from "react";

interface AmortizationRow {
  month: number;
  interest: number;
  contribution: number;
  balance: number;
}

export default function CompoundInterestCalculator() {
  const [initialAmount, setInitialAmount] = useState<number>(10000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(1000);
  const [months, setMonths] = useState<number>(12);
  const [rate, setRate] = useState<number>(12);
  const [frequency, setFrequency] = useState<number>(12);
  
  const [amortizationTable, setAmortizationTable] = useState<AmortizationRow[]>([]);
  const [totals, setTotals] = useState({ final: 0, invested: 0, interest: 0 });

  useEffect(() => {
    const runCalculation = () => {
      let currentBalance = initialAmount;
      let totalInvested = initialAmount;
      
      const r = rate / 100;
      const n = frequency;
      
      const effectiveMonthlyRate = Math.pow(1 + r / n, n / 12) - 1;
      
      const table: AmortizationRow[] = [];

      for (let i = 1; i <= months; i++) {
        const interestEarned = currentBalance * effectiveMonthlyRate;
        currentBalance += interestEarned + monthlyContribution;
        totalInvested += monthlyContribution;

        table.push({
          month: i,
          interest: interestEarned,
          contribution: monthlyContribution,
          balance: currentBalance,
        });
      }

      setTotals({
        final: currentBalance,
        invested: totalInvested,
        interest: currentBalance - totalInvested,
      });
      setAmortizationTable(table);
    };

    runCalculation();
  }, [initialAmount, monthlyContribution, months, rate, frequency]);

  return (
    <main className="min-h-screen bg-slate-100 py-10 px-4 md:px-10 font-sans">
      {/* CABECERA */}
      <div className="max-w-6xl mx-auto mb-10 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-3 tracking-tight">
          Calculadora de Interés Compuesto
        </h1>
        <p className="text-slate-500 text-lg max-w-2xl">
          Herramienta para calcular el crecimiento del interés a lo largo del tiempo basado en la frecuencia, capital y tasa.
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-200 h-fit">
          <h2 className="text-xl font-black text-slate-800 mb-6 uppercase tracking-tight">Configuración</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Inversión Inicial ($)</label>
              <input type="number" value={initialAmount} onChange={(e) => setInitialAmount(Number(e.target.value))} className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Aportación Mensual ($)</label>
              <input type="number" value={monthlyContribution} onChange={(e) => setMonthlyContribution(Number(e.target.value))} className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tasa Anual %</label>
                <input type="number" value={rate} onChange={(e) => setRate(Number(e.target.value))} className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Meses</label>
                <input type="number" value={months} onChange={(e) => setMonths(Number(e.target.value))} className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Frecuencia de Rendimientos</label>
              <select 
                value={frequency} 
                onChange={(e) => setFrequency(Number(e.target.value))}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value={360}>Diario</option>
                <option value={52}>Semanal</option>
                <option value={12}>Mensual</option>
                <option value={1}>Anual</option>
              </select>
            </div>
          </div>

          <div className="mt-8 p-6 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-200 text-center">
            <span className="text-xs font-bold opacity-80 uppercase tracking-widest">Saldo Final</span>
            <div className="text-3xl font-black">${totals.final.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-200">
            <h2 className="text-xl font-black text-slate-800 mb-6 uppercase">Crecimiento del Capital</h2>
            <div className="flex items-end gap-1 h-48 bg-slate-50 rounded-xl p-4 border border-dashed border-slate-300">
              {amortizationTable.filter((_, i) => i % Math.max(1, Math.floor(months / 20)) === 0).map((data, idx) => (
                <div 
                  key={idx} 
                  className="bg-indigo-500 w-full rounded-t-sm hover:bg-indigo-400 transition-all cursor-help relative group"
                  style={{ height: `${(data.balance / totals.final) * 100}%` }}
                >
                  <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] p-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                    Mes {data.month}: ${data.balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex justify-between items-center">
                <span className="text-xs font-bold text-emerald-700 uppercase">Capital Invertido</span>
                <span className="text-lg font-black text-emerald-900">${totals.invested.toLocaleString()}</span>
              </div>
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex justify-between items-center">
                <span className="text-xs font-bold text-amber-700 uppercase">Interés Generado</span>
                <span className="text-lg font-black text-amber-900">${totals.interest.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-black text-slate-800 uppercase">Tabla de Proyección</h2>
            </div>
            <div className="max-h-[350px] overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th className="p-4 text-[10px] font-bold text-slate-500 uppercase">Mes</th>
                    <th className="p-4 text-[10px] font-bold text-slate-500 uppercase">Saldo Acumulado</th>
                    <th className="p-4 text-[10px] font-bold text-slate-500 uppercase">Rendimiento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-900">
                  {amortizationTable.map((row) => (
                    <tr key={row.month} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-bold text-slate-400">{row.month}</td>
                      <td className="p-4 font-bold">${row.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="p-4 text-emerald-600 font-semibold">+${row.interest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}