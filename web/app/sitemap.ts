import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n/config";
import { getApiBaseUrl } from "@/lib/server-api";
import { localizedAbsoluteUrl } from "@/lib/site";

type PublicTechniciansPayload = {
  items?: Array<{
    slug?: string;
  }>;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseEntries: MetadataRoute.Sitemap = locales.flatMap((locale) => [
    {
      url: localizedAbsoluteUrl(locale, "/"),
      changeFrequency: "daily" as const,
      priority: locale === "th" ? 1 : 0.9,
    },
    {
      url: localizedAbsoluteUrl(locale, "/search"),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
  ]);

  try {
    const response = await fetch(`${getApiBaseUrl()}/v1/public/technicians`, {
      cache: "no-store",
    });
    if (!response.ok) {
      return baseEntries;
    }

    const payload = (await response.json()) as PublicTechniciansPayload;
    const technicianEntries =
      payload.items?.flatMap((item) => {
        if (!item.slug) {
          return [];
        }
        return locales.map((locale) => ({
          url: localizedAbsoluteUrl(locale, `/technicians/${item.slug}`),
          changeFrequency: "daily" as const,
          priority: locale === "th" ? 0.8 : 0.7,
        }));
      }) ?? [];

    return [...baseEntries, ...technicianEntries];
  } catch {
    return baseEntries;
  }
}
