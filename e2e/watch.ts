import { expect, type Page } from "@playwright/test";

/* Violaciones conocidas e inofensivas. jszip arrastra is-generator-function,
   que prueba Function("return function*() {}") dentro de un try/catch para
   detectar soporte: la CSP lo bloquea, el catch lo absorbe y nada se rompe. */
const TOLERATED_VIOLATIONS: Record<string, RegExp> = {
  "/tools/pdf-page-splitter": /^script-src → eval /,
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
 * queda registrada igual. Las pruebas que necesitan una respuesta la simulan
 * con page.route después de llamar a esta función: Playwright aplica primero
 * la ruta registrada al final.
 */
export async function watchPage(page: Page, path = "") {
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
