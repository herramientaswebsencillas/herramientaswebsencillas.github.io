/* Conversión entre texto y binario para la herramienta "Texto a binario".

   El texto se codifica en UTF-8 y cada byte se escribe como un grupo de 8
   bits, como hacen casi todos los conversores. Antes se escribía cada unidad
   UTF-16 con padStart(8): "ñ" salía como 11110001 en lugar de
   11000011 10110001, "€" ocupaba 14 bits y un emoji, dos grupos de 16, así que
   el binario no coincidía con el de ningún otro sitio. */

/** Error con un mensaje que se puede mostrar tal cual al usuario. */
export class BinaryError extends Error {}

export function textToBinary(text: string): string {
  return Array.from(new TextEncoder().encode(text), (byte) =>
    byte.toString(2).padStart(8, "0")
  ).join(" ");
}

/**
 * Decodifica grupos de 8 bits separados por espacios o saltos de línea.
 * Lanza BinaryError si algún grupo no tiene exactamente 8 ceros y unos, o si
 * los bytes no forman UTF-8 válido.
 */
export function binaryToText(binary: string): string {
  const groups = binary.trim().split(/\s+/).filter(Boolean);
  if (groups.length === 0) return "";

  const invalid = groups.find((group) => !/^[01]{8}$/.test(group));
  if (invalid !== undefined) {
    throw new BinaryError(
      `"${invalid.slice(0, 20)}" no es un byte: cada grupo debe tener exactamente 8 ceros y unos.`
    );
  }

  const bytes = Uint8Array.from(groups, (group) => Number.parseInt(group, 2));
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new BinaryError("Los bytes no forman texto UTF-8 válido.");
  }
}
