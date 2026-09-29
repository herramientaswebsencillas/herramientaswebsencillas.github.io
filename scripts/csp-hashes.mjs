// Inserta la CSP en cada HTML de out/, con los hashes de los scripts inline
// de esa página en lugar de 'unsafe-inline'. Se ejecuta después de
// `next build` (ver "build" en package.json).
//
// Por qué: Next.js mete el payload de hidratación en <script> inline y, sin
// servidor, no hay nonces. Con 'unsafe-inline' pasaría también cualquier
// script inyectado y las URL javascript:. En un export estático esos scripts
// ya no cambian, así que se autorizan uno a uno por su hash.
//
// El <meta> va justo después del charset, antes que cualquier <script>: una
// CSP en <meta> solo protege lo que el navegador procesa después de ella.
// app/layout.tsx no la renderiza en producción (ver el comentario allí).

import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { contentSecurityPolicy } from "../lib/csp.mjs";

const ROOT = resolve(import.meta.dirname, "..", "out");

const CHARSET = '<meta charSet="utf-8"/>';
// <script> sin src: los que llevan src ya están cubiertos por 'self'.
const INLINE_SCRIPT = /<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/g;

function* htmlFiles(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* htmlFiles(path);
    else if (entry.name.endsWith(".html")) yield path;
  }
}

const escapeAttribute = (value) =>
  value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("'", "&#x27;");

let pages = 0;
for (const file of htmlFiles(ROOT)) {
  const name = relative(ROOT, file);
  const html = readFileSync(file, "utf8");

  if (/http-equiv="Content-Security-Policy"/i.test(html)) {
    throw new Error(`${name}: ya tiene una CSP. ¿Se ejecutó dos veces sobre el mismo build?`);
  }
  if (!html.includes(CHARSET)) {
    throw new Error(`${name}: no se encontró ${CHARSET} para insertar la CSP detrás`);
  }

  const hashes = new Set();
  for (const [, body] of html.matchAll(INLINE_SCRIPT)) {
    if (body) hashes.add(`'sha256-${createHash("sha256").update(body, "utf8").digest("base64")}'`);
  }

  const csp = escapeAttribute(contentSecurityPolicy([...hashes]));
  const meta = `<meta http-equiv="Content-Security-Policy" content="${csp}"/>`;
  writeFileSync(file, html.replace(CHARSET, CHARSET + meta));
  pages++;
}

if (pages === 0) throw new Error("No se encontró ningún HTML en out/. ¿Falló next build?");
console.log(`CSP con hashes en ${pages} páginas.`);
