import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Star } from "lucide-react";
import { StatusChip } from "@/components/ui/status-chip";
import { localizeAppPath } from "@/lib/auth-flow";
import { formatCurrency } from "@/lib/format";
import { getStaffDictionary } from "@/lib/i18n/staff";
import { getJobsForTechnician, getStaffTechnicianByID } from "@/lib/server-data";

export default async function TechnicianDetailPage({
  params,
}: Readonly<{
  params: Promise<{ id: string; locale: string }>;
}>) {
  const { id, locale } = await params;
  const [technician, assignedJobs, t] = await Promise.all([
    getStaffTechnicianByID(id),
    getJobsForTechnician(id),
    Promise.resolve(getStaffDictionary(locale)),
  ]);

  if (!technician) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl">
      <header className="sticky top-0 z-50 border-b border-black/[0.04] bg-white/80 backdrop-blur-xl">
        <div className="flex h-14 items-center gap-3 px-4">
          <Link href={localizeAppPath("/portal/technicians", locale)} className="text-on-surface-variant/50 hover:text-on-surface">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="truncate text-base font-bold text-on-surface">{technician.name}</h1>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Profile */}
        <div className="flex gap-4">
          <div
            className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-surface-container"
            style={
              technician.image
                ? { backgroundImage: `url(${technician.image})`, backgroundSize: "cover", backgroundPosition: "center" }
                : undefined
            }
          />
          <div>
            <h2 className="text-lg font-extrabold text-on-surface">{technician.name}</h2>
            <p className="text-xs text-on-surface-variant/50">{technician.shopName}</p>
            <p className="mt-1 text-sm text-on-surface-variant/60">{technician.headline}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          <div className="rounded-xl bg-primary/5 p-3 text-center">
            <div className="flex items-center justify-center gap-1">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="text-lg font-extrabold text-on-surface">{technician.rating.toFixed(1)}</span>
            </div>
            <p className="text-[10px] text-on-surface-variant/40">{t.technicians.rating}</p>
          </div>
          <div className="rounded-xl bg-surface-container-low p-3 text-center">
            <p className="text-lg font-extrabold text-on-surface">{technician.reviewCount}</p>
            <p className="text-[10px] text-on-surface-variant/40">{t.technicians.reviews}</p>
          </div>
          <div className="rounded-xl bg-surface-container-low p-3 text-center">
            <p className="text-lg font-extrabold text-on-surface">{technician.experienceYears}</p>
            <p className="text-[10px] text-on-surface-variant/40">{t.technicians.years}</p>
          </div>
          <div className="rounded-xl bg-surface-container-low p-3 text-center">
            <p className="text-lg font-extrabold text-on-surface">{assignedJobs.length}</p>
            <p className="text-[10px] text-on-surface-variant/40">{t.common.jobs}</p>
          </div>
        </div>

        {/* Info grid */}
        <section className="space-y-3">
          <h3 className="text-sm font-bold text-on-surface">{t.technicians.info}</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-surface-container-low p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant/30">{t.common.startingPrice}</p>
              <p className="mt-1 text-sm font-bold text-on-surface">{formatCurrency(technician.startingPrice)}</p>
            </div>
            <div className="rounded-xl bg-surface-container-low p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant/30">{t.technicians.area}</p>
              <p className="mt-1 text-sm font-medium text-on-surface">{technician.area.join(", ") || "-"}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {technician.services.map((s) => (
              <span key={s} className="rounded-lg bg-surface-container-low px-2.5 py-1 text-xs font-medium text-on-surface-variant/50">
                {s}
              </span>
            ))}
          </div>
        </section>

        {/* Job history */}
        <section className="space-y-3">
          <h3 className="text-sm font-bold text-on-surface">{t.technicians.jobHistory}</h3>
          <div className="space-y-2">
            {assignedJobs.length > 0 ? (
              assignedJobs.map((job) => (
                <Link
                  key={job.id}
                  href={localizeAppPath(`/portal/jobs/${job.id}`, locale)}
                  className="flex items-center justify-between rounded-xl bg-surface-container-low p-3 transition-all hover:bg-surface-container active:scale-[0.99]"
                >
                  <div>
                    <p className="text-sm font-semibold text-on-surface">{job.userName}</p>
                    <p className="text-xs text-on-surface-variant/40">{job.serviceType} • {job.appointmentDate}</p>
                  </div>
                  <StatusChip status={job.status} />
                </Link>
              ))
            ) : (
              <p className="text-sm text-on-surface-variant/30">{t.technicians.emptyJobs}</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
