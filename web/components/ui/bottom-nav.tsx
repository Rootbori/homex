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
import { cn } from "@/lib/utils";

type NavMode = "user" | "staff";

const itemsByMode = {
  user: [
    { href: "/", label: "หน้าแรก", icon: Home },
    { href: "/search", label: "ค้นหา", icon: Search },
    { href: "/my-requests", label: "งานของฉัน", icon: ClipboardList },
    { href: "/profile", label: "โปรไฟล์", icon: User },
  ],
  staff: [
    { href: "/portal/dashboard", label: "แดชบอร์ด", icon: LayoutGrid },
    { href: "/portal/leads", label: "Leads", icon: ClipboardList },
    { href: "/portal/jobs", label: "Jobs", icon: Wrench },
    { href: "/portal/schedule", label: "ตาราง", icon: CalendarDays },
    { href: "/portal/more", label: "เพิ่มเติม", icon: MoreHorizontal },
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

export function BottomNav({ mode }: Readonly<{ mode: NavMode }>) {
  const pathname = usePathname();
  const items = itemsByMode[mode];

  if (hiddenPatterns.some((pattern) => pattern.test(pathname))) {
    return null;
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-black/[0.04] bg-white/80 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-lg items-stretch">
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
