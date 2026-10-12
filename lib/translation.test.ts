import { describe, expect, it } from "vitest";
import {
  MAX_TRANSLATION_BYTES,
  ONE_PARAGRAPH_MESSAGE,
  byteSize,
  hasMultipleParagraphs,
  translationInputError,
} from "./translation";

describe("byteSize", () => {
  it("cuenta bytes UTF-8, no caracteres", () => {
    expect(byteSize("hola")).toBe(4);
    expect(byteSize("ñ")).toBe(2);
    expect(byteSize("😀")).toBe(4);
  });
});

describe("hasMultipleParagraphs", () => {
  it("acepta un párrafo, aunque tenga saltos de línea simples", () => {
    expect(hasMultipleParagraphs("Hola mundo.")).toBe(false);
    expect(hasMultipleParagraphs("Primera línea\nsegunda línea")).toBe(false);
  });

  it("ignora las líneas en blanco al principio y al final", () => {
    expect(hasMultipleParagraphs("\n\nHola mundo.\n\n")).toBe(false);
  });

  it("detecta una línea en blanco entre párrafos, aunque tenga espacios", () => {
    expect(hasMultipleParagraphs("Uno.\n\nDos.")).toBe(true);
    expect(hasMultipleParagraphs("Uno.\n  \t\nDos.")).toBe(true);
    expect(hasMultipleParagraphs("Uno.\r\n\r\nDos.")).toBe(true);
  });
});

describe("translationInputError", () => {
  it("acepta un párrafo dentro del límite", () => {
    expect(translationInputError("hola mundo")).toBeNull();
    expect(translationInputError("a".repeat(MAX_TRANSLATION_BYTES))).toBeNull();
  });

  it("rechaza textos que superan el límite en bytes", () => {
    expect(translationInputError("a".repeat(MAX_TRANSLATION_BYTES + 1))).toMatch(/bytes/);
    // 226 eñes son 452 bytes, aunque solo 226 caracteres.
    expect(translationInputError("ñ".repeat(226))).toMatch(/bytes/);
  });

  it("rechaza varios párrafos", () => {
    expect(translationInputError("Uno.\n\nDos.")).toBe(ONE_PARAGRAPH_MESSAGE);
  });
});
