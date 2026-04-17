import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ImagePlus, Send } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { TopAppBar } from "@/components/shared/top-app-bar";
import { formatCurrency, jobStatusLabel } from "@/lib/format";
import { getJob } from "@/lib/server-data";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await getJob(id);

  if (!job) {
    notFound();
  }

  return (
    <div>
      <TopAppBar
        title={job.code}
        left={
          <Link href="/portal/jobs" className="rounded-full p-2 text-primary transition-transform active:scale-95">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        }
        right={
          <div className="rounded-full bg-secondary-container px-3 py-1 text-[12px] font-bold uppercase tracking-wider text-on-secondary-container">
            {jobStatusLabel[job.status]}
          </div>
        }
      />
      <main className="page-content page-stack-lg">
        <section className="relative overflow-hidden rounded-[1.75rem] bg-surface-container-low p-5 md:p-6">
          <div className="relative z-10">
            <p className="mb-1 text-sm font-medium text-on-surface-variant">Customer Details</p>
            <h1 className="headline-font mb-4 text-3xl font-extrabold leading-tight text-on-surface">
              {job.customerName}
            </h1>
            <div className="grid grid-cols-2 gap-3">
              <a href={`tel:${job.phone}`} className="flex h-[56px] items-center justify-center rounded-xl bg-primary font-semibold text-on-primary">
                โทรออก
              </a>
              <a
                href={job.mapUrl ?? "https://maps.google.com"}
                className="flex h-[56px] items-center justify-center rounded-xl bg-surface-container-lowest font-semibold text-primary shadow-sm"
              >
                นำทาง
              </a>
            </div>
          </div>
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />
        </section>

        <section className="surface-card rounded-[1.75rem] p-5 ambient-shadow md:p-6">
          <div className="section-stack">
            <h2 className="text-lg font-bold text-on-surface">ข้อมูลงาน</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-3xl bg-surface-container-low p-5">
                <p className="mb-1 text-xs font-medium uppercase tracking-widest text-on-surface-variant">บริการ</p>
                <p className="text-lg font-bold text-on-surface">{job.serviceType}</p>
              </div>
              <div className="rounded-3xl bg-surface-container-low p-5">
                <p className="mb-1 text-xs font-medium uppercase tracking-widest text-on-surface-variant">สถานะชำระเงิน</p>
                <p className="text-lg font-bold text-on-surface">{job.paymentStatus}</p>
              </div>
              <div className="col-span-2 rounded-3xl border border-border/10 bg-surface-container-lowest p-5">
                <p className="mb-2 text-xs font-medium uppercase tracking-widest text-on-surface-variant">อาการ / Symptoms</p>
                <p className="text-base leading-relaxed text-on-surface">{job.symptom}</p>
              </div>
              <div className="col-span-2 rounded-3xl border border-border/10 bg-surface-container-lowest p-5">
                <p className="mb-2 text-xs font-medium uppercase tracking-widest text-on-surface-variant">ที่อยู่</p>
                <p className="text-base leading-relaxed text-on-surface">{job.address}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="surface-card rounded-[1.75rem] p-5 ambient-shadow md:p-6">
          <div className="section-stack">
            <h2 className="text-lg font-bold text-on-surface">รูปหน้างาน</h2>
            <div className="grid grid-cols-3 gap-3">
              {job.photos.length > 0 ? (
                job.photos.map((photo) => (
                  <div
                    key={`${photo.kind ?? "photo"}-${photo.image}`}
                    className="aspect-square overflow-hidden rounded-2xl bg-surface-container-high"
                    style={{
                      backgroundImage: `url(${photo.image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                ))
              ) : (
                <div className="col-span-3 rounded-2xl bg-surface-container-low p-4 text-sm text-on-surface-variant">
                  ยังไม่มีรูปหน้างาน
                </div>
              )}
              <div className="relative flex aspect-square items-center justify-center rounded-2xl bg-surface-container-highest">
                <ImagePlus className="h-8 w-8 text-on-surface-variant" />
              </div>
            </div>
          </div>
        </section>

        <section className="section-stack">
          <h2 className="px-1 text-lg font-bold text-on-surface">ใบเสนอราคาและผู้รับงาน</h2>
          <div className="space-y-4">
            <div className="rounded-3xl bg-surface-container-low p-6">
              <div className="space-y-4">
                {job.quoteItems.length > 0 ? (
                  job.quoteItems.map((item) => (
                    <div key={item.label} className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-on-surface">{item.label}</p>
                        <p className="text-xs text-on-surface-variant">จำนวน {item.qty}</p>
                      </div>
                      <p className="text-sm font-bold text-primary">{formatCurrency(item.amount)}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-on-surface-variant">ยังไม่มีรายการใบเสนอราคา</div>
                )}
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-border/20 pt-5">
                <p className="text-sm font-semibold text-on-surface-variant">ยอดรวม</p>
                <p className="headline-font text-2xl font-extrabold text-on-surface">{formatCurrency(job.total)}</p>
              </div>
            </div>

            <div className="rounded-3xl border border-border/10 bg-surface-container-lowest p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-surface-container-low p-4">
                  <p className="text-xs font-medium uppercase tracking-widest text-on-surface-variant">Assigned Technician</p>
                  <p className="mt-1 text-sm font-bold text-on-surface">{job.assignedTechnicianName}</p>
                </div>
                <div className="rounded-2xl bg-surface-container-low p-4">
                  <p className="text-xs font-medium uppercase tracking-widest text-on-surface-variant">นัดหมาย</p>
                  <p className="mt-1 text-sm font-bold text-on-surface">{job.appointmentDate}</p>
                  <p className="text-sm text-on-surface-variant">{job.appointmentTime}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="surface-card rounded-[1.75rem] p-5 ambient-shadow md:p-6">
          <div className="section-stack">
            <h2 className="px-1 text-lg font-bold text-on-surface">ไทม์ไลน์งาน</h2>
            <div className="space-y-4">
              {job.timeline.map((item, index) => (
                <div key={`${item.label}-${index}`} className="flex gap-4 rounded-2xl bg-surface-container-low p-4">
                  <div className={`mt-0.5 h-4 w-4 rounded-full ${item.done ? "bg-primary" : "border-2 border-outline-variant"}`} />
                  <div>
                    <p className="text-sm font-bold text-on-surface">{item.label}</p>
                    <p className="mt-1 text-xs text-on-surface-variant">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <div className="glass-bar sticky-action-bar fixed bottom-0 left-0 z-50 w-full">
        <div className="mx-auto max-w-md">
          <button className={`${buttonVariants({ size: "lg" })} h-14 w-full text-base font-bold`}>
            ปิดงาน (Complete Job)
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
