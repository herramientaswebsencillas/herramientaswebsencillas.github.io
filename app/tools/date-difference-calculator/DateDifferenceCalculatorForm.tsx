"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

import {
  PARAM_END,
  PARAM_START,
  calculateDifference,
  datesFromSearch,
  defaultDates,
  formatWhileTyping,
  parseDate,
  toDateValue,
  type Dates,
  type Direction,
} from "@/lib/dates";
import { copyLabel, useCopy } from "@/lib/useCopy";

const DIRECTION_LABELS: Record<Direction, string> = {
  past: "Han pasado",
  future: "Faltan",
  crossing: "En total",
};

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
  "w-full p-3 bg-slate-50 border rounded-xl text-slate-900 font-bold outline-none focus:ring-2 tabular-nums";
const INPUT_VALID_CLASSES = "border-slate-300 focus:ring-indigo-500";
const INPUT_INVALID_CLASSES = "border-rose-400 focus:ring-rose-400";

const NO_DATES: Dates = { start: "", end: "" };

/* Un campo de texto en vez de <input type="date">: el nativo muestra la fecha
   en el formato del idioma del navegador, que no se puede forzar desde el
   código, y a un visitante con Chrome en inglés le aparecería mm/dd/aaaa.

   A cambio se pierde el calendario nativo, así que el campo se apoya en el
   teclado numérico en móvil y en las barras automáticas al teclear. */
function DateField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  // Un campo vacío está a medio llenar, no mal llenado: no se marca en rojo.
  const isInvalid = value !== "" && !parseDate(value);

  return (
    <div>
      <label htmlFor={id} className="block text-xs font-bold text-slate-500 uppercase mb-1">
        {label}
      </label>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder="dd/mm/aaaa"
        maxLength={10}
        value={value}
        aria-invalid={isInvalid}
        onChange={(event) => onChange(formatWhileTyping(event.currentTarget.value))}
        className={`${INPUT_CLASSES} ${isInvalid ? INPUT_INVALID_CLASSES : INPUT_VALID_CLASSES}`}
      />
    </div>
  );
}

/* Las dos direcciones que admite un enlace de una sola fecha. El otro extremo
   siempre es hoy, y por eso el enlace no caduca: se recalcula al abrirlo. */
const LINK_MODES = [
  {
    param: PARAM_END,
    label: "Hacia una fecha",
    hint: "Cuenta lo que falta desde hoy hasta la fecha elegida.",
  },
  {
    param: PARAM_START,
    label: "Desde una fecha",
    hint: "Cuenta lo que ha pasado desde la fecha elegida hasta hoy.",
  },
] as const;

/* Se usa <dialog> nativo en lugar de un div superpuesto: trae gratis el
   atrapado del foco, el cierre con Escape y el fondo inerte, que a mano son
   la parte que se suele hacer mal. */
