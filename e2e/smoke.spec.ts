import { expect, test, type Page } from "@playwright/test";
import { CATEGORIES } from "../lib/tools";

const PAGES = [
  "/",
  "/about/",
  "/privacy/",
  ...CATEGORIES.flatMap((category) => category.tools.map((tool) => `/tools/${tool.slug}/`)),
];

/* Violaciones conocidas e inofensivas. jszip arrastra is-generator-function,
   que prueba Function("return function*() {}") dentro de un try/catch para
   detectar soporte: la CSP lo bloquea, el catch lo absorbe y nada se rompe. */
const TOLERATED_VIOLATIONS: Record<string, RegExp> = {
  "/tools/pdf-page-splitter/": /^script-src → eval /,
};

declare global {
  interface Window {
    __cspViolations: string[];
  }
}

/**
 * Registra violaciones de CSP, excepciones y errores de consola del propio
 * sitio. Las peticiones a otros dominios se cortan: la prueba no debe depender
 * de que LanguageTool, MyMemory o Frankfurter respondan. Si un dominio falta en
 * connect-src, el navegador lo bloquea antes de llegar a la red y la violación
 * queda registrada igual.
 */
async function watchPage(page: Page, path = "") {
  const errors: string[] = [];

  await page.addInitScript(() => {
    window.__cspViolations = [];
    document.addEventListener("securitypolicyviolation", (event) => {
      window.__cspViolations.push(
        `${event.violatedDirective} → ${event.blockedURI} (${event.sourceFile}:${event.lineNumber})`
      );
    });
  });

  await page.route(
    (url) => url.hostname !== "localhost",
    (route) => route.abort()
  );

  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    // Los fallos de las peticiones externas cortadas arriba no cuentan.
    const source = message.location().url;
    if (source && !source.startsWith("http://localhost")) return;
    errors.push(`console: ${message.text()}`);
  });

  return async () => {
    const tolerated = TOLERATED_VIOLATIONS[path];
    const violations = (await page.evaluate(() => window.__cspViolations)).filter(
      (violation) => !tolerated?.test(violation)
    );
    expect(violations, "violaciones de CSP").toEqual([]);
    expect(errors, "errores en la página").toEqual([]);
  };
}

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

test("el encriptador cifra y descifra en el navegador", async ({ page }) => {
  const check = await watchPage(page);
  await page.goto("/tools/text-encryptor/");

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
  await page.goto("/tools/date-difference-calculator/?desde=01/01/2024&hasta=01/01/2025");
  await expect(page.getByText("366", { exact: true })).toBeVisible();
  await check();
});
