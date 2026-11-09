import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { ACCENTS, CATEGORIES } from "@/lib/tools";

const TOOLS = CATEGORIES.flatMap((category) => category.tools);

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-6xl mx-auto px-4 py-16 space-y-14">
        <header className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 mb-3">
            {SITE_NAME}
          </h1>
          <p className="text-base md:text-lg text-slate-600">
            {TOOLS.length} herramientas gratuitas para calcular, convertir, codificar y generar
            datos, sin registro. Casi todas funcionan por completo en tu navegador, y las que
            consultan un servicio externo lo indican.
          </p>
        </header>

        <section aria-label="Herramientas por categoría">
          {/* Columnas CSS en lugar de una rejilla de filas: el navegador
              reparte las categorías para igualar la altura de las dos
              columnas, así que una categoría larga como Convertidores deja de
              dejar un hueco al lado. Se reequilibra solo al añadir más. */}
          <div className="columns-1 md:columns-2 gap-x-8">
            {CATEGORIES.map((category) => {
              const accent = ACCENTS[category.accent];

              return (
                /* break-inside-avoid impide que una categoría se parta por la
                   mitad entre una columna y la siguiente. */
                <div key={category.name} className="break-inside-avoid mb-12">
                  <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-5 flex items-center gap-3">
                    <span className={`w-8 h-[2px] ${accent.rule}`}></span>
                    {category.name}
                  </h2>

                  {/* auto-rows-fr iguala la altura de todas las tarjetas de la
                      categoría, sin importar lo larga que sea su descripción. */}
                  <div className="grid gap-4 auto-rows-fr">
                    {category.tools.map((tool) => (
                      <Link
                        key={tool.slug}
                        href={`/tools/${tool.slug}`}
                        className={`block bg-surface p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all group ${accent.card}`}
                      >
                        <h3
                          className={`text-lg font-bold text-slate-900 mb-1 transition-colors ${accent.title}`}
                        >
                          {tool.name}
                        </h3>
                        {/* Reservar dos líneas iguala las tarjetas entre
                            categorías, no solo dentro de cada una. */}
                        <p className="text-slate-500 text-sm leading-relaxed min-h-[2lh]">
                          {tool.description}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebSite",
              name: SITE_NAME,
              url: SITE_URL,
              description: SITE_DESCRIPTION,
              inLanguage: "es",
            },
            {
              "@type": "ItemList",
              name: `Herramientas de ${SITE_NAME}`,
              itemListElement: TOOLS.map((tool, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: tool.name,
                url: `${SITE_URL}/tools/${tool.slug}`,
              })),
            },
          ],
        }}
      />
    </main>
  );
}
