import type { Locale } from "@/lib/i18n/config";
import { formatLocalizedText, getPublicDictionary } from "@/lib/i18n/messages";

export function priceOptionsForLocale(locale: Locale) {
  const labels = getPublicDictionary(locale).search.priceOptions;

  return [
    { value: "", label: labels.all },
    { value: "700", label: labels.upto700 },
    { value: "1000", label: labels.upto1000 },
    { value: "2000", label: labels.upto2000 },
    { value: "4000", label: labels.upto4000 },
  ];
}

export function homeSeoContent(locale: Locale) {
  const dictionary = getPublicDictionary(locale);
  return {
    title: dictionary.seo.home.seoTitle,
    description: dictionary.seo.home.seoDescription,
    highlights: dictionary.seo.home.highlights,
  };
}

export function searchSeoContent(
  locale: Locale,
  focusLabel: string,
  count: number,
  service: string,
  area: string,
  availability: string,
) {
  const dictionary = getPublicDictionary(locale);

  return {
    title: focusLabel
      ? formatLocalizedText(dictionary.seo.search.seoTitleWithFocus, { focus: focusLabel })
      : dictionary.seo.search.seoTitle,
    description: focusLabel
      ? formatLocalizedText(dictionary.seo.search.seoDescriptionWithFocus, { focus: focusLabel })
      : dictionary.seo.search.seoDescription,
    highlights: [
      formatLocalizedText(dictionary.seo.search.highlightMatches, { count }),
      service || dictionary.seo.search.highlightServiceFallback,
      area || dictionary.seo.search.highlightAreaFallback,
      availability === "available"
        ? dictionary.seo.search.highlightAvailabilityAvailable
        : availability === "busy"
          ? dictionary.seo.search.highlightAvailabilityBusy
          : dictionary.seo.search.highlightAvailabilityAll,
    ],
  };
}

export function provinceSeoContent(locale: Locale, provinceLabel: string, count: number) {
  const dictionary = getPublicDictionary(locale);

  return {
    title: formatLocalizedText(dictionary.seo.province.seoTitle, { province: provinceLabel }),
    description: formatLocalizedText(dictionary.seo.province.seoDescription, { province: provinceLabel }),
    highlights: [
      formatLocalizedText(dictionary.seo.province.highlightMatches, { count }),
      formatLocalizedText(dictionary.seo.province.highlightArea, { province: provinceLabel }),
      dictionary.seo.province.highlightSummary,
    ],
  };
}
