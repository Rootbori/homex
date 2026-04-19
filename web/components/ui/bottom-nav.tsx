"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ClipboardList,
  Home,
  LayoutGrid,
  MoreHorizontal,
  Search,
  User,
  Wrench,
} from "lucide-react";
import { getPublicDictionary } from "@/lib/i18n/messages";
import { localeFromPath, stripLocaleFromPath, withLocalePath } from "@/lib/i18n/config";
import { getStaffClientDictionary } from "@/lib/i18n/staff";
import { cn } from "@/lib/utils";

type NavMode = "user" | "staff";

const hiddenPatterns = [
  /^\/request$/,
  /^\/portal\/quotation$/,
  /^\/portal\/jobs\/[^/]+$/,
  /^\/portal\/leads\/[^/]+$/,
];

export function BottomNav({ mode }: Readonly<{ mode: NavMode }>) {
  const pathname = usePathname();
  const locale = pathname ? localeFromPath(pathname) : null;
  const normalizedPath = pathname ? stripLocaleFromPath(pathname) : "/";
  const publicDictionary = getPublicDictionary(locale ?? "th");
  const staffDictionary = getStaffClientDictionary(locale ?? "th");
  const itemsByMode = {
    user: [
      { href: "/", label: publicDictionary.seo.common.homeLabel, icon: Home },
      { href: "/search", label: staffDictionary.nav.search, icon: Search },
      { href: "/my-requests", label: staffDictionary.nav.myRequests, icon: ClipboardList },
      { href: "/profile", label: staffDictionary.nav.profile, icon: User },
    ],
    staff: [
      { href: "/portal/dashboard", label: staffDictionary.nav.dashboard, icon: LayoutGrid },
      { href: "/portal/leads", label: staffDictionary.nav.leads, icon: ClipboardList },
      { href: "/portal/jobs", label: staffDictionary.common.jobs, icon: Wrench },
      { href: "/portal/schedule", label: staffDictionary.nav.schedule, icon: CalendarDays },
      { href: "/portal/more", label: staffDictionary.nav.more, icon: MoreHorizontal },
    ],
  } satisfies Record<
    NavMode,
    Array<{ href: string; label: string; icon: ComponentType<{ className?: string }> }>
  >;
  const items = itemsByMode[mode];

  if (hiddenPatterns.some((pattern) => pattern.test(normalizedPath))) {
    return null;
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-black/[0.04] bg-white/80 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-lg items-stretch">
        {items.map((item) => {
          const Icon = item.icon;
          const href = locale ? withLocalePath(locale, item.href) : item.href;
          const active =
            normalizedPath === item.href ||
            (item.href !== "/" && normalizedPath.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors",
                active
                  ? "text-primary"
                  : "text-on-surface-variant/40 hover:text-on-surface-variant/70",
              )}
            >
              <Icon className={cn("h-5 w-5", active && "fill-current")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
