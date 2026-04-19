import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ImagePlus, MapPin, PhoneCall } from "lucide-react";
import { localizeAppPath } from "@/lib/auth-flow";
import { getStaffDictionary } from "@/lib/i18n/staff";
import { getLead } from "@/lib/server-data";

export default async function LeadDetailPage({
  params,
}: Readonly<{
  params: Promise<{ id: string; locale: string }>;
}>) {
  const { id, locale } = await params;
  const [lead, t] = await Promise.all([getLead(id), Promise.resolve(getStaffDictionary(locale))]);

  if (!lead) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl">
      <header className="sticky top-0 z-50 border-b border-black/[0.04] bg-white/80 backdrop-blur-xl">
        <div className="flex h-14 items-center gap-3 px-4">
          <Link href={localizeAppPath("/portal/leads", locale)} className="text-on-surface-variant/50 hover:text-on-surface">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-base font-bold text-on-surface">{lead.userName}</h1>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Contact actions */}
        <div className="grid grid-cols-2 gap-2">
          <a
            href={`tel:${lead.phone}`}
            className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-bold text-white"
          >
            <PhoneCall className="h-4 w-4" />
            {t.leads.callOut}
          </a>
          <button className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-surface-container-low text-sm font-semibold text-on-surface">
            <MapPin className="h-4 w-4" />
            {t.leads.navigate}
          </button>
        </div>

        {/* Request details */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-on-surface">{t.leads.detailTitle}</h2>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-surface-container-low p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant/30">{t.common.service}</p>
              <p className="mt-1 text-sm font-bold text-on-surface">{lead.serviceType}</p>
            </div>
            <div className="rounded-xl bg-surface-container-low p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant/30">{t.leads.quantity}</p>
              <p className="mt-1 text-sm font-bold text-on-surface">{lead.units || "-"} {t.leads.units}</p>
            </div>
          </div>
          <div className="rounded-xl bg-surface-container-low p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant/30">{t.leads.initialSymptom}</p>
            <p className="mt-1 text-sm leading-relaxed text-on-surface">{lead.symptom}</p>
          </div>
        </section>

        {/* Air units */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-on-surface">{t.leads.airconInfo}</h2>
          {lead.airUnits.length > 0 ? (
            <div className="space-y-2">
              {lead.airUnits.map((unit, index) => (
                <div key={`${unit.brand}-${index}`} className="rounded-xl bg-surface-container-low p-3">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="font-bold text-on-surface">{unit.brand}</span>
                    <span className="text-on-surface-variant/50">{unit.btu}</span>
                  </div>
                  <p className="mt-1 text-xs text-on-surface-variant/50">{unit.symptom}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-on-surface-variant/30">{t.leads.noAirconUnits}</p>
          )}
          <div className="flex h-20 items-center justify-center rounded-xl bg-surface-container-low">
            <ImagePlus className="h-6 w-6 text-on-surface-variant/20" />
          </div>
        </section>

        {/* Notes */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-on-surface">{t.common.note}</h2>
          <div className="space-y-2">
            <div className="rounded-xl bg-surface-container-low p-3">
              <p className="text-sm font-medium text-on-surface">{t.leads.leadAccepted}</p>
              <p className="mt-0.5 text-xs text-on-surface-variant/40">{lead.time} • {lead.source}</p>
            </div>
            <div className="rounded-xl bg-surface-container-low p-3">
              <p className="text-sm font-medium text-on-surface">{t.leads.serviceArea}</p>
              <p className="mt-0.5 text-xs text-on-surface-variant/40">{lead.area}</p>
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="grid gap-2 pb-4">
          <Link
            href={localizeAppPath("/portal/quotation", locale)}
            className="flex h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-sm font-bold text-white shadow-lg shadow-amber-500/20 transition-all hover:brightness-110 active:scale-[0.98]"
          >
            {t.leads.createQuotation}
          </Link>
          <button className="flex h-12 items-center justify-center rounded-2xl bg-surface-container-low text-sm font-semibold text-on-surface">
            {t.leads.assignTechnician}
          </button>
        </div>
      </main>
    </div>
  );
}
