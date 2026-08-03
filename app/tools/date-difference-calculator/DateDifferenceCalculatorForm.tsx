"use client";

import { useMemo, useState, useSyncExternalStore } from "react";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Fecha en el formato que espera <input type="date">. */
function toInputValue(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/* Se construye la fecha con el constructor de tres argumentos (hora local) en
   lugar de new Date("2026-01-01"), que ISO interpreta como UTC y adelanta o
   atrasa un día según la zona horaria del visitante. */
function parseInputValue(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(year, month, day);

  // Descarta fechas inexistentes (31/02, por ejemplo): el constructor las
  // desborda al mes siguiente en vez de fallar.
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

/* Días de calendario, no periodos de 24 h: con horario de verano hay días de
   23 y de 25 horas, así que se redondea el cociente. */
function diffInDays(from: Date, to: Date) {
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);
}

/** Suma meses recortando al último día del mes destino (31/01 + 1 mes = 28/02). */
function addMonths(date: Date, months: number) {
  const month = date.getMonth() + months;
  const lastDayOfTarget = new Date(date.getFullYear(), month + 1, 0).getDate();
  return new Date(
    date.getFullYear(),
    month,
    Math.min(date.getDate(), lastDayOfTarget),
  );
}

/** Meses completos entre dos fechas, contando el calendario real. */
function diffInMonths(from: Date, to: Date) {
  const estimate =
    (to.getFullYear() - from.getFullYear()) * 12 +
    (to.getMonth() - from.getMonth());

  // El estimado se pasa cuando el día del mes destino aún no ha llegado.
  return addMonths(from, estimate) > to ? estimate - 1 : estimate;
}

interface Difference {
  /** La fecha de referencia está en el futuro respecto a la de comparación. */
  isFuture: boolean;
  days: number;
  weeks: number;
  daysAfterWeeks: number;
  months: number;
  daysAfterMonths: number;
  years: number;
  monthsAfterYears: number;
}

function calculateDifference(start: Date, end: Date): Difference {
  const isFuture = end < start;
  const [from, to] = isFuture ? [end, start] : [start, end];

  const days = diffInDays(from, to);
  const months = diffInMonths(from, to);

  return {
    isFuture,
    days,
    weeks: Math.floor(days / 7),
    daysAfterWeeks: days % 7,
    months,
    daysAfterMonths: diffInDays(addMonths(from, months), to),
    years: Math.floor(months / 12),
    monthsAfterYears: months % 12,
  };
}

function formatNumber(value: number) {
  return value.toLocaleString("es-MX");
}

/* Una rampa fría de menor a mayor unidad en lugar de cuatro colores sueltos:
   el ámbar y el rojo leían como advertencia o error, cuando aquí las cuatro
   tarjetas son el mismo dato expresado en otra unidad. */
const CARD_STYLES = [
  { value: "text-sky-900", box: "bg-sky-50 border-sky-100", label: "text-sky-700" },
  { value: "text-teal-900", box: "bg-teal-50 border-teal-100", label: "text-teal-700" },
  { value: "text-indigo-900", box: "bg-indigo-50 border-indigo-100", label: "text-indigo-700" },
  { value: "text-violet-900", box: "bg-violet-50 border-violet-100", label: "text-violet-700" },
];

const INPUT_CLASSES =
  "w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold outline-none focus:ring-2 focus:ring-indigo-500";

interface Dates {
  start: string;
  end: string;
}

const NO_DATES: Dates = { start: "", end: "" };

/** Valores por defecto: del 1 de enero del año en curso hasta hoy. */
function defaultDates(): Dates {
  const today = new Date();
  return {
    start: toInputValue(new Date(today.getFullYear(), 0, 1)),
    end: toInputValue(today),
  };
}

/* El sitio es un export estático: el HTML se genera durante el build, así que
   "hoy" no se puede calcular al renderizar en el servidor sin que la fecha se
   quede congelada en el día de la compilación. useSyncExternalStore devuelve
   el valor del servidor mientras React hidrata y el del cliente justo después,
   que es la forma de repintar con datos del navegador sin discrepancias. */
const subscribeToNothing = () => () => {};

export default function DateDifferenceCalculatorForm() {
  const isHydrated = useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );

  const [editedDates, setEditedDates] = useState<Dates | null>(null);
  const defaults = useMemo(
    () => (isHydrated ? defaultDates() : NO_DATES),
    [isHydrated],
  );
  const { start: startDate, end: endDate } = editedDates ?? defaults;

  const setStartDate = (value: string) =>
    setEditedDates((current) => ({ ...(current ?? defaults), start: value }));
  const setEndDate = (value: string) =>
    setEditedDates((current) => ({ ...(current ?? defaults), end: value }));

  const start = useMemo(() => parseInputValue(startDate), [startDate]);
  const end = useMemo(() => parseInputValue(endDate), [endDate]);
  const difference = useMemo(
    () => (start && end ? calculateDifference(start, end) : null),
    [start, end],
  );

  const cards = difference
    ? [
        { label: "Días", value: formatNumber(difference.days), detail: "días de calendario" },
        {
          label: "Semanas",
          value: formatNumber(difference.weeks),
          detail:
            difference.daysAfterWeeks > 0
              ? `y ${difference.daysAfterWeeks} ${difference.daysAfterWeeks === 1 ? "día" : "días"}`
              : "exactas",
        },
        {
          label: "Meses",
          value: formatNumber(difference.months),
          detail:
            difference.daysAfterMonths > 0
              ? `y ${difference.daysAfterMonths} ${difference.daysAfterMonths === 1 ? "día" : "días"}`
              : "exactos",
        },
        {
          label: "Años",
          value: formatNumber(difference.years),
          detail:
            difference.monthsAfterYears > 0
              ? `y ${difference.monthsAfterYears} ${difference.monthsAfterYears === 1 ? "mes" : "meses"}`
              : "exactos",
        },
      ]
    : [];

  return (
    <main className="min-h-screen bg-slate-100 py-10 px-4 md:px-10 font-sans">
      <div className="max-w-5xl mx-auto mb-10 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-3 tracking-tight">
          Calculadora de Tiempo entre Fechas
        </h1>
        <p className="text-slate-500 text-lg max-w-2xl">
          Calcula cuántos días, semanas, meses y años hay a partir de una fecha.
          Por defecto cuenta desde el primer día del año en curso hasta hoy.
        </p>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-surface p-8 rounded-3xl shadow-lg border border-slate-200 h-fit">
          <h2 className="text-xl font-black text-slate-800 mb-6 uppercase tracking-tight">
            Fechas
          </h2>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="start-date"
                className="block text-xs font-bold text-slate-500 uppercase mb-1"
              >
                Desde
              </label>
              <input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.currentTarget.value)}
                className={INPUT_CLASSES}
              />
            </div>

            <div>
              <label
                htmlFor="end-date"
                className="block text-xs font-bold text-slate-500 uppercase mb-1"
              >
                Hasta
              </label>
              <input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.currentTarget.value)}
                className={INPUT_CLASSES}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setEditedDates(defaultDates())}
            className="mt-6 w-full p-3 bg-slate-100 border border-slate-300 rounded-xl text-slate-600 text-sm font-bold uppercase tracking-wide hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Restablecer
          </button>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {!difference ? (
            <div className="bg-surface p-8 rounded-3xl shadow-lg border border-slate-200 text-slate-500">
              Introduce dos fechas válidas para ver el resultado.
            </div>
          ) : (
            <div className="bg-surface p-8 rounded-3xl shadow-lg border border-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <h2 className="text-xl font-black text-slate-800 uppercase">
                  Resultado
                </h2>
                {/* Único indicador del sentido del cálculo: las tarjetas dan la
                    magnitud, pero no si la fecha ya pasó o está por venir. */}
                <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-widest">
                  {difference.isFuture ? "Faltan" : "Han pasado"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {cards.map((card, index) => {
                  const style = CARD_STYLES[index];

                  return (
                    <div
                      key={card.label}
                      className={`p-5 rounded-2xl border ${style.box}`}
                    >
                      <span
                        className={`block text-xs font-bold uppercase tracking-wide ${style.label}`}
                      >
                        {card.label}
                      </span>
                      <div className={`text-3xl font-black ${style.value}`}>
                        {card.value}
                      </div>
                      <span className="text-xs font-semibold text-slate-500">
                        {card.detail}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center">
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                  Horas
                </span>
                <span className="text-lg font-black text-slate-800">
                  {formatNumber(difference.days * 24)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
