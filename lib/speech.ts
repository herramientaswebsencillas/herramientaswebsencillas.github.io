/* Lógica de la herramienta "Texto a voz" que no depende del navegador. */

// Chrome corta las locuciones largas a los ~15 segundos. Trocear el texto en
// fragmentos cortos y encolarlos evita ese corte sin hacks de pause/resume.
export const MAX_CHUNK_LENGTH = 180;

export function splitIntoChunks(text: string, max = MAX_CHUNK_LENGTH): string[] {
  const clean = text.trim();
  if (!clean) return [];

  const sentences = clean.match(/[^.!?…]+[.!?…]*/g) ?? [clean];
  const chunks: string[] = [];
  let current = "";

  const push = () => {
    if (current) chunks.push(current);
    current = "";
  };

  const append = (piece: string) => {
    const next = current ? `${current} ${piece}` : piece;
    if (next.length > max) {
      push();
      current = piece;
    } else {
      current = next;
    }
  };

  for (const sentence of sentences) {
    const piece = sentence.trim();
    if (!piece) continue;

    if (piece.length > max) {
      // Frase demasiado larga: se reparte palabra por palabra.
      for (const word of piece.split(/\s+/)) append(word);
      continue;
    }
    append(piece);
  }

  push();
  return chunks;
}
