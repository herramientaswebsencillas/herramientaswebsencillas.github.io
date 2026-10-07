/* Monitoreo de los servicios externos: hace una consulta real a cada uno y
   comprueba que la respuesta sigue teniendo la forma que esperan las
   herramientas. No forma parte de `pnpm test` (depende de la red); se ejecuta
   con `pnpm test:apis` y cada día desde .github/workflows/external-apis.yml.

   Los mismos validadores que usa el sitio deciden si la respuesta es válida,
   así que un cambio de formato que rompería una herramienta hace fallar esto. */

import { describe, expect, it } from "vitest";
import {
  EXTERNAL_TIMEOUT_MS,
  ExternalServiceError,
  MYMEMORY_QUOTA_MESSAGE,
  parseFrankfurterRates,
  parseLanguageToolMatches,
  parseMyMemoryTranslation,
} from "./external";

async function fetchJson(url: string, init?: RequestInit) {
  const res = await fetch(url, { ...init, signal: AbortSignal.timeout(EXTERNAL_TIMEOUT_MS) });
  expect(res.status, `${url} respondió ${res.status}`).toBe(200);
  return res.json();
}

describe("servicios externos", () => {
  it("LanguageTool marca una falta de ortografía conocida", async () => {
    const text = "Esto es una prueva.";
    const data = await fetchJson("https://api.languagetool.org/v2/check", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ text, language: "es" }),
    });
    const matches = parseLanguageToolMatches(data, text);
    const typo = matches.find((m) => text.slice(m.offset, m.offset + m.length) === "prueva");
    expect(typo?.replacements.map((r) => r.value)).toContain("prueba");
  });

  /* MyMemory cuenta su cuota gratuita por IP, y los runners de GitHub
     comparten IPs con otros proyectos: a veces la cuota ya está gastada cuando
     llega esta prueba. Eso no es una falla del servicio ni del sitio, que ante
     el 429 o el aviso de cuota muestra MYMEMORY_QUOTA_MESSAGE (lo cubre
     e2e/tools.spec.ts). En ese caso la prueba se omite con una nota; cualquier
     otra respuesta inesperada sigue haciéndola fallar. */
  it("MyMemory traduce una palabra sencilla", async (ctx) => {
    const url = "https://api.mymemory.translated.net/get?q=gato&langpair=es|en";
    const res = await fetch(url, { signal: AbortSignal.timeout(EXTERNAL_TIMEOUT_MS) });
    const quotaSkip = () =>
      ctx.skip(
        "MyMemory: cuota gratuita agotada para la IP de este equipo; no se pudo comprobar hoy."
      );

    if (res.status === 429) return quotaSkip();
    expect(res.status, `${url} respondió ${res.status}`).toBe(200);

    let translation: string;
    try {
      translation = parseMyMemoryTranslation(await res.json());
    } catch (error) {
      if (error instanceof ExternalServiceError && error.message === MYMEMORY_QUOTA_MESSAGE) {
        return quotaSkip();
      }
      throw error;
    }
    expect(translation.toLowerCase()).toContain("cat");
  });

  it("Frankfurter da las cotizaciones del día con base USD", async () => {
    const entries = parseFrankfurterRates(
      await fetchJson("https://api.frankfurter.dev/v2/rates?base=USD")
    );
    // El conversor muestra unas 165 divisas; una caída fuerte indica un cambio en la API.
    expect(entries.length).toBeGreaterThan(100);
    expect(entries.map((e) => e.quote)).toEqual(expect.arrayContaining(["MXN", "EUR", "JPY"]));
  });

  it("Frankfurter da la serie histórica del BCE para la gráfica", async () => {
    const end = new Date();
    const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
    const day = (d: Date) => d.toISOString().slice(0, 10);
    const entries = parseFrankfurterRates(
      await fetchJson(
        `https://api.frankfurter.dev/v2/rates?from=${day(start)}&to=${day(end)}&base=EUR&quotes=MXN&providers=ECB`
      )
    );
    // Un mes tiene unos 21 días hábiles con cotización del BCE.
    expect(entries.length).toBeGreaterThan(10);
    expect(entries.every((e) => e.quote === "MXN")).toBe(true);
  });
});
