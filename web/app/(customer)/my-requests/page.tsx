import Link from "next/link";
import { Clock3, User } from "lucide-react";
import { auth } from "@/auth";
import { TopAppBar } from "@/components/shared/top-app-bar";
import { ProfileBubble } from "@/components/shared/profile-bubble";
import { StatusChip } from "@/components/shared/status-chip";
import { buttonVariants } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { getCustomerJobs } from "@/lib/server-data";

export default async function MyRequestsPage() {
  const [session, jobs] = await Promise.all([auth(), getCustomerJobs()]);

  return (
    <div>
      <TopAppBar title="Atmospheric" right={<ProfileBubble image={session?.user?.image ?? undefined} />} />
      <main className="page-content page-stack">
        <section className="page-hero">
          <span className="block text-sm font-bold uppercase tracking-widest text-primary">
            Customer Jobs
          </span>
          <h1 className="headline-font text-3xl font-extrabold tracking-tight">คำขอและงานของฉัน</h1>
        </section>

        <div className="card-stack">
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <div key={job.id} className="surface-card rounded-[1.75rem] p-5 ambient-shadow md:p-6">
                <div className="section-stack">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="headline-font text-lg font-bold text-on-surface">{job.assignedTechnicianName}</p>
                      <p className="text-sm text-on-surface-variant">{job.serviceType}</p>
                    </div>
                    <StatusChip status={job.status} />
                  </div>

                  <div className="grid gap-3 border-t border-border/15 pt-4 sm:grid-cols-2 sm:gap-4">
                    <div>
                      <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">
                        Appointment
                      </span>
                      <span className="text-sm font-bold text-on-surface">{job.appointmentDate}</span>
                    </div>
                    <div>
                      <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">
                        Total
                      </span>
                      <span className="text-sm font-bold text-on-surface">{formatCurrency(job.total)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <Clock3 className="h-4 w-4" />
                    {job.appointmentTime}
                  </div>

                  <Link href={`/tracking/${job.id}`} className={buttonVariants({ variant: "ghost" })}>
                    <User className="h-4 w-4" />
                    ดูรายละเอียดงาน
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="surface-card rounded-[1.75rem] p-5 text-sm text-on-surface-variant">
              ยังไม่มีคำขอหรือประวัติงานในตอนนี้
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
