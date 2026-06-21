# Herramientas Web Sencillas

Pequeña colección de utilidades web implementadas con Next.js (app dir). Cada herramienta está en `app/tools/` como una página independiente.

**Demo local**: ejecuta la app en modo desarrollo y abre http://localhost:3000

## Comandos útiles

- **Instalar dependencias**: `npm install`
- **Desarrollo**: `npm run dev` — arranca el servidor en modo desarrollo (puerto 3000)
- **Construir**: `npm run build` — prepara la aplicación para producción
- **Iniciar**: `npm run start` — arranca la app en modo producción (tras `npm run build`)
- **Lint**: `npm run lint`

> Nota: los scripts están definidos en `package.json`.

## Estructura relevante

- `app/` — directorio principal de la aplicación (Next.js app router)
- `app/tools/` — cada subcarpeta contiene una herramienta con su `page.tsx` y el componente del formulario
- `components/` — componentes compartidos (por ejemplo, `Navbar.tsx`)
- `public/` — activos estáticos
- `next.config.ts`, `package.json`, `tsconfig.json` — configuración del proyecto

## Contribuir

1. Crea una rama nueva para tu cambio.
2. Añade la nueva herramienta dentro de `app/tools/` como una carpeta con `page.tsx` y el componente necesario.
3. Asegúrate de que el componente funcione en `npm run dev`.
4. Envía un pull request describiendo los cambios.
