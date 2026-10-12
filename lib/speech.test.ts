import { describe, expect, it } from "vitest";
import { MAX_CHUNK_LENGTH, splitIntoChunks } from "./speech";

describe("splitIntoChunks", () => {
  it("devuelve vacío para un texto vacío o solo con espacios", () => {
    expect(splitIntoChunks("")).toEqual([]);
    expect(splitIntoChunks("   \n ")).toEqual([]);
  });

  it("junta frases cortas en un mismo fragmento", () => {
    expect(splitIntoChunks("Hola. ¿Qué tal? Bien.")).toEqual(["Hola. ¿Qué tal? Bien."]);
  });

  it("empieza un fragmento nuevo cuando la siguiente frase no cabe", () => {
    expect(splitIntoChunks("Uno dos. Tres cuatro.", 12)).toEqual(["Uno dos.", "Tres cuatro."]);
  });

  it("reparte por palabras una frase más larga que el máximo", () => {
    const sentence = Array.from({ length: 60 }, (_, i) => `palabra${i}`).join(" ");
    const chunks = splitIntoChunks(sentence);
    expect(chunks.length).toBeGreaterThan(1);
    for (const chunk of chunks) expect(chunk.length).toBeLessThanOrEqual(MAX_CHUNK_LENGTH);
    expect(chunks.join(" ")).toBe(sentence);
  });

  it("conserva todo el texto, en orden", () => {
    const text = "Primera frase. Segunda frase, algo más larga! Tercera… y última?";
    expect(splitIntoChunks(text, 20).join(" ")).toBe(text);
  });

  it("deja en su propio fragmento una palabra que no cabe en el máximo", () => {
    const word = "a".repeat(MAX_CHUNK_LENGTH + 20);
    expect(splitIntoChunks(`Mira ${word} ahora`)).toEqual(["Mira", word, "ahora"]);
  });
});
