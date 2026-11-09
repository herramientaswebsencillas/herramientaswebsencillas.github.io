import { useCallback, useEffect, useRef } from "react";

/**
 * Para herramientas que lanzan una petición por clic (corrector, traductor).
 * `next()` cancela la petición anterior, si sigue en curso, y devuelve la
 * señal de la nueva; al desmontar el componente se cancela la que quede.
 * Así una respuesta tardía no pisa a una más reciente ni actualiza el estado
 * de una página que ya se cerró. Las cancelaciones llegan como AbortError
 * (ver isAbortError en lib/external.ts).
 */
export function useLatestRequest() {
  const controller = useRef<AbortController | null>(null);

  useEffect(() => () => controller.current?.abort(), []);

  return useCallback(() => {
    controller.current?.abort();
    controller.current = new AbortController();
    return controller.current.signal;
  }, []);
}
