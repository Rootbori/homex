"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronDown } from "lucide-react";
import { localeCookieName, locales, normalizeLocale, stripLocaleFromPath, withLocalePath, type Locale } from "@/lib/i18n/config";
import type { PublicMessages } from "@/lib/i18n/messages";

type LanguageSwitcherProps = {
  locale: Locale;
  messages: PublicMessages;
};

export function LanguageSwitcher({ locale, messages }: Readonly<LanguageSwitcherProps>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function changeLocale(nextLocale: Locale) {
    if (nextLocale === locale) {
      setOpen(false);
      return;
    }

    document.cookie = `${localeCookieName}=${nextLocale}; path=/; max-age=31536000; samesite=lax`;

    const basePath = pathname ? stripLocaleFromPath(pathname) : "/";
    const nextPath = withLocalePath(normalizeLocale(nextLocale), basePath);
    const query = searchParams?.toString();
    setOpen(false);
    router.push(query ? `${nextPath}?${query}` : nextPath);
  }

  return (
    <div ref={rootRef} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={messages.languageLabel}
        aria-expanded={open}
        className="inline-flex h-7 min-w-[3.35rem] items-center justify-center gap-1 rounded-lg border border-black/[0.06] bg-white/96 px-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-on-surface shadow-[0_4px_12px_-10px_rgba(15,23,42,0.35)] transition-colors hover:bg-surface-container-low"
      >
        <span>{locale.toUpperCase()}</span>
        <ChevronDown className="h-3 w-3" />
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+0.35rem)] z-[80] min-w-[5.5rem] overflow-hidden rounded-xl border border-black/[0.06] bg-white py-1 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.35)]">
          {locales.map((item) => {
            const active = item === locale;
            return (
              <button
                key={item}
                type="button"
                onClick={() => changeLocale(item)}
                className={`flex w-full items-center justify-between px-3 py-2 text-left text-[11px] font-medium transition-colors ${
                  active
                    ? "bg-surface-container-low text-on-surface"
                    : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                }`}
              >
                <span>{messages.languageNames[item]}</span>
                {active ? <Check className="h-3.5 w-3.5 text-primary" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
