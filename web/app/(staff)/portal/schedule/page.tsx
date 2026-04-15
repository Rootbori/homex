import { Badge } from "@/components/ui/badge";
import { ProfileBubble } from "@/components/shared/profile-bubble";
import { TopAppBar } from "@/components/shared/top-app-bar";
import { StatusChip } from "@/components/shared/status-chip";
import { jobs, technicians } from "@/lib/mock-data";

export default function SchedulePage() {
  return (
    <div>
      <TopAppBar
        title="Atmospheric"
        right={<ProfileBubble image={technicians[0]?.heroImage} />}
      />
      <main className="space-y-4 px-6 pb-24 pt-24">
        <section className="mb-6 pt-4">
          <span className="block text-sm font-bold uppercase tracking-widest text-primary">Schedule</span>
          <h1 className="headline-font text-3xl font-extrabold tracking-tight">ตารางงานช่าง</h1>
        </section>
        <div className="surface-card rounded-[2rem] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between gap-3">
            <p className="headline-font text-lg font-bold">Schedule</p>
            <div className="flex gap-2">
              <Badge>รายวัน</Badge>
              <Badge variant="muted">รายสัปดาห์</Badge>
            </div>
          </div>
          <p className="mt-3 text-sm text-on-surface-variant">
            โฟกัสเป็น time slot card แทน calendar desktop ขนาดใหญ่
          </p>
        </div>

        {["16 เม.ย. 2026", "17 เม.ย. 2026"].map((date) => (
          <div key={date} className="surface-card rounded-[2rem] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.02)]">
            <p className="mb-4 text-sm font-semibold text-on-surface">{date}</p>
            <div className="space-y-3">
              {jobs.map((job) => (
                <div key={`${date}-${job.id}`} className="rounded-[24px] bg-surface-container-low p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-on-surface">{job.appointmentTime}</p>
                      <p className="text-sm text-on-surface-variant">
                        {job.customerName} • {job.assignedTechnicianName}
                      </p>
                    </div>
                    <StatusChip status={job.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
