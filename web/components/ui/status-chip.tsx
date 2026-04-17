import { cn } from "@/lib/utils";
import type { JobStatus } from "@/lib/api-types";

const jobStatusLabel: Record<JobStatus, string> = {
  awaiting_shop: "รอร้านรับงาน",
  awaiting_quote: "รอใบเสนอราคา",
  awaiting_confirm: "รอยืนยัน",
  scheduled: "นัดหมายแล้ว",
  on_the_way: "กำลังไป",
  in_progress: "กำลังทำ",
  completed: "เสร็จแล้ว",
  cancelled: "ยกเลิก",
};

const jobStatusVariant: Record<JobStatus, "default" | "success" | "warning" | "muted"> = {
  awaiting_shop: "muted",
  awaiting_quote: "warning",
  awaiting_confirm: "warning",
  scheduled: "success",
  on_the_way: "default",
  in_progress: "default",
  completed: "success",
  cancelled: "muted",
};

export function StatusChip({ status }: Readonly<{ status: JobStatus }>) {
  const variant = jobStatusVariant[status];
  const label = jobStatusLabel[status];

  return (
    <span className={cn(
      "inline-flex h-6 items-center px-2.5 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm",
      variant === "success" && "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10",
      variant === "warning" && "bg-amber-50 text-amber-700 ring-1 ring-amber-600/10",
      variant === "default" && "bg-primary/5 text-primary ring-1 ring-primary/20",
      variant === "muted" && "bg-slate-50 text-slate-500 ring-1 ring-slate-400/10",
    )}>
      {label}
    </span>
  );
}
