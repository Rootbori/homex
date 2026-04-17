import Link from "next/link";
import { ArrowUpRight, MapPin, PhoneCall } from "lucide-react";
import { StatusChip } from "@/components/shared/status-chip";
import { buttonVariants } from "@/components/ui/button";
import type { JobSummary } from "@/lib/api-types";
import { formatCurrency } from "@/lib/format";

export function JobCard({ job }: { job: JobSummary }) {
  return (
    <div className="surface-card rounded-[1.75rem] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.02)]">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="headline-font text-lg font-bold text-on-surface">{job.customerName}</p>
            <p className="text-sm text-on-surface-variant">{job.code}</p>
          </div>
          <StatusChip status={job.status} />
        </div>

        <div className="space-y-2 text-sm text-on-surface-variant">
          <p>{job.serviceType}</p>
          <p>
            {job.appointmentDate} • {job.appointmentTime}
          </p>
          <p>{job.area}</p>
          <p className="font-medium text-on-surface">{formatCurrency(job.total)}</p>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <a href={`tel:${job.phone}`} className={buttonVariants({ variant: "outline" })}>
            <PhoneCall className="h-4 w-4" />
          </a>
          <a href={job.mapUrl ?? "https://maps.google.com"} className={buttonVariants({ variant: "outline" })}>
            <MapPin className="h-4 w-4" />
          </a>
          <Link href={`/portal/jobs/${job.id}`} className={buttonVariants()}>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
