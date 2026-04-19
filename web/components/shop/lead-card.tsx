"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Clock3, MessageCircle, Search } from "lucide-react";
import type { LeadSummary } from "@/lib/api-types";
import { localeFromPath, withLocalePath } from "@/lib/i18n/config";
import { getStaffClientDictionary } from "@/lib/i18n/staff";

export function LeadCard({ lead }: Readonly<{ lead: LeadSummary }>) {
  const isNew = lead.status === "new";
  const pathname = usePathname();
  const locale = pathname ? localeFromPath(pathname) : null;
  const href = locale ? withLocalePath(locale, `/portal/leads/${lead.id}`) : `/portal/leads/${lead.id}`;
  const t = getStaffClientDictionary(locale);

  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-black/[0.04] transition-all hover:shadow-md active:scale-[0.99]"
    >
      {/* Source icon */}
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          lead.source === "line_oa" ? "bg-emerald-50 text-emerald-500" : "bg-primary/5 text-primary"
        }`}
      >
        {lead.source === "line_oa" ? (
          <MessageCircle className="h-5 w-5" />
        ) : (
          <Search className="h-5 w-5" />
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-[15px] font-bold text-on-surface">
            {t.common.customerPrefix}
            {lead.userName}
          </span>
          {isNew && (
            <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-600">
              NEW
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-on-surface-variant/50">
          {lead.serviceType} • {lead.units} {t.common.units}
        </p>
        <div className="mt-1 flex items-center gap-1 text-[11px] text-on-surface-variant/30">
          <Clock3 className="h-3 w-3" />
          {lead.time}
        </div>
      </div>

      <ChevronRight className="h-4 w-4 shrink-0 text-on-surface-variant/20 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
