import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { CATEGORIES } from "@/lib/tools";

// output: "export" exige declararlo: se genera una sola vez, en el build.
export const dynamic = "force-static";

/* Se genera desde el catálogo, como la página de inicio y las pruebas de
   humo: una herramienta nueva aparece aquí sin tocar este archivo. Sin
   lastModified, porque la fecha del build no dice cuándo cambió cada página. */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    ...CATEGORIES.flatMap((category) => category.tools.map((tool) => `/tools/${tool.slug}`)),
    "/about",
    "/privacy",
    "/terms",
  ];
  return paths.map((path) => ({ url: `${SITE_URL}${path}` }));
}
