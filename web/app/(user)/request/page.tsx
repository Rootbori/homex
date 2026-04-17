import Link from "next/link";
import { ArrowLeft, BadgeCheck, CalendarDays, MapPin } from "lucide-react";
import { auth } from "@/auth";
import { CreateRequestForm } from "@/components/user/create-request-form";
import { ProfileBubble } from "@/components/shared/profile-bubble";
import { TopAppBar } from "@/components/shared/top-app-bar";
import { formatCurrency } from "@/lib/format";
import { getPublicTechnicianDetail, getPublicTechnicians } from "@/lib/server-data";

export default async function CreateRequestPage({
  searchParams,
}: {
  searchParams: Promise<{ technician?: string }>;
}) {
  const [{ technician: technicianSlug }, session, technicians] = await Promise.all([
    searchParams,
    auth(),
    getPublicTechnicians(),
  ]);

  const selectedTechnician = technicianSlug
    ? await getPublicTechnicianDetail(technicianSlug)
    : null;
  const heroTechnician = selectedTechnician ?? technicians[0] ?? null;
  const backHref = selectedTechnician ? `/technicians/${selectedTechnician.slug}` : "/search";

  return (
    <div>
      <TopAppBar
        title="ส่งคำขอใช้บริการ"
        left={
          <Link href={backHref} className="rounded-full p-2 text-primary transition-transform active:scale-95">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        }
        right={<ProfileBubble image={session?.user?.image ?? heroTechnician?.image} />}
      />

      <main className="page-content page-stack-lg">
        <section className="surface-card rounded-[1.75rem] p-5 ambient-shadow md:p-6">
          <div className="section-stack">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">Service Request</p>
              <h1 className="headline-font mt-2 text-3xl font-extrabold tracking-tight text-on-surface">
                ส่งคำขอหา
                <br />
                ช่างแอร์ได้ในไม่กี่ขั้นตอน
              </h1>
              <p className="mt-3 text-sm leading-6 text-on-surface-variant">
                กรอกข้อมูลเท่าที่จำเป็นก่อน ระบบจะส่งคำขอไปยังร้านที่เลือกและให้ทีมงานติดต่อกลับพร้อมใบเสนอราคา
              </p>
            </div>

            {heroTechnician ? (
              <div className="overflow-hidden rounded-[1.5rem] bg-surface-container-low">
                <div className="flex gap-4 p-4">
                  <div
                    className="h-20 w-20 flex-shrink-0 rounded-[1.25rem] bg-surface-container-high"
                    style={
                      heroTechnician.image
                        ? {
                            backgroundImage: `url(${heroTechnician.image})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }
                        : undefined
                    }
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="headline-font text-lg font-bold text-on-surface">{heroTechnician.shopName}</p>
                      <span className="rounded-full bg-secondary-container px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-on-secondary-container">
                        {heroTechnician.availability === "available" ? "Available" : "Busy"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-on-surface-variant">{heroTechnician.name}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-on-surface-variant">
                      <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1">
                        <BadgeCheck className="h-3.5 w-3.5 text-primary" />
                        {heroTechnician.rating.toFixed(1)} คะแนน
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1">
                        <MapPin className="h-3.5 w-3.5 text-primary" />
                        {heroTechnician.area.join(", ") || "-"}
                      </span>
                    </div>
                    <p className="mt-3 text-sm font-semibold text-on-surface">
                      ราคาเริ่มต้น {formatCurrency(heroTechnician.startingPrice)}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.25rem] bg-surface-container-low p-4">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant">ขั้นตอน</p>
                <p className="mt-1 text-sm font-bold text-on-surface">กรอกข้อมูลสั้น ๆ</p>
              </div>
              <div className="rounded-[1.25rem] bg-surface-container-low p-4">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant">ตอบกลับ</p>
                <p className="mt-1 text-sm font-bold text-on-surface">ร้านจะออกใบเสนอราคา</p>
              </div>
              <div className="rounded-[1.25rem] bg-surface-container-low p-4">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant">นัดหมาย</p>
                <p className="mt-1 text-sm font-bold text-on-surface">เลือกวันทำงานสะดวก</p>
              </div>
            </div>
          </div>
        </section>

        <CreateRequestForm
          defaultName={session?.user?.name ?? ""}
          selectedTechnician={
            selectedTechnician
              ? {
                  slug: selectedTechnician.slug,
                  name: selectedTechnician.name,
                  shopName: selectedTechnician.shopName,
                }
              : null
          }
        />

        <section className="rounded-[1.75rem] bg-surface-container-low p-5 md:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-container text-on-primary">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <p className="headline-font text-lg font-bold text-on-surface">หลังส่งคำขอแล้ว</p>
              <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                คุณจะติดตามสถานะได้ในหน้า My Requests ตั้งแต่รอร้านรับงาน, รอใบเสนอราคา, นัดหมายแล้ว ไปจนถึงปิดงาน
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
