"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import ErrorMessage from "@/components/ErrorMessage";
import { MAX_MONTHS, calculateCompoundInterest, monthsError } from "@/lib/finance";

/** `header` y `guide` son la cabecera (ToolHeader) y la guía de uso
    (ToolGuide), que page.tsx renderiza en el servidor para que el catálogo y
    sus textos no lleguen al JavaScript. */
export default function CompoundInterestCalculatorForm({
  header,
  guide,
}: {
  header: ReactNode;
  guide: ReactNode;
}) {
  const [initialAmount, setInitialAmount] = useState<number>(10000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(1000);
  const [months, setMonths] = useState<number>(12);
  const [rate, setRate] = useState<number>(12);
  const [frequency, setFrequency] = useState<number>(12);

  const { table: amortizationTable, totals } = useMemo(
    () =>
      calculateCompoundInterest({ initialAmount, monthlyContribution, months, rate, frequency }),
    [initialAmount, monthlyContribution, months, rate, frequency]
  );
  // Con un plazo no válido calculateCompoundInterest devuelve una tabla vacía.
  const termError = monthsError(months);

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 md:px-10">
      {header}

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-surface p-8 rounded-3xl shadow-lg border border-slate-200 h-fit">
          <h2 className="text-xl font-black text-slate-800 mb-6 uppercase tracking-tight">
            Configuración
          </h2>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="interest-1"
                className="block text-xs font-bold text-slate-500 uppercase mb-1"
              >
                Inversión Inicial ($)
              </label>
              <input
                id="interest-1"
                type="number"
                value={initialAmount}
                onChange={(e) => setInitialAmount(Number(e.target.value))}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label
                htmlFor="interest-2"
                className="block text-xs font-bold text-slate-500 uppercase mb-1"
              >
                Aportación Mensual ($)
              </label>
              <input
                id="interest-2"
                type="number"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="interest-3"
                  className="block text-xs font-bold text-slate-500 uppercase mb-1"
                >
                  Tasa Anual %
                </label>
                <input
                  id="interest-3"
                  type="number"
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label
                  htmlFor="interest-4"
                  className="block text-xs font-bold text-slate-500 uppercase mb-1"
                >
                  Meses
                </label>
                <input
                  id="interest-4"
                  type="number"
                  min={1}
                  max={MAX_MONTHS}
                  step={1}
                  value={months}
                  onChange={(e) => setMonths(Number(e.target.value))}
                  aria-invalid={!!termError}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            {termError && <ErrorMessage>{termError}</ErrorMessage>}

            <div>
              <label
                htmlFor="interest-5"
                className="block text-xs font-bold text-slate-500 uppercase mb-1"
              >
                Frecuencia de Rendimientos
              </label>
              <select
                id="interest-5"
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
            <span className="text-xs font-bold opacity-80 uppercase tracking-widest">
              Saldo Final
            </span>
            <div className="text-3xl font-black">
              ${totals.final.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface p-8 rounded-3xl shadow-lg border border-slate-200">
            <h2 className="text-xl font-black text-slate-800 mb-6 uppercase">
              Crecimiento del Capital
            </h2>
            <div className="flex items-end gap-1 h-48 bg-slate-50 rounded-xl p-4 border border-dashed border-slate-300">
              {amortizationTable
                .filter((_, i) => i % Math.max(1, Math.floor(months / 20)) === 0)
                .map((data, idx) => (
                  <div
                    key={idx}
                    className="bg-indigo-500 w-full rounded-t-sm hover:bg-indigo-400 transition-all cursor-help relative group"
                    style={{ height: `${(data.balance / totals.final) * 100}%` }}
                  >
                    <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] p-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                      Mes {data.month}: $
                      {data.balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {/* El color vive solo en la etiqueta y en un fondo muy claro; la
                  cifra va en gris oscuro. Se evitan además el verde/ámbar de
                  "correcto" y "advertencia": aquí nada es una alerta. */}
              <div className="p-4 bg-teal-50/70 rounded-2xl border border-teal-100 flex justify-between items-center">
                <span className="text-xs font-bold text-teal-700 uppercase">Capital Invertido</span>
                <span className="text-lg font-black text-slate-800">
                  ${totals.invested.toLocaleString()}
                </span>
              </div>
              <div className="p-4 bg-sky-50/70 rounded-2xl border border-sky-100 flex justify-between items-center">
                <span className="text-xs font-bold text-sky-700 uppercase">Interés Generado</span>
                <span className="text-lg font-black text-slate-800">
                  ${totals.interest.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-black text-slate-800 uppercase">Tabla de Proyección</h2>
            </div>
            {/* Fondo gris claro en lugar de blanco: una tabla larga a pantalla
                completa en blanco puro deslumbra al leerla. */}
            {/* Enfocable para que la tabla se pueda desplazar con el teclado. */}
            <div
              className="max-h-[350px] overflow-y-auto bg-slate-50"
              tabIndex={0}
              role="region"
              aria-label="Tabla de crecimiento mensual"
            >
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-100 sticky top-0">
                  <tr>
                    <th className="p-4 text-[10px] font-bold text-slate-600 uppercase">Mes</th>
                    <th className="p-4 text-[10px] font-bold text-slate-600 uppercase">
                      Saldo Acumulado
                    </th>
                    <th className="p-4 text-[10px] font-bold text-slate-600 uppercase">
                      Rendimiento
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-900">
                  {amortizationTable.map((row) => (
                    <tr key={row.month} className="hover:bg-slate-100 transition-colors">
                      <td className="p-4 font-bold text-slate-500">{row.month}</td>
                      <td className="p-4 font-bold">
                        $
                        {row.balance.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="p-4 text-sky-700 font-semibold">
                        +$
                        {row.interest.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {guide}
    </main>
  );
}
