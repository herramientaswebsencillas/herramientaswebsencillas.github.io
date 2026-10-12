// Escribe out/third-party-licenses.txt con la licencia de cada dependencia de
// producción. Se ejecuta después de `next build` (ver "build" en package.json)
// y lo enlazan "Acerca de" y los Términos de uso.
//
// Por qué: el JavaScript publicado incluye, minificado, código de React,
// pdf-lib, fflate y otros paquetes MIT o similares. Esas licencias
// piden conservar su aviso de copyright en las copias, y el minificador lo
// quita del bundle.
//
// Recorre `dependencies` desde package.json, sin las opcionales ni las peer:
// las opcionales de next son binarios de compilación (swc, sharp) que no
// llegan al navegador. Busca cada paquete subiendo por node_modules, como
// Node, así que funciona con la estructura de pnpm y con la de npm.

import { existsSync, readdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const OUT = join(ROOT, "out");
const LICENSE_FILE = /^(licen[cs]e|copying|notice)([.-].*)?$/i;

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

function findPackageDir(name, fromDir) {
  for (let dir = fromDir; ; dir = dirname(dir)) {
    const candidate = join(dir, "node_modules", name);
    if (existsSync(join(candidate, "package.json"))) return realpathSync(candidate);
    if (dirname(dir) === dir) return null;
  }
}

function licenseOf(pkg) {
  if (typeof pkg.license === "string") return pkg.license;
  // Formato antiguo: { type } o [{ type }, …].
  const legacy = [pkg.license, ...(pkg.licenses ?? [])].filter(Boolean);
  return legacy.map((l) => l.type ?? l).join(" OR ") || "Sin declarar";
}

function repositoryOf(pkg) {
  const repo = typeof pkg.repository === "string" ? pkg.repository : pkg.repository?.url;
  return (repo ?? pkg.homepage ?? "")
    .replace(/^git\+/, "")
    .replace(/^git:\/\//, "https://")
    .replace(/\.git$/, "");
}

if (!existsSync(OUT)) throw new Error("No existe out/. ¿Falló next build?");

const packages = new Map();
const pending = Object.keys(readJson(join(ROOT, "package.json")).dependencies ?? {}).map(
  (name) => ({ name, from: ROOT })
);

while (pending.length > 0) {
  const { name, from } = pending.pop();
  const dir = findPackageDir(name, from);
  if (!dir) throw new Error(`No se encontró ${name} (requerido desde ${from}).`);

  const pkg = readJson(join(dir, "package.json"));
  const key = `${pkg.name}@${pkg.version}`;
  if (packages.has(key)) continue;

  const files = readdirSync(dir)
    .filter((file) => LICENSE_FILE.test(file))
    .sort();
  packages.set(key, {
    name: pkg.name,
    version: pkg.version,
    license: licenseOf(pkg),
    repository: repositoryOf(pkg),
    texts: files.map((file) => readFileSync(join(dir, file), "utf8").trim()),
  });

  for (const dep of Object.keys(pkg.dependencies ?? {})) pending.push({ name: dep, from: dir });
}

const RULE = "=".repeat(78);
const entries = [...packages.values()].sort(
  (a, b) => a.name.localeCompare(b.name) || a.version.localeCompare(b.version)
);

const body = entries.map((entry) =>
  [
    RULE,
    `${entry.name} ${entry.version}`,
    `Licencia: ${entry.license}`,
    ...(entry.repository ? [`Código: ${entry.repository}`] : []),
    "",
    entry.texts.length > 0
      ? entry.texts.join(`\n\n${"-".repeat(78)}\n\n`)
      : "(El paquete no incluye el texto de la licencia; ver el campo anterior.)",
  ].join("\n")
);

const header = [
  "Avisos de licencia de terceros — Herramientas Web Sencillas",
  "",
  "El código del sitio se publica con la licencia MIT. Su JavaScript incluye",
  "código de los paquetes siguientes, cada uno con su propia licencia.",
  "Archivo generado en cada compilación a partir de las dependencias de producción.",
  "",
].join("\n");

writeFileSync(join(OUT, "third-party-licenses.txt"), `${header}\n${body.join("\n\n")}\n`);
console.log(`Licencias de ${entries.length} paquetes en out/third-party-licenses.txt.`);
