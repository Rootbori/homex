import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, MessageCircle, PhoneCall } from "lucide-react";
import { Timeline } from "@/components/ui/timeline";
import { formatCurrency, jobStatusLabel } from "@/lib/format";
import { getUserJob } from "@/lib/server-data";

export default async function TrackingPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;
  const job = await getUserJob(id);

  if (!job) {
    notFound();
  }

  const progress = Math.max(
    15,
    ((job.timeline.filter((item) => item.done).length || 1) / job.timeline.length) * 100,
  );

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-black/[0.04] bg-white/80 backdrop-blur-xl">
        <div className="flex h-14 items-center gap-3 px-4">
          <Link href="/my-requests" className="text-on-surface-variant/50 hover:text-on-surface">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-bold text-on-surface">
              {jobStatusLabel[job.status]}
            </h1>
            <p className="text-[11px] text-on-surface-variant/40">{job.code}</p>
          </div>
          <span className="rounded-full bg-primary/5 px-2.5 py-1 text-[10px] font-bold text-primary">
            {job.paymentStatus}
          </span>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Progress bar */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container-low">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Technician card */}
        <div className="flex items-center gap-4 rounded-2xl bg-surface-container-low p-4">
          <div className="relative">
            <div
              className="h-14 w-14 overflow-hidden rounded-xl bg-surface-container"
              style={
                job.photos[0]?.image
                  ? { backgroundImage: `url(${job.photos[0].image})`, backgroundSize: "cover", backgroundPosition: "center" }
                  : undefined
              }
            />
            <div className="absolute -bottom-1 -right-1 rounded-md bg-primary p-0.5 text-white">
              <BadgeCheck className="h-3 w-3" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-on-surface">{job.assignedTechnicianName}</h3>
            <p className="text-xs text-on-surface-variant/50">{job.serviceType}</p>
          </div>
          <div className="flex gap-2">
            <a
              href={`tel:${job.phone}`}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white"
            >
              <PhoneCall className="h-4 w-4" />
            </a>
            <button className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-container text-on-surface-variant/50">
              <MessageCircle className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Timeline */}
        <section className="space-y-3">
          <h3 className="text-sm font-bold text-on-surface">ความคืบหน้า</h3>
          <Timeline items={job.timeline} />
        </section>

        {/* Details grid */}
        <section className="grid grid-cols-2 gap-2">
          <div className="col-span-2 rounded-xl bg-surface-container-low p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant/30">
              สถานที่
            </p>
            <p className="mt-1 text-sm font-medium text-on-surface">{job.address}</p>
          </div>
          <div className="rounded-xl bg-surface-container-low p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant/30">
              วันเวลา
            </p>
            <p className="mt-1 text-sm font-bold text-on-surface">{job.appointmentDate}</p>
            <p className="text-xs text-on-surface-variant/40">{job.appointmentTime}</p>
          </div>
          <div className="rounded-xl bg-primary/5 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-primary/40">
              ราคาสุทธิ
            </p>
            <p className="mt-1 text-lg font-extrabold text-primary">{formatCurrency(job.total)}</p>
          </div>
        </section>
      </main>
    </div>
  );
}
