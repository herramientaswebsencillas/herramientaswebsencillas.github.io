/* Lógica de fechas de la calculadora de tiempo entre fechas. Vive aparte del
   componente para poder probarla; el formato dd/mm/aaaa y los parámetros
   desde/hasta son un contrato público (ver README), así que sus pruebas
   protegen enlaces que la gente ya compartió. */

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Fecha en dd/mm/aaaa, el formato que se escribe y el que viaja en la URL. */
export function toDateValue(date: Date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
}

/* Se construye la fecha con el constructor de tres argumentos (hora local) en
   lugar de new Date("2026-01-01"), que ISO interpreta como UTC y adelanta o
   atrasa un día según la zona horaria del visitante. */
function makeDate(year: number, month: number, day: number): Date | null {
  const date = new Date(year, month - 1, day);

  // Descarta fechas inexistentes (31/02, por ejemplo): el constructor las
  // desborda al mes siguiente en vez de fallar.
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

/** dd/mm/aaaa. */
export function parseDate(value: string): Date | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return null;

  return makeDate(Number(match[3]), Number(match[2]), Number(match[1]));
}

/* Las barras se ponen solas al teclear: evita tener que escribirlas y descarta
   de raíz formas ambiguas como 1-2-2026 o 15.9.26. Al borrar no se vuelven a
   añadir, porque se reconstruyen a partir de los dígitos que quedan. */
export function formatWhileTyping(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)]
    .filter((part) => part !== "")
    .join("/");
}

/* Días de calendario, no periodos de 24 h: con horario de verano hay días de
   23 y de 25 horas, así que se redondea el cociente. */
export function diffInDays(from: Date, to: Date) {
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);
}

/** Suma meses recortando al último día del mes destino (31/01 + 1 mes = 28/02). */
export function addMonths(date: Date, months: number) {
  const month = date.getMonth() + months;
  const lastDayOfTarget = new Date(date.getFullYear(), month + 1, 0).getDate();
  return new Date(
    date.getFullYear(),
    month,
    Math.min(date.getDate(), lastDayOfTarget),
  );
}

/** Meses completos entre dos fechas, contando el calendario real. */
export function diffInMonths(from: Date, to: Date) {
  const estimate =
    (to.getFullYear() - from.getFullYear()) * 12 +
    (to.getMonth() - from.getMonth());

  // El estimado se pasa cuando el día del mes destino aún no ha llegado.
  return addMonths(from, estimate) > to ? estimate - 1 : estimate;
}

/** Medianoche de hoy, para comparar contra fechas sin hora igual que ellas. */
function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/* Dónde cae el rango respecto a hoy. Antes esto se deducía de comparar los dos
   extremos entre sí, y por eso "hoy → Navidad" salía como "Han pasado": un
   rango es el mismo se escriba en el orden que se escriba, así que el orden no
   puede decidir si está por venir o si ya ocurrió.

   Un rango que cruza el día de hoy no es ninguna de las dos cosas —parte ya
   pasó y parte falta—, así que en ese caso no se afirma nada. */
export type Direction = "past" | "future" | "crossing";

export function directionOf(from: Date, to: Date): Direction {
  const today = startOfToday();

  if (to <= today) return "past";
  if (from >= today) return "future";
  return "crossing";
}

export interface Difference {
  direction: Direction;
  days: number;
  weeks: number;
  daysAfterWeeks: number;
  months: number;
  daysAfterMonths: number;
  years: number;
  monthsAfterYears: number;
}

export function calculateDifference(start: Date, end: Date): Difference {
  // El rango se normaliza a orden ascendente para poder medirlo.
  const [from, to] = end < start ? [end, start] : [start, end];

  const days = diffInDays(from, to);
  const months = diffInMonths(from, to);

  return {
    direction: directionOf(from, to),
    days,
    weeks: Math.floor(days / 7),
    daysAfterWeeks: days % 7,
    months,
    daysAfterMonths: diffInDays(addMonths(from, months), to),
    years: Math.floor(months / 12),
    monthsAfterYears: months % 12,
  };
}

export interface Dates {
  start: string;
  end: string;
}

/** Valores por defecto: del 1 de enero del año en curso hasta hoy. */
export function defaultDates(): Dates {
  const today = new Date();
  return {
    start: toDateValue(new Date(today.getFullYear(), 0, 1)),
    end: toDateValue(today),
  };
}

export const PARAM_START = "desde";
export const PARAM_END = "hasta";

/** Descarta un parámetro ausente o con una fecha que no existe. */
function dateParam(value: string | null) {
  return value && parseDate(value) ? value : null;
}

/* Las fechas viajan en la URL para que un rango se pueda consultar con un
   enlace. Se leen de window.location y no con useSearchParams porque ese hook
   obliga a envolver la página en <Suspense>, y el HTML prerenderizado se
   quedaría sin encabezado ni formulario.

   Ambos parámetros son opcionales y el que falte se completa con hoy, que es
   lo que hace útil al enlace corto: ?hasta=25/12/2026 dice cuánto falta para
   esa fecha y ?desde=15/03/2024 cuánto ha pasado desde ella. Como el extremo
   que falta se recalcula en cada visita, el enlace sigue vigente mañana.

   Sin ningún parámetro no hay intención que respetar, así que se conserva el
   rango por defecto del año en curso. */
export function datesFromSearch(search: string): Dates {
  const params = new URLSearchParams(search);
  const start = dateParam(params.get(PARAM_START));
  const end = dateParam(params.get(PARAM_END));

  if (!start && !end) return defaultDates();

  const today = toDateValue(new Date());
  return { start: start ?? today, end: end ?? today };
}
