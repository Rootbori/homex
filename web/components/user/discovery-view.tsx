"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { TechnicianCard } from "@/components/user/technician-card";
import { Logo } from "@/components/ui/logo";
import type { TechnicianSummary } from "@/lib/api-types";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function DiscoveryView({
  compact = false,
  technicians,
  query: initialQuery = "",
}: Readonly<{
  compact?: boolean;
  technicians: TechnicianSummary[];
  query?: string;
}>) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  const handleSearch = (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-black/[0.04] bg-white/80 px-4 pb-3 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
        <div className="flex items-center gap-3 pt-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
            <Logo className="h-5 w-5 text-white" />
          </div>
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant/30" />
            <input
              className="h-10 w-full rounded-xl bg-white ring-1 ring-slate-200/60 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-on-surface-variant/30 focus:bg-white focus:ring-primary/20"
              placeholder="ค้นหาช่างแอร์ หรือพื้นที่..."
              value={query}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
            />
          </form>
        </div>
      </div>

      <main className="px-4 py-6">
        {/* Hero — only on home, not search */}
        {!initialQuery && !compact && (
          <section className="mb-8">
            <h1 className="headline-font text-[1.75rem] font-extrabold leading-tight tracking-tight text-on-surface">
              บริการช่างแอร์
              <br />
              <span className="text-primary">มืออาชีพใกล้คุณ</span>
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant/60">
              จองง่าย ได้ช่างไว ราคาตรงไปตรงมา
            </p>
          </section>
        )}

        {/* Quick filters */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {["ทั้งหมด", "ล้างแอร์", "ซ่อมแอร์", "ติดตั้ง", "เติมน้ำยา"].map((label, i) => (
            <button
              key={label}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                i === 0
                  ? "bg-on-surface text-white"
                  : "bg-white ring-1 ring-slate-200/60 text-on-surface-variant/60 hover:bg-slate-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Results label */}
        {initialQuery && (
          <p className="mb-4 text-xs font-medium text-on-surface-variant/40">
            ผลลัพธ์สำหรับ &quot;{initialQuery}&quot; — {technicians.length} คน
          </p>
        )}

        {/* Technician list */}
        <div className="space-y-3">
          {technicians.length > 0 ? (
            technicians.map((technician) => (
              <TechnicianCard key={technician.id} technician={technician} />
            ))
          ) : (
            <div className="flex flex-col items-center py-20 text-center">
              <Search className="mb-4 h-10 w-10 text-on-surface-variant/15" />
              <p className="text-base font-bold text-on-surface">ไม่พบช่าง</p>
              <p className="mt-1 text-sm text-on-surface-variant/50">
                ลองค้นหาด้วยคำอื่น หรือดูช่างทั้งหมด
              </p>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="mt-8 grid gap-2">
          <Link
            href="/request"
            className="flex h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:brightness-110 active:scale-[0.98]"
          >
            สร้างคำขอรับบริการ
          </Link>
        </div>
      </main>
    </div>
  );
}
