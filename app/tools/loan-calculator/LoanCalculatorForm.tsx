"use client";

import React, { useState, useEffect } from "react";

interface LoanRow {
  month: number;
  totalPayment: number;
  basePayment: number;
  insurance: number;
  principal: number;
  interest: number;
  tax: number; // NUEVO: Impuesto sobre el interés
  balance: number;
}

export default function LoanCalculator() {
  const [loanAmount, setLoanAmount] = useState<number>(100000);
  const [annualRate, setAnnualRate] = useState<number>(12);
  const [months, setMonths] = useState<number>(24);
  const [monthlyInsurance, setMonthlyInsurance] = useState<number>(250);
  const [taxRate, setTaxRate] = useState<number>(16); // NUEVO: Porcentaje de impuesto (ej. IVA)
  const [amortizationSystem, setAmortizationSystem] = useState<"frances" | "aleman" | "americano">("frances");
  
  const [amortizationTable, setAmortizationTable] = useState<LoanRow[]>([]);
  const [totals, setTotals] = useState({ 
    firstPayment: 0, 
    totalInterest: 0, 
    totalInsurance: 0,
    totalTax: 0, // NUEVO: Total de impuestos pagados
    totalPaid: 0 
  });

  useEffect(() => {
    const runCalculation = () => {
      const r = annualRate > 0 ? (annualRate / 100) / 12 : 0;
      const n = months;
      
      let currentBalance = loanAmount;
      let totalInterestAccumulated = 0;
      let totalTaxAccumulated = 0;
      let firstMonthPayment = 0;
      const table: LoanRow[] = [];

      for (let i = 1; i <= n; i++) {
        let interestPayment = currentBalance * r;
        let principalPayment = 0;
        let baseMonthlyPayment = 0;

        // LÓGICA SEGÚN EL SISTEMA DE AMORTIZACIÓN
        if (amortizationSystem === "frances") {
          // Cuota base constante
          const p = r > 0 ? (loanAmount * r) / (1 - Math.pow(1 + r, -n)) : loanAmount / n;
          principalPayment = p - interestPayment;
          baseMonthlyPayment = p;
        } 
        else if (amortizationSystem === "aleman") {
          // Abono a capital constante
          principalPayment = loanAmount / n;
          baseMonthlyPayment = principalPayment + interestPayment;
        } 
        else if (amortizationSystem === "americano") {
          // Solo intereses, capital al final
          interestPayment = loanAmount * r; 
          principalPayment = i === n ? loanAmount : 0;
          baseMonthlyPayment = principalPayment + interestPayment;
        }

        // NUEVO: Cálculo del impuesto sobre los intereses de este mes
        const taxPayment = interestPayment * (taxRate / 100);

        currentBalance -= principalPayment;
        // Evitar números negativos ínfimos por redondeo de JavaScript
        if (currentBalance < 0.01) currentBalance = 0; 

        totalInterestAccumulated += interestPayment;
        totalTaxAccumulated += taxPayment;
        
        // La cuota total ahora incluye el impuesto
        const totalMonthlyPayment = baseMonthlyPayment + monthlyInsurance + taxPayment;

        if (i === 1) {
          firstMonthPayment = totalMonthlyPayment;
        }

        table.push({
          month: i,
          totalPayment: totalMonthlyPayment,
          basePayment: baseMonthlyPayment,
          insurance: monthlyInsurance,
          principal: principalPayment,
          interest: interestPayment,
          tax: taxPayment,
          balance: currentBalance,
        });
      }

      const totalInsuranceAccumulated = monthlyInsurance * n;

      setTotals({
        firstPayment: firstMonthPayment,
        totalInterest: totalInterestAccumulated,
        totalInsurance: totalInsuranceAccumulated,
        totalTax: totalTaxAccumulated,
        totalPaid: loanAmount + totalInterestAccumulated + totalInsuranceAccumulated + totalTaxAccumulated,
      });
      
      setAmortizationTable(table);
    };

    if (loanAmount > 0 && months > 0) {
      runCalculation();
    }
  }, [loanAmount, annualRate, months, monthlyInsurance, taxRate, amortizationSystem]);

  return (
    <main className="min-h-screen bg-slate-100 py-10 px-4 md:px-10 font-sans">
      
      {/* CABECERA */}
      <div className="max-w-6xl mx-auto mb-10 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-3 tracking-tight">
          Calculadora de Préstamos
        </h1>
        <p className="text-slate-500 text-lg max-w-2xl">
          Calcula tu cuota, compara sistemas de amortización y visualiza tu tabla de pagos incluyendo seguros, impuestos y otros gastos.
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: CONFIGURACIÓN */}
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-200 h-fit">
          <h2 className="text-xl font-black text-slate-800 mb-6 uppercase tracking-tight flex items-center gap-2">
            <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Configuración
          </h2>
          
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Monto del Préstamo ($)</label>
              <input 
                type="number" 
                value={loanAmount} 
                onChange={(e) => setLoanAmount(Number(e.target.value))} 
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold outline-none focus:ring-2 focus:ring-rose-500 transition-shadow" 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tasa Anual %</label>
                <input 
                  type="number" 
                  value={annualRate} 
                  onChange={(e) => setAnnualRate(Number(e.target.value))} 
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold outline-none focus:ring-2 focus:ring-rose-500 transition-shadow" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Plazo (Meses)</label>
                <input 
                  type="number" 
                  value={months} 
                  onChange={(e) => setMonths(Number(e.target.value))} 
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold outline-none focus:ring-2 focus:ring-rose-500 transition-shadow" 
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Sistema de Pago</label>
                <select 
                  value={amortizationSystem} 
                  onChange={(e) => setAmortizationSystem(e.target.value as "frances" | "aleman" | "americano")}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold outline-none focus:ring-2 focus:ring-rose-500 transition-shadow cursor-pointer"
                >
                  <option value="frances">Sistema Francés (Cuota Fija)</option>
                  <option value="aleman">Sistema Alemán (Cuota Decreciente)</option>
                  <option value="americano">Sistema Americano (Interés Fijo)</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Gastos Extra ($)</label>
                  <input 
                    type="number" 
                    value={monthlyInsurance} 
                    onChange={(e) => setMonthlyInsurance(Number(e.target.value))} 
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold outline-none focus:ring-2 focus:ring-rose-500 transition-shadow" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Impuestos (%)</label>
                  <input 
                    type="number" 
                    value={taxRate} 
                    onChange={(e) => setTaxRate(Number(e.target.value))} 
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold outline-none focus:ring-2 focus:ring-rose-500 transition-shadow" 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-rose-600 rounded-2xl text-white shadow-xl shadow-rose-200 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-5 rounded-full -mr-10 -mt-10 pointer-events-none"></div>
            <span className="text-xs font-bold opacity-90 uppercase tracking-widest block mb-1">
              Cuota Inicial (Mes 1)
            </span>
            <div className="text-3xl md:text-4xl font-black">${totals.firstPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            {(monthlyInsurance > 0 || taxRate > 0) && (
              <span className="text-[11px] font-medium opacity-80 mt-2 block">
                (Incluye impuestos y gastos extra)
              </span>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: RESULTADOS */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tarjeta Informativa del Sistema */}
          <div className="bg-sky-50 border border-sky-200 p-5 rounded-2xl flex items-start gap-4 shadow-sm">
            <div className="bg-sky-100 p-2 rounded-lg flex-shrink-0">
              <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sky-900 font-bold text-base">
                {amortizationSystem === "frances" && "Sistema Francés (El más común)"}
                {amortizationSystem === "aleman" && "Sistema Alemán (Cuota Decreciente)"}
                {amortizationSystem === "americano" && "Sistema Americano (Solo Intereses)"}
              </h4>
              <p className="text-sky-800 text-sm mt-1 leading-relaxed">
                {amortizationSystem === "frances" && "Pagas una cuota mensual constante. Al inicio del crédito, la mayor parte de tu cuota se va a pagar intereses, y al final, la mayor parte va al capital."}
                {amortizationSystem === "aleman" && "Abonas una cantidad fija al capital de tu deuda cada mes. Como tu deuda baja constantemente, los intereses son menores cada mes y tu cuota total disminuye."}
                {amortizationSystem === "americano" && "Pagas una cuota fija que cubre únicamente los intereses generados en el mes, sin reducir tu deuda. El último mes del crédito debes liquidar el 100% del capital original más el último interés."}
              </p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-200">
            <h2 className="text-xl font-black text-slate-800 mb-6 uppercase">Evolución de la Deuda</h2>
            
            {/* Gráfico de barras decreciente */}
            <div className="flex items-end gap-1 h-48 bg-slate-50 rounded-xl p-4 border border-dashed border-slate-300">
              {amortizationTable.filter((_, i) => i % Math.max(1, Math.floor(months / 20)) === 0).map((data, idx) => (
                <div 
                  key={idx} 
                  className="bg-rose-400 w-full rounded-t-sm hover:bg-rose-500 transition-all cursor-help relative group"
                  style={{ height: `${(data.balance / loanAmount) * 100}%` }}
                >
                  <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] p-1.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 shadow-lg">
                    Mes {data.month}: ${data.balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase mb-1">Capital Prestado</span>
                <span className="text-lg font-black text-slate-800">${loanAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-rose-700 uppercase mb-1">Costo Intereses</span>
                <span className="text-lg font-black text-rose-600">${totals.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-amber-700 uppercase mb-1">Impuestos ({taxRate}%)</span>
                <span className="text-lg font-black text-amber-600">${totals.totalTax.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-indigo-700 uppercase mb-1">Gastos Extra</span>
                <span className="text-lg font-black text-indigo-600">${totals.totalInsurance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* TABLA DE AMORTIZACIÓN */}
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-black text-slate-800 uppercase">Tabla de Amortización</h2>
            </div>
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="p-4 text-[10px] font-bold text-slate-500 uppercase whitespace-nowrap">Mes</th>
                    <th className="p-4 text-[10px] font-bold text-slate-500 uppercase whitespace-nowrap">Cuota Total</th>
                    <th className="p-4 text-[10px] font-bold text-slate-500 uppercase whitespace-nowrap hidden sm:table-cell">Abono a Capital</th>
                    <th className="p-4 text-[10px] font-bold text-slate-500 uppercase whitespace-nowrap hidden sm:table-cell">Pago Interés</th>
                    {taxRate > 0 && (
                      <th className="p-4 text-[10px] font-bold text-slate-500 uppercase whitespace-nowrap hidden md:table-cell">Impuestos</th>
                    )}
                    {monthlyInsurance > 0 && (
                      <th className="p-4 text-[10px] font-bold text-slate-500 uppercase whitespace-nowrap hidden md:table-cell">Gastos Extra</th>
                    )}
                    <th className="p-4 text-[10px] font-bold text-slate-500 uppercase whitespace-nowrap">Saldo Pendiente</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-900">
                  {amortizationTable.map((row) => (
                    <tr key={row.month} className="hover:bg-rose-50/50 transition-colors">
                      <td className="p-4 font-bold text-slate-400">{row.month}</td>
                      <td className="p-4 font-bold text-slate-800">
                        ${row.totalPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 text-slate-600 hidden sm:table-cell">
                        ${row.principal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 text-rose-500 hidden sm:table-cell">
                        ${row.interest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      {taxRate > 0 && (
                        <td className="p-4 text-amber-500 hidden md:table-cell">
                          ${row.tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      )}
                      {monthlyInsurance > 0 && (
                        <td className="p-4 text-indigo-500 hidden md:table-cell">
                          ${row.insurance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      )}
                      <td className="p-4 font-bold text-slate-700">
                        ${row.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
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