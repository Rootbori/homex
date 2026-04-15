import Link from "next/link";
import { ArrowRight, Clock3, User } from "lucide-react";
import { TopAppBar } from "@/components/shared/top-app-bar";
import { ProfileBubble } from "@/components/shared/profile-bubble";
import { StatusChip } from "@/components/shared/status-chip";
import { buttonVariants } from "@/components/ui/button";
import { jobs, formatCurrency, technicians } from "@/lib/mock-data";

export default function MyRequestsPage() {
  return (
    <div>
      <TopAppBar
        title="Atmospheric"
        right={<ProfileBubble image={technicians[0]?.heroImage} />}
      />
      <main className="space-y-4 px-6 pb-24 pt-24">
        <section className="mb-6 pt-4">
          <span className="block text-sm font-bold uppercase tracking-widest text-primary">
            Customer Jobs
          </span>
          <h1 className="headline-font text-3xl font-extrabold tracking-tight">คำขอและงานของฉัน</h1>
        </section>
        {jobs.map((job) => (
          <div key={job.id} className="surface-card rounded-[2rem] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.02)]">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="headline-font text-lg font-bold text-on-surface">
                    {job.assignedTechnicianName}
                  </p>
                  <p className="text-sm text-on-surface-variant">{job.serviceType}</p>
                </div>
                <StatusChip status={job.status} />
              </div>
              <div className="grid grid-cols-2 gap-4 border-t border-border/15 pt-4">
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
                  <span className="text-sm font-bold text-on-surface">
                    {formatCurrency(job.total)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                <Clock3 className="h-4 w-4" />
                {job.appointmentTime}
              </div>
              <Link href={`/tracking/${job.id}`} className={buttonVariants({ variant: "ghost" })}>
                <User className="h-4 w-4" />
                ดูรายละเอียดงาน
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
