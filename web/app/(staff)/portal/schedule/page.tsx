import { CalendarDays } from "lucide-react";
import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { ProfileBubble } from "@/components/shared/profile-bubble";
import { TopAppBar } from "@/components/shared/top-app-bar";
import { StatusChip } from "@/components/shared/status-chip";
import { getSchedule } from "@/lib/server-data";

export default async function SchedulePage() {
  const [session, days] = await Promise.all([auth(), getSchedule()]);

  return (
    <div>
      <TopAppBar title="Schedule" right={<ProfileBubble image={session?.user?.image ?? undefined} />} />
      <main className="page-content page-stack">
        <section className="page-hero">
          <span className="block text-sm font-bold uppercase tracking-widest text-primary">Schedule</span>
          <h1 className="headline-font text-3xl font-extrabold tracking-tight text-on-surface">ตารางงานช่าง</h1>
          <p className="mt-2 text-sm leading-6 text-on-surface-variant">
            จัดเป็นการ์ดรายวันบนมือถือ อ่านง่ายกว่า wide calendar และยังเห็นช่างที่รับผิดชอบแต่ละงานชัดเจน
          </p>
        </section>

        <section className="surface-card rounded-[1.75rem] p-5 ambient-shadow md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="headline-font text-lg font-bold text-on-surface">มุมมองตารางงาน</p>
              <p className="mt-1 text-sm text-on-surface-variant">ดึงตาม schedule API ของร้าน</p>
            </div>
            <div className="flex gap-2">
              <Badge>รายวัน</Badge>
              <Badge variant="muted">รายสัปดาห์</Badge>
            </div>
          </div>
        </section>

        <div className="card-stack">
          {days.length > 0 ? (
            days.map((day) => (
              <section key={day.date} className="surface-card rounded-[1.75rem] p-5 ambient-shadow md:p-6">
                <div className="section-stack">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-container text-on-primary">
                        <CalendarDays className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="headline-font text-lg font-bold text-on-surface">{day.date}</p>
                        <p className="text-sm text-on-surface-variant">{day.jobs.length} งานในคิว</p>
                      </div>
                    </div>
                    <Badge variant="muted">{day.jobs.length} jobs</Badge>
                  </div>

                  <div className="card-stack">
                    {day.jobs.length > 0 ? (
                      day.jobs.map((job) => (
                        <div key={`${day.date}-${job.id}`} className="rounded-[1.5rem] bg-surface-container-low p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-bold text-on-surface">{job.appointmentTime}</p>
                              <p className="mt-1 text-sm text-on-surface-variant">
                                {job.userName} • {job.serviceType}
                              </p>
                              <p className="mt-1 text-sm text-on-surface-variant">{job.assignedTechnicianName}</p>
                            </div>
                            <StatusChip status={job.status} />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-[1.5rem] bg-surface-container-low p-4 text-sm text-on-surface-variant">
                        ไม่มีงานในวันดังกล่าว
                      </div>
                    )}
                  </div>
                </div>
              </section>
            ))
          ) : (
            <div className="surface-card rounded-[1.75rem] p-5 text-sm text-on-surface-variant">
              ยังไม่มีข้อมูล schedule ในตอนนี้
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
