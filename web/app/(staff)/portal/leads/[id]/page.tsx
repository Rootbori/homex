import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ImagePlus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ProfileBubble } from "@/components/shared/profile-bubble";
import { TopAppBar } from "@/components/shared/top-app-bar";
import { getLead, technicians } from "@/lib/mock-data";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lead = getLead(id);

  if (!lead) {
    notFound();
  }

  return (
    <div>
      <TopAppBar
        title="Lead Detail"
        left={
          <button className="rounded-full p-2 text-on-surface transition-transform active:scale-95">
            <ArrowLeft className="h-5 w-5" />
          </button>
        }
        right={<ProfileBubble image={technicians[0]?.heroImage} />}
      />
      <main className="mt-20 space-y-6 px-5 pb-32">
        <section className="relative overflow-hidden rounded-[2rem] bg-surface-container-low p-6">
          <div className="relative z-10">
            <p className="mb-1 text-sm font-medium text-on-surface-variant">Lead Details</p>
            <h1 className="headline-font mb-6 text-3xl font-extrabold leading-tight text-on-surface">
              {lead.customerName}
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

        <section>
          <h2 className="mb-4 px-1 text-lg font-bold text-on-surface">ข้อมูลเครื่องปรับอากาศ</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 rounded-3xl border border-border/10 bg-surface-container-lowest p-5">
              <p className="mb-2 text-xs font-medium uppercase tracking-widest text-on-surface-variant">
                อาการเสีย / Symptoms
              </p>
              <p className="text-lg font-medium leading-relaxed text-on-surface">{lead.symptom}</p>
            </div>
            <div className="rounded-3xl bg-surface-container-low p-5">
              <p className="mb-1 text-xs font-medium uppercase tracking-widest text-on-surface-variant">แบรนด์</p>
              <p className="text-xl font-bold text-on-surface">DAIKIN</p>
            </div>
            <div className="rounded-3xl bg-surface-container-low p-5">
              <p className="mb-1 text-xs font-medium uppercase tracking-widest text-on-surface-variant">ขนาด</p>
              <p className="text-xl font-bold text-on-surface">18,000 BTU</p>
            </div>
            <div className="col-span-2 grid grid-cols-3 gap-2">
              {technicians[0]?.gallery.slice(0, 2).map((image, index) => (
                <div
                  key={`${image}-${index}`}
                  className="aspect-square overflow-hidden rounded-2xl"
                  style={{
                    backgroundImage: `url(${image})`,
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

        <section className="space-y-4">
          <h2 className="px-1 text-lg font-bold text-on-surface">บันทึก lead</h2>
          <div className="rounded-3xl bg-surface-container-low p-6">
            <div className="space-y-8">
              <div className="relative flex gap-4">
                <div className="absolute bottom-[-32px] left-[11px] top-6 w-[2px] bg-border/20" />
                <div className="z-10 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] text-white">
                  ✓
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">รับ lead แล้ว</p>
                  <p className="mt-1 text-xs text-on-surface-variant">{lead.time} • {lead.source}</p>
                </div>
              </div>
              <div className="relative flex gap-4">
                <div className="z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 border-primary bg-surface">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">พร้อมสร้างใบเสนอราคา</p>
                  <div className="mt-4 rounded-2xl border border-border/10 bg-surface-container-lowest p-4 text-sm italic text-on-surface-variant">
                    สะดวกวันที่ 17 เม.ย. ช่วง 13:00 - 15:00
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <div className="glass-bar fixed bottom-0 left-0 z-50 w-full p-6 pb-10">
        <div className="mx-auto grid max-w-md grid-cols-3 gap-3">
          <Link href="/portal/quotation" className={buttonVariants({ size: "lg" })}>
            สร้างใบเสนอราคา
          </Link>
          <button className={buttonVariants({ size: "lg", variant: "secondary" })}>
            Assign ช่าง
          </button>
          <button className={buttonVariants({ size: "lg", variant: "outline" })}>
            เปลี่ยนเป็น Job
          </button>
        </div>
      </div>
    </div>
  );
}
