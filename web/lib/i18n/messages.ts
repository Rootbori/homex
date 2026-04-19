import en from "@/messages/public/en.json";
import th from "@/messages/public/th.json";
import type { Locale } from "@/lib/i18n/config";

export const publicDictionaries = {
  th,
  en,
} as const;

export type PublicDictionary = (typeof publicDictionaries)[Locale];

function interpolate(template: string, variables: Record<string, string | number>) {
  return Object.entries(variables).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

export type PublicMessages = PublicDictionary;

export function getPublicDictionary(locale: Locale): PublicDictionary {
  return publicDictionaries[locale];
}

export function getMessages(locale: Locale): PublicMessages {
  return getPublicDictionary(locale);
}

export function formatLocalizedText(template: string, variables: Record<string, string | number>) {
  return interpolate(template, variables);
}
