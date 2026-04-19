import type { MetadataRoute } from "next";
import { absoluteUrl, siteConfig } from "@/lib/site";
import { defaultLocale } from "@/lib/i18n/config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.title,
    short_name: siteConfig.name,
    description: siteConfig.shortDescription,
    start_url: `/${defaultLocale}`,
    display: "standalone",
    background_color: "#eef5ff",
    theme_color: "#1d6fe9",
    lang: defaultLocale,
    scope: "/",
    categories: ["business", "utilities"],
    id: absoluteUrl("/"),
  };
}
