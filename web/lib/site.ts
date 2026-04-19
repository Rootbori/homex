import { defaultLocale, locales, withLocalePath, type Locale } from "@/lib/i18n/config";

export const siteConfig = {
  name: "Homex",
  title: "Homex - หาช่างแอร์และร้านแอร์ในประเทศไทย",
  shortDescription: "ค้นหาช่างแอร์ ดูโปรไฟล์ร้าน เปรียบเทียบบริการ และนัดหมายงานแอร์ผ่านเว็บที่ใช้ง่ายบนมือถือ",
  description:
    "Homex ช่วยให้ลูกค้าในประเทศไทยค้นหาช่างแอร์และร้านแอร์ที่ตั้งค่าโปรไฟล์จริง ดูบริการ พื้นที่ให้บริการ ราคาเริ่มต้น และติดตามงานได้ในที่เดียว",
  domain: "localhost:7771",
  locale: "th_TH",
  keywords: [
    "ช่างแอร์",
    "ร้านแอร์",
    "ล้างแอร์",
    "ซ่อมแอร์",
    "ติดตั้งแอร์",
    "ช่างแอร์ใกล้ฉัน",
    "หาช่างแอร์",
    "CRM ร้านช่างแอร์",
    "นัดช่างแอร์",
  ],
};

export function getSiteUrl() {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.SITE_URL ??
    process.env.AUTH_URL ??
    "http://localhost:7771";

  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

export function absoluteUrl(path = "/") {
  if (!path.startsWith("/")) {
    return `${getSiteUrl()}/${path}`;
  }
  return `${getSiteUrl()}${path}`;
}

export function localizedPath(locale: Locale, path = "/") {
  return withLocalePath(locale, path);
}

export function localizedAbsoluteUrl(locale: Locale, path = "/") {
  return absoluteUrl(localizedPath(locale, path));
}

export function languageAlternates(path = "/") {
  return Object.fromEntries(
    locales.map((locale) => [locale, withLocalePath(locale, path)]),
  ) as Record<Locale, string>;
}

export function defaultCanonical(path = "/") {
  return withLocalePath(defaultLocale, path);
}

export function provinceSlug(nameEn?: string, nameTh?: string) {
  const source = (nameEn && nameEn.trim()) || (nameTh && nameTh.trim()) || "";
  return source
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
