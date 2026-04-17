import Link from "next/link";
import { ArrowLeft, BadgeCheck, MapPin } from "lucide-react";
import { auth } from "@/auth";
import { CreateRequestForm } from "@/components/user/create-request-form";
import { formatCurrency } from "@/lib/format";
import { getPublicTechnicianDetail, getPublicTechnicians } from "@/lib/server-data";

export default async function CreateRequestPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ technician?: string }>;
}>) {
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
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-black/[0.04] bg-white/80 backdrop-blur-xl">
        <div className="flex h-14 items-center gap-3 px-4">
          <Link href={backHref} className="text-on-surface-variant/50 hover:text-on-surface">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-base font-bold text-on-surface">ส่งคำขอใช้บริการ</h1>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Selected technician preview */}
        {heroTechnician ? (
          <div className="flex items-center gap-4 rounded-2xl bg-surface-container-low p-4">
            <div
              className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-surface-container"
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
                <span className="truncate text-sm font-bold text-on-surface">
                  {heroTechnician.shopName}
                </span>
                <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600">
                  {heroTechnician.availability === "available" ? "ว่าง" : "ไม่ว่าง"}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-on-surface-variant/50">{heroTechnician.name}</p>
              <div className="mt-1 flex items-center gap-3 text-xs text-on-surface-variant/40">
                <span className="flex items-center gap-1">
                  <BadgeCheck className="h-3 w-3 text-primary" />
                  {heroTechnician.rating.toFixed(1)}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {heroTechnician.area.join(", ") || "-"}
                </span>
                <span className="font-semibold text-on-surface">
                  เริ่ม {formatCurrency(heroTechnician.startingPrice)}
                </span>
              </div>
            </div>
          </div>
        ) : null}

        {/* Steps indicator */}
        <div className="flex gap-2">
          {["กรอกข้อมูล", "ร้านจะตอบกลับ", "นัดหมาย"].map((step, i) => (
            <div
              key={step}
              className="flex flex-1 flex-col items-center gap-1.5 rounded-xl bg-surface-container-low px-2 py-3 text-center"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-on-surface/5 text-[11px] font-bold text-on-surface-variant/40">
                {i + 1}
              </span>
              <span className="text-[11px] font-medium text-on-surface-variant/50">{step}</span>
            </div>
          ))}
        </div>

        {/* The form */}
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
      </main>
    </div>
  );
}
