import { afterEach, describe, expect, it, vi } from "vitest";
import { randomInt, randomString } from "./random";

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
