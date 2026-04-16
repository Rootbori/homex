import { notFound } from "next/navigation";
import { ArrowLeft, ImagePlus, Send } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { TopAppBar } from "@/components/shared/top-app-bar";
import { formatCurrency, getJob, getTechnicianById } from "@/lib/mock-data";

export default async function JobDetailPage({
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
        title={job.code}
        left={
          <button className="rounded-full p-2 text-primary transition-transform active:scale-95">
            <ArrowLeft className="h-5 w-5" />
          </button>
        }
        right={
          <div className="rounded-full bg-secondary-container px-3 py-1 text-[12px] font-bold uppercase tracking-wider text-on-secondary-container">
            In Progress
          </div>
        }
      />
      <main className="page-content page-stack-lg">
        <section className="relative overflow-hidden rounded-[1.75rem] bg-surface-container-low p-5 md:p-6">
          <div className="relative z-10">
            <p className="mb-1 text-sm font-medium text-on-surface-variant">Customer Details</p>
            <h1 className="headline-font mb-6 text-3xl font-extrabold leading-tight text-on-surface">
              {job.customerName}
            </h1>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex h-[56px] items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-on-primary">
                โทรออก
              </button>
              <button className="flex h-[56px] items-center justify-center gap-2 rounded-xl bg-surface-container-lowest font-semibold text-primary shadow-sm">
                นำทาง
              </button>
            </div>
          </div>
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />
        </section>

        <section className="section-stack">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-bold text-on-surface">แชทกับลูกค้า</h2>
            <button className="text-sm font-semibold text-primary">ดูทั้งหมด</button>
          </div>
          <div className="rounded-3xl border border-border/10 bg-surface-container-lowest p-5 shadow-sm">
            <div className="mb-6 space-y-4">
              <div className="flex flex-col items-start">
                <div className="max-w-[85%] rounded-2xl rounded-tl-none bg-surface-container-low px-4 py-2 text-sm text-on-surface">
                  สวัสดีครับ ผมกำลังเข้าไปดูแลแอร์ให้ครับ
                </div>
                <p className="ml-1 mt-1 text-[10px] text-on-surface-variant">10:40 น.</p>
              </div>
              <div className="flex flex-col items-end">
                <div className="max-w-[85%] rounded-2xl rounded-tr-none bg-primary px-4 py-2 text-sm text-on-primary">
                  รับทราบค่ะ เข้ามาได้เลยค่ะ
                </div>
                <p className="mr-1 mt-1 text-[10px] text-on-surface-variant">10:42 น.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-11 flex-1 items-center rounded-xl bg-surface-container-low px-4">
                <input
                  className="w-full border-none bg-transparent p-0 text-sm text-on-surface outline-none"
                  placeholder="ส่งข้อความด่วน..."
                  type="text"
                />
              </div>
              <button className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-on-primary transition-transform active:scale-95">
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </section>

        <section className="section-stack">
          <h2 className="mb-4 text-lg font-bold text-on-surface">ข้อมูลเครื่องปรับอากาศ</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 rounded-3xl border border-border/10 bg-surface-container-lowest p-5">
              <p className="mb-2 text-xs font-medium uppercase tracking-widest text-on-surface-variant">
                อาการเสีย / Symptoms
              </p>
              <p className="text-lg font-medium leading-relaxed text-on-surface">{job.symptom}</p>
            </div>
            <div className="rounded-3xl bg-surface-container-low p-5">
              <p className="mb-1 text-xs font-medium uppercase tracking-widest text-on-surface-variant">
                แบรนด์
              </p>
              <p className="text-xl font-bold text-on-surface">DAIKIN</p>
            </div>
            <div className="rounded-3xl bg-surface-container-low p-5">
              <p className="mb-1 text-xs font-medium uppercase tracking-widest text-on-surface-variant">
                ขนาด
              </p>
              <p className="text-xl font-bold text-on-surface">18,000 BTU</p>
            </div>
            <div className="col-span-2 grid grid-cols-3 gap-2">
              {job.photos.map((photo) => (
                <div
                  key={photo.label}
                  className="aspect-square overflow-hidden rounded-2xl"
                  style={{
                    backgroundImage: `url(${photo.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
              ))}
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
                {job.quoteItems.map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-on-surface">{item.label}</p>
                      <p className="text-xs text-on-surface-variant">จำนวน {item.qty} เครื่อง</p>
                    </div>
                    <p className="text-sm font-bold text-primary">{formatCurrency(item.amount)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-border/20 pt-5">
                <p className="text-sm font-semibold text-on-surface-variant">ยอดรวม</p>
                <p className="headline-font text-2xl font-extrabold text-on-surface">
                  {formatCurrency(job.total)}
                </p>
              </div>
            </div>

            {technician ? (
              <div className="rounded-3xl border border-border/10 bg-surface-container-lowest p-5">
                <div className="flex items-center gap-4">
                  <div
                    className="h-16 w-16 rounded-2xl bg-surface-container-high"
                    style={{
                      backgroundImage: `url(${technician.gallery[0] ?? technician.heroImage})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  <div className="flex-1">
                    <p className="text-xs font-medium uppercase tracking-widest text-on-surface-variant">
                      Assigned Technician
                    </p>
                    <p className="text-lg font-bold text-on-surface">{technician.name}</p>
                    <p className="text-sm text-on-surface-variant">{technician.shopName}</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-surface-container-low p-4">
                    <p className="text-xs font-medium uppercase tracking-widest text-on-surface-variant">
                      นัดหมาย
                    </p>
                    <p className="mt-1 text-sm font-bold text-on-surface">{job.appointmentDate}</p>
                    <p className="text-sm text-on-surface-variant">{job.appointmentTime}</p>
                  </div>
                  <div className="rounded-2xl bg-surface-container-low p-4">
                    <p className="text-xs font-medium uppercase tracking-widest text-on-surface-variant">
                      Payment
                    </p>
                    <p className="mt-1 text-sm font-bold text-on-surface">
                      {job.paymentStatus === "paid" ? "ชำระแล้ว" : "รอชำระ"}
                    </p>
                    <p className="text-sm text-on-surface-variant">{job.note}</p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <section className="section-stack">
          <h2 className="px-1 text-lg font-bold text-on-surface">บันทึกงาน & ไทม์ไลน์</h2>
          <div className="rounded-3xl bg-surface-container-low p-6">
            <div className="space-y-8">
              {job.timeline.slice(0, 2).map((item, index) => (
                <div key={item.label} className="relative flex gap-4">
                  {index === 0 ? (
                    <div className="absolute bottom-[-32px] left-[11px] top-6 w-[2px] bg-border/20" />
                  ) : null}
                  <div className="z-10 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] text-white">
                    ✓
                  </div>
                  <div>
                    <p className="text-sm font-bold text-on-surface">{item.label}</p>
                    <p className="mt-1 text-xs text-on-surface-variant">{item.time}</p>
                  </div>
                </div>
              ))}
              <div className="relative flex gap-4">
                <div className="z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 border-primary bg-surface">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">กำลังดำเนินการแก้ไข</p>
                  <p className="mt-1 text-xs text-on-surface-variant">เริ่มเมื่อ 11:05 น.</p>
                  <div className="mt-4 rounded-2xl border border-border/10 bg-surface-container-lowest p-4 text-sm italic text-on-surface-variant">
                    &ldquo;ตรวจสอบพบว่าท่อน้ำทิ้งอุดตันเนื่องจากมีเมือกสะสม เตรียมล้างด้วยปั๊มแรงดันสูง&rdquo;
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <div className="glass-bar sticky-action-bar fixed bottom-0 left-0 z-50 w-full">
        <div className="mx-auto max-w-md">
          <button className={`${buttonVariants({ size: "lg" })} h-14 w-full text-base font-bold`}>
            ปิดงาน (Complete Job)
          </button>
        </div>
      </div>
    </div>
  );
}
