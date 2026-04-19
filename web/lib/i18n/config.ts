export const locales = ["th", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "th";
export const localeCookieName = "homex_locale";

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function normalizeLocale(value?: string | null): Locale {
  if (value && isLocale(value)) {
    return value;
  }
  return defaultLocale;
}

export function isThaiLocale(locale: string | null | undefined) {
  return normalizeLocale(locale) === "th";
}

export function isDefaultEnglishContentLocale(locale: string | null | undefined) {
  return !isThaiLocale(locale);
}

export function stripLocaleFromPath(pathname: string) {
  const parts = pathname.split("/");
  const maybeLocale = parts[1];
  if (maybeLocale && isLocale(maybeLocale)) {
    const nextPath = `/${parts.slice(2).join("/")}`.replace(/\/+/g, "/");
    return nextPath === "/" ? "/" : nextPath.replace(/\/$/, "") || "/";
  }
  return pathname || "/";
}

export function localeFromPath(pathname: string): Locale | null {
  const maybeLocale = pathname.split("/")[1];
  return maybeLocale && isLocale(maybeLocale) ? maybeLocale : null;
}

export function withLocalePath(locale: Locale, pathname: string) {
  const normalized = stripLocaleFromPath(pathname);
  if (normalized === "/") {
    return `/${locale}`;
  }
  return `/${locale}${normalized}`;
}
