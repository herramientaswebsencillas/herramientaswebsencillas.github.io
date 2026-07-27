"use client";

import { useState } from "react";

export interface RatePoint {
  date: string;
  value: number;
}

/* Gráfica SVG dibujada a mano: evita añadir una librería de charts al bundle
   y no necesita nada que la CSP tenga que permitir. */

const WIDTH = 640;
const HEIGHT = 240;
const PAD_X = 8;
const PAD_Y = 16;

function formatDate(iso: string) {
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}

function formatShortDate(iso: string) {
  const [year, month] = iso.split("-");
  return `${month}/${year.slice(2)}`;
}

interface Props {
  points: RatePoint[];
  from: string;
  to: string;
}

export default function RateChart({ points, from, to }: Props) {
  const [hover, setHover] = useState<number | null>(null);

  if (points.length < 2) {
    return (
      <p className="text-sm text-slate-500 text-center py-12">
        No hay suficientes datos para dibujar la evolución de este periodo.
      </p>
    );
  }

  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  // Un periodo plano dejaría el rango en cero y la línea saldría fuera del área.
  const span = max - min || max || 1;

  const x = (index: number) =>
    PAD_X + (index * (WIDTH - PAD_X * 2)) / (points.length - 1);
  const y = (value: number) =>
    HEIGHT - PAD_Y - ((value - min) / span) * (HEIGHT - PAD_Y * 2);

  const line = points.map((p, i) => `${x(i)},${y(p.value)}`).join(" ");
  const area = `${PAD_X},${HEIGHT - PAD_Y} ${line} ${WIDTH - PAD_X},${HEIGHT - PAD_Y}`;

  const first = points[0];
  const last = points[points.length - 1];
  const change = ((last.value - first.value) / first.value) * 100;
  const active = hover !== null ? points[hover] : null;

  const handleMove = (event: React.PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    // El SVG se escala con viewBox, así que hay que pasar el píxel de pantalla
    // a coordenadas del dibujo antes de buscar el punto más cercano.
    const local = ((event.clientX - rect.left) / rect.width) * WIDTH;
    const ratio = (local - PAD_X) / (WIDTH - PAD_X * 2);
    const index = Math.round(ratio * (points.length - 1));
    setHover(Math.min(points.length - 1, Math.max(0, index)));
  };

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
        <p className="text-sm text-slate-500">
          {active ? (
            <>
              <span className="font-semibold text-slate-700">
                {active.value.toFixed(4)}
              </span>{" "}
              {to} el {formatDate(active.date)}
            </>
          ) : (
            <>
              Máximo {max.toFixed(4)} · Mínimo {min.toFixed(4)}
            </>
          )}
        </p>
        <p
          className={`text-sm font-semibold ${
            change >= 0 ? "text-emerald-600" : "text-red-600"
          }`}
        >
          {change >= 0 ? "▲" : "▼"} {Math.abs(change).toFixed(2)}% en el periodo
        </p>
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full h-56 touch-none"
        onPointerMove={handleMove}
        onPointerLeave={() => setHover(null)}
        role="img"
        aria-label={`Evolución del tipo de cambio de ${from} a ${to}. Del ${formatDate(
          first.date
        )} al ${formatDate(last.date)}. Mínimo ${min.toFixed(
          4
        )}, máximo ${max.toFixed(4)}, variación ${change.toFixed(2)} por ciento.`}
      >
        <defs>
          <linearGradient id="rate-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0d9488" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#0d9488" stopOpacity="0" />
          </linearGradient>
        </defs>

        <polygon points={area} fill="url(#rate-fill)" />
        <polyline
          points={line}
          fill="none"
          stroke="#0d9488"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />

        {active && hover !== null && (
          <g>
            <line
              x1={x(hover)}
              y1={PAD_Y}
              x2={x(hover)}
              y2={HEIGHT - PAD_Y}
              stroke="#94a3b8"
              strokeWidth="1"
              strokeDasharray="3 3"
              vectorEffect="non-scaling-stroke"
            />
            <circle
              cx={x(hover)}
              cy={y(active.value)}
              r="4"
              fill="#0d9488"
              stroke="#ffffff"
              strokeWidth="2"
            />
          </g>
        )}
      </svg>

      <div className="flex justify-between text-xs text-slate-400 mt-1">
        <span>{formatShortDate(first.date)}</span>
        <span>{formatShortDate(last.date)}</span>
      </div>
    </div>
  );
}
