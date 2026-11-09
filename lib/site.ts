import type { Metadata } from "next";

/** Dirección pública del sitio: base de los metadatos, el sitemap y robots.txt. */
export const SITE_URL = "https://herramientaswebsencillas.github.io";

export const SITE_NAME = "Herramientas Web Sencillas";

export const SITE_DESCRIPTION =
  "Colección de herramientas web rápidas, gratuitas y fáciles de usar para mejorar tu productividad y resolver tareas comunes en segundos.";

/* Next.js combina los metadatos del layout y de cada página de forma
   superficial: si una página define openGraph, reemplaza entero el del
   layout. Por eso las páginas no lo escriben a mano, sino con pageMetadata,
   que conserva estos campos comunes. La imagen sale de
   app/opengraph-image.png, que Next.js añade sola a todas las páginas. */
const BASE_OPEN_GRAPH = {
  type: "website",
  locale: "es_MX",
  siteName: SITE_NAME,
} as const;

/**
 * Metadatos de una página con su URL canónica. Sin canonical, cada página
 * declaraba como suya la URL de inicio (og:url) y GitHub Pages sirve el mismo
 * contenido en /ruta y /ruta.html, así que los buscadores veían duplicados.
 * `path` es relativo a la raíz ("/" para el inicio); metadataBase, en
 * app/layout.tsx, lo completa con SITE_URL.
 */
export function pageMetadata({
  path,
  title,
  description,
}: {
  path: string;
  title?: string;
  description: string;
}): Metadata {
  return {
    ...(title && { title }),
    description,
    alternates: { canonical: path },
    // og:title y og:description los completa Next.js a partir de title y
    // description, con la plantilla " | Herramientas Web Sencillas".
    openGraph: { ...BASE_OPEN_GRAPH, url: path },
  };
}
