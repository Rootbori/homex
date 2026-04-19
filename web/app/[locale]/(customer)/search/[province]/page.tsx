import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DiscoveryView } from "@/components/user/discovery-view";
import { isDefaultEnglishContentLocale, isLocale } from "@/lib/i18n/config";
import { getMessages, getPublicDictionary } from "@/lib/i18n/messages";
import { provinceSeoContent } from "@/lib/i18n/public-copy";
import { extractProvinceLinks } from "@/lib/public-discovery";
import { getPublicTechnicians, getThaiProvinces } from "@/lib/server-data";
import { absoluteUrl, languageAlternates, localizedAbsoluteUrl, provinceSlug } from "@/lib/site";

async function resolveProvince(locale: string, slug: string) {
  const provinces = await getThaiProvinces();
  const province = provinces.find((item) => provinceSlug(item.nameEn, item.nameTh) === slug);

  if (!province) {
    return null;
  }

  return {
    label: isDefaultEnglishContentLocale(locale) ? province.nameEn ?? province.nameTh : province.nameTh,
    provinces,
  };
}

export async function generateMetadata({
  params,
}: Readonly<{
  params: Promise<{ locale: string; province: string }>;
}>): Promise<Metadata> {
  const { locale, province } = await params;
  if (!isLocale(locale)) {
    return {};
  }

  const resolved = await resolveProvince(locale, province);
  if (!resolved) {
    return {
      title: isDefaultEnglishContentLocale(locale) ? "Province not found" : "ไม่พบจังหวัด",
    };
  }

  const dictionary = getPublicDictionary(locale);

  return {
    title: dictionary.seo.province.pageTitle.replace("{province}", resolved.label),
    description: dictionary.seo.province.pageDescription.replace("{province}", resolved.label),
    alternates: {
      canonical: `/${locale}/search/${province}`,
      languages: languageAlternates(`/search/${province}`),
    },
  };
}

export default async function LocalizedProvinceSearchPage({
  params,
}: Readonly<{
  params: Promise<{ locale: string; province: string }>;
}>) {
  const { locale, province } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const resolved = await resolveProvince(locale, province);
  if (!resolved) {
    notFound();
  }

  const messages = getMessages(locale);
  const allTechnicians = await getPublicTechnicians();
  const technicians = allTechnicians.filter((technician) =>
    technician.area.some((item) => item.includes(resolved.label) || item.includes(resolved.provinces.find((p) => provinceSlug(p.nameEn, p.nameTh) === province)?.nameTh ?? "")),
  );
  const seo = provinceSeoContent(locale, resolved.label, technicians.length);
  const provinceLinks = extractProvinceLinks(allTechnicians, resolved.provinces, locale);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: getPublicDictionary(locale).seo.common.homeLabel,
        item: localizedAbsoluteUrl(locale, "/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: getPublicDictionary(locale).seo.common.searchLabel,
        item: localizedAbsoluteUrl(locale, "/search"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: resolved.label,
        item: absoluteUrl(`/${locale}/search/${province}`),
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <DiscoveryView
        compact
        locale={locale}
        messages={messages}
        technicians={technicians}
        allTechnicians={allTechnicians}
        area={resolved.label}
        seoContent={{
          ...seo,
          links: provinceLinks,
        }}
      />
    </>
  );
}
