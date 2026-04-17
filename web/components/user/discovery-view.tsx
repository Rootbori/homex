"use client";

import Link from "next/link";
import { Menu, MapPin, Search, Zap } from "lucide-react";
import { TechnicianCard } from "@/components/user/technician-card";
import { ProfileBubble } from "@/components/shared/profile-bubble";
import { TopAppBar } from "@/components/shared/top-app-bar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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

  const handleSearch = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="animate-in">
      <TopAppBar
        title="Atmospheric"
        left={
          <button className="interactive-scale rounded-full p-2 text-primary">
            <Menu className="h-5 w-5" />
          </button>
        }
        right={<ProfileBubble image={technicians[0]?.image} />}
      />
      <main className="page-content page-stack">
        {!initialQuery && (
          <section className="page-hero">
            <Badge className="w-fit mb-2" variant="default">
              #1 Air Service Platform
            </Badge>
            <h1 className="headline-font text-5xl font-extrabold leading-[1.1] tracking-tighter text-on-surface">
              ดูแลแอร์ของคุณ
              <br />
              <span className="text-primary italic">ให้สมบูรณ์แบบ</span>
            </h1>
            <p className="max-w-xs text-lg font-medium leading-relaxed text-on-surface-variant/80">
              รวมช่างแอร์ฝีมือดีที่ผ่านการรับรอง พร้อมดูแลคุณถึงบ้าน
            </p>
          </section>
        )}

        <div
          className={`${compact ? "" : "sticky top-[4.5rem] z-40"} -mx-2 mb-2 rounded-[2rem] bg-surface/80 px-2 py-4 backdrop-blur-xl md:-mx-4 md:px-4`}
        >
          <form
            onSubmit={handleSearch}
            className="group relative transition-all duration-500 hover:shadow-lg rounded-2xl"
          >
            <Input
              className="h-14 rounded-2xl border-none bg-surface-container-lowest pl-14 pr-6 text-base shadow-sm ring-1 ring-black/5 focus:ring-2 focus:ring-primary/20"
              placeholder="ค้นหาช่างแอร์ หรือพื้นที่ให้บริการ..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant transition-colors group-focus-within:text-primary" />
          </form>
          <div className="no-scrollbar mt-4 flex gap-3 overflow-x-auto pb-1">
            <button className="interactive-scale flex items-center gap-2 whitespace-nowrap rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-on-primary atmospheric-glow">
              <MapPin className="h-4 w-4" /> พื้นที่ใกล้เคียง
            </button>
            <button className="interactive-scale whitespace-nowrap rounded-2xl bg-white px-6 py-3 text-sm font-bold text-on-surface-variant shadow-sm ring-1 ring-black/5">
              ล้างแอร์
            </button>
            <button className="interactive-scale whitespace-nowrap rounded-2xl bg-white px-6 py-3 text-sm font-bold text-on-surface-variant shadow-sm ring-1 ring-black/5">
              ซ่อมแอร์
            </button>
            <button className="interactive-scale flex items-center gap-2 whitespace-nowrap rounded-2xl bg-secondary-container px-6 py-3 text-sm font-bold text-on-secondary-container shadow-sm">
              <Zap className="h-4 w-4 fill-current" /> ว่างตอนนี้
            </button>
          </div>
        </div>

        <div className="card-stack mt-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="headline-font text-xl font-bold tracking-tight">
              ช่างแนะนำสำหรับคุณ
            </h3>
            <span className="text-sm font-bold text-primary cursor-pointer hover:underline">
              ดูทั้งหมด
            </span>
          </div>
          {technicians.length > 0 ? (
            technicians.map((technician) => (
              <TechnicianCard key={technician.id} technician={technician} />
            ))
          ) : (
            <div className="premium-card p-12 text-center">
              <div className="mb-4 flex justify-center text-on-surface-variant/20">
                <Search className="h-12 w-12" />
              </div>
              <p className="text-lg font-bold text-on-surface">
                ไม่พบช่างที่ตรงกับเงื่อนไข
              </p>
              <p className="text-sm text-on-surface-variant">
                ลองค้นหาด้วยคำอื่น หรือขยายพื้นที่ให้บริการ
              </p>
            </div>
          )}
        </div>

        {compact || initialQuery ? null : (
          <div className="premium-card relative flex h-72 flex-col justify-end overflow-hidden bg-primary p-8 md:p-10 text-on-primary">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary via-primary to-secondary opacity-90" />
            <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-white/10 blur-3xl animate-pulse" />
            <div className="relative z-10">
              <Badge
                variant="default"
                className="h-5 px-3 text-[10px] font-black uppercase tracking-widest shadow-none"
              >
                Promotion
              </Badge>
              <h2 className="headline-font mb-4 mt-6 text-4xl font-extrabold leading-none tracking-tight">
                ชวนเพื่อนใช้{" "}
                <span className="text-secondary-container">Homex</span>
                <br />
                รับส่วนลดทันที 100.-
              </h2>
              <button className="interactive-scale rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-primary shadow-xl">
                รับโค้ดส่วนลด
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mt-8">
          <Link
            href="/request"
            className="interactive-scale flex h-14 items-center justify-center rounded-2xl bg-primary text-sm font-bold text-on-primary atmospheric-glow"
          >
            สร้างคำขอรับบริการ
          </Link>
          <Link
            href="/login/user"
            className="interactive-scale flex h-14 items-center justify-center rounded-2xl bg-secondary text-sm font-bold text-on-primary shadow-lg"
          >
            เข้าสู่ระบบสมาชิก
          </Link>
        </div>
      </main>
    </div>
  );
}
