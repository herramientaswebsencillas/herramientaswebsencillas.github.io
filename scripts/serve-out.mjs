// Sirve el export estático de out/ para previsualizar el build y para las
// pruebas E2E. `next start` no sirve aquí: es incompatible con output: 'export'.
// Imita a GitHub Pages en lo que importa: /ruta → ruta.html, /ruta/ →
// ruta/index.html y 404.html para lo que no existe.

import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";

const ROOT = resolve(import.meta.dirname, "..", "out");
const PORT = Number(process.env.PORT ?? 3000);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

if (!existsSync(ROOT)) {
  console.error("No existe out/. Ejecuta `pnpm build` primero.");
  process.exit(1);
}

/* El router pide los datos de prefetch como /ruta/__next.a.b.__PAGE__.txt.
   En Linux el build los escribe con ese nombre, pero en Windows Next arma la
   ruta con path.relative y las barras invertidas acaban como carpetas
   (__next.a/b/__PAGE__.txt). Se prueba también esa forma para que la
   previsualización local se comporte como el sitio publicado, que se compila
   en Linux. */
function windowsSegmentPath(path) {
  return path.replace(
    /__next\.([^/\\]+)\.txt$/,
    (_, segments) => `__next.${segments.replaceAll(".", sep)}.txt`
  );
}

function resolveFile(urlPath) {
  return resolvePath(urlPath) ?? resolvePath(windowsSegmentPath(urlPath));
}

function resolvePath(urlPath) {
  const path = normalize(decodeURIComponent(urlPath));
  const file = join(ROOT, path);
  // Nada fuera de out/, aunque la ruta traiga "..".
  if (file !== ROOT && !file.startsWith(ROOT + sep)) return null;
  if (existsSync(file) && statSync(file).isFile()) return file;
  // Como GitHub Pages: /ruta sirve ruta.html (trailingSlash: false) y, si no
  // existe, la carpeta con su index.html.
  if (existsSync(`${file}.html`)) return `${file}.html`;
  const index = join(file, "index.html");
  return existsSync(index) ? index : null;
}

createServer((req, res) => {
  let file = null;
  try {
    file = resolveFile(new URL(req.url, "http://localhost").pathname);
  } catch {
    // URL mal codificada: se trata como no encontrada.
  }
  const status = file ? 200 : 404;
  file ??= join(ROOT, "404.html");

  res.writeHead(status, {
    "Content-Type": TYPES[extname(file)] ?? "application/octet-stream",
  });
  createReadStream(file).pipe(res);
}).listen(PORT, () => {
  console.log(`Sirviendo out/ en http://localhost:${PORT}`);
});
