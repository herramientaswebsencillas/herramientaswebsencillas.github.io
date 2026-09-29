// Content Security Policy del sitio. Es JavaScript y no TypeScript porque la
// usan tanto app/layout.tsx (en desarrollo) como scripts/csp-hashes.mjs, que
// Node ejecuta directamente después de `next build`.
//
// Va en una etiqueta <meta> porque GitHub Pages no permite configurar
// cabeceras HTTP. Es una cobertura parcial: a diferencia de una cabecera
// real, no puede aplicar frame-ancestors ni X-Frame-Options, ni reportar
// violaciones (report-uri). Si eso llega a ser crítico, lo correcto es migrar
// a un host que sirva cabeceras (Cloudflare Pages, Netlify, Vercel).
//
// Al añadir una herramienta que llame a un servicio externo, su dominio va en
// connect-src y la herramienta se lista en la página de Privacidad.

/**
 * @param {string[]} inlineScripts Fuentes que autorizan los scripts inline:
 *   los hashes de cada página en lo publicado, o 'unsafe-inline' en desarrollo.
 * @returns {string}
 */
export function contentSecurityPolicy(inlineScripts) {
  return [
    "default-src 'self'",
    // Next.js mete el payload de hidratación en <script> inline y, sin
    // servidor, no hay nonces: cada página autoriza los suyos por hash.
    ["script-src 'self'", ...inlineScripts].join(" "),
    "style-src 'self' 'unsafe-inline'",
    // Las fuentes de next/font/google se autohospedan en el build; en tiempo
    // de ejecución no se llama a fonts.googleapis.com ni a fonts.gstatic.com.
    "font-src 'self'",
    "img-src 'self' data:",
    // APIs públicas del corrector, el traductor y el conversor de divisas.
    "connect-src 'self' https://api.languagetool.org https://api.mymemory.translated.net https://api.frankfurter.dev",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}
