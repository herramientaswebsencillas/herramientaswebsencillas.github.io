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

## Si el sitio se ve comprometido

Por ejemplo, si el sitio publicado sirve código que no está en `main`, aparece un commit o un workflow que nadie hizo, o una dependencia o acción de GitHub resulta maliciosa. En ese orden:

1. **Contener.** Si el sitio publicado sirve algo malicioso, despublícalo en **Settings → Pages** (o desactiva el workflow de despliegue) mientras se investiga. Es preferible un sitio caído a uno que ataque a quien lo visita.
2. **Cortar el acceso.** Cambia la contraseña de la cuenta de GitHub, cierra las sesiones abiertas (**Settings → Sessions**), revoca los tokens personales y las aplicaciones OAuth que no reconozcas, y revisa las llaves SSH y las claves de despliegue.
3. **Encontrar el origen.** Revisa `git log` de `main`, los cambios recientes en `.github/workflows/`, el registro de auditoría de la cuenta y las ejecuciones de Actions. Compara lo publicado con un build limpio del último commit de confianza.
4. **Restaurar.** Revierte a ese commit (ver "Rollback" en el README), actualiza o quita la dependencia o acción comprometida y vuelve a publicar. Confirma en el sitio que la CSP y el contenido son los esperados.
5. **Avisar.** Publica un aviso de seguridad en el repositorio (**Security → Advisories**) que diga qué se sirvió, durante cuánto tiempo y qué herramientas se vieron afectadas. Añade una nota al `CHANGELOG.md`. El sitio no guarda datos de visitantes, pero un script malicioso pudo leer lo que se escribió en las herramientas mientras estuvo publicado. El aviso debe decirlo, sobre todo si afecta al encriptador.
