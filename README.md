# Herramientas Web Sencillas

Pequeña colección de utilidades web implementadas con Next.js (app dir). Cada herramienta está en `app/tools/` como una página independiente.

## Comandos útiles

El proyecto usa [pnpm](https://pnpm.io/). Si no lo tienes, actívalo con `corepack enable`.

- **Instalar dependencias**: `pnpm install`
- **Desarrollo**: `pnpm dev` — arranca el servidor en modo desarrollo (puerto 3000)
- **Construir**: `pnpm build` — prepara la aplicación para producción
- **Iniciar**: `pnpm start` — arranca la app en modo producción (tras `pnpm build`)
- **Lint**: `pnpm lint`

> Nota: los scripts están definidos en `package.json`.

## Estructura relevante

- `app/` — directorio principal de la aplicación (Next.js app router)
- `app/tools/` — cada subcarpeta contiene una herramienta con su `page.tsx` y el componente del formulario
- `components/` — componentes compartidos (por ejemplo, `Navbar.tsx`)
- `public/` — activos estáticos
- `next.config.ts`, `package.json`, `tsconfig.json` — configuración del proyecto
- `pnpm-workspace.yaml` — ajustes de pnpm (overrides de seguridad y scripts de instalación permitidos)
