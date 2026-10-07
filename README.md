# Herramientas Web Sencillas

Pequeña colección de utilidades web implementadas con Next.js (app dir). Cada herramienta está en `app/tools/` como una página independiente.

El sitio se genera como export estático (`output: 'export'`) y se publica en GitHub Pages, así que **no hay servidor**: toda la lógica corre en el navegador del usuario.

## Requisitos

- **Node.js 22.13 o superior** — lo exige pnpm 11. La versión de referencia está en `.nvmrc` (con nvm: `nvm use`) y es la que usa el workflow de CI.
- **pnpm**. Si no lo tienes, actívalo con `corepack enable`; la versión está fijada en el campo `packageManager` de `package.json`.

## Comandos útiles

- **Instalar dependencias**: `pnpm install`
- **Desarrollo**: `pnpm dev` — arranca el servidor en modo desarrollo (puerto 3000)
- **Construir**: `pnpm build` — genera el sitio estático en `out/` y le inserta la CSP con los hashes de cada página (`scripts/csp-hashes.mjs`)
- **Previsualizar el build**: `pnpm start` — sirve `out/` en el puerto 3000 con `scripts/serve-out.mjs` (`next start` no sirve con `output: 'export'`)
- **Lint**: `pnpm lint`
- **Formato**: `pnpm format` aplica Prettier; `pnpm format:check` solo comprueba, como hace el CI
- **Comprobar tipos**: `pnpm exec tsc --noEmit`
- **Pruebas unitarias**: `pnpm test` — Vitest sobre la lógica de `lib/`
- **Servicios externos**: `pnpm test:apis` — consulta de verdad LanguageTool, MyMemory y Frankfurter y comprueba el formato de sus respuestas
- **Pruebas de humo**: `pnpm test:e2e` — Playwright abre cada página del build; hace falta `pnpm build` antes y, la primera vez, `pnpm exec playwright install chromium`
- **Peso del JavaScript**: `pnpm size` — comprueba el presupuesto de `.size-limit.mjs` sobre `out/`; hace falta `pnpm build` antes

> Nota: los scripts están definidos en `package.json`. `pnpm export` es un alias de `pnpm build`, ya que el build estático ya escribe `out/`.

## Estructura relevante

- `app/` — directorio principal de la aplicación (Next.js app router)
- `app/layout.tsx` — layout raíz y metadatos
- `app/opengraph-image.png` — imagen de las vistas previas en redes sociales (con su texto alternativo en `opengraph-image.alt.txt`)
- `app/privacy/` — qué herramientas envían datos a servicios externos
- `app/terms/` — términos de uso: servicio sin garantías, resultados orientativos y servicios de terceros
- `app/tools/` — cada subcarpeta contiene una herramienta con su `page.tsx` y el componente del formulario
- `components/` — componentes compartidos (por ejemplo, `Navbar.tsx`)
- `lib/tools.ts` — catálogo de herramientas y categorías que se muestra en la página de inicio
- `lib/currencies.ts` — nombres de divisas en español, usados por el conversor
- `lib/csp.mjs` — la Content Security Policy del sitio (ver "Seguridad")
- `lib/files.ts` — límites de tamaño, decodificación de Base64 y descargas de las herramientas de archivos
- `lib/*.ts` — lógica pura de las herramientas (fechas, finanzas, romanos, aleatorios, cifrado), separada de los componentes y probada en `lib/*.test.ts`
- `lib/external.ts` — validación de las respuestas de los servicios externos; `lib/external.live.test.ts` los consulta de verdad para el monitoreo diario
- `e2e/` — pruebas con Playwright sobre el export estático: `smoke.spec.ts` recorre todas las páginas y `tools.spec.ts` prueba los flujos de archivos y de servicios externos con respuestas simuladas
- `scripts/serve-out.mjs` — servidor estático de `out/` para `pnpm start` y las pruebas de humo
- `scripts/csp-hashes.mjs` — inserta la CSP con hashes en cada HTML de `out/` después de `next build`
- `next.config.ts`, `package.json`, `tsconfig.json` — configuración del proyecto
- `pnpm-workspace.yaml` — ajustes de pnpm (overrides de seguridad, avisos de `pnpm audit` ignorados con su motivo y scripts de instalación permitidos)
- `.github/workflows/nextjs.yml` — verificación en cada pull request, y verificación y despliegue a GitHub Pages en cada push a `main`
- `.github/workflows/codeql.yml`, `.github/dependabot.yml` — análisis de seguridad y actualizaciones automáticas de dependencias
- `.github/workflows/external-apis.yml` — monitoreo diario del sitio publicado, de los servicios externos y de los avisos de seguridad de las dependencias
- `.size-limit.mjs` — presupuesto de peso del JavaScript publicado
- `CHANGELOG.md` — cambios visibles del sitio, con los que rompen compatibilidad marcados

