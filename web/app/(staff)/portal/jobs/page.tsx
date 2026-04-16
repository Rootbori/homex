import { Briefcase } from "lucide-react";
import { JobCard } from "@/components/shop/job-card";
import { ProfileBubble } from "@/components/shared/profile-bubble";
import { TopAppBar } from "@/components/shared/top-app-bar";
import { jobs, technicians } from "@/lib/mock-data";

export default function JobsPage() {
  return (
    <div>
      <TopAppBar
        title="Atmospheric"
        right={<ProfileBubble image={technicians[0]?.heroImage} />}
      />
      <main className="page-content page-stack">
        <section className="page-hero">
          <span className="block text-sm font-bold uppercase tracking-widest text-primary">Jobs</span>
          <h1 className="headline-font text-3xl font-extrabold tracking-tight">งานทั้งหมด</h1>
        </section>
        <div className="surface-card rounded-[1.75rem] p-5 ambient-shadow md:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-fixed text-primary">
              <Briefcase className="h-5 w-5" />
            </div>
            <p className="text-sm leading-6 text-on-surface-variant">
              ใช้ card stacked แทน table เพื่อให้ owner, dispatcher และ technician ใช้งานบนมือถือได้จริง
            </p>
          </div>
        </div>
        <div className="card-stack">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </main>
    </div>
  );
}
