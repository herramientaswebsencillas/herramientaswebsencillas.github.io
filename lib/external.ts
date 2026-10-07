/* Validación de las respuestas de los servicios externos (LanguageTool,
   MyMemory y Frankfurter).

   React ya muestra todo como texto, así que una respuesta maliciosa no puede
   ejecutar código; lo que sí puede es traer datos absurdos: una tasa negativa,
   una corrección que apunta fuera del texto o un aviso de cuota disfrazado de
   traducción. Aquí se descarta lo que no tiene la forma esperada antes de que
   llegue a la interfaz. Las mismas funciones usa el monitoreo diario
   (lib/external.live.test.ts), de modo que un cambio de formato en un servicio
   se detecta ahí antes de que lo note alguien en el sitio. */

/** Espera máxima de cada petición a un servicio externo. Sin ella, un servicio
    que acepta la conexión y no responde deja la herramienta cargando, con el
    botón deshabilitado, hasta que el navegador corta la conexión (minutos). */
export const EXTERNAL_TIMEOUT_MS = 15_000;

/** Error con un mensaje que se puede mostrar tal cual al usuario. */
export class ExternalServiceError extends Error {}

type Json = Record<string, unknown>;

const isObject = (value: unknown): value is Json =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isPositiveNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value > 0;

const isIndex = (value: unknown): value is number =>
  typeof value === "number" && Number.isInteger(value) && value >= 0;

/* ------------------------------ LanguageTool ------------------------------ */

export interface LTReplacement {
  value: string;
}

export interface LTMatch {
  message: string;
  offset: number;
  length: number;
  replacements: LTReplacement[];
  rule?: { id?: string; category?: { id: string; name?: string } };
}

/**
 * Correcciones de /v2/check. Se descartan las que no caen dentro del texto
 * enviado: aplicarlas cortaría o duplicaría texto del usuario.
 */
export function parseLanguageToolMatches(data: unknown, text: string): LTMatch[] {
  if (!isObject(data) || !Array.isArray(data.matches)) {
    throw new ExternalServiceError("El servicio de corrección respondió en un formato inesperado.");
  }

  const matches: LTMatch[] = [];
  for (const raw of data.matches) {
    if (!isObject(raw)) continue;
    const { message, offset, length, replacements, rule } = raw;
    if (typeof message !== "string" || !isIndex(offset) || !isIndex(length)) continue;
    if (length === 0 || offset + length > text.length) continue;

    const category = isObject(rule) && isObject(rule.category) ? rule.category : null;
    matches.push({
      message,
      offset,
      length,
      replacements: Array.isArray(replacements)
        ? replacements.filter((r): r is LTReplacement => isObject(r) && typeof r.value === "string")
        : [],
      rule: isObject(rule)
        ? {
            id: typeof rule.id === "string" ? rule.id : undefined,
            category:
              category && typeof category.id === "string"
                ? {
                    id: category.id,
                    name: typeof category.name === "string" ? category.name : undefined,
                  }
                : undefined,
          }
        : undefined,
    });
  }
  return matches;
}

/* -------------------------------- MyMemory -------------------------------- */

export const MYMEMORY_QUOTA_MESSAGE =
  "Se agotó por hoy la cuota gratuita del servicio de traducción para tu conexión. Intenta de nuevo mañana.";

/**
 * Traducción de /get. Con la cuota diaria agotada, MyMemory puede devolver el
 * aviso dentro de translatedText ("MYMEMORY WARNING: YOU USED ALL AVAILABLE
 * FREE TRANSLATIONS…"), así que no basta con leer ese campo.
 */
export function parseMyMemoryTranslation(data: unknown): string {
  if (!isObject(data)) {
    throw new ExternalServiceError("El servicio de traducción respondió en un formato inesperado.");
  }

  const status = Number(data.responseStatus);
  const translated = isObject(data.responseData) ? data.responseData.translatedText : undefined;

  if (
    data.quotaFinished === true ||
    status === 429 ||
    (typeof translated === "string" && /^MYMEMORY WARNING/i.test(translated))
  ) {
    throw new ExternalServiceError(MYMEMORY_QUOTA_MESSAGE);
  }
  if (status !== 200 || typeof translated !== "string") {
    throw new ExternalServiceError("No se pudo traducir el texto. Intenta de nuevo.");
  }
  return translated;
}

/* ------------------------------- Frankfurter ------------------------------ */

export interface RateEntry {
  date: string; // AAAA-MM-DD
  quote: string;
  rate: number;
}

/**
 * Cotizaciones de /v2/rates, tanto las más recientes como una serie histórica:
 * ambas llegan como lista de { date, base, quote, rate }. Se descartan las
 * entradas con tasas no positivas o códigos y fechas mal formados.
 */
export function parseFrankfurterRates(data: unknown): RateEntry[] {
  if (!Array.isArray(data)) {
    throw new ExternalServiceError(
      "El servicio de tipos de cambio respondió en un formato inesperado."
    );
  }

  const entries: RateEntry[] = [];
  for (const raw of data) {
    if (!isObject(raw)) continue;
    const { date, quote, rate } = raw;
    if (
      typeof date === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(date) &&
      typeof quote === "string" &&
      /^[A-Z]{3}$/.test(quote) &&
      isPositiveNumber(rate)
    ) {
      entries.push({ date, quote, rate });
    }
  }
  return entries;
}
