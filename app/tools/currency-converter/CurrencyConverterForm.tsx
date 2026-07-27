"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CURRENCIES,
  CURRENCY_CODES,
  ECB_CURRENCIES,
} from "@/lib/currencies";
import RateChart, { RatePoint } from "./RateChart";

const API = "https://api.frankfurter.dev";

/* Todas las conversiones se calculan como cruce sobre el dólar:
   - /v2/rates solo responde de forma fiable con bases principales (COP o ARS,
     por ejemplo, devuelven vacío), mientras que con base USD sí aparecen las
     165 monedas como cotización.
   - Basta una petición para toda la sesión: cambiar cualquiera de los dos
     selectores es inmediato y no genera tráfico nuevo. */
const RATES_URL = `${API}/v2/rates?base=USD`;

const RANGES = [
  { id: "1m", label: "1 mes", days: 30 },
  { id: "3m", label: "3 meses", days: 90 },
  { id: "6m", label: "6 meses", days: 182 },
  { id: "1y", label: "1 año", days: 365 },
  { id: "5y", label: "5 años", days: 1825 },
] as const;

type RangeId = (typeof RANGES)[number]["id"];

interface Quote {
  rate: number;
  date: string;
}

interface RatesResult {
  quotes: Record<string, Quote>;
  error: string;
}

/** `key` identifica la consulta que produjo la serie. */
interface SeriesResult {
  key: string;
  points: RatePoint[];
  error: string;
}

function toApiDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatDate(iso: string) {
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}

