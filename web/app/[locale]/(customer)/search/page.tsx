import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DiscoveryView } from "@/components/user/discovery-view";
import { getMessages, getPublicDictionary } from "@/lib/i18n/messages";
import { searchSeoContent } from "@/lib/i18n/public-copy";
import { isLocale } from "@/lib/i18n/config";
import { extractProvinceLinks } from "@/lib/public-discovery";
import { getPublicTechnicians, getThaiProvinces } from "@/lib/server-data";
import { languageAlternates, localizedAbsoluteUrl } from "@/lib/site";

export async function generateMetadata({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    q?: string;
    service?: string;
    area?: string;
    availability?: string;
    max_price?: string;
  }>;
}>): Promise<Metadata> {
  const [{ locale }, { q = "", service = "", area = "", availability = "" }] = await Promise.all([
    params,
    searchParams,
  ]);

  if (!isLocale(locale)) {
    return {};
  }

  const dictionary = getPublicDictionary(locale);
  const focus = q || service || area;

  return {
    title: focus
      ? dictionary.seo.search.pageTitleWithFocus.replace("{focus}", focus)
      : dictionary.seo.search.pageTitle,
    description: focus
      ? dictionary.seo.search.pageDescriptionWithFocus.replace("{focus}", focus)
      : dictionary.seo.search.pageDescription,
    alternates: {
      canonical: `/${locale}/search`,
      languages: languageAlternates("/search"),
    },
    keywords: [q, service, area, availability].filter(Boolean),
  };
}

export default async function LocalizedSearchPage({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    q?: string;
    service?: string;
    area?: string;
    availability?: string;
    max_price?: string;
  }>;
}>) {
  const [{ locale }, { q = "", service = "", area = "", availability = "", max_price = "" }] =
    await Promise.all([params, searchParams]);

  if (!isLocale(locale)) {
    notFound();
  }

  const messages = getMessages(locale);
  const dictionary = getPublicDictionary(locale);
  const [technicians, allTechnicians, provinces] = await Promise.all([
    getPublicTechnicians({ q, service, area, availability, max_price }),
    getPublicTechnicians(),
    getThaiProvinces(),
  ]);

  const focus = q || service || area;
  const seo = searchSeoContent(locale, focus, technicians.length, service, area, availability);
  const provinceLinks = extractProvinceLinks(allTechnicians, provinces, locale);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: dictionary.seo.common.homeLabel,
        item: localizedAbsoluteUrl(locale, "/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: dictionary.seo.common.searchLabel,
        item: localizedAbsoluteUrl(locale, "/search"),
      },
    ],
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: dictionary.seo.search.itemListName,
    url: localizedAbsoluteUrl(locale, "/search"),
    numberOfItems: technicians.length,
    itemListElement: technicians.slice(0, 20).map((technician, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: localizedAbsoluteUrl(locale, `/technicians/${technician.slug}`),
      name: technician.shopName,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <DiscoveryView
        compact
        locale={locale}
        messages={messages}
        technicians={technicians}
        allTechnicians={allTechnicians}
        query={q}
        service={service}
        area={area}
        availability={availability}
        maxPrice={max_price}
        seoContent={{
          ...seo,
          links: provinceLinks,
        }}
      />
    </>
  );
}
