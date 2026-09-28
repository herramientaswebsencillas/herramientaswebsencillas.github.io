# Herramientas Web Sencillas

Pequeña colección de utilidades web implementadas con Next.js (app dir). Cada herramienta está en `app/tools/` como una página independiente.

El sitio se genera como export estático (`output: 'export'`) y se publica en GitHub Pages, así que **no hay servidor**: toda la lógica corre en el navegador del usuario.

## Requisitos

- **Node.js 22.13 o superior** — lo exige pnpm 11. La versión de referencia está en `.nvmrc` (con nvm: `nvm use`) y es la que usa el workflow de CI.
- **pnpm**. Si no lo tienes, actívalo con `corepack enable`; la versión está fijada en el campo `packageManager` de `package.json`.

## Comandos útiles

- **Instalar dependencias**: `pnpm install`
- **Desarrollo**: `pnpm dev` — arranca el servidor en modo desarrollo (puerto 3000)
- **Construir**: `pnpm build` — genera el sitio estático en `out/`
- **Previsualizar el build**: `pnpm start` — sirve `out/` en el puerto 3000 con `scripts/serve-out.mjs` (`next start` no sirve con `output: 'export'`)
- **Lint**: `pnpm lint`
- **Comprobar tipos**: `pnpm exec tsc --noEmit`
- **Pruebas unitarias**: `pnpm test` — Vitest sobre la lógica de `lib/`
- **Servicios externos**: `pnpm test:apis` — consulta de verdad LanguageTool, MyMemory y Frankfurter y comprueba el formato de sus respuestas
- **Pruebas de humo**: `pnpm test:e2e` — Playwright abre cada página del build; hace falta `pnpm build` antes y, la primera vez, `pnpm exec playwright install chromium`

> Nota: los scripts están definidos en `package.json`. `pnpm export` es un alias de `pnpm build`, ya que el build estático ya escribe `out/`.

## Estructura relevante

- `app/` — directorio principal de la aplicación (Next.js app router)
- `app/layout.tsx` — layout raíz, metadatos y la cabecera CSP
- `app/privacy/` — qué herramientas envían datos a servicios externos
- `app/tools/` — cada subcarpeta contiene una herramienta con su `page.tsx` y el componente del formulario
- `components/` — componentes compartidos (por ejemplo, `Navbar.tsx`)
- `lib/tools.ts` — catálogo de herramientas y categorías que se muestra en la página de inicio
- `lib/currencies.ts` — nombres de divisas en español, usados por el conversor
- `lib/*.ts` — lógica pura de las herramientas (fechas, finanzas, romanos, aleatorios, cifrado), separada de los componentes y probada en `lib/*.test.ts`
- `lib/external.ts` — validación de las respuestas de los servicios externos; `lib/external.live.test.ts` los consulta de verdad para el monitoreo diario
- `e2e/` — pruebas de humo con Playwright sobre el export estático
- `scripts/serve-out.mjs` — servidor estático de `out/` para `pnpm start` y las pruebas de humo
- `public/` — activos estáticos
- `next.config.ts`, `package.json`, `tsconfig.json` — configuración del proyecto
- `pnpm-workspace.yaml` — ajustes de pnpm (overrides de seguridad y scripts de instalación permitidos)
- `.github/workflows/nextjs.yml` — verificación en cada pull request, y verificación y despliegue a GitHub Pages en cada push a `main`
- `.github/workflows/codeql.yml`, `.github/dependabot.yml` — análisis de seguridad y actualizaciones automáticas de dependencias
- `.github/workflows/external-apis.yml` — monitoreo diario de los servicios externos

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

El workflow `.github/workflows/external-apis.yml` consulta los tres servicios cada día (`pnpm test:apis` lo hace en local) y avisa por correo si alguno falla. Ante un fallo:

1. Mira qué prueba falló en el registro del workflow. Si fue algo pasajero, la siguiente ejecución diaria pasará sola.
2. Si el servicio cambió su formato, ajusta el validador de `lib/external.ts` y la herramienta con la respuesta nueva.
3. Si el servicio desaparece, hay alternativas: Frankfurter se puede alojar por cuenta propia con Docker; LanguageTool también, aunque necesita un servidor y GitHub Pages no lo ofrece; para traducción, LibreTranslate es una alternativa de código abierto.

**Al añadir una herramienta que llame a un servicio externo hay que incluir su dominio en `connect-src`**, dentro de la CSP definida en `app/layout.tsx`, y listarla en la página de Privacidad (`app/privacy/page.tsx`). Sin lo primero el navegador bloquea las peticiones, y las pruebas de humo fallan con la violación de CSP. La CSP va en una etiqueta `<meta>` porque GitHub Pages no permite configurar cabeceras HTTP; es una cobertura parcial, y el propio archivo explica sus límites.

## Parámetros de URL

La calculadora de tiempo entre fechas lee su estado de la barra de direcciones, así que un rango se puede consultar con un enlace. Son enlaces que la gente comparte y guarda, de modo que **este contrato no se puede cambiar sin romperlos**:

| Parámetro | Formato | Ausente |
|---|---|---|
| `desde` | `dd/mm/aaaa` | Se completa con hoy |
| `hasta` | `dd/mm/aaaa` | Se completa con hoy |

Un valor que no exista como fecha (`31/02/2024`) se ignora y cae en el valor por defecto. Sin ningún parámetro se muestra el rango del año en curso.

Que el extremo ausente sea hoy es lo que hace útil al enlace corto: `?hasta=25/12/2026` cuenta lo que falta para esa fecha y se recalcula en cada visita, en vez de quedar congelado en el día de quien lo compartió. Por eso, al escribir la URL, el extremo que coincide con hoy se omite en lugar de fijarse.

## Despliegue

Cada push a `main` dispara el workflow de GitHub Actions. Instala con `pnpm install --frozen-lockfile`, ejecuta lint, `pnpm audit`, las pruebas unitarias, `pnpm build` y las pruebas de humo, y solo si todo pasa publica `out/` en GitHub Pages. En los pull request se ejecutan las mismas verificaciones sin publicar.

### Rollback

Si una publicación rompe algo, lo más rápido es revertir el commit y dejar que el workflow publique de nuevo:

```bash
git revert <commit>
git push
```

Si hace falta volver ya, en la pestaña **Actions** abre la ejecución de un commit anterior que funcionaba y usa **Re-run all jobs**: vuelve a construir y publicar ese commit.

## Seguridad

Para reportar una vulnerabilidad, consulta [SECURITY.md](SECURITY.md).
