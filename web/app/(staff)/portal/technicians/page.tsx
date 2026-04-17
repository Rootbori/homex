import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getTechnicians } from "@/lib/server-data";

export default async function TechniciansPage() {
  const technicians = await getTechnicians();

  return (
    <div className="mx-auto max-w-3xl">
      <header className="sticky top-0 z-50 border-b border-black/[0.04] bg-white/80 backdrop-blur-xl">
        <div className="flex h-14 items-center px-4">
          <h1 className="text-base font-bold text-on-surface">ทีมช่าง</h1>
          <span className="ml-2 rounded-full bg-primary/5 px-2 py-0.5 text-[11px] font-bold text-primary">
            {technicians.length}
          </span>
        </div>
      </header>

      <main className="px-4 py-4 space-y-2">
        {technicians.length > 0 ? (
          technicians.map((technician) => (
            <Link
              key={technician.id}
              href={`/portal/technicians/${technician.id}`}
              className="group flex items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-black/[0.04] transition-all hover:shadow-md active:scale-[0.99]"
            >
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-surface-container">
                {technician.image ? (
                  <img src={technician.image} alt={technician.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-bold text-primary/30">
                    {technician.name.charAt(0)}
                  </div>
                )}
                <div className={`absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white ${technician.availability === "available" ? "bg-emerald-400" : "bg-amber-400"}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-bold text-on-surface">{technician.name}</p>
                <p className="text-xs text-on-surface-variant/50">{technician.shopName}</p>
                <p className="mt-1 text-xs text-on-surface-variant/30">
                  {technician.services.join(", ") || "-"} • {technician.area.join(", ") || "-"}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-on-surface-variant/20 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))
        ) : (
          <p className="py-16 text-center text-sm text-on-surface-variant/30">
            ยังไม่มีช่างในระบบ
          </p>
        )}
      </main>
    </div>
  );
}
