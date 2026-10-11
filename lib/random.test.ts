import { afterEach, describe, expect, it, vi } from "vitest";
import {
  RANDOM_LIMIT,
  RandomRangeError,
  randomInt,
  randomString,
  randomUniqueInts,
} from "./random";

/** Hace que getRandomValues devuelva, en orden, los bytes indicados. */
function feedBytes(...sequence: number[][]) {
  const spy = vi.spyOn(crypto, "getRandomValues");
  for (const bytes of sequence) {
    spy.mockImplementationOnce(((array: Uint8Array) => {
      array.set(bytes);
      return array;
    }) as typeof crypto.getRandomValues);
  }
  return spy;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("randomInt", () => {
  it("se mantiene dentro del rango e incluye ambos extremos", () => {
    const seen = new Set<number>();
    for (let i = 0; i < 2000; i++) {
      const n = randomInt(-2, 2);
      expect(n).toBeGreaterThanOrEqual(-2);
      expect(n).toBeLessThanOrEqual(2);
      seen.add(n);
    }
    expect([...seen].sort((a, b) => a - b)).toEqual([-2, -1, 0, 1, 2]);
  });

  it("devuelve el único valor posible cuando min y max coinciden", () => {
    expect(randomInt(7, 7)).toBe(7);
  });

  it("rechaza rangos invertidos", () => {
    expect(() => randomInt(5, 1)).toThrow();
  });

  it("descarta los bytes que introducirían sesgo de módulo", () => {
    // Con un rango de 3, el mayor múltiplo que cabe en un byte es 255 (0..254):
    // el 255 debe descartarse en lugar de contarse como 255 % 3 = 0.
    const spy = feedBytes([255], [4]);
    expect(randomInt(10, 12)).toBe(10 + (4 % 3));
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it("combina varios bytes para rangos mayores a 256", () => {
    feedBytes([0x01, 0x02]); // 0x0201 = 513
    expect(randomInt(0, 999)).toBe(513);
  });

  it.each([
    [1.5, 3],
    [0, 2.5],
    [0, RANDOM_LIMIT + 1],
    [-RANDOM_LIMIT - 1, 0],
    [1e16, 1e16 + 10],
    [0, Number.POSITIVE_INFINITY],
    [Number.NaN, 5],
  ])("rechaza extremos no enteros o fuera del límite: [%d, %d]", (min, max) => {
    expect(() => randomInt(min, max)).toThrow(RandomRangeError);
  });

  it("se mantiene dentro del rango en los límites admitidos", () => {
    for (let i = 0; i < 200; i++) {
      const n = randomInt(-RANDOM_LIMIT, RANDOM_LIMIT);
      expect(Number.isInteger(n)).toBe(true);
      expect(Math.abs(n)).toBeLessThanOrEqual(RANDOM_LIMIT);
    }
  });
});

describe("randomUniqueInts", () => {
  it("devuelve valores distintos, en orden y dentro del rango", () => {
    const values = randomUniqueInts(20, 1, 30);
    expect(values).toHaveLength(20);
    expect(new Set(values).size).toBe(20);
    expect(values).toEqual([...values].sort((a, b) => a - b));
    expect(values.every((n) => n >= 1 && n <= 30)).toBe(true);
  });

  it("devuelve todo el rango si se piden más valores de los que hay", () => {
    expect(randomUniqueInts(5, 1, 3)).toEqual([1, 2, 3]);
  });

  it("rechaza extremos por encima de 2^53, donde no todos los enteros existen", () => {
    // Antes este caso dejaba el bucle de selección girando para siempre.
    expect(() => randomUniqueInts(7, 1e16, 1e16 + 10)).toThrow(RandomRangeError);
  });

  it("rechaza cantidades no válidas", () => {
    expect(() => randomUniqueInts(-1, 1, 10)).toThrow(RandomRangeError);
    expect(() => randomUniqueInts(2.5, 1, 10)).toThrow(RandomRangeError);
  });
});

describe("randomString", () => {
  it("genera la longitud pedida usando solo el alfabeto", () => {
    const alphabet = "abc123";
    const value = randomString(64, alphabet);
    expect(value).toHaveLength(64);
    expect([...value].every((ch) => alphabet.includes(ch))).toBe(true);
  });

  it("devuelve una cadena vacía sin alfabeto", () => {
    expect(randomString(10, "")).toBe("");
  });

  it("descarta los bytes que introducirían sesgo de módulo", () => {
    // Alfabeto de 3: solo valen los bytes 0..254.
    const bytes = new Array(16).fill(1);
    bytes[0] = 255;
    feedBytes(bytes);
    expect(randomString(3, "xyz")).toBe("yyy");
  });
});
