import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { StatusChip } from "@/components/shared/status-chip";
import { ProfileBubble } from "@/components/shared/profile-bubble";
import { TopAppBar } from "@/components/shared/top-app-bar";
import { formatCurrency } from "@/lib/format";
import { getJobsForTechnician, getStaffTechnicianByID } from "@/lib/server-data";

export default async function TechnicianDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [session, technician, assignedJobs] = await Promise.all([
    auth(),
    getStaffTechnicianByID(id),
    getJobsForTechnician(id),
  ]);

  if (!technician) {
    notFound();
  }

  return (
    <div>
      <TopAppBar
        title="Technician"
        left={
          <Link href="/portal/technicians" className="rounded-full p-2 text-primary transition-transform active:scale-95">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        }
        right={<ProfileBubble image={session?.user?.image ?? technician.image} />}
      />
      <main className="page-content page-stack">
        <section className="surface-card rounded-[1.75rem] p-5 ambient-shadow md:p-6">
          <div className="page-hero">
            <p className="text-sm font-bold uppercase tracking-widest text-primary">Technician</p>
            <h1 className="headline-font text-3xl font-extrabold tracking-tight text-on-surface">{technician.name}</h1>
            <p className="text-sm text-on-surface-variant">{technician.headline}</p>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-[1.5rem] bg-primary-container p-4 text-on-primary">
            <p className="text-[11px] font-semibold uppercase tracking-widest opacity-80">Rating</p>
            <p className="mt-2 text-3xl font-extrabold">{technician.rating.toFixed(1)}</p>
          </div>
          <div className="rounded-[1.5rem] bg-surface-container-low p-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant">รีวิว</p>
            <p className="mt-2 text-3xl font-extrabold text-on-surface">{technician.reviewCount}</p>
          </div>
          <div className="rounded-[1.5rem] bg-surface-container-low p-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant">ประสบการณ์</p>
            <p className="mt-2 text-3xl font-extrabold text-on-surface">{technician.experienceYears} ปี</p>
          </div>
          <div className="rounded-[1.5rem] bg-surface-container-low p-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant">Assigned Jobs</p>
            <p className="mt-2 text-3xl font-extrabold text-on-surface">{assignedJobs.length}</p>
          </div>
        </section>

        <section className="surface-card rounded-[1.75rem] p-5 ambient-shadow md:p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.5rem] bg-surface-container-low p-4">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant">ร้าน</p>
              <p className="mt-2 text-sm font-bold text-on-surface">{technician.shopName}</p>
            </div>
            <div className="rounded-[1.5rem] bg-surface-container-low p-4">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant">ราคาเริ่มต้น</p>
              <p className="mt-2 text-sm font-bold text-on-surface">{formatCurrency(technician.startingPrice)}</p>
            </div>
            <div className="rounded-[1.5rem] bg-surface-container-low p-4">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant">พื้นที่ดูแล</p>
              <p className="mt-2 text-sm text-on-surface">{technician.area.join(", ") || "-"}</p>
            </div>
            <div className="rounded-[1.5rem] bg-surface-container-low p-4">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant">บริการ</p>
              <p className="mt-2 text-sm text-on-surface">{technician.services.join(", ") || "-"}</p>
            </div>
          </div>
        </section>

        <section className="surface-card rounded-[1.75rem] p-5 ambient-shadow md:p-6">
          <div className="section-stack">
            <p className="text-sm font-semibold text-on-surface">ประวัติงาน</p>
            <div className="card-stack">
              {assignedJobs.length > 0 ? (
                assignedJobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/portal/jobs/${job.id}`}
                    className="rounded-[1.5rem] bg-surface-container-low p-4 transition-transform active:scale-[0.99]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-on-surface">{job.userName}</p>
                        <p className="mt-1 text-sm text-on-surface-variant">
                          {job.serviceType} • {job.appointmentDate}
                        </p>
                        <p className="mt-1 text-sm text-on-surface-variant">{job.area}</p>
                      </div>
                      <StatusChip status={job.status} />
                    </div>
                  </Link>
                ))
              ) : (
                <div className="rounded-[1.5rem] bg-surface-container-low p-4 text-sm text-on-surface-variant">
                  ยังไม่มีงานที่ผูกกับช่างคนนี้
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
