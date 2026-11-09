import { expect, type Page } from "@playwright/test";
import { SITE_ORIGIN } from "./site";

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
 * queda registrada igual. Las pruebas que necesitan una respuesta la simulan
 * con page.route después de llamar a esta función: Playwright aplica primero
 * la ruta registrada al final.
 */
export async function watchPage(page: Page) {
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
    (url) => url.origin !== SITE_ORIGIN,
    (route) => route.abort()
  );

  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    // Los fallos de las peticiones externas cortadas arriba no cuentan.
    const source = message.location().url;
    if (source && !source.startsWith(SITE_ORIGIN)) return;
    errors.push(`console: ${message.text()}`);
  });

  return async () => {
    const violations = await page.evaluate(() => window.__cspViolations);
    expect(violations, "violaciones de CSP").toEqual([]);
    expect(errors, "errores en la página").toEqual([]);
  };
}
