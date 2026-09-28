/* Generadores aleatorios criptográficamente seguros, compartidos por las
   herramientas de números y cadenas aleatorias. */

/**
 * Genera un entero aleatorio criptográficamente seguro en el rango [min, max] (inclusivo).
 * Usa crypto.getRandomValues con rechazo de muestreo para evitar el sesgo de módulo
 * que introduciría un simple `byte % rango`.
 */
export function randomInt(min: number, max: number): number {
  const range = max - min + 1;
  if (range <= 0) throw new Error("Rango inválido: max debe ser mayor que min");

  const bytesNeeded = Math.max(1, Math.ceil(Math.log2(range) / 8));
  const maxPow = 256 ** bytesNeeded;
  // Mayor múltiplo de `range` que cabe en maxPow, para descartar valores sesgados
  const maxValid = Math.floor(maxPow / range) * range - 1;

  let value: number;
  const bytes = new Uint8Array(bytesNeeded);
  do {
    crypto.getRandomValues(bytes);
    value = bytes.reduce((acc, b, i) => acc + b * 256 ** i, 0);
  } while (value > maxValid);

  return min + (value % range);
}

/**
 * Genera una cadena aleatoria criptográficamente segura a partir de un alfabeto dado.
 * Usa crypto.getRandomValues y descarta bytes que generarían sesgo de módulo
 * (cuando 256 no es múltiplo exacto de la longitud del alfabeto).
 */
export function randomString(length: number, alphabet: string): string {
  if (alphabet.length === 0) return "";

  const alphabetLength = alphabet.length;
  const maxByte = Math.floor(256 / alphabetLength) * alphabetLength;

  let result = "";
  const chunkSize = Math.max(length, 16);
  const bytes = new Uint8Array(chunkSize);
  let i = chunkSize; // fuerza a generar el primer lote

  while (result.length < length) {
    if (i >= bytes.length) {
      crypto.getRandomValues(bytes);
      i = 0;
    }
    const byte = bytes[i++];
    if (byte < maxByte) {
      result += alphabet[byte % alphabetLength];
    }
  }
  return result;
}
