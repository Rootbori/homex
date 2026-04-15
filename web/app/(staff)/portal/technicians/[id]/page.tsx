import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ProfileBubble } from "@/components/shared/profile-bubble";
import { TopAppBar } from "@/components/shared/top-app-bar";
import { getTechnicianById, jobs } from "@/lib/mock-data";

export default async function TechnicianDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const technician = getTechnicianById(id);

  if (!technician) {
    notFound();
  }

  const assignedJobs = jobs.filter((job) => job.assignedTechnicianId === technician.id);

  return (
    <div>
      <TopAppBar
        title="Technician"
        left={
          <button className="rounded-full p-2 text-on-surface transition-transform active:scale-95">
            <ArrowLeft className="h-5 w-5" />
          </button>
        }
        right={<ProfileBubble image={technician.heroImage} />}
      />
      <main className="space-y-4 px-6 pb-24 pt-24">
        <section className="surface-card rounded-[2rem] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.02)]">
          <p className="mb-2 text-sm font-bold uppercase tracking-widest text-primary">Technician</p>
          <h1 className="headline-font text-3xl font-extrabold tracking-tight">{technician.name}</h1>
          <p className="mt-2 text-sm text-on-surface-variant">{technician.headline}</p>
        </section>

        <section className="surface-card rounded-[2rem] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.02)]">
          <p className="mb-3 text-sm font-semibold text-on-surface">Performance</p>
          <div className="grid grid-cols-2 gap-4 text-sm text-on-surface-variant">
            <div>
              <p className="text-[10px] uppercase tracking-widest">Rating</p>
              <p className="mt-1 text-xl font-bold text-on-surface">{technician.rating}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest">รีวิว</p>
              <p className="mt-1 text-xl font-bold text-on-surface">{technician.reviewCount}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest">ประสบการณ์</p>
              <p className="mt-1 text-xl font-bold text-on-surface">{technician.experienceYears} ปี</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest">Assigned Jobs</p>
              <p className="mt-1 text-xl font-bold text-on-surface">{assignedJobs.length}</p>
            </div>
          </div>
        </section>

        <section className="surface-card rounded-[2rem] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.02)]">
          <p className="mb-3 text-sm font-semibold text-on-surface">ประวัติงาน</p>
          <div className="space-y-3">
            {assignedJobs.map((job) => (
              <div key={job.id} className="rounded-[24px] bg-surface-container-low p-4 text-sm text-on-surface-variant">
                <p className="font-medium text-on-surface">{job.customerName}</p>
                <p>{job.serviceType} • {job.appointmentDate}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
