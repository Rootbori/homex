import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ImagePlus, MapPin, PhoneCall } from "lucide-react";
import { localizeAppPath } from "@/lib/auth-flow";
import { formatCurrency, jobStatusLabel } from "@/lib/format";
import { getStaffDictionary } from "@/lib/i18n/staff";
import { getJob } from "@/lib/server-data";

export default async function JobDetailPage({
  params,
}: Readonly<{
  params: Promise<{ id: string; locale: string }>;
}>) {
  const { id, locale } = await params;
  const [job, t] = await Promise.all([getJob(id), Promise.resolve(getStaffDictionary(locale))]);

  if (!job) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl">
      <header className="sticky top-0 z-50 border-b border-black/[0.04] bg-white/80 backdrop-blur-xl">
        <div className="flex h-14 items-center gap-3 px-4">
          <Link href={localizeAppPath("/portal/jobs", locale)} className="text-on-surface-variant/50 hover:text-on-surface">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-bold text-on-surface">{job.code}</h1>
          </div>
          <span className="rounded-full bg-primary/5 px-2.5 py-1 text-[10px] font-bold text-primary">
            {jobStatusLabel[job.status]}
          </span>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Customer info + actions */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-on-surface">{job.userName}</h2>
            <p className="text-xs text-on-surface-variant/50">{job.phone}</p>
          </div>
          <div className="flex gap-2">
            <a
              href={`tel:${job.phone}`}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white"
            >
              <PhoneCall className="h-4 w-4" />
            </a>
            <a
              href={job.mapUrl ?? "https://maps.google.com"}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-container-low text-on-surface-variant/50"
            >
              <MapPin className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Job info */}
        <section className="space-y-3">
          <h3 className="text-sm font-bold text-on-surface">{t.jobs.jobInfo}</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-surface-container-low p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant/30">{t.common.service}</p>
              <p className="mt-1 text-sm font-bold text-on-surface">{job.serviceType}</p>
            </div>
            <div className="rounded-xl bg-surface-container-low p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant/30">{t.jobs.payment}</p>
              <p className="mt-1 text-sm font-bold text-on-surface">{job.paymentStatus}</p>
            </div>
          </div>
          <div className="rounded-xl bg-surface-container-low p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant/30">{t.common.symptom}</p>
            <p className="mt-1 text-sm leading-relaxed text-on-surface">{job.symptom}</p>
          </div>
          <div className="rounded-xl bg-surface-container-low p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant/30">{t.common.address}</p>
            <p className="mt-1 text-sm leading-relaxed text-on-surface">{job.address}</p>
          </div>
        </section>

        {/* Photos */}
        <section className="space-y-3">
          <h3 className="text-sm font-bold text-on-surface">{t.jobs.jobPhotos}</h3>
          <div className="grid grid-cols-3 gap-2">
            {job.photos.length > 0 ? (
              job.photos.map((photo) => (
                <div
                  key={`${photo.kind ?? "photo"}-${photo.image}`}
                  className="aspect-square overflow-hidden rounded-xl bg-surface-container"
                  style={{
                    backgroundImage: `url(${photo.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
              ))
            ) : (
              <p className="col-span-3 text-sm text-on-surface-variant/30">{t.jobs.noPhotos}</p>
            )}
            <div className="flex aspect-square items-center justify-center rounded-xl bg-surface-container-low">
              <ImagePlus className="h-6 w-6 text-on-surface-variant/20" />
            </div>
          </div>
        </section>

        {/* Quote */}
        <section className="space-y-3">
          <h3 className="text-sm font-bold text-on-surface">{t.jobs.quotation}</h3>
          <div className="rounded-2xl bg-surface-container-low p-4 space-y-3">
            {job.quoteItems.length > 0 ? (
              job.quoteItems.map((item) => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-semibold text-on-surface">{item.label}</p>
                    <p className="text-xs text-on-surface-variant/40">x{item.qty}</p>
                  </div>
                  <p className="font-bold text-on-surface">{formatCurrency(item.amount)}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-on-surface-variant/30">{t.common.noItems}</p>
            )}
            <div className="flex items-center justify-between border-t border-black/[0.04] pt-3">
              <span className="text-sm font-medium text-on-surface-variant/50">{t.common.total}</span>
              <span className="text-xl font-extrabold text-on-surface">{formatCurrency(job.total)}</span>
            </div>
          </div>
        </section>

        {/* Assignment */}
        <section className="space-y-3">
          <h3 className="text-sm font-bold text-on-surface">{t.jobs.assignee}</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-surface-container-low p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant/30">{t.jobs.assignedTechnician}</p>
              <p className="mt-1 text-sm font-bold text-on-surface">{job.assignedTechnicianName}</p>
            </div>
            <div className="rounded-xl bg-surface-container-low p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant/30">{t.jobs.appointment}</p>
              <p className="mt-1 text-sm font-bold text-on-surface">{job.appointmentDate}</p>
              <p className="text-xs text-on-surface-variant/40">{job.appointmentTime}</p>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="space-y-3">
          <h3 className="text-sm font-bold text-on-surface">{t.common.timeline}</h3>
          <div className="space-y-2">
            {job.timeline.map((item, index) => (
              <div key={`${item.label}-${index}`} className="flex items-start gap-3 rounded-xl bg-surface-container-low p-3">
                <div className={`mt-0.5 h-3 w-3 shrink-0 rounded-full ${item.done ? "bg-primary" : "border-2 border-on-surface-variant/20"}`} />
                <div>
                  <p className="text-sm font-semibold text-on-surface">{item.label}</p>
                  <p className="text-xs text-on-surface-variant/40">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="pb-4">
          <button className="flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-sm font-bold text-white shadow-lg shadow-amber-500/20 transition-all hover:brightness-110 active:scale-[0.98]">
            {t.jobs.complete}
          </button>
        </div>
      </main>
    </div>
  );
}
