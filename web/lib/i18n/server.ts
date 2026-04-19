import { cookies, headers } from "next/headers";
import {
  isLocale,
  localeCookieName,
  localeFromPath,
  normalizeLocale,
  type Locale,
  withLocalePath,
} from "@/lib/i18n/config";

export async function getPreferredLocale() {
  const cookieStore = await cookies();
  return normalizeLocale(cookieStore.get(localeCookieName)?.value);
}

export async function withPreferredLocale(pathname: string) {
  const locale = await getPreferredLocale();
  return withLocalePath(locale, pathname);
}

export async function resolveServerLocale(options?: {
  formData?: FormData | null;
  redirectPath?: string | null;
  referer?: string | null;
}): Promise<Locale> {
  const explicitLocale = options?.formData?.get("locale");
  if (typeof explicitLocale === "string" && isLocale(explicitLocale)) {
    return explicitLocale;
  }

  if (options?.redirectPath) {
    const localeFromRedirect = localeFromPath(options.redirectPath);
    if (localeFromRedirect) {
      return localeFromRedirect;
    }
  }

  const referer = options?.referer ?? (await headers()).get("referer");
  if (referer) {
    try {
      const localeFromReferer = localeFromPath(new URL(referer).pathname);
      if (localeFromReferer) {
        return localeFromReferer;
      }
    } catch {
      // Ignore malformed referer and fall back to the cookie preference.
    }
  }

  return getPreferredLocale();
}
