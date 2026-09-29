/* Conversión entre números decimales y romanos (1 a 3999). */

const ROMAN_MAP: [number, string][] = [
  [1000, "M"],
  [900, "CM"],
  [500, "D"],
  [400, "CD"],
  [100, "C"],
  [90, "XC"],
  [50, "L"],
  [40, "XL"],
  [10, "X"],
  [9, "IX"],
  [5, "V"],
  [4, "IV"],
  [1, "I"],
];

export const MIN_VALUE = 1;
export const MAX_VALUE = 3999;

const ROMAN_TO_DECIMAL: Record<string, number> = {
  I: 1,
  V: 5,
  X: 10,
  L: 50,
  C: 100,
  D: 500,
  M: 1000,
};

export function decimalToRoman(value: number): string {
  if (!Number.isInteger(value) || value < MIN_VALUE || value > MAX_VALUE) {
    throw new Error(`Ingresa un número entero entre ${MIN_VALUE} y ${MAX_VALUE}.`);
  }
  let remaining = value;
  let result = "";
  for (const [num, symbol] of ROMAN_MAP) {
    while (remaining >= num) {
      result += symbol;
      remaining -= num;
    }
  }
  return result;
}

export function romanToDecimal(roman: string): number {
  const clean = roman.trim().toUpperCase();
  if (!clean) throw new Error("Ingresa un número romano.");
  if (!/^[MDCLXVI]+$/.test(clean)) {
    throw new Error("Solo se permiten los símbolos M, D, C, L, X, V, I.");
  }

  let total = 0;
  for (let i = 0; i < clean.length; i++) {
    const current = ROMAN_TO_DECIMAL[clean[i]];
    const next = ROMAN_TO_DECIMAL[clean[i + 1]];
    if (next && current < next) {
      total -= current;
    } else {
      total += current;
    }
  }

  if (decimalToRoman(total) !== clean) {
    throw new Error("Ese no es un número romano válido.");
  }
  return total;
}
