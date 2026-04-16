import { JobCard } from "@/components/shop/job-card";
import { ProfileBubble } from "@/components/shared/profile-bubble";
import { TopAppBar } from "@/components/shared/top-app-bar";
import { jobs, technicians } from "@/lib/mock-data";

export default function TechnicianMyJobsPage() {
  const myJobs = jobs.filter((job) => job.assignedTechnicianId === "tech-01");

  return (
    <div>
      <TopAppBar
        title="Atmospheric"
        right={<ProfileBubble image={technicians[0]?.heroImage} />}
      />
      <main className="page-content page-stack">
        <section className="page-hero">
          <span className="block text-sm font-bold uppercase tracking-widest text-primary">Technician view</span>
          <h1 className="headline-font text-3xl font-extrabold tracking-tight">งานของฉัน</h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            แสดงเฉพาะงานที่ assign ให้ช่างคนนี้ เพื่อสะท้อน role isolation
          </p>
        </section>
        <div className="card-stack">
          {myJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </main>
    </div>
  );
}
