import Link from "next/link";
import { PhoneCall } from "lucide-react";
import { StatusChip } from "@/components/shared/status-chip";
import type { JobSummary } from "@/lib/api-types";
import { formatCurrency } from "@/lib/format";

export function JobCard({ job }: Readonly<{ job: JobSummary }>) {
  return (
    <div className="premium-card p-6 border-none ring-1 ring-black/[0.03] transition-all hover:scale-[1.01]">
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="headline-font text-xl font-extrabold tracking-tight text-on-surface">คุณ{job.userName}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">{job.code}</p>
          </div>
          <StatusChip status={job.status} />
        </div>

        <div className="grid grid-cols-2 gap-y-4 gap-x-6">
           <div className="flex flex-col">
             <span className="text-[10px] font-bold uppercase tracking-tighter text-on-surface-variant/50">ประเภทงาน</span>
             <span className="text-sm font-bold text-on-surface">{job.serviceType}</span>
           </div>
           <div className="flex flex-col">
             <span className="text-[10px] font-bold uppercase tracking-tighter text-on-surface-variant/50">เวลานัดหมาย</span>
             <span className="text-sm font-bold text-primary italic">{job.appointmentDate} • {job.appointmentTime}</span>
           </div>
           <div className="flex flex-col col-span-2">
             <span className="text-[10px] font-bold uppercase tracking-tighter text-on-surface-variant/50">สถานที่</span>
             <span className="text-sm font-bold text-on-surface line-clamp-1">{job.area}</span>
           </div>
        </div>

        <div className="flex items-center justify-between border-t border-black/5 pt-5">
           <div className="flex flex-col">
             <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/40">ค่าใช้จ่าย</span>
             <span className="text-2xl font-black text-on-surface italic">{formatCurrency(job.total)}</span>
           </div>
           <div className="flex gap-2">
              <a href={`tel:${job.phone}`} className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-container text-on-surface transition-colors hover:bg-surface-container-high ring-1 ring-black/[0.02]">
                <PhoneCall className="h-4 w-4" />
              </a>
              <Link href={`/portal/jobs/${job.id}`} className="flex h-11 px-6 items-center justify-center rounded-xl bg-primary text-white text-sm font-bold atmospheric-glow">
                รายละเอียด
              </Link>
           </div>
        </div>
      </div>
    </div>
  );
}
