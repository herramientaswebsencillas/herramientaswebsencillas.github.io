# Cómo contribuir

Gracias por querer mejorar el sitio. Esta guía resume cómo proponer un cambio; los detalles de cada tema están en el [README](README.md).

## Antes de empezar

- **Errores o ideas:** abre un issue. Si es algo grande (una herramienta nueva, un cambio de diseño o de dependencias), conviene comentarlo en el issue antes de escribir código.
- **Problemas de seguridad:** no abras un issue público; sigue [SECURITY.md](SECURITY.md).

Requisitos y comandos: ver "Requisitos" y "Comandos útiles" en el README.

## Ramas y pull requests

- `main` es lo que está publicado: cada push a `main` se despliega solo. Nada entra a `main` sin un pull request con el check `build` en verde.
- Trabaja en una rama a partir de `main`, con un prefijo por tema y un nombre descriptivo en español, por ejemplo `seguridad/correcciones-auditoria`, `herramienta/calculadora-iva` o `correccion/traductor-cuota`.
- Un pull request por tema. Llena la plantilla: el checklist recoge lo que suele olvidarse (catálogo de herramientas, CSP, Privacidad, compatibilidad).
- Si el cambio rompe los parámetros de URL de la calculadora de fechas o el formato cifrado, la descripción empieza con **⚠ Compatibilidad** (ver "Compatibilidad" en el README).

## Commits

En español, en impersonal y explicando el qué y, si no es evidente, el porqué. Por ejemplo:

- `Se agrega la calculadora de fechas`
- `Se valida el relleno al descifrar el formato heredado`

## Antes de abrir el pull request

Ejecuta lo mismo que el CI, en este orden:

```bash
pnpm lint --max-warnings=0
pnpm format:check
pnpm audit --audit-level=high
pnpm test
pnpm build
pnpm size
pnpm test:e2e
```

Si cambiaste `lib/external.ts` o algo que dependa de LanguageTool, MyMemory o Frankfurter, ejecuta también `pnpm test:apis`.

## Qué se espera de un cambio

- La lógica no trivial va en `lib/` con sus pruebas (`lib/*.test.ts`), separada del componente.
- Los flujos con archivos o servicios externos tienen su caso en `e2e/tools.spec.ts`, con las respuestas simuladas.
- Nada de lo que escribe el usuario se asigna a un `href`, `src` o `innerHTML`.
- Las dependencias nuevas se justifican en el pull request: para qué hacen falta, si tienen mantenimiento activo y cuánto pesan (`pnpm size`).

## Licencia

Al contribuir aceptas que tu aporte se publique bajo la [licencia MIT](LICENSE) del proyecto.