function CountdownLinkDialog({ onClose }: { onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [param, setParam] = useState<string>(PARAM_END);
  const [date, setDate] = useState("");
  const { copy, statusOf } = useCopy();

  /* showModal() no se puede llamar durante el render, solo sobre el nodo ya
     montado; es lo que distingue un modal de un <dialog open> normal.

     Al desmontar se cierra a conciencia en vez de dejar que React arranque el
     nodo sin más: así el navegador saca el diálogo de la capa superior y
     devuelve el foco al botón que lo abrió. */
  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();

    return () => dialog?.close();
  }, []);

  const mode = LINK_MODES.find((option) => option.param === param) ?? LINK_MODES[0];

  // Sin fecha completa y real no hay enlace que copiar.
  const link = parseDate(date)
    ? `${window.location.origin}${window.location.pathname}?${param}=${date}`
    : null;

  const copyLink = () => {
    if (link) copy(link);
  };

  return (
    /* Todas las salidas llaman a onClose() en vez de a dialog.close(), y el
       desmontaje es lo que cierra de verdad. Colgar el cierre del evento
       "close" del elemento lo hacía frágil: si ese evento no llega, el estado
       se queda en abierto, el diálogo permanece montado pero invisible y el
       botón ya no consigue reabrirlo. Al invertirlo, el estado de React manda
       y el evento nativo pasa a ser prescindible. */
    <dialog
      ref={dialogRef}
      // Escape: se corta el cierre nativo para que el desmontaje sea la única
      // vía y no queden el estado y el DOM contando historias distintas.
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onKeyDown={(event) => {
        if (event.key !== "Escape") return;

        event.preventDefault();
        onClose();
      }}
      // Cerrar al pinchar fuera: el clic en el fondo tiene como destino el
      // propio <dialog>, mientras que el de dentro lo tiene en la tarjeta.
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
      className="m-auto w-[min(30rem,calc(100vw-2rem))] bg-transparent p-0 backdrop:bg-slate-900/50"
    >
      <div className="bg-surface p-8 rounded-3xl border border-slate-200 shadow-2xl">
        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-6">
          Crear cuenta regresiva
        </h2>

        <div
          role="radiogroup"
          aria-label="Dirección del conteo"
          className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl"
        >
          {LINK_MODES.map((option) => (
            <button
              key={option.param}
              type="button"
              role="radio"
              aria-checked={option.param === param}
              onClick={() => setParam(option.param)}
              className={`p-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors cursor-pointer ${
                option.param === param
                  ? "bg-surface text-indigo-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <p className="mt-3 mb-5 text-xs text-slate-500 leading-relaxed">{mode.hint}</p>

        <DateField id="countdown-date" label="Fecha" value={date} onChange={setDate} />

        <div className="mt-5 p-3 bg-slate-50 rounded-xl border border-dashed border-slate-300">
          <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
            Enlace
          </span>
          <span className="block text-xs font-semibold text-slate-700 break-all">
            {link ?? "Introduce una fecha válida."}
          </span>
        </div>

        <button
          type="button"
          onClick={copyLink}
          disabled={!link}
          className="mt-5 w-full p-3 bg-indigo-600 rounded-xl text-white text-sm font-bold uppercase tracking-wide hover:bg-indigo-700 transition-colors cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed"
        >
          {copyLabel(statusOf(), "Copiar enlace", "¡Enlace copiado!")}
        </button>

        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full p-3 bg-slate-100 border border-slate-300 rounded-xl text-slate-600 text-sm font-bold uppercase tracking-wide hover:bg-slate-200 transition-colors cursor-pointer"
        >
          Cerrar
        </button>
      </div>
    </dialog>
  );
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
    () => false
  );

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editedDates, setEditedDates] = useState<Dates | null>(null);
  const initialDates = useMemo(
    () => (isHydrated ? datesFromSearch(window.location.search) : NO_DATES),
    [isHydrated]
  );
  const { start: startDate, end: endDate } = editedDates ?? initialDates;

  const setStartDate = (value: string) =>
    setEditedDates((current) => ({ ...(current ?? initialDates), start: value }));
  const setEndDate = (value: string) =>
    setEditedDates((current) => ({ ...(current ?? initialDates), end: value }));

  /* La URL se mantiene al día con lo que se ve en pantalla, de modo que basta
     con copiar la barra de direcciones para compartir el rango. replaceState
     en lugar de pushState: cada cambio del selector añadiría una entrada al
     historial y el botón de retroceso dejaría de servir.

     La guarda de hidratación no es opcional: en el primer render las fechas
     todavía están vacías, y sin ella este efecto borraría los parámetros del
     enlace recién abierto antes de poder leerlos. */
  useEffect(() => {
    if (!isHydrated) return;

    const today = toDateValue(new Date());
    const params = new URLSearchParams(window.location.search);

    /* El extremo que coincide con hoy se omite en vez de fijarse, porque al
       leer la ausencia del parámetro ya significa "hoy". Así lo que se copia
       es el enlace corto y sigue vivo: quien lo abra la semana que viene lo
       contará desde su día actual y no desde el de quien lo compartió.

       Solo se escribe lo que se puede volver a leer: mientras se teclea el
       campo pasa por estados a medias como "15/0" que no son una fecha. */
    const write = (name: string, value: string) => {
      if (parseDate(value) && value !== today) params.set(name, value);
      else params.delete(name);
    };

    write(PARAM_START, startDate);
    write(PARAM_END, endDate);

    /* toString() escapa las barras a %2F y dejaría el enlace ilegible. En la
       parte de consulta la barra es un carácter permitido tal cual (RFC 3986),
       y los valores solo llevan dígitos, así que se puede devolver sin riesgo
       de romper la separación entre parámetros. */
    const query = params.toString().replaceAll("%2F", "/");
    window.history.replaceState(null, "", query ? `?${query}` : window.location.pathname);
  }, [isHydrated, startDate, endDate]);

  const start = useMemo(() => parseDate(startDate), [startDate]);
  const end = useMemo(() => parseDate(endDate), [endDate]);
  const difference = useMemo(
    () => (start && end ? calculateDifference(start, end) : null),
    [start, end]
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
          Calcula cuántos días, semanas, meses y años hay a partir de una fecha. Por defecto cuenta
          desde el primer día del año en curso hasta hoy.
        </p>
      </div>

      {/* El resultado va primero en el DOM para que en móvil se lea antes que
          los controles. En escritorio ocupa dos de las tres columnas, así que
          los controles caen solos en la de la derecha; no hacen falta clases
          order-*, que además dejarían el orden de lectura por teclado o lector
          de pantalla contradiciendo al visual. */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {!difference ? (
            <div className="bg-surface p-8 rounded-3xl shadow-lg border border-slate-200 text-slate-500">
              Introduce dos fechas válidas para ver el resultado.
            </div>
          ) : (
            <div className="bg-surface p-8 rounded-3xl shadow-lg border border-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <h2 className="text-xl font-black text-slate-800 uppercase">Resultado</h2>
                {/* Único indicador del sentido del cálculo: las tarjetas dan la
                    magnitud, pero no si la fecha ya pasó o está por venir. */}
                <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-widest">
                  {DIRECTION_LABELS[difference.direction]}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {cards.map((card, index) => {
                  const style = CARD_STYLES[index];

                  return (
                    <div key={card.label} className={`p-5 rounded-2xl border ${style.box}`}>
                      <span
                        className={`block text-xs font-bold uppercase tracking-wide ${style.label}`}
                      >
                        {card.label}
                      </span>
                      <div className={`text-3xl font-black ${style.value}`}>{card.value}</div>
                      <span className="text-xs font-semibold text-slate-500">{card.detail}</span>
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
        <div className="bg-surface p-8 rounded-3xl shadow-lg border border-slate-200 h-fit">
          <h2 className="text-xl font-black text-slate-800 mb-6 uppercase tracking-tight">
            Fechas
          </h2>

          <div className="space-y-4">
            <DateField id="start-date" label="Desde" value={startDate} onChange={setStartDate} />
            <DateField id="end-date" label="Hasta" value={endDate} onChange={setEndDate} />
          </div>

          <button
            type="button"
            onClick={() => setIsDialogOpen(true)}
            className="mt-6 w-full p-3 bg-indigo-600 rounded-xl text-white text-sm font-bold uppercase tracking-wide hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            Crear cuenta regresiva
          </button>

          <button
            type="button"
            onClick={() => setEditedDates(defaultDates())}
            className="mt-3 w-full p-3 bg-slate-100 border border-slate-300 rounded-xl text-slate-600 text-sm font-bold uppercase tracking-wide hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Restablecer
          </button>
        </div>
      </div>

      {/* Se monta solo al abrirlo: así el efecto de apertura corre en el montaje
          y el diálogo nunca se renderiza durante el prerenderizado, donde
          window.location no existe. */}
      {isDialogOpen && <CountdownLinkDialog onClose={() => setIsDialogOpen(false)} />}
    </main>
  );
}
