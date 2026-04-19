"use client";

import { useEffect } from "react";
import { localeCookieName, type Locale } from "@/lib/i18n/config";

export function LocaleCookieSync({ locale }: Readonly<{ locale: Locale }>) {
  useEffect(() => {
    document.cookie = `${localeCookieName}=${locale}; path=/; max-age=31536000; samesite=lax`;
  }, [locale]);

  return null;
}
