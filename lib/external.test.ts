import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ExternalServiceError,
  fetchJson,
  isAbortError,
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

describe("fetchJson", () => {
  const options = { errorMessage: "Falló.", rateLimitMessage: "Cuota agotada." };
  const respond = (body: unknown, status = 200) =>
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify(body), { status }))
    );

  afterEach(() => vi.unstubAllGlobals());

  it("devuelve lo que entrega el validador", async () => {
    respond({ value: 3 });
    await expect(
      fetchJson("https://x.test", (data) => (data as { value: number }).value, options)
    ).resolves.toBe(3);
  });

  it("convierte un HTTP de error en el mensaje indicado", async () => {
    respond({}, 500);
    await expect(fetchJson("https://x.test", () => 1, options)).rejects.toThrow(
      new ExternalServiceError("Falló.")
    );
  });

  it("usa el mensaje de cuota con un 429, si lo hay", async () => {
    respond({}, 429);
    await expect(fetchJson("https://x.test", () => 1, options)).rejects.toThrow("Cuota agotada.");
    await expect(fetchJson("https://x.test", () => 1, { errorMessage: "Falló." })).rejects.toThrow(
      "Falló."
    );
  });

  it("convierte un fallo de red o un JSON inválido en el mensaje indicado", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Promise.reject(new TypeError("Failed to fetch")))
    );
    await expect(fetchJson("https://x.test", () => 1, options)).rejects.toThrow("Falló.");

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("<html>"))
    );
    await expect(fetchJson("https://x.test", () => 1, options)).rejects.toThrow("Falló.");
  });

  it("conserva el mensaje de los errores del validador", async () => {
    respond({ matches: "no" });
    await expect(
      fetchJson("https://x.test", (data) => parseLanguageToolMatches(data, ""), options)
    ).rejects.toThrow("formato inesperado");
  });

  it("relanza la cancelación tal cual, para que la página la ignore", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        (_url: string, init?: RequestInit) =>
          new Promise((_resolve, reject) =>
            init?.signal?.addEventListener("abort", () => reject(init.signal?.reason))
          )
      )
    );
    const controller = new AbortController();
    const request = fetchJson("https://x.test", () => 1, { ...options, signal: controller.signal });
    controller.abort();
    const error = await request.catch((e: unknown) => e);
    expect(isAbortError(error)).toBe(true);
  });
});
