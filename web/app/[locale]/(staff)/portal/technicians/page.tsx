import Link from "next/link";
import { ArrowLeft, ChevronRight, Plus } from "lucide-react";
import { TopAppBar } from "@/components/ui/top-app-bar";
import { localizeAppPath } from "@/lib/auth-flow";
import { formatStaffText, getStaffDictionary } from "@/lib/i18n/staff";
import { getPortalStore, getTechnicians } from "@/lib/server-data";

export default async function TechniciansPage({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const [store, technicians, t] = await Promise.all([getPortalStore(), getTechnicians(), Promise.resolve(getStaffDictionary(locale))]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col bg-surface-container-lowest">
      <TopAppBar
        title={t.technicians.title}
        left={
          <>
            <Link
              href={localizeAppPath("/portal/more", locale)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant/50 transition-colors hover:bg-surface-container-low hover:text-on-surface"
              aria-label={t.common.backToMore}
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <span className="rounded-full bg-primary/5 px-2 py-0.5 text-[11px] font-bold text-primary">
              {technicians.length}
            </span>
          </>
        }
        right={
          <Link
            href={localizeAppPath("/portal/technicians/new", locale)}
            className="flex h-8 items-center gap-1.5 rounded-full bg-on-surface px-3 text-[11px] font-bold text-white transition-all hover:bg-on-surface/90 active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            {t.technicians.add}
          </Link>
        }
      />

      <main className="px-4 py-4 space-y-2">
        <div className="rounded-2xl bg-surface-container-low p-4 text-sm leading-6 text-on-surface-variant">
          {formatStaffText(t.technicians.scope, { store: store?.name ?? t.common.currentStoreFallback })}
        </div>
        {technicians.length > 0 ? (
          technicians.map((technician) => (
            <Link
              key={technician.id}
              href={localizeAppPath(`/portal/technicians/${technician.id}`, locale)}
              className="group flex items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-black/[0.04] transition-all hover:shadow-md active:scale-[0.99]"
            >
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-surface-container">
                {technician.image ? (
                  <div
                    className="h-full w-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${technician.image})` }}
                  />
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
            {t.technicians.empty}
          </p>
        )}
      </main>
    </div>
  );
}
