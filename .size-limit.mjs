// Presupuesto de peso del JavaScript publicado (`pnpm size`, después de
// `pnpm build`). Mide out/ comprimido con Brotli, como lo descargan los
// navegadores. El CI falla si se pasa, para que un aumento de peso sea una
// decisión y no un accidente: si está justificado, se sube el límite en el
// mismo PR y se explica allí.
//
// Referencia del 2026-10-06: 478 kB en total. El chunk de @cantoo/pdf-lib
// (~209 kB) solo lo cargan Unir PDF y Dividir PDF; el resto de las páginas
// descarga ~155 kB.
const budgets = [
  {
    name: "JavaScript del sitio (todas las páginas)",
    path: "out/_next/static/**/*.js",
    limit: "500 kB",
  },
];

export default budgets;
