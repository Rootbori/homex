import { cookies } from "next/headers";
import { Wrench } from "lucide-react";
import { JobCard } from "@/components/shop/job-card";
import { getJobsForTechnician } from "@/lib/server-data";

export default async function TechnicianMyJobsPage() {
  const cookieStore = await cookies();
  const technicianId = cookieStore.get("homex_technician_id")?.value ?? "";
  const myJobs = technicianId ? await getJobsForTechnician(technicianId) : [];

  const onTheWay = myJobs.filter((job) => job.status === "on_the_way").length;
  const inProgress = myJobs.filter((job) => job.status === "in_progress").length;

  return (
    <div className="mx-auto max-w-3xl">
      <header className="sticky top-0 z-50 border-b border-black/[0.04] bg-white/80 backdrop-blur-xl">
        <div className="flex h-14 items-center px-4">
          <h1 className="text-base font-bold text-on-surface">งานของฉัน</h1>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-primary/5 p-3 text-center">
            <p className="text-xl font-extrabold text-primary">{myJobs.length}</p>
            <p className="text-[10px] font-medium text-primary/60">ทั้งหมด</p>
          </div>
          <div className="rounded-xl bg-surface-container-low p-3 text-center">
            <p className="text-xl font-extrabold text-on-surface">{onTheWay}</p>
            <p className="text-[10px] font-medium text-on-surface-variant/40">กำลังไป</p>
          </div>
          <div className="rounded-xl bg-surface-container-low p-3 text-center">
            <p className="text-xl font-extrabold text-on-surface">{inProgress}</p>
            <p className="text-[10px] font-medium text-on-surface-variant/40">กำลังทำ</p>
          </div>
        </div>

        {/* Job list */}
        <div className="space-y-2">
          {myJobs.length > 0 ? (
            myJobs.map((job) => <JobCard key={job.id} job={job} />)
          ) : (
            <div className="flex flex-col items-center py-16 text-center">
              <Wrench className="mb-3 h-8 w-8 text-on-surface-variant/15" />
              <p className="text-sm font-bold text-on-surface">
                {technicianId ? "ยังไม่มีงานที่มอบหมาย" : "บัญชีนี้ยังไม่ได้ผูกช่าง"}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
