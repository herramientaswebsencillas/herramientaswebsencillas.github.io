# Registro de cambios

Cambios visibles del sitio, del más reciente al más antiguo. El sitio se publica de forma continua desde `main`, así que las entradas van por fecha y no por número de versión.

Los cambios que rompen algo que la gente guarda o comparte se marcan con **⚠ Compatibilidad**. Hoy son dos contratos:

- Los parámetros de URL de la calculadora de fechas (`desde`, `hasta`), documentados en el README.
- El formato de los textos cifrados del encriptador (`v2:` y el heredado de CryptoJS), definido en `lib/cipher.ts`.

## Sin publicar

### Seguridad
- El conversor Base64 de archivos ya no usa el texto pegado como URL del enlace de descarga. Antes, un texto como `javascript:…` ejecutaba código en el sitio. Ahora solo acepta Base64 (solo o con la cabecera `data:…;base64,`) y reconstruye el archivo como Blob. Los HTML, SVG y XML reconstruidos se entregan como binario, para que el navegador nunca los abra en el sitio.
- La CSP publicada ya no incluye `'unsafe-inline'` en `script-src`: cada página autoriza sus scripts inline por hash (`scripts/csp-hashes.mjs`), y el `<meta>` va antes de cualquier script.
- Las acciones de GitHub se fijan por SHA.

### Cambios
- Unir PDF, dividir PDF y el conversor Base64 de archivos rechazan los archivos demasiado grandes con un mensaje (50 MB para PDF y 10 MB para Base64), en lugar de congelar la pestaña.
- Las descargas ya no se cancelan en navegadores que revocaban el Blob antes de que empezara.
- El monitoreo diario comprueba también que el sitio publicado responda.
- Cada publicación genera un SBOM (CycloneDX) como artefacto del workflow.
- Se agrega una imagen para las vistas previas en redes sociales.

## 2026-09-28
- Pruebas unitarias (Vitest), pruebas de humo (Playwright), CodeQL, Dependabot y monitoreo diario de los servicios externos. El despliegue solo ocurre si todo pasa.
- **⚠ Compatibilidad:** el encriptador cifra con AES-256-GCM y PBKDF2 (formato `v2:`). Los textos del formato anterior se siguen pudiendo descifrar.
- Página de Privacidad y `SECURITY.md`.
- El conversor de divisas usa la API v2 de Frankfurter y detecta la cuota agotada de MyMemory.

## 2026-08-04
- **⚠ Compatibilidad:** la calculadora de fechas lee y escribe el rango en la URL (`?desde=dd/mm/aaaa&hasta=dd/mm/aaaa`). Desde aquí esos enlaces deben seguir funcionando.

## 2026-08-02
- Calculadora de tiempo entre fechas. El convertidor de voz se divide en "Texto a voz" y "Voz a texto".

## 2026-07-27
- Conversor de divisas con gráfica histórica.
- Herramientas de texto a voz y voz a texto.
- Página de inicio organizada como catálogo por categorías.
- El proyecto pasa a pnpm.

## 2026-06-21 a 2026-06-27
- Corrector de texto (LanguageTool), traductor (MyMemory), encriptador de texto y convertidor de números romanos.
- Página "Acerca de".
- Los generadores de números y cadenas aleatorias usan `crypto.getRandomValues` sin sesgo.
- Correcciones de seguridad.

## 2026-06-20
- Primera versión del sitio, separada del sitio web personal.
