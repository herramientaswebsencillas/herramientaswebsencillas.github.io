/* Generadores aleatorios criptográficamente seguros, compartidos por las
   herramientas de números y cadenas aleatorias. */

/** Mayor valor absoluto admitido en los extremos de randomInt. Así el rango
    cabe holgado en 6 bytes (2^48 ≈ 2.8·10^14) y toda la aritmética es exacta
    con números de JavaScript: más allá de 2^53 dejan de representarse todos
    los enteros, y en [1e16, 1e16 + 10] solo salían 6 valores distintos. */
export const RANDOM_LIMIT = 1_000_000_000_000;

/** Error con un mensaje que se puede mostrar tal cual al usuario. */
export class RandomRangeError extends Error {}

function assertRange(min: number, max: number) {
  const valid = (value: number) => Number.isInteger(value) && Math.abs(value) <= RANDOM_LIMIT;
  if (!valid(min) || !valid(max)) {
    const limit = RANDOM_LIMIT.toLocaleString("es-MX");
    throw new RandomRangeError(
      `El mínimo y el máximo deben ser números enteros entre -${limit} y ${limit}.`
    );
  }
  if (min > max) throw new RandomRangeError("El mínimo no puede ser mayor que el máximo.");
}

/**
 * Genera un entero aleatorio criptográficamente seguro en el rango [min, max] (inclusivo).
 * Usa crypto.getRandomValues con rechazo de muestreo para evitar el sesgo de módulo
 * que introduciría un simple `byte % rango`.
 *
 * Lanza RandomRangeError si los extremos no son enteros dentro de ±RANDOM_LIMIT:
 * con decimales, `value % range` devolvía valores fuera del rango (3.5 en [1.5, 3]).
 */
export function randomInt(min: number, max: number): number {
  assertRange(min, max);
  const range = max - min + 1;

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
 * Hasta `count` enteros distintos de [min, max], en orden ascendente. Si el
 * rango tiene menos valores que `count`, los devuelve todos.
 *
 * Se descartan los repetidos hasta completar la cantidad. Termina siempre
 * porque randomInt solo admite rangos en los que cada entero es distinto y
 * representable; con números mayores a 2^53 el rango tenía menos valores de
 * los que aparentaba y el bucle no acababa nunca.
 */
export function randomUniqueInts(count: number, min: number, max: number): number[] {
  assertRange(min, max);
  if (!Number.isInteger(count) || count < 0) {
    throw new RandomRangeError("La cantidad debe ser un número entero positivo.");
  }

  const target = Math.min(count, max - min + 1);
  const selected = new Set<number>();
  while (selected.size < target) selected.add(randomInt(min, max));
  return [...selected].sort((a, b) => a - b);
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
