/* Monitoreo de los servicios externos: hace una consulta real a cada uno y
   comprueba que la respuesta sigue teniendo la forma que esperan las
   herramientas. No forma parte de `pnpm test` (depende de la red); se ejecuta
   con `pnpm test:apis` y cada día desde .github/workflows/external-apis.yml.

   Los mismos validadores que usa el sitio deciden si la respuesta es válida,
   así que un cambio de formato que rompería una herramienta hace fallar esto. */

import { describe, expect, it } from "vitest";
import {
  parseFrankfurterRates,
  parseLanguageToolMatches,
  parseMyMemoryTranslation,
} from "./external";

async function fetchJson(url: string, init?: RequestInit) {
  const res = await fetch(url, { ...init, signal: AbortSignal.timeout(15_000) });
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

  it("MyMemory traduce una palabra sencilla", async () => {
    const data = await fetchJson("https://api.mymemory.translated.net/get?q=gato&langpair=es|en");
    expect(parseMyMemoryTranslation(data).toLowerCase()).toContain("cat");
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
