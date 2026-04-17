import Link from "next/link";
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
  const hour = new Date().getHours();
  let greeting: string;
  if (hour < 12) {
    greeting = "อรุณสวัสดิ์";
  } else if (hour < 18) {
    greeting = "สวัสดีตอนบ่าย";
  } else {
    greeting = "สวัสดีตอนเย็น";
  }

  return (
    <div className="animate-in">
      <TopAppBar title="Homex Portal" right={<ProfileBubble />} />
      <main className="page-content page-stack">
        <section className="page-hero">
          <Badge className="w-fit mb-2" variant="default">
            Dashboard Mode
          </Badge>
          <h2 className="headline-font text-5xl font-extrabold leading-[1.05] tracking-tighter text-on-surface">
            {greeting}
            <br />
            <span className="text-primary italic">ภาพรวมวันนี้ของคุณ</span>
          </h2>
        </section>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">
          {dashboard.kpis.map((item, index) => {
            const colors = [
              "bg-primary text-white atmospheric-glow",
              "bg-secondary text-white shadow-lg",
              "bg-white text-on-surface ring-1 ring-black/5",
              "bg-white text-on-surface ring-1 ring-black/5",
              "bg-emerald-500 text-white shadow-lg sm:col-span-2 lg:col-span-1",
            ];

            const getIcon = (idx: number) => {
              switch (idx) {
                case 0:
                  return "★";
                case 1:
                  return "⚡";
                case 2:
                  return "▧";
                case 3:
                  return "✓";
                default:
                  return "฿";
              }
            };

            return (
              <div
                key={item.label}
                className={`flex flex-col justify-between rounded-[2rem] p-6 transition-transform hover:scale-[1.02] ${colors[index] ?? "bg-white"}`}
              >
                <div className="text-2xl opacity-80">{getIcon(index)}</div>
                <div className="mt-4">
                  <p className="text-3xl font-black leading-none tracking-tighter">
                    {index === 4
                      ? formatCurrency(Number(item.value))
                      : item.value}
                  </p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-widest opacity-70">
                    {item.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <section className="mt-4">
          <div className="mb-6 flex items-baseline justify-between px-1">
            <h3 className="headline-font text-2xl font-extrabold tracking-tight">
              งานด่วนต้องรีบทำ
            </h3>
            <Link
              href="/portal/jobs"
              className="text-sm font-bold text-primary hover:underline italic"
            >
              ดูงานทั้งหมด →
            </Link>
          </div>
          <div className="no-scrollbar -mx-5 flex gap-5 overflow-x-auto px-5 pb-6 md:-mx-8 md:px-8">
            {dashboard.urgentJobs.length > 0 ? (
              dashboard.urgentJobs.map((item) => (
                <div
                  key={item.code}
                  className="premium-card min-w-[300px] p-7 ring-1 ring-black/5"
                >
                  <div className="mb-8 flex items-start justify-between">
                    <div className="flex flex-col gap-1">
                      <Badge variant="warning" className="w-fit">
                        Urgent Case
                      </Badge>
                      <span className="text-[10px] font-bold text-on-surface-variant/40 tracking-tighter uppercase">
                        Needs action
                      </span>
                    </div>
                    <p className="text-lg font-black text-primary">
                      {item.time}
                    </p>
                  </div>
                  <h4 className="mb-1 text-2xl font-extrabold tracking-tighter italic">
                    {item.code}
                  </h4>
                  <p className="mb-8 text-base font-medium text-on-surface-variant leading-tight">
                    คุณ{item.user}
                    <br />
                    <span className="text-sm font-bold text-amber-600 truncate max-w-[200px] block">
                      สถานะ: {item.status}
                    </span>
                  </p>
                  <div className="flex gap-2">
                    <button className="flex-1 h-11 rounded-xl bg-surface-container text-xs font-bold hover:bg-surface-container-high transition-colors">
                      ข้าม
                    </button>
                    <button className="flex-1 h-11 rounded-xl bg-on-surface text-white text-xs font-bold shadow-lg active:scale-95">
                      ดูรายละเอียด
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="premium-card w-full p-10 flex flex-col items-center justify-center border-dashed border-2 border-black/5 bg-transparent shadow-none">
                <p className="text-sm font-bold text-on-surface-variant/40">
                  ยังไม่มีงานเร่งด่วนในตอนนี้
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
          <div className="card-stack">
            <div className="flex items-center justify-between px-1">
              <p className="text-sm font-black uppercase tracking-widest text-on-surface-variant/60">
                งานในคิววันนี้
              </p>
              <span className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">
                {dashboard.todayJobs.length}
              </span>
            </div>
            {dashboard.todayJobs.length > 0 ? (
              dashboard.todayJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))
            ) : (
              <div className="premium-card p-10 text-center bg-surface-container-low border-none">
                <p className="text-sm font-bold text-on-surface-variant">
                  วันนี้ยังไม่มีงานในระบบ
                </p>
              </div>
            )}
          </div>

          <div className="card-stack">
            <div className="flex items-center justify-between px-1">
              <p className="text-sm font-black uppercase tracking-widest text-on-surface-variant/60">
                ลีดล่าสุด
              </p>
              <span className="h-5 w-5 rounded-full bg-secondary/10 flex items-center justify-center text-[10px] font-black text-secondary">
                {dashboard.latestLeads.length}
              </span>
            </div>
            {dashboard.latestLeads.length > 0 ? (
              dashboard.latestLeads.map((lead) => (
                <LeadCard key={lead.id} lead={lead} />
              ))
            ) : (
              <div className="premium-card p-10 text-center bg-surface-container-low border-none">
                <p className="text-sm font-bold text-on-surface-variant">
                  ยังไม่มีลีดใหม่ส่งมาให้นะครับ
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <button className="atmospheric-glow fixed bottom-28 right-8 z-50 flex h-16 w-16 items-center justify-center rounded-2xl bg-on-surface text-white transition-all hover:scale-110">
        <Plus className="h-8 w-8" />
      </button>
    </div>
  );
}
