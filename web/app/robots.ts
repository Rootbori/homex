import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n/config";
import { absoluteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const allow = [
    "/",
    ...locales.flatMap((locale) => [`/${locale}`, `/${locale}/search`, `/${locale}/technicians/`]),
  ];
  const disallow = [
    "/portal/",
    "/login",
    "/onboarding/",
    "/auth/",
    "/api/",
    ...locales.flatMap((locale) => [
      `/${locale}/portal/`,
      `/${locale}/login`,
      `/${locale}/onboarding/`,
      `/${locale}/auth/`,
    ]),
  ];

  return {
    rules: [
      {
        userAgent: "*",
        allow,
        disallow,
      },
      {
        userAgent: "GPTBot",
        allow,
        disallow,
      },
      {
        userAgent: "Google-Extended",
        allow,
        disallow,
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
