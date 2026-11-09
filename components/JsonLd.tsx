/* Datos estructurados (schema.org) para buscadores y agentes de IA. El
   contenido sale siempre del catálogo y de lib/toolGuides.ts, nunca de lo que
   escribe el usuario. Se escapa "<" para que ningún texto pueda cerrar la
   etiqueta <script>, como recomienda la documentación de Next.js.

   No ejecuta código: el navegador no corre los <script> de tipo
   application/ld+json, y scripts/csp-hashes.mjs les calcula su hash igual que
   a los demás, así que la CSP no se queja. */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\u003c") }}
    />
  );
}
