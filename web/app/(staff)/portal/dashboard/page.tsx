import { Plus } from "lucide-react";
import { LeadCard } from "@/components/shop/lead-card";
import { JobCard } from "@/components/shop/job-card";
import { Badge } from "@/components/ui/badge";
import { ProfileBubble } from "@/components/shared/profile-bubble";
import { TopAppBar } from "@/components/shared/top-app-bar";
import { formatCurrency } from "@/lib/format";
import { getDashboard } from "@/lib/server-data";

export default async function DashboardPage() {
  const dashboard = await getDashboard();

  return (
    <div>
      <TopAppBar title="Atmospheric" right={<ProfileBubble />} />
      <main className="page-content page-stack">
        <section className="page-hero">
          <p className="mb-1 text-sm font-medium text-on-surface-variant">สรุปภาพรวมร้าน</p>
          <h2 className="headline-font text-4xl font-extrabold leading-tight tracking-tight text-on-surface">
            ภาพรวมงาน
            <br />
            ประจำวันนี้
          </h2>
        </section>

        <div className="grid grid-cols-2 gap-3.5 md:gap-4">
          {dashboard.kpis.map((item, index) => {
            const classes = [
              "bg-surface-container-lowest text-primary",
              "bg-primary-container text-on-primary",
              "bg-tertiary-fixed text-[#351000]",
              "bg-surface-container-high text-on-surface",
              "bg-secondary-container text-on-secondary-container",
            ];

            return (
              <div
                key={item.label}
                className={`flex min-h-32 flex-col justify-between rounded-3xl p-5 ${classes[index] ?? "bg-surface-container-lowest"}`}
              >
                <div className="text-3xl">{index === 0 ? "◎" : index === 1 ? "◔" : index === 2 ? "◫" : index === 3 ? "◌" : "◉"}</div>
                <div>
                  <p className={index === 4 ? "mb-1 text-2xl font-bold leading-tight" : "mb-1 text-[2.6rem] font-bold leading-none"}>
                    {index === 4 ? formatCurrency(Number(item.value)) : item.value}
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-wider opacity-80">{item.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        <section className="section-stack">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="headline-font text-2xl font-bold tracking-tight">งานด่วนวันนี้</h3>
            <span className="text-sm font-semibold text-primary">ดูทั้งหมด</span>
          </div>
          <div className="no-scrollbar -mx-5 flex gap-4 overflow-x-auto px-5 pb-2 md:-mx-6 md:px-6">
            {dashboard.urgentJobs.length > 0 ? (
              dashboard.urgentJobs.map((item) => (
                <div
                  key={item.code}
                  className="min-w-[280px] rounded-3xl border border-border/10 bg-surface-container-lowest p-5 md:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.02)]"
                >
                  <div className="mb-6 flex items-start justify-between">
                    <Badge variant="warning">Urgent</Badge>
                    <p className="text-xs font-medium text-on-surface-variant">{item.time} น.</p>
                  </div>
                  <h4 className="mb-1 text-lg font-bold">{item.code}</h4>
                  <p className="mb-6 text-sm leading-relaxed text-on-surface-variant">
                    {item.customer}
                    <br />
                    สถานะ {item.status}
                  </p>
                </div>
              ))
            ) : (
              <div className="min-w-[280px] rounded-3xl border border-border/10 bg-surface-container-lowest p-5 text-sm text-on-surface-variant">
                ไม่มีงานด่วนในตอนนี้
              </div>
            )}
          </div>
        </section>

        <section className="card-stack">
          <p className="text-sm font-semibold text-on-surface">งานวันนี้</p>
          {dashboard.todayJobs.length > 0 ? (
            dashboard.todayJobs.map((job) => <JobCard key={job.id} job={job} />)
          ) : (
            <div className="surface-card rounded-[1.75rem] p-5 text-sm text-on-surface-variant">ไม่มีงานในคิววันนี้</div>
          )}
        </section>

        <section className="card-stack">
          <p className="text-sm font-semibold text-on-surface">ผู้สนใจล่าสุด (Leads)</p>
          {dashboard.latestLeads.length > 0 ? (
            dashboard.latestLeads.map((lead) => <LeadCard key={lead.id} lead={lead} />)
          ) : (
            <div className="surface-card rounded-[1.75rem] p-5 text-sm text-on-surface-variant">ยังไม่มี lead ล่าสุด</div>
          )}
        </section>
      </main>

      <button className="atmospheric-glow fixed bottom-28 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--primary-container)_0%,var(--primary)_100%)] text-on-primary transition-transform active:scale-90">
        <Plus className="h-7 w-7" />
      </button>
    </div>
  );
}
