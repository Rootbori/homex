import Link from "next/link";
import { ArrowLeft, ChevronRight, Clock3 } from "lucide-react";
import { StatusChip } from "@/components/shared/status-chip";
import { formatCurrency } from "@/lib/format";
import { getUserJobs } from "@/lib/server-data";

export default async function MyRequestsPage() {
  const jobs = await getUserJobs();

  return (
    <div className="mx-auto max-w-3xl">
      <header className="sticky top-0 z-50 border-b border-black/[0.04] bg-white/80 backdrop-blur-xl">
        <div className="flex h-14 items-center gap-3 px-4">
          <Link href="/" className="text-on-surface-variant/50 hover:text-on-surface">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-base font-bold text-on-surface">งานของฉัน</h1>
        </div>
      </header>

      <main className="px-4 py-6">
        {jobs.length > 0 ? (
          <div className="space-y-3">
            {jobs.map((job) => (
              <Link
                key={job.id}
                href={`/tracking/${job.id}`}
                className="group flex items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-black/[0.04] transition-all hover:shadow-md active:scale-[0.99]"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-[15px] font-bold text-on-surface">
                      {job.assignedTechnicianName}
                    </span>
                    <StatusChip status={job.status} />
                  </div>
                  <p className="mt-0.5 text-xs text-on-surface-variant/50">{job.serviceType}</p>
                  <div className="mt-2 flex items-center gap-4 text-xs text-on-surface-variant/40">
                    <span className="flex items-center gap-1">
                      <Clock3 className="h-3 w-3" />
                      {job.appointmentDate} {job.appointmentTime}
                    </span>
                    <span className="font-semibold text-on-surface">{formatCurrency(job.total)}</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-on-surface-variant/20 transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-20 text-center">
            <Clock3 className="mb-4 h-10 w-10 text-on-surface-variant/15" />
            <p className="text-base font-bold text-on-surface">ยังไม่มีงาน</p>
            <p className="mt-1 text-sm text-on-surface-variant/50">
              เมื่อคุณส่งคำขอบริการ จะแสดงที่นี่
            </p>
            <Link
              href="/request"
              className="mt-6 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white"
            >
              สร้างคำขอ
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
