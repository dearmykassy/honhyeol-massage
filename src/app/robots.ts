import type { MetadataRoute } from "next";
import { SITE_ORIGIN } from "@/lib/metadata";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", disallow: "/" },
    sitemap: new URL("/sitemap.xml", SITE_ORIGIN).href,
  };
}
