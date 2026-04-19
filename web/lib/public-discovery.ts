import type { TechnicianSummary, ThaiProvince } from "@/lib/api-types";
import { isThaiLocale, withLocalePath, type Locale } from "@/lib/i18n/config";
import { provinceSlug } from "@/lib/site";

function provinceLabelForLocale(province: ThaiProvince, locale: Locale) {
  if (isThaiLocale(locale)) {
    return province.nameTh;
  }

  return province.nameEn ?? province.nameTh;
}

export function extractProvinceLinks(
  technicians: TechnicianSummary[],
  provinces: ThaiProvince[],
  locale: Locale,
) {
  const available = new Set<string>();

  for (const technician of technicians) {
    for (const area of technician.area) {
      const lastPart = area
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .pop();
      if (lastPart) {
        available.add(lastPart);
      }
    }
  }

  return provinces
    .filter((province) => available.has(province.nameTh))
    .slice(0, 8)
    .map((province) => ({
      href: withLocalePath(locale, `/search/${provinceSlug(province.nameEn, province.nameTh)}`),
      label: provinceLabelForLocale(province, locale),
    }));
}
