import { useEffect, useRef, useState } from "react";

export type CopyStatus = "copied" | "failed";

/**
 * Copia texto al portapapeles y recuerda unos segundos cómo salió, para que
 * el botón lo diga en su propia etiqueta (ver `copyLabel`).
 *
 * navigator.clipboard.writeText devuelve una promesa que se rechaza si el
 * navegador niega el permiso, y navigator.clipboard ni siquiera existe fuera
 * de un contexto seguro. Sin esperar la promesa, las herramientas anunciaban
 * "¡Copiado!" aunque no se hubiera copiado nada.
 *
 * `target` distingue los botones de una misma herramienta.
 */
export function useCopy(resetMs = 2000) {
  const [last, setLast] = useState<{ target: string; status: CopyStatus } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async (text: string, target = "") => {
    if (!text) return;
    let status: CopyStatus;
    try {
      await navigator.clipboard.writeText(text);
      status = "copied";
    } catch {
      status = "failed";
    }
    setLast({ target, status });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setLast(null), resetMs);
  };

  const statusOf = (target = ""): CopyStatus | null =>
    last?.target === target ? last.status : null;

  /** Olvida el último intento, p. ej. al generar un resultado nuevo. */
  const reset = () => {
    clearTimeout(timer.current);
    setLast(null);
  };

  return { copy, statusOf, reset };
}

/** Etiqueta del botón según el último intento: la de reposo, o cómo salió. */
export function copyLabel(status: CopyStatus | null, idle = "Copiar", copied = "¡Copiado!") {
  if (status === "copied") return copied;
  if (status === "failed") return "No se pudo copiar";
  return idle;
}