## Añadir una herramienta

1. Crea `app/tools/<slug>/page.tsx` con su `metadata` y el componente del formulario al lado. Si la herramienta usa estado o APIs del navegador, el formulario lleva `"use client"`.
2. Añade una entrada al array de la categoría correspondiente en `lib/tools.ts`:

   ```ts
   {
     slug: "<slug>",
     name: "Nombre visible",
     description: "Una frase; la tarjeta reserva dos líneas.",
   }
   ```

   La página de inicio se genera desde ese catálogo: la ruta, la tarjeta y los colores salen de ahí, y las columnas se reequilibran solas.

3. Si la herramienta tiene lógica no trivial, sácala a `lib/` y añade sus pruebas junto a ella. Las pruebas de humo la incluyen sola, porque recorren el catálogo.

4. Para una categoría nueva, añade también su acento al mapa `ACCENTS` del mismo archivo. Las clases se escriben completas a propósito — Tailwind rastrea literales en el código, así que un nombre de clase construido en tiempo de ejecución no generaría ningún estilo.

## Servicios externos

Casi todas las herramientas funcionan íntegramente en el navegador. Las que consultan una API pública son:

| Herramienta | Servicio | Clave | Límites del plan gratuito | Condiciones que afectan al sitio |
|---|---|---|---|---|
| Corrector de texto | [LanguageTool](https://dev.languagetool.org/public-http-api) | No | 20 peticiones/min, 75 KB/min y 20 KB por petición, por IP | Enlace visible a languagetool.org sin `rel="nofollow"` (ya está en la herramienta) |
| Traductor | [MyMemory](https://mymemory.translated.net/doc/usagelimits.php) | No | 5 000 caracteres al día por IP sin identificarse | Conserva los textos que recibe; prohíbe revender el servicio y traducir más de un párrafo por petición |
| Conversor de divisas | [Frankfurter](https://frankfurter.dev/) | No | Sin cuota; solo límite contra abuso | Uso comercial libre; la API v1 está deprecada (el sitio usa v2) |

Las peticiones salen del navegador de cada visitante, no de un servidor propio, así que los límites se cuentan por visitante: el tráfico total del sitio no se suma en una sola cuota. Los límites se consultaron el 2026-09-28 y los servicios pueden cambiarlos sin aviso.

**Si un servicio falla o cambia.** Las respuestas pasan por los validadores de `lib/external.ts` antes de llegar a la interfaz. Como React muestra todo como texto y la CSP solo admite scripts propios, una respuesta maliciosa no puede ejecutar código. Lo peor que puede hacer es traer datos falsos, y los mal formados se descartan: tasas no positivas, correcciones que apuntan fuera del texto o avisos de cuota disfrazados de traducción. Si un servicio cae, solo su herramienta muestra un error; el resto del sitio sigue igual.

El workflow `.github/workflows/external-apis.yml` consulta cada día los tres servicios (`pnpm test:apis` lo hace en local) y el sitio publicado, y avisa por correo si algo falla. Ante un fallo:

1. Mira qué prueba falló en el registro del workflow. Si fue algo pasajero, la siguiente ejecución diaria pasará sola.

   La prueba de MyMemory se **omite** (no falla) cuando responde con la cuota agotada. Esa cuota se cuenta por IP, y los runners de GitHub comparten IPs con otros proyectos que pueden haberla gastado antes. No afecta a los visitantes, porque cada uno consulta desde su propia IP. Si se omite varios días seguidos, conviene revisarlo con `pnpm test:apis` en local.
2. Si el servicio cambió su formato, ajusta el validador de `lib/external.ts` y la herramienta con la respuesta nueva.
3. Si el servicio desaparece, hay alternativas: Frankfurter se puede alojar por cuenta propia con Docker; LanguageTool también, aunque necesita un servidor y GitHub Pages no lo ofrece; para traducción, LibreTranslate es una alternativa de código abierto.

**Si el monitoreo deja de ejecutarse.** GitHub desactiva los workflows programados de un repositorio público (este y el análisis semanal de CodeQL) tras 60 días sin actividad, y avisa antes por correo. Si el sitio pasa una temporada sin cambios, revisa en **Actions** que *External APIs* y *CodeQL* sigan activos y, si no, actívalos con **Enable workflow**. Integrar los PR semanales de Dependabot cuenta como actividad.

**Al añadir una herramienta que llame a un servicio externo hay que incluir su dominio en `connect-src`**, dentro de la CSP de `lib/csp.mjs`, y listarla en la página de Privacidad (`app/privacy/page.tsx`) y en "Servicios de terceros" de los Términos de uso (`app/terms/page.tsx`). Sin lo primero el navegador bloquea las peticiones y las pruebas de humo fallan con la violación de CSP.

## Parámetros de URL

La calculadora de tiempo entre fechas lee su estado de la barra de direcciones, así que un rango se puede consultar con un enlace. Son enlaces que la gente comparte y guarda, de modo que **este contrato no se puede cambiar sin romperlos**:

| Parámetro | Formato | Ausente |
|---|---|---|
| `desde` | `dd/mm/aaaa` | Se completa con hoy |
| `hasta` | `dd/mm/aaaa` | Se completa con hoy |

Un valor que no exista como fecha (`31/02/2024`) se ignora y cae en el valor por defecto. Sin ningún parámetro se muestra el rango del año en curso.

Que el extremo ausente sea hoy es lo que hace útil al enlace corto: `?hasta=25/12/2026` cuenta lo que falta para esa fecha y se recalcula en cada visita, en vez de quedar congelado en el día de quien lo compartió. Por eso, al escribir la URL, el extremo que coincide con hoy se omite en lugar de fijarse.

## Despliegue

Cada push a `main` dispara el workflow de GitHub Actions. Instala con `pnpm install --frozen-lockfile`, ejecuta lint, la comprobación de formato, `pnpm audit`, las pruebas unitarias, `pnpm build`, el presupuesto de peso (`pnpm size`) y las pruebas E2E, y solo si todo pasa publica `out/` en GitHub Pages. En los pull request se ejecutan las mismas verificaciones sin publicar. Cada publicación deja además un SBOM (inventario de dependencias en formato CycloneDX) como artefacto de la ejecución, en la pestaña **Actions**.

Las acciones de los workflows se fijan por SHA, con la versión en un comentario. Dependabot las actualiza igual que las dependencias.

### Rollback

Si una publicación rompe algo, lo más rápido es revertir el commit y dejar que el workflow publique de nuevo:

```bash
git revert <commit>
git push
```

Si hace falta volver ya, en la pestaña **Actions** abre la ejecución de un commit anterior que funcionaba y usa **Re-run all jobs**: vuelve a construir y publicar ese commit.

## Dependencias

`pnpm audit --audit-level=high` corre en cada pull request, antes de cada publicación y cada día en `external-apis.yml`. Un aviso alto bloquea el despliegue. Para resolverlo:

1. Si la dependencia directa ya trae la versión corregida, actualízala (o integra el PR de Dependabot).
2. Si el aviso está en una dependencia transitiva, fuerza la versión corregida en `overrides` de `pnpm-workspace.yaml`, con el aviso y el camino por el que llega en un comentario. Quita el override cuando la dependencia directa ya la traiga.
3. Si no existe versión corregida, evalúa si el aviso afecta al sitio publicado. Si no lo afecta (por ejemplo, porque solo llega a herramientas de desarrollo con datos del propio repositorio), añade su GHSA a `auditConfig.ignoreGhsas` con el motivo y la condición para quitarlo.

Dos dependencias se fijan a propósito: `@cantoo/pdf-lib` es el fork mantenido de `pdf-lib`, que dejó de publicar versiones en 2022, y `crypto-js` va en versión exacta porque está deprecada y solo sirve para descifrar el formato heredado del encriptador.

## Seguridad

Para reportar una vulnerabilidad, o si el sitio se ve comprometido, consulta [SECURITY.md](SECURITY.md).

### Content Security Policy

GitHub Pages no permite configurar cabeceras HTTP, así que la CSP va en una etiqueta `<meta>`. Eso no puede aplicar `frame-ancestors`, `X-Frame-Options` ni reportar violaciones; para eso haría falta un host que sirva cabeceras.

La política se define en `lib/csp.mjs`. Next.js mete el payload de hidratación en `<script>` inline y, sin servidor, no hay nonces. Por eso:

- **En lo publicado**, `scripts/csp-hashes.mjs` inserta la CSP al principio del `<head>` de cada HTML de `out/` y autoriza sus scripts inline por hash. No hay `'unsafe-inline'` en `script-src`, así que un script inyectado o una URL `javascript:` quedan bloqueados. Las pruebas de humo lo comprueban.
- **En desarrollo** (`pnpm dev`), `app/layout.tsx` renderiza la misma CSP con `'unsafe-inline'`, porque los scripts cambian con cada recarga.

Toda herramienta que reciba texto para convertirlo en un archivo o enlace debe decodificarlo a un `Blob` (ver `lib/files.ts`), nunca asignarlo a un `href`.
