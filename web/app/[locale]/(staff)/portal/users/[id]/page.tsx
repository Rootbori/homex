import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, PhoneCall } from "lucide-react";
import { StatusChip } from "@/components/ui/status-chip";
import { localizeAppPath } from "@/lib/auth-flow";
import { formatCurrency } from "@/lib/format";
import { getStaffDictionary } from "@/lib/i18n/staff";
import { getUserByID, getJobsForUser } from "@/lib/server-data";

export default async function UserDetailPage({
  params,
}: Readonly<{
  params: Promise<{ id: string; locale: string }>;
}>) {
  const { id, locale } = await params;
  const [user, jobs, t] = await Promise.all([
    getUserByID(id),
    getJobsForUser(id),
    Promise.resolve(getStaffDictionary(locale)),
  ]);

  if (!user) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl">
      <header className="sticky top-0 z-50 border-b border-black/[0.04] bg-white/80 backdrop-blur-xl">
        <div className="flex h-14 items-center gap-3 px-4">
          <Link href={localizeAppPath("/portal/users", locale)} className="text-on-surface-variant/50 hover:text-on-surface">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="truncate text-base font-bold text-on-surface">{user.name}</h1>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Customer info */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-on-surface">{user.name}</h2>
            <p className="text-xs text-on-surface-variant/50">{user.phone} • {user.area}</p>
          </div>
          <a
            href={`tel:${user.phone}`}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white"
          >
            <PhoneCall className="h-4 w-4" />
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-primary/5 p-3 text-center">
            <p className="text-lg font-extrabold text-primary">{formatCurrency(user.totalSpend)}</p>
            <p className="text-[10px] text-primary/60">{t.users.totalSpend}</p>
          </div>
          <div className="rounded-xl bg-surface-container-low p-3 text-center">
            <p className="text-lg font-extrabold text-on-surface">{jobs.length}</p>
            <p className="text-[10px] text-on-surface-variant/40">{t.common.jobs}</p>
          </div>
          <div className="rounded-xl bg-surface-container-low p-3 text-center">
            <p className="text-lg font-extrabold text-on-surface">
              {formatCurrency(jobs.length > 0 ? Math.round(user.totalSpend / jobs.length) : 0)}
            </p>
            <p className="text-[10px] text-on-surface-variant/40">{t.users.averagePerUser}</p>
          </div>
        </div>

        {/* Note */}
        {user.note && (
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-on-surface">{t.common.note}</h3>
            <p className="rounded-xl bg-surface-container-low p-3 text-sm leading-relaxed text-on-surface-variant/60">
              {user.note}
            </p>
          </section>
        )}

        {/* Job history */}
        <section className="space-y-3">
          <h3 className="text-sm font-bold text-on-surface">{t.users.jobHistory}</h3>
          <div className="space-y-2">
            {jobs.length > 0 ? (
              jobs.map((job) => (
                <Link
                  key={job.id}
                  href={localizeAppPath(`/portal/jobs/${job.id}`, locale)}
                  className="flex items-center justify-between rounded-xl bg-surface-container-low p-3 transition-all hover:bg-surface-container active:scale-[0.99]"
                >
                  <div>
                    <p className="text-sm font-semibold text-on-surface">{job.code}</p>
                    <p className="text-xs text-on-surface-variant/40">
                      {job.serviceType} • {job.appointmentDate} • {job.assignedTechnicianName}
                    </p>
                  </div>
                  <StatusChip status={job.status} />
                </Link>
              ))
            ) : (
              <p className="text-sm text-on-surface-variant/30">{t.users.emptyHistory}</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
