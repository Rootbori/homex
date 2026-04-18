import type { MetadataRoute } from "next";
import { getApiBaseUrl } from "@/lib/server-api";
import { absoluteUrl } from "@/lib/site";

type PublicTechniciansPayload = {
  items?: Array<{
    slug?: string;
  }>;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseEntries: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: absoluteUrl("/search"),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

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
        return [
          {
            url: absoluteUrl(`/technicians/${item.slug}`),
            changeFrequency: "daily" as const,
            priority: 0.8,
          },
        ];
      }) ?? [];

    return [...baseEntries, ...technicianEntries];
  } catch {
    return baseEntries;
  }
}
