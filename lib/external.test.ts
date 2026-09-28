import { describe, expect, it } from "vitest";
import {
  ExternalServiceError,
  MYMEMORY_QUOTA_MESSAGE,
  parseFrankfurterRates,
  parseLanguageToolMatches,
  parseMyMemoryTranslation,
} from "./external";

describe("parseLanguageToolMatches", () => {
  const text = "Esto es una prueva.";
  // Recortado de una respuesta real de /v2/check.
  const typo = {
    message: "Se ha encontrado un posible error ortográfico.",
    replacements: [{ value: "prueba" }, { value: "pruebas" }],
    offset: 12,
    length: 6,
    rule: { id: "MORFOLOGIK_RULE_ES", category: { id: "TYPOS", name: "Errores ortográficos" } },
  };

  it("conserva las correcciones válidas", () => {
    expect(parseLanguageToolMatches({ matches: [typo] }, text)).toEqual([typo]);
  });

  it("descarta correcciones fuera del texto o mal formadas", () => {
    const matches = parseLanguageToolMatches(
      {
        matches: [
          { ...typo, offset: 15 }, // 15 + 6 > 19
          { ...typo, offset: -1 },
          { ...typo, length: 0 },
          { ...typo, offset: "12" },
          { ...typo, message: 42 },
          null,
          typo,
        ],
      },
      text
    );
    expect(matches).toHaveLength(1);
  });

  it("filtra sugerencias que no son texto", () => {
    const [match] = parseLanguageToolMatches(
      { matches: [{ ...typo, replacements: [{ value: "prueba" }, { value: 1 }, "x"] }] },
      text
    );
    expect(match.replacements).toEqual([{ value: "prueba" }]);
  });

  it("rechaza una respuesta sin lista de correcciones", () => {
    expect(() => parseLanguageToolMatches({}, text)).toThrow(ExternalServiceError);
    expect(() => parseLanguageToolMatches("<html>", text)).toThrow(ExternalServiceError);
  });
});

describe("parseMyMemoryTranslation", () => {
  it("devuelve la traducción", () => {
    // Recortado de una respuesta real de /get.
    const data = {
      responseData: { translatedText: "hello", match: 1 },
      quotaFinished: false,
      responseDetails: "",
      responseStatus: 200,
    };
    expect(parseMyMemoryTranslation(data)).toBe("hello");
  });

  it("detecta la cuota agotada aunque llegue como traducción", () => {
    const cases = [
      { responseData: { translatedText: "hola" }, quotaFinished: true, responseStatus: 200 },
      { responseData: { translatedText: "x" }, responseStatus: 429 },
      {
        responseData: {
          translatedText: "MYMEMORY WARNING: YOU USED ALL AVAILABLE FREE TRANSLATIONS FOR TODAY.",
        },
        responseStatus: "200",
      },
    ];
    for (const data of cases) {
      expect(() => parseMyMemoryTranslation(data)).toThrow(MYMEMORY_QUOTA_MESSAGE);
    }
  });

  it("rechaza estados de error y formas inesperadas", () => {
    expect(() =>
      parseMyMemoryTranslation({ responseData: { translatedText: "x" }, responseStatus: 403 })
    ).toThrow(ExternalServiceError);
    expect(() => parseMyMemoryTranslation({ responseStatus: 200 })).toThrow(ExternalServiceError);
    expect(() => parseMyMemoryTranslation(null)).toThrow(ExternalServiceError);
  });
});

describe("parseFrankfurterRates", () => {
  // Recortado de una respuesta real de /v2/rates.
  const valid = [
    { date: "2026-09-01", base: "USD", quote: "MXN", rate: 17.0001 },
    { date: "2026-09-02", base: "USD", quote: "MXN", rate: 16.9964 },
  ];

  it("conserva las cotizaciones válidas", () => {
    expect(parseFrankfurterRates(valid)).toEqual([
      { date: "2026-09-01", quote: "MXN", rate: 17.0001 },
      { date: "2026-09-02", quote: "MXN", rate: 16.9964 },
    ]);
  });

  it("descarta tasas absurdas y campos mal formados", () => {
    const entries = parseFrankfurterRates([
      ...valid,
      { date: "2026-09-03", quote: "MXN", rate: -1 },
      { date: "2026-09-03", quote: "MXN", rate: 0 },
      { date: "2026-09-03", quote: "MXN", rate: Number.NaN },
      { date: "2026-09-03", quote: "MXN", rate: "17" },
      { date: "03/09/2026", quote: "MXN", rate: 17 },
      { date: "2026-09-03", quote: "<b>", rate: 17 },
      "basura",
    ]);
    expect(entries).toHaveLength(2);
  });

  it("rechaza respuestas que no son una lista", () => {
    // Así responde Frankfurter a una divisa desconocida.
    expect(() => parseFrankfurterRates({ status: 422, message: "invalid currency: XXX" })).toThrow(
      ExternalServiceError
    );
  });
});
