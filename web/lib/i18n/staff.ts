import en from "@/messages/staff/en.json";
import th from "@/messages/staff/th.json";
import { normalizeLocale, type Locale } from "@/lib/i18n/config";
import { formatLocalizedText } from "@/lib/i18n/messages";

const staffDictionaries = {
  th,
  en,
} as const;

export function getStaffDictionary(locale?: string | null) {
  const normalizedLocale = normalizeLocale(locale);
  return staffDictionaries[normalizedLocale];
}

export function getStaffClientDictionary(locale?: string | null) {
  const normalizedLocale = normalizeLocale(locale) as Locale;
  return staffDictionaries[normalizedLocale];
}

export function getStaffDictionaryByLocale(locale?: string | null) {
  const normalizedLocale = normalizeLocale(locale);
  return staffDictionaries[normalizedLocale];
}

export function formatStaffText(template: string, values: Record<string, string | number>) {
  return formatLocalizedText(template, values);
}
