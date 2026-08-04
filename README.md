# Herramientas Web Sencillas

Pequeña colección de utilidades web implementadas con Next.js (app dir). Cada herramienta está en `app/tools/` como una página independiente.

El sitio se genera como export estático (`output: 'export'`) y se publica en GitHub Pages, así que **no hay servidor**: toda la lógica corre en el navegador del usuario.

## Requisitos

- **Node.js 22.13 o superior** — lo exige pnpm 11.
- **pnpm**. Si no lo tienes, actívalo con `corepack enable`; la versión está fijada en el campo `packageManager` de `package.json`.

## Comandos útiles

- **Instalar dependencias**: `pnpm install`
- **Desarrollo**: `pnpm dev` — arranca el servidor en modo desarrollo (puerto 3000)
- **Construir**: `pnpm build` — genera el sitio estático en `out/`
- **Lint**: `pnpm lint`
- **Comprobar tipos**: `pnpm exec tsc --noEmit`

Para previsualizar el resultado del build, sirve la carpeta `out/` con cualquier servidor estático (por ejemplo `npx serve@latest out`). El script `pnpm start` **no funciona** en este proyecto: `next start` es incompatible con `output: 'export'`.

> Nota: los scripts están definidos en `package.json`. `pnpm export` es un alias de `pnpm build`, ya que el build estático ya escribe `out/`.

## Estructura relevante

- `app/` — directorio principal de la aplicación (Next.js app router)
- `app/layout.tsx` — layout raíz, metadatos y la cabecera CSP
- `app/tools/` — cada subcarpeta contiene una herramienta con su `page.tsx` y el componente del formulario
- `components/` — componentes compartidos (por ejemplo, `Navbar.tsx`)
- `lib/tools.ts` — catálogo de herramientas y categorías que se muestra en la página de inicio
- `lib/currencies.ts` — nombres de divisas en español, usados por el conversor
- `public/` — activos estáticos
- `next.config.ts`, `package.json`, `tsconfig.json` — configuración del proyecto
- `pnpm-workspace.yaml` — ajustes de pnpm (overrides de seguridad y scripts de instalación permitidos)
- `.github/workflows/nextjs.yml` — build y despliegue a GitHub Pages en cada push a `main`

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

3. Para una categoría nueva, añade también su acento al mapa `ACCENTS` del mismo archivo. Las clases se escriben completas a propósito — Tailwind rastrea literales en el código, así que un nombre de clase construido en tiempo de ejecución no generaría ningún estilo.

## Servicios externos

Casi todas las herramientas funcionan íntegramente en el navegador. Las que consultan una API pública son:

| Herramienta | Servicio | Clave |
|---|---|---|
| Corrector de texto | [LanguageTool](https://languagetool.org/) | No |
| Traductor | [MyMemory](https://mymemory.translated.net/) | No |
| Conversor de divisas | [Frankfurter](https://frankfurter.dev/) | No |

**Al añadir una herramienta que llame a un servicio externo hay que incluir su dominio en `connect-src`**, dentro de la CSP definida en `app/layout.tsx`. Sin eso el navegador bloquea las peticiones. La CSP va en una etiqueta `<meta>` porque GitHub Pages no permite configurar cabeceras HTTP; es una cobertura parcial, y el propio archivo explica sus límites.

## Parámetros de URL

La calculadora de tiempo entre fechas lee su estado de la barra de direcciones, así que un rango se puede consultar con un enlace. Son enlaces que la gente comparte y guarda, de modo que **este contrato no se puede cambiar sin romperlos**:

| Parámetro | Formato | Ausente |
|---|---|---|
| `desde` | `dd/mm/aaaa` | Se completa con hoy |
| `hasta` | `dd/mm/aaaa` | Se completa con hoy |

Un valor que no exista como fecha (`31/02/2024`) se ignora y cae en el valor por defecto. Sin ningún parámetro se muestra el rango del año en curso.

Que el extremo ausente sea hoy es lo que hace útil al enlace corto: `?hasta=25/12/2026` cuenta lo que falta para esa fecha y se recalcula en cada visita, en vez de quedar congelado en el día de quien lo compartió. Por eso, al escribir la URL, el extremo que coincide con hoy se omite en lugar de fijarse.

## Despliegue

Cada push a `main` dispara el workflow de GitHub Actions, que instala con `pnpm install --frozen-lockfile`, ejecuta `pnpm build` y publica el contenido de `out/` en GitHub Pages.
