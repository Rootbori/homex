import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ImagePlus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ProfileBubble } from "@/components/shared/profile-bubble";
import { TopAppBar } from "@/components/shared/top-app-bar";
import { getLead } from "@/lib/server-data";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lead = await getLead(id);

  if (!lead) {
    notFound();
  }

  return (
    <div>
      <TopAppBar
        title="Lead Detail"
        left={
          <Link href="/portal/leads" className="rounded-full p-2 text-on-surface transition-transform active:scale-95">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        }
        right={<ProfileBubble />}
      />
      <main className="page-content page-stack-lg">
        <section className="relative overflow-hidden rounded-[1.75rem] bg-surface-container-low p-6">
          <div className="relative z-10">
            <p className="mb-1 text-sm font-medium text-on-surface-variant">Lead Details</p>
            <h1 className="headline-font mb-4 text-3xl font-extrabold leading-tight text-on-surface">
              {lead.userName}
            </h1>
            <div className="grid grid-cols-2 gap-3">
              <a href={`tel:${lead.phone}`} className="flex h-[56px] items-center justify-center rounded-xl bg-primary font-semibold text-on-primary">
                โทรออก
              </a>
              <button className="flex h-[56px] items-center justify-center rounded-xl bg-surface-container-lowest font-semibold text-primary shadow-sm">
                นำทาง
              </button>
            </div>
          </div>
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />
        </section>

        <section className="surface-card rounded-[1.75rem] p-5 ambient-shadow md:p-6">
          <div className="section-stack">
            <h2 className="text-lg font-bold text-on-surface">รายละเอียดคำขอ</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-3xl bg-surface-container-low p-5">
                <p className="mb-1 text-xs font-medium uppercase tracking-widest text-on-surface-variant">บริการ</p>
                <p className="text-xl font-bold text-on-surface">{lead.serviceType}</p>
              </div>
              <div className="rounded-3xl bg-surface-container-low p-5">
                <p className="mb-1 text-xs font-medium uppercase tracking-widest text-on-surface-variant">จำนวนเครื่อง</p>
                <p className="text-xl font-bold text-on-surface">{lead.units || "-"} เครื่อง</p>
              </div>
              <div className="col-span-2 rounded-3xl border border-border/10 bg-surface-container-lowest p-5">
                <p className="mb-2 text-xs font-medium uppercase tracking-widest text-on-surface-variant">อาการเบื้องต้น</p>
                <p className="text-lg leading-relaxed text-on-surface">{lead.symptom}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="surface-card rounded-[1.75rem] p-5 ambient-shadow md:p-6">
          <div className="section-stack">
            <h2 className="text-lg font-bold text-on-surface">ข้อมูลเครื่องปรับอากาศ</h2>
            {lead.airUnits.length > 0 ? (
              <div className="card-stack">
                {lead.airUnits.map((unit, index) => (
                  <div key={`${unit.brand}-${index}`} className="grid grid-cols-2 gap-4 rounded-3xl bg-surface-container-low p-5">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-on-surface-variant">แบรนด์</p>
                      <p className="mt-1 text-lg font-bold text-on-surface">{unit.brand}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-on-surface-variant">ขนาด</p>
                      <p className="mt-1 text-lg font-bold text-on-surface">{unit.btu}</p>
                    </div>
                    <div className="col-span-2 text-sm text-on-surface-variant">{unit.symptom}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl bg-surface-container-low p-5 text-sm text-on-surface-variant">ยังไม่มีข้อมูลแอร์แยกรายเครื่อง</div>
            )}
            <div className="relative flex h-28 items-center justify-center rounded-3xl bg-surface-container-highest">
              <ImagePlus className="h-8 w-8 text-on-surface-variant" />
            </div>
          </div>
        </section>

        <section className="surface-card rounded-[1.75rem] p-5 ambient-shadow md:p-6">
          <div className="section-stack">
            <h2 className="text-lg font-bold text-on-surface">บันทึก lead</h2>
            <div className="rounded-3xl bg-surface-container-low p-6">
              <div className="space-y-4">
                <div className="rounded-2xl bg-surface-container-lowest p-4">
                  <p className="text-sm font-bold text-on-surface">รับ lead แล้ว</p>
                  <p className="mt-1 text-xs text-on-surface-variant">
                    {lead.time} • {lead.source}
                  </p>
                </div>
                <div className="rounded-2xl bg-surface-container-lowest p-4">
                  <p className="text-sm font-bold text-on-surface">พื้นที่ให้บริการ</p>
                  <p className="mt-1 text-xs text-on-surface-variant">{lead.area}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <div className="glass-bar fixed bottom-0 left-0 z-50 w-full p-6 pb-10">
        <div className="mx-auto grid max-w-md grid-cols-1 gap-3 sm:grid-cols-3">
          <Link href="/portal/quotation" className={buttonVariants({ size: "lg" })}>
            สร้างใบเสนอราคา
          </Link>
          <button className={buttonVariants({ size: "lg", variant: "secondary" })}>Assign ช่าง</button>
          <button className={buttonVariants({ size: "lg", variant: "outline" })}>เปลี่ยนเป็น Job</button>
        </div>
      </div>
    </div>
  );
}
