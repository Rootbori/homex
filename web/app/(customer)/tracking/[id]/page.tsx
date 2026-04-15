import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, MessageCircle, PhoneCall } from "lucide-react";
import { ProfileBubble } from "@/components/shared/profile-bubble";
import { TopAppBar } from "@/components/shared/top-app-bar";
import { Timeline } from "@/components/shared/timeline";
import { Button } from "@/components/ui/button";
import { formatCurrency, getJob, getTechnicianById } from "@/lib/mock-data";

export default async function TrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = getJob(id);

  if (!job) {
    notFound();
  }

  const technician = getTechnicianById(job.assignedTechnicianId);

  return (
    <div>
      <TopAppBar
        title="Atmospheric"
        left={
          <button className="rounded-full p-2 text-primary transition-transform active:scale-95">
            <ArrowLeft className="h-5 w-5" />
          </button>
        }
        right={<ProfileBubble image={technician?.heroImage ?? job.photos[0]?.image} />}
      />
      <main className="mt-20 space-y-6 px-6">
        <section className="surface-card space-y-4 rounded-xl p-6 shadow-[0_-8px_32px_rgba(0,0,0,0.04)]">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-sm font-medium text-on-surface-variant">หมายเลขงาน {job.code}</span>
              <h1 className="headline-font mt-1 text-2xl font-bold text-primary">
                ช่างกำลังเดินทาง
              </h1>
            </div>
            <div className="rounded-full bg-primary-container/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
              In Progress
            </div>
          </div>
          <div className="relative pt-2">
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-high">
              <div className="h-full w-3/4 rounded-full bg-[linear-gradient(to_right,var(--primary),var(--primary-container))]" />
            </div>
            <div className="mt-2 flex justify-between text-[10px] font-bold uppercase tracking-tighter text-on-surface-variant">
              <span>เริ่มงาน</span>
              <span>75% สำเร็จ</span>
            </div>
          </div>
        </section>

        <section className="flex items-center gap-4 rounded-xl bg-surface-container-low p-5">
          <div className="relative">
            <div
              className="h-16 w-16 overflow-hidden rounded-2xl shadow-sm"
              style={{
                backgroundImage: `url(${technician?.heroImage ?? job.photos[0]?.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <div className="absolute -bottom-1 -right-1 rounded-lg bg-primary p-1 text-white">
              <BadgeCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="headline-font font-bold text-on-surface">{job.assignedTechnicianName}</h3>
            <p className="text-sm text-on-surface-variant">ผู้เชี่ยวชาญระบบปรับอากาศ (5.0 ★)</p>
            <div className="mt-3 flex gap-3">
              <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary">
                <PhoneCall className="h-4 w-4" />
                ติดต่อช่าง
              </button>
              <button className="flex items-center gap-2 rounded-lg bg-secondary-container px-4 py-2 text-sm font-semibold text-on-secondary-container">
                <MessageCircle className="h-4 w-4" />
                แชท
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-xl bg-surface-container-lowest p-6">
          <h2 className="headline-font mb-6 text-lg font-bold">ความคืบหน้า</h2>
          <Timeline items={job.timeline} />
        </section>

        <section className="grid grid-cols-2 gap-4">
          <div className="col-span-2 rounded-xl bg-surface-container-low p-4">
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              สถานที่รับบริการ
            </p>
            <p className="text-sm font-medium text-on-surface">{job.address}</p>
          </div>
          <div className="rounded-xl bg-surface-container-low p-4">
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              วันและเวลา
            </p>
            <p className="text-sm font-bold text-on-surface">{job.appointmentDate}</p>
            <p className="text-sm text-on-surface-variant">{job.appointmentTime}</p>
          </div>
          <div className="flex flex-col justify-center rounded-xl bg-primary/5 p-4">
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-primary">ราคาสุทธิ</p>
            <p className="text-xl font-extrabold text-primary">{formatCurrency(job.total)}</p>
          </div>
        </section>

        <Button className="mb-10 h-14 w-full text-lg font-bold">ดูใบเสนอราคา</Button>
      </main>
    </div>
  );
}
