import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { CATEGORIES } from "../lib/tools";
import { PAGES } from "./site";
import { watchPage } from "./watch";

/* Accesibilidad, títulos y sitemap del build. Van aparte de smoke.spec.ts,
   que el monitoreo diario pasa también sobre el sitio publicado: estas
   comprueban decisiones del código, no que lo publicado siga funcionando. */

// Reglas de WCAG 2.1 A y AA. Fallan las violaciones graves y críticas; las
// menores (p. ej. regiones sin landmark) se revisan a mano.
const WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];
const BLOCKING = new Set(["serious", "critical"]);

for (const path of PAGES) {
  test(`${path} no tiene problemas graves de accesibilidad`, async ({ page }) => {
    await watchPage(page);
    await page.goto(path);
    await page.waitForLoadState("networkidle");

    const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze();
    const blocking = violations
      .filter((v) => BLOCKING.has(v.impact ?? ""))
      .map(
        (v) => `${v.id} (${v.impact}): ${v.help}\n  ${v.nodes.map((n) => n.target).join("\n  ")}`
      );
    expect(blocking, blocking.join("\n")).toEqual([]);
  });
}

for (const tool of CATEGORIES.flatMap((category) => category.tools)) {
  test(`/tools/${tool.slug} se titula como en el catálogo`, async ({ page }) => {
    await watchPage(page);
    await page.goto(`/tools/${tool.slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(tool.name);
    await expect(page).toHaveTitle(`${tool.name} | Herramientas Web Sencillas`);
    await expect(page.getByRole("heading", { level: 2, name: "Cómo se usa" })).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: "Preguntas frecuentes" })
    ).toBeVisible();
  });
}

for (const path of PAGES) {
  test(`${path} declara su URL canónica y sus datos estructurados son JSON válido`, async ({
    page,
  }) => {
    await watchPage(page);
    await page.goto(path);
    const url = `https://herramientaswebsencillas.github.io${path === "/" ? "" : path}`;
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", url);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", url);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    const jsonLd = page.locator('script[type="application/ld+json"]');
    for (const json of await jsonLd.allTextContents()) {
      expect(() => JSON.parse(json)).not.toThrow();
    }
  });
}

test("el sitemap lista todas las páginas y robots.txt lo enlaza", async ({ request }) => {
  const sitemap = await (await request.get("/sitemap.xml")).text();
  for (const path of PAGES) {
    expect(sitemap).toContain(`<loc>https://herramientaswebsencillas.github.io${path}</loc>`);
  }

  const robots = await request.get("/robots.txt");
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain(
    "Sitemap: https://herramientaswebsencillas.github.io/sitemap.xml"
  );
});
