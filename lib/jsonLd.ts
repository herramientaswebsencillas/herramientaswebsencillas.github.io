/* Convierte datos estructurados (schema.org) en el texto de un
   <script type="application/ld+json">. Se escapa "<" como la secuencia JSON
   < para que ningún texto pueda cerrar la etiqueta <script>, como
   recomienda la documentación de Next.js. El resultado sigue siendo JSON
   válido y equivale a los mismos datos.

   Ojo: en el reemplazo hace falta "\\u003c". Escrito "<", JavaScript lo
   convierte en "<" y el reemplazo no cambia nada. */
export function serializeJsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
