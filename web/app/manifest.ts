import type { MetadataRoute } from "next";
import { absoluteUrl, siteConfig } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.title,
    short_name: siteConfig.name,
    description: siteConfig.shortDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#eef5ff",
    theme_color: "#1d6fe9",
    lang: "th",
    scope: "/",
    categories: ["business", "utilities"],
    id: absoluteUrl("/"),
  };
}
