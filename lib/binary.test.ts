import { describe, expect, it } from "vitest";
import { BinaryError, binaryToText, textToBinary } from "./binary";

describe("textToBinary", () => {
  it("escribe cada byte UTF-8 en un grupo de 8 bits", () => {
    expect(textToBinary("Hola")).toBe("01001000 01101111 01101100 01100001");
    expect(textToBinary("ñ")).toBe("11000011 10110001");
    expect(textToBinary("€")).toBe("11100010 10000010 10101100");
    expect(textToBinary("😀")).toBe("11110000 10011111 10011000 10000000");
  });

  it("devuelve vacío para un texto vacío", () => {
    expect(textToBinary("")).toBe("");
  });
});

describe("binaryToText", () => {
  it("decodifica de ida y vuelta textos con acentos y emoji", () => {
    const text = "¡Año 2026! Precio: 5 € 😀\nsegunda línea";
    expect(binaryToText(textToBinary(text))).toBe(text);
  });

  it("acepta espacios y saltos de línea entre grupos", () => {
    expect(binaryToText("  01001000\n01101001  ")).toBe("Hi");
  });

  it("devuelve vacío si no hay grupos", () => {
    expect(binaryToText("   ")).toBe("");
  });

  it.each(["0100100", "010010001", "0100100a", "1111111111111111"])(
    "rechaza el grupo %s, que no es un byte",
    (group) => {
      expect(() => binaryToText(`01001000 ${group}`)).toThrow(BinaryError);
    }
  );

  it("rechaza bytes que no forman UTF-8 válido", () => {
    // 0xC3 sin su byte de continuación.
    expect(() => binaryToText("11000011")).toThrow(BinaryError);
  });
});
