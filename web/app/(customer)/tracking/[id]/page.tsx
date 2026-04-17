import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, MessageCircle, PhoneCall } from "lucide-react";
import { auth } from "@/auth";
import { ProfileBubble } from "@/components/shared/profile-bubble";
import { TopAppBar } from "@/components/shared/top-app-bar";
import { Timeline } from "@/components/shared/timeline";
import { Button } from "@/components/ui/button";
import { formatCurrency, jobStatusLabel } from "@/lib/format";
import { getCustomerJob } from "@/lib/server-data";

export default async function TrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, session] = await Promise.all([params, auth()]);
  const job = await getCustomerJob(id);

  if (!job) {
    notFound();
  }

  return (
    <div>
      <TopAppBar
        title="Atmospheric"
        left={
          <Link href="/my-requests" className="rounded-full p-2 text-primary transition-transform active:scale-95">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        }
        right={<ProfileBubble image={session?.user?.image ?? job.photos[0]?.image} />}
      />
      <main className="page-content-tight page-stack">
        <section className="surface-card section-stack rounded-[1.75rem] p-5 shadow-[0_-8px_32px_rgba(0,0,0,0.04)] md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-sm font-medium text-on-surface-variant">หมายเลขงาน {job.code}</span>
              <h1 className="headline-font mt-1 text-2xl font-bold text-primary">
                {jobStatusLabel[job.status]}
              </h1>
            </div>
            <div className="rounded-full bg-primary-container/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
              {job.paymentStatus}
            </div>
          </div>
          <div className="relative pt-2">
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-high">
              <div
                className="h-full rounded-full bg-[linear-gradient(to_right,var(--primary),var(--primary-container))]"
                style={{ width: `${Math.max(15, ((job.timeline.filter((item) => item.done).length || 1) / job.timeline.length) * 100)}%` }}
              />
            </div>
          </div>
        </section>

        <section className="flex items-center gap-4 rounded-[1.5rem] bg-surface-container-low p-5">
          <div className="relative">
            <div
              className="h-16 w-16 overflow-hidden rounded-2xl bg-surface-container-high shadow-sm"
              style={job.photos[0]?.image ? { backgroundImage: `url(${job.photos[0].image})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
            />
            <div className="absolute -bottom-1 -right-1 rounded-lg bg-primary p-1 text-white">
              <BadgeCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="headline-font font-bold text-on-surface">{job.assignedTechnicianName}</h3>
            <p className="text-sm text-on-surface-variant">{job.serviceType}</p>
            <div className="mt-3 flex gap-3">
              <a href={`tel:${job.phone}`} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary">
                <PhoneCall className="h-4 w-4" />
                ติดต่อร้าน
              </a>
              <button className="flex items-center gap-2 rounded-lg bg-secondary-container px-4 py-2 text-sm font-semibold text-on-secondary-container">
                <MessageCircle className="h-4 w-4" />
                แชท
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-[1.5rem] bg-surface-container-lowest p-5 md:p-6">
          <h2 className="headline-font mb-5 text-lg font-bold">ความคืบหน้า</h2>
          <Timeline items={job.timeline} />
        </section>

        <section className="grid grid-cols-2 gap-4">
          <div className="col-span-2 rounded-[1.5rem] bg-surface-container-low p-4">
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-on-surface-variant">สถานที่รับบริการ</p>
            <p className="text-sm font-medium text-on-surface">{job.address}</p>
          </div>
          <div className="rounded-[1.5rem] bg-surface-container-low p-4">
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-on-surface-variant">วันและเวลา</p>
            <p className="text-sm font-bold text-on-surface">{job.appointmentDate}</p>
            <p className="text-sm text-on-surface-variant">{job.appointmentTime}</p>
          </div>
          <div className="flex flex-col justify-center rounded-[1.5rem] bg-primary/5 p-4">
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-primary">ราคาสุทธิ</p>
            <p className="text-xl font-extrabold text-primary">{formatCurrency(job.total)}</p>
          </div>
        </section>

        <Button className="h-14 w-full text-base font-bold">ดูใบเสนอราคา</Button>
      </main>
    </div>
  );
}
