import { describe, expect, it } from "vitest";
import { base64ToBytes, base64ToText, bytesToBase64, textToBase64 } from "./base64";

describe("textToBase64 y base64ToText", () => {
  it("codifican ASCII igual que btoa", () => {
    expect(textToBase64("Hola, mundo")).toBe(btoa("Hola, mundo"));
  });

  it("conservan acentos, eñes y emojis (UTF-8)", () => {
    const text = "Año de la niña — ¿qué tal? 🎉";
    expect(textToBase64("ñ")).toBe("w7E=");
    expect(base64ToText(textToBase64(text))).toBe(text);
  });

  it("rechazan Base64 inválido", () => {
    expect(() => base64ToText("no es base64!")).toThrow();
  });

  it("rechazan bytes que no son UTF-8", () => {
    // 0xFF nunca aparece en UTF-8.
    expect(() => base64ToText(btoa("\xff"))).toThrow();
  });
});

describe("bytesToBase64 y base64ToBytes", () => {
  it("van y vuelven con todos los valores de byte", () => {
    const bytes = Uint8Array.from({ length: 256 }, (_, i) => i);
    expect(base64ToBytes(bytesToBase64(bytes))).toEqual(bytes);
  });

  it("no desbordan la pila con entradas grandes", () => {
    const bytes = new Uint8Array(1_000_000).fill(65);
    expect(base64ToBytes(bytesToBase64(bytes))).toEqual(bytes);
  });
});
