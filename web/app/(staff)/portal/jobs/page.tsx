import { JobCard } from "@/components/shop/job-card";
import { getJobs } from "@/lib/server-data";

export default async function JobsPage() {
  const jobs = await getJobs();

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-black/[0.04] bg-white/80 backdrop-blur-xl">
        <div className="flex h-14 items-center px-4">
          <h1 className="text-base font-bold text-on-surface">งานทั้งหมด</h1>
          <span className="ml-2 rounded-full bg-primary/5 px-2 py-0.5 text-[11px] font-bold text-primary">
            {jobs.length}
          </span>
        </div>
      </header>

      <main className="px-4 py-4 space-y-2">
        {jobs.length > 0 ? (
          jobs.map((job) => <JobCard key={job.id} job={job} />)
        ) : (
          <p className="py-16 text-center text-sm text-on-surface-variant/30">
            ยังไม่มีงานในระบบ
          </p>
        )}
      </main>
    </div>
  );
}
