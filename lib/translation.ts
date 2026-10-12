/* Reglas de lo que el traductor puede enviar a MyMemory en una petición. */

/** Margen de seguridad bajo el límite de ~500 bytes por petición de MyMemory. */
export const MAX_TRANSLATION_BYTES = 450;

export const ONE_PARAGRAPH_MESSAGE =
  "Traduce un párrafo a la vez: las condiciones de MyMemory no permiten enviar varios en una misma petición.";

export function byteSize(text: string): number {
  return new TextEncoder().encode(text).length;
}

/** Si el texto tiene más de un párrafo, es decir, alguna línea en blanco. */
export function hasMultipleParagraphs(text: string): boolean {
  return /\n[^\S\n]*\n/.test(text.trim());
}

/** Por qué no se puede enviar el texto, o null si se puede. */
export function translationInputError(text: string): string | null {
  if (byteSize(text) > MAX_TRANSLATION_BYTES) {
    return `El texto supera el límite de ${MAX_TRANSLATION_BYTES} bytes permitido por solicitud.`;
  }
  if (hasMultipleParagraphs(text)) return ONE_PARAGRAPH_MESSAGE;
  return null;
}
