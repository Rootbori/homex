import { Badge } from "@/components/ui/badge";
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

export function StatusChip({ status }: { status: JobStatus }) {
  return <Badge variant={jobStatusVariant[status]}>{jobStatusLabel[status]}</Badge>;
}
