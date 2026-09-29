import { expect, test } from "@playwright/test";
import { CATEGORIES } from "../lib/tools";
import { watchPage } from "./watch";

const PAGES = [
  "/",
  "/about",
  "/privacy",
  ...CATEGORIES.flatMap((category) => category.tools.map((tool) => `/tools/${tool.slug}`)),
];

for (const path of PAGES) {
  test(`carga ${path} sin errores`, async ({ page }) => {
    const check = await watchPage(page, path);
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading").first()).toBeVisible();
    await page.waitForLoadState("networkidle");
    await check();
  });
}

test("lo publicado no admite scripts inline sin hash", async ({ page }) => {
  await page.goto("/");
  const csp = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute("content");
  const scriptSrc = csp?.split(";").map((d) => d.trim()).find((d) => d.startsWith("script-src "));
  expect(scriptSrc).toBeDefined();
  expect(scriptSrc).not.toContain("'unsafe-inline'");
  expect(scriptSrc).toMatch(/'sha256-[A-Za-z0-9+/]+=*'/);
});

test("la CSP bloquea una URL javascript: aunque algún código la use", async ({ page }) => {
  await watchPage(page);
  await page.goto("/");
  await expect(page.getByRole("heading").first()).toBeVisible();

  await page.evaluate(() => {
    const link = document.createElement("a");
    link.href = "javascript:window.__pwned=1";
    document.body.append(link);
    link.click();
  });

  await expect
    .poll(() => page.evaluate(() => window.__cspViolations.join("\n")))
    .toMatch(/script-src/);
  expect(await page.evaluate(() => "__pwned" in window)).toBe(false);
});

test("la navegación interna funciona con la CSP de hashes", async ({ page }) => {
  const check = await watchPage(page);
  await page.goto("/");
  await page.locator('a[href="/tools/roman-converter"]').first().click();
  await expect(page).toHaveURL(/\/tools\/roman-converter$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.waitForLoadState("networkidle");
  await check();
});

test("el encriptador cifra y descifra en el navegador", async ({ page }) => {
  const check = await watchPage(page);
  await page.goto("/tools/text-encryptor");

  await page.getByPlaceholder("Escribe el mensaje que quieres proteger…").fill("Mensaje de prueba ñ 🔐");
  await page.getByPlaceholder("Tu clave compartida").fill("frase de prueba");
  await page.getByRole("button", { name: "Encriptar texto" }).click();
  await expect(page.getByText(/^v2:/)).toBeVisible();

  // Al cambiar de modo, el resultado pasa a ser la entrada.
  await page.getByRole("button", { name: "Desencriptar", exact: true }).click();
  await page.getByRole("button", { name: "Desencriptar texto" }).click();
  await expect(page.getByText("Mensaje de prueba ñ 🔐", { exact: true })).toBeVisible();
  await check();
});

test("la calculadora de fechas lee el rango de la URL", async ({ page }) => {
  const check = await watchPage(page);
  await page.goto("/tools/date-difference-calculator?desde=01/01/2024&hasta=01/01/2025");
  await expect(page.getByText("366", { exact: true })).toBeVisible();
  await check();
});
