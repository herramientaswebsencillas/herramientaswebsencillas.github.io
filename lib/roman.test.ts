import { describe, expect, it } from "vitest";
import { MAX_VALUE, MIN_VALUE, RomanError, decimalToRoman, romanToDecimal } from "./roman";

describe("decimalToRoman", () => {
  it.each([
    [1, "I"],
    [4, "IV"],
    [9, "IX"],
    [14, "XIV"],
    [40, "XL"],
    [90, "XC"],
    [400, "CD"],
    [1994, "MCMXCIV"],
    [2026, "MMXXVI"],
    [3999, "MMMCMXCIX"],
  ])("%i → %s", (value, roman) => {
    expect(decimalToRoman(value)).toBe(roman);
  });

  it("rechaza valores fuera de rango o no enteros", () => {
    expect(() => decimalToRoman(0)).toThrow(RomanError);
    expect(() => decimalToRoman(4000)).toThrow(RomanError);
    expect(() => decimalToRoman(-5)).toThrow(RomanError);
    expect(() => decimalToRoman(1.5)).toThrow(RomanError);
    expect(() => decimalToRoman(Number.NaN)).toThrow(RomanError);
  });
});

describe("romanToDecimal", () => {
  it("acepta minúsculas y espacios alrededor", () => {
    expect(romanToDecimal(" xlii ")).toBe(42);
  });

  it("rechaza formas no canónicas", () => {
    for (const invalid of ["IIII", "VX", "IC", "MMMM", "VV", "IIX"]) {
      expect(() => romanToDecimal(invalid), invalid).toThrow(RomanError);
    }
  });

  it("rechaza símbolos ajenos y cadenas vacías", () => {
    expect(() => romanToDecimal("ABC")).toThrow(RomanError);
    expect(() => romanToDecimal("   ")).toThrow(RomanError);
  });

  it("es la inversa exacta de decimalToRoman en todo el rango", () => {
    for (let n = MIN_VALUE; n <= MAX_VALUE; n++) {
      expect(romanToDecimal(decimalToRoman(n))).toBe(n);
    }
  });
});
