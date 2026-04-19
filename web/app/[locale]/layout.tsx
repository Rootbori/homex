import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { LocaleCookieSync } from "@/components/ui/locale-cookie-sync";
import { isLocale, locales } from "@/lib/i18n/config";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return (
    <>
      <LocaleCookieSync locale={locale} />
      {children}
    </>
  );
}
