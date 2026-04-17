import Link from "next/link";
import { ChevronRight, Snowflake } from "lucide-react";
import { LeadCard } from "@/components/shop/lead-card";
import { JobCard } from "@/components/shop/job-card";
import { formatCurrency } from "@/lib/format";
import { getDashboard } from "@/lib/server-data";

export default async function DashboardPage() {
  const dashboard = await getDashboard();
  const hour = new Date().getHours();
  
  let greeting = "อรุณสวัสดิ์";
  if (hour >= 12 && hour < 18) {
    greeting = "สวัสดีตอนบ่าย";
  } else if (hour >= 18) {
    greeting = "สวัสดีตอนเย็น";
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-black/[0.04] bg-white/80 backdrop-blur-xl">
        <div className="flex h-14 items-center gap-3 px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
            <Snowflake className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-bold text-on-surface">Homex Portal</span>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-extrabold text-on-surface">{greeting}</h1>
          <p className="mt-1 text-sm text-on-surface-variant/50">ภาพรวมธุรกิจของคุณวันนี้</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {dashboard.kpis.map((item, index) => {
            const styles = [
              "bg-gradient-to-br from-blue-500 to-indigo-600 text-white",
              "bg-gradient-to-br from-amber-500 to-orange-600 text-white",
              "bg-surface-container-low text-on-surface",
              "bg-surface-container-low text-on-surface",
              "bg-emerald-50 text-emerald-700",
            ];
            return (
              <div
                key={item.label}
                className={`rounded-2xl p-4 ${styles[index] ?? "bg-surface-container-low text-on-surface"}`}
              >
                <p className="text-2xl font-extrabold leading-none">
                  {index === 4 ? formatCurrency(Number(item.value)) : item.value}
                </p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider opacity-60">
                  {item.label}
                </p>
              </div>
            );
          })}
        </div>

        {/* Urgent jobs carousel */}
        {dashboard.urgentJobs.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-on-surface">งานเร่งด่วน</h2>
              <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-500">
                {dashboard.urgentJobs.length}
              </span>
            </div>
            <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
              {dashboard.urgentJobs.map((item) => (
                <div
                  key={item.code}
                  className="min-w-[240px] rounded-2xl bg-red-50 p-4 ring-1 ring-red-100"
                >
                  <p className="text-xs font-bold text-red-400">{item.time}</p>
                  <p className="mt-1 text-base font-extrabold text-on-surface">{item.code}</p>
                  <p className="mt-0.5 text-sm text-on-surface-variant/60">
                    คุณ{item.user} — {item.status}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Today's jobs */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-on-surface">งานวันนี้</h2>
            <Link href="/portal/jobs" className="flex items-center gap-1 text-xs font-semibold text-primary">
              ทั้งหมด <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          {dashboard.todayJobs.length > 0 ? (
            <div className="space-y-2">
              {dashboard.todayJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-on-surface-variant/30">
              วันนี้ยังไม่มีงาน
            </p>
          )}
        </section>

        {/* Latest leads */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-on-surface">ลีดล่าสุด</h2>
            <Link href="/portal/leads" className="flex items-center gap-1 text-xs font-semibold text-primary">
              ทั้งหมด <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          {dashboard.latestLeads.length > 0 ? (
            <div className="space-y-2">
              {dashboard.latestLeads.map((lead) => (
                <LeadCard key={lead.id} lead={lead} />
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-on-surface-variant/30">
              ยังไม่มีลีดใหม่
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
