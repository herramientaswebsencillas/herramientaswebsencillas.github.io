import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// output: "export" exige declararlo: se genera una sola vez, en el build.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
