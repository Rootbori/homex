"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Home,
  LayoutGrid,
  MoreHorizontal,
  Search,
  User,
  Wrench,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavMode = "customer" | "staff";

const itemsByMode = {
  customer: [
    { href: "/", label: "หน้าแรก", icon: Home },
    { href: "/search", label: "ค้นหา", icon: Search },
    { href: "/my-requests", label: "งานของฉัน", icon: ClipboardList },
    { href: "/profile", label: "โปรไฟล์", icon: User },
  ],
  staff: [
    { href: "/portal/dashboard", label: "แดชบอร์ด", icon: LayoutGrid },
    { href: "/portal/leads", label: "Leads", icon: ClipboardList },
    { href: "/portal/jobs", label: "Jobs", icon: Wrench },
    { href: "/portal/schedule", label: "Schedule", icon: CalendarDays },
    { href: "/portal/more", label: "More", icon: MoreHorizontal },
  ],
} satisfies Record<
  NavMode,
  Array<{ href: string; label: string; icon: ComponentType<{ className?: string }> }>
>;

const hiddenPatterns = [
  /^\/request$/,
  /^\/portal\/quotation$/,
  /^\/portal\/jobs\/[^/]+$/,
  /^\/portal\/leads\/[^/]+$/,
];

export function BottomNav({ mode }: { mode: NavMode }) {
  const pathname = usePathname();
  const items = itemsByMode[mode];

  if (hiddenPatterns.some((pattern) => pattern.test(pathname))) {
    return null;
  }

  return (
    <nav className="glass-bar fixed inset-x-0 bottom-0 z-40 rounded-t-3xl px-4 pb-6 pt-3 shadow-[0_-8px_32px_rgba(0,0,0,0.04)]">
      <div className="mx-auto flex max-w-md items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant transition-all duration-300",
                active && "scale-95 bg-secondary-container text-on-secondary-container",
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
