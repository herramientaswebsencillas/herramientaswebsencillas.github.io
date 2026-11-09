## Qué cambia y por qué

<!-- Una o dos frases. Si corrige un issue, enlázalo. -->

## Revisión

- [ ] Si agrega sesiones, cuentas o una acción que cambie algo en un servidor, migra antes a un host con cabeceras para servir `frame-ancestors` (ver "Content Security Policy" en el README).
- [ ] Si llama a un servicio externo nuevo, su dominio está en `connect-src` (`lib/csp.mjs`) y la herramienta aparece en la página de Privacidad y en "Servicios de terceros" de los Términos de uso.
- [ ] Si cambia un límite o el comportamiento de una herramienta, su guía en `lib/toolGuides.ts` sigue siendo cierta.
- [ ] La lógica no trivial está en `lib/` con pruebas, y los flujos con archivos o servicios externos tienen su caso en `e2e/tools.spec.ts`.
- [ ] Nada de lo que escribe el usuario se asigna a un `href`, `src` o `innerHTML`.
- [ ] Las entradas numéricas tienen mínimo, máximo y paso, y sus límites están probados en `lib/`.
- [ ] No cambia los parámetros de URL de la calculadora de fechas ni el formato cifrado (ver "Compatibilidad" en el README). Si lo hace, la descripción del PR empieza con **⚠ Compatibilidad** y explica qué enlaces o textos cifrados dejan de funcionar.
