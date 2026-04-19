import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppShell } from "@/components/ui/app-shell";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { getMessages } from "@/lib/i18n/messages";
import { isLocale } from "@/lib/i18n/config";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default async function PortalLayout({
  children,
  params,
}: Readonly<{
  children: ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const normalizedLocale = isLocale(locale) ? locale : "th";
  const messages = getMessages(normalizedLocale);

  return (
    <AppShell mode="staff">
      <div className="pointer-events-none fixed right-4 top-3 z-[70]">
        <div className="pointer-events-auto">
          <LanguageSwitcher locale={normalizedLocale} messages={messages} />
        </div>
      </div>
      {children}
    </AppShell>
  );
}
