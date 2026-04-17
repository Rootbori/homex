import { Briefcase } from "lucide-react";
import { JobCard } from "@/components/shop/job-card";
import { ProfileBubble } from "@/components/shared/profile-bubble";
import { TopAppBar } from "@/components/shared/top-app-bar";
import { getJobs } from "@/lib/server-data";

export default async function JobsPage() {
  const jobs = await getJobs();

  return (
    <div>
      <TopAppBar title="Atmospheric" right={<ProfileBubble />} />
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
          {jobs.length > 0 ? (
            jobs.map((job) => <JobCard key={job.id} job={job} />)
          ) : (
            <div className="surface-card rounded-[1.75rem] p-5 text-sm text-on-surface-variant">ยังไม่มีงานในระบบ</div>
          )}
        </div>
      </main>
    </div>
  );
}
