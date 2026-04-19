import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DiscoveryView } from "@/components/user/discovery-view";
import { getMessages, getPublicDictionary } from "@/lib/i18n/messages";
import { homeSeoContent } from "@/lib/i18n/public-copy";
import { isLocale } from "@/lib/i18n/config";
import { extractProvinceLinks } from "@/lib/public-discovery";
import { getPublicTechnicians, getThaiProvinces } from "@/lib/server-data";
import { languageAlternates, localizedAbsoluteUrl, siteConfig } from "@/lib/site";

export async function generateMetadata({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return {};
  }

  const dictionary = getPublicDictionary(locale);

  return {
    title: dictionary.seo.home.pageTitle,
    description: dictionary.seo.home.pageDescription,
    alternates: {
      canonical: `/${locale}`,
      languages: languageAlternates("/"),
    },
  };
}

export default async function LocalizedHomePage({
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
  const provinceLinks = extractProvinceLinks(allTechnicians, provinces, locale);
  const seo = homeSeoContent(locale);

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: dictionary.seo.home.itemListName,
    url: localizedAbsoluteUrl(locale, "/"),
    numberOfItems: technicians.length,
    itemListElement: technicians.slice(0, 20).map((technician, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: localizedAbsoluteUrl(locale, `/technicians/${technician.slug}`),
      name: technician.shopName,
    })),
  };
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: dictionary.seo.home.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: localizedAbsoluteUrl(locale, "/"),
    description: dictionary.seo.home.pageDescription,
    inLanguage: locale,
    potentialAction: {
      "@type": "SearchAction",
      target: `${localizedAbsoluteUrl(locale, "/search")}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
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
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <DiscoveryView
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
