import { cookies } from "next/headers";
import { auth } from "@/auth";
import { JobCard } from "@/components/shop/job-card";
import { ProfileBubble } from "@/components/shared/profile-bubble";
import { TopAppBar } from "@/components/shared/top-app-bar";
import { getJobsForTechnician } from "@/lib/server-data";

export default async function TechnicianMyJobsPage() {
  const [session, cookieStore] = await Promise.all([auth(), cookies()]);
  const technicianId = cookieStore.get("homex_technician_id")?.value ?? "";
  const myJobs = technicianId ? await getJobsForTechnician(technicianId) : [];

  return (
    <div>
      <TopAppBar title="งานของฉัน" right={<ProfileBubble image={session?.user?.image ?? undefined} />} />
      <main className="page-content page-stack">
        <section className="page-hero">
          <span className="block text-sm font-bold uppercase tracking-widest text-primary">Technician View</span>
          <h1 className="headline-font text-3xl font-extrabold tracking-tight text-on-surface">
            งานที่มอบหมายให้ฉัน
          </h1>
          <p className="mt-2 text-sm leading-6 text-on-surface-variant">
            แสดงเฉพาะงานที่ถูก assign ให้ช่างคนนี้ เพื่อให้เห็นเฉพาะลูกค้าและงานในสิทธิ์ของตัวเอง
          </p>
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-[1.5rem] bg-primary-container p-4 text-on-primary">
            <p className="text-[11px] font-semibold uppercase tracking-widest opacity-80">งานทั้งหมด</p>
            <p className="mt-2 text-3xl font-extrabold">{myJobs.length}</p>
          </div>
          <div className="rounded-[1.5rem] bg-surface-container-low p-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant">กำลังไป</p>
            <p className="mt-2 text-3xl font-extrabold text-on-surface">
              {myJobs.filter((job) => job.status === "on_the_way").length}
            </p>
          </div>
          <div className="rounded-[1.5rem] bg-surface-container-low p-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant">กำลังทำ</p>
            <p className="mt-2 text-3xl font-extrabold text-on-surface">
              {myJobs.filter((job) => job.status === "in_progress").length}
            </p>
          </div>
        </section>

        <div className="card-stack">
          {myJobs.length > 0 ? (
            myJobs.map((job) => <JobCard key={job.id} job={job} />)
          ) : (
            <div className="surface-card rounded-[1.75rem] p-5 text-sm text-on-surface-variant">
              {technicianId
                ? "ตอนนี้ยังไม่มีงานที่มอบหมายให้ช่างคนนี้"
                : "บัญชีนี้ยังไม่ได้ผูก technician profile จึงยังไม่สามารถแสดงงานของฉันได้"}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
