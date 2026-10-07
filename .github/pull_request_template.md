## Qué cambia y por qué

<!-- Una o dos frases. Si corrige un issue, enlázalo. -->

## Revisión

- [ ] Si la herramienta es nueva o cambió de nombre o descripción, está actualizada en `lib/tools.ts`.
- [ ] Si llama a un servicio externo nuevo, su dominio está en `connect-src` (`lib/csp.mjs`) y la herramienta aparece en la página de Privacidad y en "Servicios de terceros" de los Términos de uso.
- [ ] La lógica no trivial está en `lib/` con pruebas, y los flujos con archivos o servicios externos tienen su caso en `e2e/tools.spec.ts`.
- [ ] Nada de lo que escribe el usuario se asigna a un `href`, `src` o `innerHTML`.
- [ ] No cambia los parámetros de URL de la calculadora de fechas ni el formato cifrado (ver "Compatibilidad" en el README). Si lo hace, la descripción del PR empieza con **⚠ Compatibilidad** y explica qué enlaces o textos cifrados dejan de funcionar.
