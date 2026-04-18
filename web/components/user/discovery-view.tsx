"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MapPin, Search, SlidersHorizontal } from "lucide-react";
import { TechnicianCard } from "@/components/user/technician-card";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/ui/logo";
import { SelectField } from "@/components/ui/select-field";
import type { TechnicianSummary } from "@/lib/api-types";

type DiscoveryViewProps = {
  compact?: boolean;
  technicians: TechnicianSummary[];
  allTechnicians: TechnicianSummary[];
  query?: string;
  service?: string;
  area?: string;
  availability?: string;
  maxPrice?: string;
};

const priceOptions = [
  { value: "", label: "ทุกช่วงราคา" },
  { value: "700", label: "ไม่เกิน 700 บาท" },
  { value: "1000", label: "ไม่เกิน 1,000 บาท" },
  { value: "2000", label: "ไม่เกิน 2,000 บาท" },
  { value: "4000", label: "ไม่เกิน 4,000 บาท" },
];

export function DiscoveryView({
  compact = false,
  technicians,
  allTechnicians,
  query: initialQuery = "",
  service: initialService = "",
  area: initialArea = "",
  availability: initialAvailability = "",
  maxPrice: initialMaxPrice = "",
}: Readonly<DiscoveryViewProps>) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(initialQuery);
  const [service, setService] = useState(initialService);
  const [area, setArea] = useState(initialArea);
  const [availability, setAvailability] = useState(initialAvailability);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);

  useEffect(() => setQuery(initialQuery), [initialQuery]);
  useEffect(() => setService(initialService), [initialService]);
  useEffect(() => setArea(initialArea), [initialArea]);
  useEffect(() => setAvailability(initialAvailability), [initialAvailability]);
  useEffect(() => setMaxPrice(initialMaxPrice), [initialMaxPrice]);

  const serviceOptions = useMemo(() => {
    const labels = new Set<string>();
    for (const technician of allTechnicians) {
      for (const item of technician.services) {
        if (item.trim()) labels.add(item.trim());
      }
    }
    return Array.from(labels).sort((a, b) => a.localeCompare(b, "th"));
  }, [allTechnicians]);

  const areaOptions = useMemo(() => {
    const labels = new Set<string>();
    for (const technician of allTechnicians) {
      for (const item of technician.area) {
        if (item.trim()) labels.add(item.trim());
      }
    }
    return Array.from(labels).sort((a, b) => a.localeCompare(b, "th"));
  }, [allTechnicians]);

  const activeFilterCount = [service, area, availability, maxPrice].filter(Boolean).length;

  function pushFilters(next?: Partial<{ query: string; service: string; area: string; availability: string; maxPrice: string }>) {
    const params = new URLSearchParams();
    const nextQuery = next?.query ?? query;
    const nextService = next?.service ?? service;
    const nextArea = next?.area ?? area;
    const nextAvailability = next?.availability ?? availability;
    const nextMaxPrice = next?.maxPrice ?? maxPrice;

    if (nextQuery.trim()) params.set("q", nextQuery.trim());
    if (nextService) params.set("service", nextService);
    if (nextArea) params.set("area", nextArea);
    if (nextAvailability) params.set("availability", nextAvailability);
    if (nextMaxPrice) params.set("max_price", nextMaxPrice);

    const targetPath = compact ? "/search" : pathname || "/";
    const href = params.toString() ? `${targetPath}?${params.toString()}` : targetPath;
    router.push(href);
  }

  function handleSearch(event: React.SyntheticEvent) {
    event.preventDefault();
    pushFilters({ query });
  }

  function clearFilters() {
    setService("");
    setArea("");
    setAvailability("");
    setMaxPrice("");
    const targetPath = compact ? "/search" : "/";
    if (query.trim()) {
      router.push(`${targetPath}?q=${encodeURIComponent(query.trim())}`);
      return;
    }
    router.push(targetPath);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="sticky top-0 z-50 border-b border-black/[0.04] bg-white/85 px-4 pb-3 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
        <div className="flex items-center gap-3 pt-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
            <Logo className="h-5 w-5 text-white" />
          </div>
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant/30" />
            <Input
              className="pl-10"
              placeholder="ค้นหาช่างแอร์ ร้าน หรือพื้นที่"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </form>
        </div>
      </div>

      <main className="space-y-6 px-4 py-6">
        {!initialQuery && !compact ? (
          <section className="rounded-[1.9rem] bg-[linear-gradient(135deg,rgba(255,255,255,1),rgba(239,246,255,0.95))] p-6 shadow-[0_24px_60px_-34px_rgba(30,64,175,0.35)] ring-1 ring-primary/10">
            <h1 className="headline-font text-[1.95rem] font-extrabold leading-tight tracking-tight text-on-surface">
              หาช่างแอร์ที่
              <br />
              <span className="text-primary">พร้อมรับงานจริง</span>
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-on-surface-variant">
              รายชื่อด้านล่างดึงจากร้านและช่างที่ตั้งค่าโปรไฟล์ไว้แล้วจริงในระบบ
              คุณสามารถกรองตามบริการ พื้นที่ ราคาเริ่มต้น และสถานะรับงานได้ทันที
            </p>
          </section>
        ) : null}

        <section className="rounded-[1.8rem] bg-white p-4 shadow-sm ring-1 ring-black/[0.04]">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <SlidersHorizontal className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-on-surface">ตัวกรองการค้นหา</p>
                <p className="text-xs text-on-surface-variant/50">
                  {activeFilterCount > 0 ? `กำลังใช้ ${activeFilterCount} ตัวกรอง` : "ยังไม่ได้กรองเพิ่มเติม"}
                </p>
              </div>
            </div>
            {activeFilterCount > 0 ? (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-semibold text-primary"
              >
                ล้างตัวกรอง
              </button>
            ) : null}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            <button
              type="button"
              onClick={() => {
                setService("");
                pushFilters({ service: "" });
              }}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                service === "" ? "bg-on-surface text-white" : "bg-surface-container-low text-on-surface-variant/70"
              }`}
            >
              ทั้งหมด
            </button>
            {serviceOptions.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  setService(label);
                  pushFilters({ service: label });
                }}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                  service === label ? "bg-primary text-white" : "bg-surface-container-low text-on-surface-variant/70"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <SelectField
              id="search_area"
              label="พื้นที่"
              value={area}
              onChange={(event) => {
                const value = event.target.value;
                setArea(value);
                pushFilters({ area: value });
              }}
              placeholder="ทุกพื้นที่"
              options={areaOptions.map((label) => ({ value: label, label }))}
            />
            <SelectField
              id="search_price"
              label="ราคาเริ่มต้น"
              value={maxPrice}
              onChange={(event) => {
                const value = event.target.value;
                setMaxPrice(value);
                pushFilters({ maxPrice: value });
              }}
              options={priceOptions}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                const next = availability === "available" ? "" : "available";
                setAvailability(next);
                pushFilters({ availability: next });
              }}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                availability === "available"
                  ? "bg-emerald-500 text-white"
                  : "bg-surface-container-low text-on-surface-variant/70"
              }`}
            >
              พร้อมรับงานตอนนี้
            </button>
            <button
              type="button"
              onClick={() => {
                const next = availability === "busy" ? "" : "busy";
                setAvailability(next);
                pushFilters({ availability: next });
              }}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                availability === "busy"
                  ? "bg-amber-500 text-white"
                  : "bg-surface-container-low text-on-surface-variant/70"
              }`}
            >
              คิวแน่น
            </button>
          </div>
        </section>

        <section className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-on-surface-variant/40">Search Result</p>
            <h2 className="headline-font mt-1 text-xl font-bold text-on-surface">
              พบช่าง {technicians.length} ราย
            </h2>
            {(initialQuery || service || area || availability || maxPrice) && (
              <p className="mt-1 text-sm text-on-surface-variant/55">
                {initialQuery ? `คำค้นหา "${initialQuery}"` : "กรองจากข้อมูลล่าสุดของร้านและช่างในระบบ"}
              </p>
            )}
          </div>
          {area ? (
            <div className="hidden items-center gap-1 rounded-full bg-surface-container-low px-3 py-2 text-xs font-semibold text-on-surface-variant md:flex">
              <MapPin className="h-3.5 w-3.5" />
              {area}
            </div>
          ) : null}
        </section>

        <div className="space-y-3">
          {technicians.length > 0 ? (
            technicians.map((technician) => <TechnicianCard key={technician.id} technician={technician} />)
          ) : (
            <div className="rounded-[1.8rem] bg-white px-6 py-14 text-center shadow-sm ring-1 ring-black/[0.04]">
              <Search className="mx-auto mb-4 h-10 w-10 text-on-surface-variant/15" />
              <p className="text-base font-bold text-on-surface">ยังไม่พบช่างที่ตรงกับตัวกรองนี้</p>
              <p className="mt-2 text-sm leading-6 text-on-surface-variant/55">
                ลองล้างตัวกรองบางตัว หรือเปลี่ยนคำค้นหาเพื่อดูร้านและช่างที่ตั้งค่าโปรไฟล์ไว้ล่าสุด
              </p>
            </div>
          )}
        </div>

        <div className="grid gap-2">
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
