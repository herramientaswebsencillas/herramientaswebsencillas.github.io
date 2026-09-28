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
