import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, MapPin, MessageCircle, PhoneCall, Star } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { TopAppBar } from "@/components/shared/top-app-bar";
import { ProfileBubble } from "@/components/shared/profile-bubble";
import { formatCurrency } from "@/lib/format";
import { getPublicTechnicianDetail } from "@/lib/server-data";

export default async function TechnicianProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const technician = await getPublicTechnicianDetail(slug);

  if (!technician) {
    notFound();
  }

  const gallery = technician.gallery.length > 0 ? technician.gallery : technician.image ? [technician.image] : [];

  return (
    <div>
      <TopAppBar
        title="Technician Profile"
        left={
          <Link href="/search" className="rounded-full p-2 text-on-surface transition-transform active:scale-95">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        }
        right={<ProfileBubble image={technician.image} />}
      />

      <main className="page-content page-stack-lg">
        <section className="surface-card rounded-[1.75rem] p-5 ambient-shadow md:p-6">
          <div className="section-stack">
            <div className="relative flex w-full items-end gap-4 sm:gap-6">
              <div
                className="h-28 w-28 overflow-hidden rounded-2xl bg-surface-container-high shadow-xl shadow-primary/10"
                style={technician.image ? { backgroundImage: `url(${technician.image})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
              />
              <div className="flex-1">
                <h1 className="headline-font text-2xl font-extrabold leading-tight text-on-surface">
                  {technician.shopName}
                </h1>
                <p className="mt-1 text-sm text-on-surface-variant">{technician.name}</p>
                <div className="mt-2 flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  <span className="text-sm font-bold text-on-surface">{technician.rating.toFixed(1)}</span>
                  <span className="text-sm text-on-surface-variant">({technician.reviewCount} รีวิว)</span>
                </div>
                <div className="mt-2 inline-flex items-center rounded-full bg-secondary-container px-3 py-1 text-xs font-semibold text-on-secondary-container">
                  ประสบการณ์ {technician.experienceYears} ปี
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-3 gap-3">
          <a
            href={`tel:${technician.phone}`}
            className="flex flex-col items-center justify-center gap-2 rounded-[1.5rem] bg-surface-container-low px-3 py-4 transition-colors duration-200 active:scale-95"
          >
            <PhoneCall className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium">โทร</span>
          </a>
          <a
            href={technician.lineUrl}
            className="flex flex-col items-center justify-center gap-2 rounded-[1.5rem] bg-surface-container-low px-3 py-4 transition-colors duration-200 active:scale-95"
          >
            <MessageCircle className="h-5 w-5 text-[#06C755]" />
            <span className="text-xs font-medium">LINE</span>
          </a>
          <Link
            href={`/request?technician=${technician.slug}`}
            className="flex flex-col items-center justify-center gap-2 rounded-[1.5rem] bg-surface-container-low px-3 py-4 transition-colors duration-200 active:scale-95"
          >
            <CalendarDays className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium">จองงาน</span>
          </Link>
        </section>

        <section className="surface-card rounded-[1.75rem] p-5 ambient-shadow md:p-6">
          <div className="section-stack">
            <h2 className="headline-font text-lg font-bold">เกี่ยวกับทีมช่าง</h2>
            <p className="text-sm leading-relaxed text-on-surface-variant">
              {technician.headline}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.25rem] bg-surface-container-low p-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">
                  เวลาทำการ
                </p>
                <p className="mt-1 text-sm font-semibold text-on-surface">{technician.hours}</p>
              </div>
              <div className="rounded-[1.25rem] bg-surface-container-low p-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">
                  ราคาเริ่มต้น
                </p>
                <p className="mt-1 text-sm font-semibold text-on-surface">{formatCurrency(technician.startingPrice)}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="surface-card rounded-[1.75rem] p-5 ambient-shadow md:p-6">
          <div className="section-stack">
            <h2 className="headline-font text-lg font-bold">บริการและพื้นที่ให้บริการ</h2>
            <div className="flex flex-wrap gap-2">
              {technician.services.map((service) => (
                <span
                  key={service}
                  className="rounded-lg bg-surface-container-low px-3 py-1 text-xs font-medium text-on-surface-variant"
                >
                  {service}
                </span>
              ))}
            </div>
            <div className="flex items-start gap-3 rounded-[1.5rem] bg-surface-container-low p-5">
              <MapPin className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-on-surface">พื้นที่ให้บริการ</p>
                <p className="mt-1 text-xs text-on-surface-variant">{technician.area.join(", ") || "-"}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="surface-card rounded-[1.75rem] p-5 ambient-shadow md:p-6">
          <div className="section-stack">
            <h2 className="headline-font text-lg font-bold">ผลงานและรีวิว</h2>
            {gallery.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {gallery.slice(0, 4).map((image, index) => (
                  <div
                    key={`${image}-${index}`}
                    className="aspect-square overflow-hidden rounded-2xl bg-surface-container-high"
                    style={{
                      backgroundImage: `url(${image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                ))}
              </div>
            ) : null}

            <div className="card-stack">
              {technician.reviews.length > 0 ? (
                technician.reviews.map((review, index) => (
                  <div key={`${review.user}-${index}`} className="rounded-[1.5rem] bg-surface-container-low p-4">
                    <p className="text-sm font-semibold text-on-surface">
                      {review.user} • {review.rating}/5
                    </p>
                    <p className="mt-1 text-sm text-on-surface-variant">{review.comment}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.5rem] bg-surface-container-low p-4 text-sm text-on-surface-variant">
                  ยังไม่มีรีวิวล่าสุด
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <div className="glass-bar fixed bottom-24 left-0 z-40 w-full px-5 py-4 md:bottom-6 md:px-6">
        <div className="mx-auto w-full max-w-[42rem]">
          <Link href={`/request?technician=${technician.slug}`} className={`${buttonVariants({ size: "lg" })} w-full`}>
            จองบริการตอนนี้
            <CalendarDays className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