function formatAmount(value: number) {
  return new Intl.NumberFormat("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Las tasas van de 0,00024 (oro) a miles, así que los decimales se ajustan. */
function formatRate(value: number) {
  if (value >= 100) return value.toFixed(2);
  if (value >= 1) return value.toFixed(4);
  return value.toPrecision(4);
}

export default function CurrencyConverterForm() {
  const [amount, setAmount] = useState("1");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("MXN");
  const [range, setRange] = useState<RangeId>("6m");

  /* El estado se fija solo dentro de los callbacks de fetch, nunca de forma
     síncrona en el efecto, y "cargando" se deduce de que aún no haya llegado
     la respuesta que corresponde a lo que se está viendo. */
  const [rates, setRates] = useState<RatesResult | null>(null);
  const [seriesResult, setSeriesResult] = useState<SeriesResult | null>(null);

  const sameCurrency = from === to;
  // La gráfica sale de /v1, que solo cubre las divisas de referencia del BCE.
  const chartSupported =
    ECB_CURRENCIES.has(from) && ECB_CURRENCIES.has(to) && !sameCurrency;
  const seriesKey = `${from}|${to}|${range}`;

  /* ------------------------------ Cotizaciones ----------------------------- */

  useEffect(() => {
    const controller = new AbortController();

    fetch(RATES_URL, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: { quote: string; rate: number; date: string }[]) => {
        if (!Array.isArray(data) || data.length === 0) {
          throw new Error("Respuesta vacía");
        }
        const quotes: Record<string, Quote> = {};
        for (const entry of data) {
          quotes[entry.quote] = { rate: entry.rate, date: entry.date };
        }
        setRates({ quotes, error: "" });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setRates({
          quotes: {},
          error: "No se pudieron obtener las tasas de cambio. Intenta de nuevo.",
        });
      });

    return () => controller.abort();
  }, []);

  /* ---------------------------- Serie histórica ---------------------------- */

  useEffect(() => {
    if (!(ECB_CURRENCIES.has(from) && ECB_CURRENCIES.has(to)) || from === to) {
      return;
    }

    const key = `${from}|${to}|${range}`;
    const days = RANGES.find((r) => r.id === range)?.days ?? 182;
    const end = new Date();
    const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
    const controller = new AbortController();

    fetch(
      `${API}/v1/${toApiDate(start)}..${toApiDate(end)}?base=${from}&symbols=${to}`,
      { signal: controller.signal }
    )
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: { rates: Record<string, Record<string, number>> }) => {
        const points = Object.entries(data.rates ?? {})
          .map(([date, values]) => ({ date, value: values[to] }))
          .filter((point) => typeof point.value === "number")
          // El objeto llega ordenado, pero el orden de claves no está garantizado.
          .sort((a, b) => a.date.localeCompare(b.date));
        setSeriesResult({ key, points, error: "" });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setSeriesResult({
          key,
          points: [],
          error: "No se pudo cargar el histórico de este periodo.",
        });
      });

    return () => controller.abort();
  }, [from, to, range]);

  /* -------------------------------- Cálculo -------------------------------- */

  const numericAmount = useMemo(() => {
    const parsed = Number.parseFloat(amount.replace(",", "."));
    return Number.isFinite(parsed) ? parsed : null;
  }, [amount]);

  // El dólar es la base del cruce, así que vale 1 y no viene en la respuesta.
  const quoteOf = (code: string): Quote | null => {
    if (code === "USD") return { rate: 1, date: "" };
    return rates?.quotes[code] ?? null;
  };

  const fromQuote = quoteOf(from);
  const toQuote = quoteOf(to);

  const effectiveRate = sameCurrency
    ? 1
    : fromQuote && toQuote
      ? toQuote.rate / fromQuote.rate
      : null;

  /* Cada banco central publica a su ritmo, así que las dos patas del cruce
     pueden traer fechas distintas: el resultado solo es tan reciente como la
     más antigua de las dos. */
  const rateDate = sameCurrency
    ? ""
    : [fromQuote?.date, toQuote?.date].filter(Boolean).sort()[0] ?? "";

  const busy = !sameCurrency && !rates;
  const failed = sameCurrency ? "" : rates?.error ?? "";
  const missingQuote =
    !busy && !failed && !sameCurrency && (!fromQuote || !toQuote);

  const converted =
    effectiveRate !== null && numericAmount !== null
      ? numericAmount * effectiveRate
      : null;

  const settledSeries = seriesResult?.key === seriesKey ? seriesResult : null;
  const loadingSeries = chartSupported && !settledSeries;
  const seriesError = chartSupported ? settledSeries?.error ?? "" : "";
  const series = settledSeries?.points ?? [];

  const outsideEcb = [from, to].filter((code) => !ECB_CURRENCIES.has(code));

  const swap = useCallback(() => {
    setFrom(to);
    setTo(from);
  }, [from, to]);

  const renderOptions = () =>
    CURRENCY_CODES.map((code) => (
      <option key={code} value={code}>
        {code} · {CURRENCIES[code]}
      </option>
    ));

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Conversor de Divisas y Tipo de Cambio
          </h1>
          <p className="text-slate-500">
            Convierte entre 165 monedas y consulta cómo ha evolucionado el tipo
            de cambio.
          </p>
        </div>

        {/* ----------------------------- Conversión ---------------------------- */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="bg-teal-700 p-4">
            <h2 className="text-white font-semibold flex items-center gap-2">
              💱 Conversión
            </h2>
          </div>

          <div className="p-6 space-y-5">
            <div>
              <label
                htmlFor="amount"
                className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1"
              >
                Cantidad
              </label>
              <input
                id="amount"
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-lg font-semibold focus:ring-2 focus:ring-teal-500 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 sm:items-end">
              <div>
                <label
                  htmlFor="from"
                  className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1"
                >
                  De
                </label>
                <select
                  id="from"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium shadow-sm focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  {renderOptions()}
                </select>
              </div>

              <button
                onClick={swap}
                title="Intercambiar monedas"
                aria-label="Intercambiar monedas"
                className="justify-self-center p-3 bg-slate-700 hover:bg-slate-600 rounded-full text-white transition-colors"
              >
                ⇄
              </button>

              <div>
                <label
                  htmlFor="to"
                  className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1"
                >
                  A
                </label>
                <select
                  id="to"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium shadow-sm focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  {renderOptions()}
                </select>
              </div>
            </div>

            {/* Resultado */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-center">
              {busy && (
                <p className="text-slate-400 text-sm">Consultando tasas...</p>
              )}

              {!busy && failed && (
                <p className="text-red-500 text-sm">{failed}</p>
              )}

              {missingQuote && (
                <p className="text-amber-700 text-sm">
                  No hay cotización disponible para este par ahora mismo.
                </p>
              )}

              {!busy && !failed && !missingQuote && converted !== null && (
                <>
                  <p className="text-3xl font-bold text-slate-800 break-words">
                    {formatAmount(converted)}{" "}
                    <span className="text-lg text-slate-500">{to}</span>
                  </p>
                  {effectiveRate !== null && !sameCurrency && (
                    <p className="text-sm text-slate-500 mt-2">
                      1 {from} = {formatRate(effectiveRate)} {to} · 1 {to} ={" "}
                      {formatRate(1 / effectiveRate)} {from}
                    </p>
                  )}
                  {rateDate && (
                    <p className="text-xs text-slate-400 mt-1">
                      Tasa del {formatDate(rateDate)}
                    </p>
                  )}
                </>
              )}

              {!busy && !failed && !missingQuote && converted === null && (
                <p className="text-slate-400 text-sm">
                  Escribe una cantidad válida para ver la conversión.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ------------------------------ Histórico ---------------------------- */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-800 p-4">
            <h2 className="text-white font-semibold flex items-center gap-2">
              📈 Evolución histórica
            </h2>
          </div>

          <div className="p-6 space-y-4">
            {sameCurrency && (
              <p className="text-sm text-slate-500 text-center py-12">
                Elige dos monedas distintas para ver la evolución del tipo de
                cambio.
              </p>
            )}

            {!sameCurrency && !chartSupported && (
              <div className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                <p className="font-semibold mb-1">
                  Gráfica no disponible para este par
                </p>
                <p>
                  El histórico solo existe para las 30 divisas de referencia del
                  Banco Central Europeo, y{" "}
                  {outsideEcb
                    .map((code) => `${CURRENCIES[code]} (${code})`)
                    .join(" y ")}{" "}
                  {outsideEcb.length > 1 ? "no están incluidas" : "no está incluida"}
                  . La conversión de arriba sí funciona con normalidad.
                </p>
              </div>
            )}

            {chartSupported && (
              <>
                <div className="flex flex-wrap gap-2 justify-center">
                  {RANGES.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setRange(option.id)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                        range === option.id
                          ? "bg-teal-700 text-white shadow-sm"
                          : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                <p className="text-sm text-slate-500 text-center">
                  {from} → {to}
                </p>

                {loadingSeries && (
                  <p className="text-slate-400 text-sm text-center py-12">
                    Cargando histórico...
                  </p>
                )}

                {!loadingSeries && seriesError && (
                  <p className="text-red-500 text-sm text-center py-12">
                    {seriesError}
                  </p>
                )}

                {!loadingSeries && !seriesError && (
                  <RateChart points={series} from={from} to={to} />
                )}
              </>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-400 text-center mt-6 max-w-2xl mx-auto">
          Tasas de referencia diarias publicadas por bancos centrales vía{" "}
          <a
            href="https://frankfurter.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline-offset-2 hover:text-teal-600 hover:underline"
          >
            Frankfurter
          </a>
          . Los pares que no incluyen el dólar se calculan cruzando ambas
          cotizaciones sobre él. No son precios de mercado en tiempo real ni
          incluyen las comisiones de tu banco, así que sirven para orientarte,
          no para operar. Solo se envía el par consultado, ningún dato personal.
        </p>
      </div>
    </main>
  );
}
