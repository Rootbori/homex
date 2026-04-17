import type { JobStatus } from "@/lib/api-types";

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateLabel(value: string) {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

export function formatTimeLabel(value: string) {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

export const jobStatusLabel: Record<JobStatus, string> = {
  awaiting_shop: "รอร้านรับงาน",
  awaiting_quote: "รอใบเสนอราคา",
  awaiting_confirm: "รอยืนยัน",
  scheduled: "นัดหมายแล้ว",
  on_the_way: "กำลังไป",
  in_progress: "กำลังทำ",
  completed: "เสร็จแล้ว",
  cancelled: "ยกเลิก",
};
