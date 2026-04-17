import { StatusChip } from "@/components/shared/status-chip";
import { getSchedule } from "@/lib/server-data";

export default async function SchedulePage() {
  const days = await getSchedule();

  return (
    <div className="mx-auto max-w-3xl">
      <header className="sticky top-0 z-50 border-b border-black/[0.04] bg-white/80 backdrop-blur-xl">
        <div className="flex h-14 items-center px-4">
          <h1 className="text-base font-bold text-on-surface">ตารางงาน</h1>
        </div>
      </header>

      <main className="px-4 py-6 space-y-4">
        {days.length > 0 ? (
          days.map((day) => (
            <section key={day.date} className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-on-surface">{day.date}</h2>
                <span className="text-xs text-on-surface-variant/30">{day.jobs.length} งาน</span>
              </div>
              {day.jobs.length > 0 ? (
                <div className="space-y-1.5">
                  {day.jobs.map((job) => (
                    <div
                      key={`${day.date}-${job.id}`}
                      className="flex items-center gap-3 rounded-xl bg-surface-container-low p-3"
                    >
                      <span className="text-sm font-bold text-primary">{job.appointmentTime}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-on-surface">
                          {job.userName}
                        </p>
                        <p className="text-xs text-on-surface-variant/40">
                          {job.serviceType} • {job.assignedTechnicianName}
                        </p>
                      </div>
                      <StatusChip status={job.status} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-on-surface-variant/30">ไม่มีงาน</p>
              )}
            </section>
          ))
        ) : (
          <p className="py-16 text-center text-sm text-on-surface-variant/30">
            ยังไม่มีข้อมูลตารางงาน
          </p>
        )}
      </main>
    </div>
  );
}
