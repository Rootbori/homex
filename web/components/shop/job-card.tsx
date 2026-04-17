import Link from "next/link";
import { ChevronRight, PhoneCall } from "lucide-react";
import { StatusChip } from "@/components/shared/status-chip";
import type { JobSummary } from "@/lib/api-types";
import { formatCurrency } from "@/lib/format";

export function JobCard({ job }: Readonly<{ job: JobSummary }>) {
  return (
    <Link
      href={`/portal/jobs/${job.id}`}
      className="group flex items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-black/[0.04] transition-all hover:shadow-md active:scale-[0.99]"
    >
      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-[15px] font-bold text-on-surface">คุณ{job.userName}</span>
          <StatusChip status={job.status} />
        </div>
        <p className="mt-0.5 text-xs text-on-surface-variant/50">
          {job.serviceType} • {job.area}
        </p>
        <div className="mt-2 flex items-center gap-4 text-xs">
          <span className="text-on-surface-variant/40">
            {job.appointmentDate} {job.appointmentTime}
          </span>
          <span className="font-bold text-on-surface">{formatCurrency(job.total)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <a
          href={`tel:${job.phone}`}
          onClick={(e) => e.stopPropagation()}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-container-low text-on-surface-variant/40 transition-colors hover:bg-surface-container"
        >
          <PhoneCall className="h-4 w-4" />
        </a>
        <ChevronRight className="h-4 w-4 text-on-surface-variant/20 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
