# Política de seguridad

## Cómo reportar una vulnerabilidad

Si encuentras un problema de seguridad en este sitio, **no abras un issue público**. Repórtalo de forma privada desde la pestaña **Security → Report a vulnerability** del repositorio, que solo ve quien mantiene el proyecto.

Incluye, si puedes:

- La herramienta o página afectada.
- Los pasos para reproducirlo y qué impacto tiene.
- El navegador y la versión en que lo probaste.

Recibirás una respuesta en un plazo de 7 días. Si se confirma, se corrige en la rama `main`, que se publica automáticamente, y se te da crédito en el aviso si lo deseas.

## Alcance

El sitio es estático: no tiene servidor propio, cuentas ni base de datos, y casi todo se ejecuta en el navegador. Entran en el alcance, por ejemplo:

- Inyección de código (XSS) en cualquier herramienta o en los parámetros de URL.
- Debilidades en el cifrado del encriptador de texto.
- Datos que salgan del navegador sin que la herramienta lo indique (ver la página de Privacidad).
- Vulnerabilidades en las dependencias que afecten al sitio publicado.

Quedan fuera los problemas de los servicios externos (LanguageTool, MyMemory, Frankfurter) y de GitHub Pages, que deben reportarse a sus responsables.

## Modelo de amenazas

Qué se protege, de quién y cómo. Revísalo al agregar una herramienta, un servicio externo o una dependencia, o al cambiar de host.

**Qué se protege**

- Lo que el visitante escribe o sube a las herramientas (textos, frases secretas, PDF, archivos en Base64): no debe salir del navegador salvo hacia el servicio que la herramienta indica.
- La integridad del sitio publicado: que sirva exactamente lo que está en `main`.
- Los textos cifrados que la gente ya compartió y los enlaces de la calculadora de fechas, que deben seguir abriéndose (ver "Compatibilidad" en el README).

**Amenazas y mitigaciones**

| Amenaza | Mitigación |
|---|---|
| Código inyectado por un parámetro de URL o un texto pegado (XSS) | React muestra todo como texto; ninguna entrada se asigna a `href`, `src` ni `innerHTML`; CSP con hashes y sin `'unsafe-inline'` en `script-src` (`lib/csp.mjs`, `scripts/csp-hashes.mjs`). |
| Una URL `javascript:` o un HTML pegado en el conversor Base64 | Solo se acepta Base64, el archivo se reconstruye como `Blob` y los tipos activos se descargan como binario (`lib/files.ts`). |
| Una respuesta maliciosa o mal formada de LanguageTool, MyMemory o Frankfurter | Validadores de `lib/external.ts`, espera máxima de 15 s y `connect-src` limitado a esos tres dominios. |
| Una dependencia o acción de GitHub comprometida | Lockfile con `--frozen-lockfile`, versiones con al menos 3 días publicadas (`minimumReleaseAge`) y 7 en Dependabot (`cooldown`), acciones fijadas por SHA, `persist-credentials: false`, `pnpm audit` y CodeQL en CI, y SRI en los scripts del build. |
| Un commit malicioso o accidental en `main`, que se publica solo | Ruleset de `main` (PR obligatorio con el check `build` en verde y sin force-push), entorno `github-pages` restringido a `main` y pruebas de humo diarias sobre el sitio publicado (`external-apis.yml`). |
| Fuerza bruta sobre un texto cifrado interceptado | AES-256-GCM con PBKDF2-SHA256 de 600 000 iteraciones (`lib/cipher.ts`) y aviso cuando la frase secreta es débil. |
| Clickjacking: otro sitio incrusta una herramienta en un iframe | Riesgo aceptado: GitHub Pages no permite `frame-ancestors` y el sitio no tiene sesiones ni acciones con estado (ver "Content Security Policy" en el README). |
| Entradas que congelan la pestaña (archivos o cifras enormes) | Límites de tamaño por archivo y en total (`lib/files.ts`) y rangos validados en las calculadoras y generadores (`lib/finance.ts`, `lib/random.ts`). |

## Si el sitio se ve comprometido

Por ejemplo, si el sitio publicado sirve código que no está en `main`, aparece un commit o un workflow que nadie hizo, o una dependencia o acción de GitHub resulta maliciosa. En ese orden:

1. **Contener.** Si el sitio publicado sirve algo malicioso, despublícalo en **Settings → Pages** (o desactiva el workflow de despliegue) mientras se investiga. Es preferible un sitio caído a uno que ataque a quien lo visita.
2. **Cortar el acceso.** Cambia la contraseña de la cuenta de GitHub, cierra las sesiones abiertas (**Settings → Sessions**), revoca los tokens personales y las aplicaciones OAuth que no reconozcas, y revisa las llaves SSH y las claves de despliegue.
3. **Encontrar el origen.** Revisa `git log` de `main`, los cambios recientes en `.github/workflows/`, el registro de auditoría de la cuenta y las ejecuciones de Actions. Compara lo publicado con un build limpio del último commit de confianza.
4. **Restaurar.** Revierte a ese commit (ver "Rollback" en el README), actualiza o quita la dependencia o acción comprometida y vuelve a publicar. Confirma en el sitio que la CSP y el contenido son los esperados.
5. **Avisar.** Publica un aviso de seguridad en el repositorio (**Security → Advisories**) que diga qué se sirvió, durante cuánto tiempo y qué herramientas se vieron afectadas. El sitio no guarda datos de visitantes, pero un script malicioso pudo leer lo que se escribió en las herramientas mientras estuvo publicado. El aviso debe decirlo, sobre todo si afecta al encriptador.
