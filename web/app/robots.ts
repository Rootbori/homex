import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/search", "/technicians/"],
        disallow: ["/portal/", "/login", "/onboarding/", "/auth/", "/api/"],
      },
      {
        userAgent: "GPTBot",
        allow: ["/", "/search", "/technicians/"],
        disallow: ["/portal/", "/login", "/onboarding/", "/auth/", "/api/"],
      },
      {
        userAgent: "Google-Extended",
        allow: ["/", "/search", "/technicians/"],
        disallow: ["/portal/", "/login", "/onboarding/", "/auth/", "/api/"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
