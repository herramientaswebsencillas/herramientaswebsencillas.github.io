import { serializeJsonLd } from "@/lib/jsonLd";

/* Datos estructurados (schema.org) para buscadores y agentes de IA. El
   contenido sale siempre del catálogo y de lib/toolGuides.ts, nunca de lo que
   escribe el usuario. serializeJsonLd escapa "<" para que ningún texto pueda
   cerrar la etiqueta <script>.

   No ejecuta código: el navegador no corre los <script> de tipo
   application/ld+json, y scripts/csp-hashes.mjs les calcula su hash igual que
   a los demás, así que la CSP no se queja. */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
