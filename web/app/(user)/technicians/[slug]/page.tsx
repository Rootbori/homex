import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, MapPin, MessageCircle, PhoneCall, Star } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { getPublicTechnicianDetail } from "@/lib/server-data";

export default async function TechnicianProfilePage({
  params,
}: Readonly<{
  params: Promise<{ slug: string }>;
}>) {
  const { slug } = await params;
  const technician = await getPublicTechnicianDetail(slug);

  if (!technician) {
    notFound();
  }

  const gallery =
    technician.gallery.length > 0
      ? technician.gallery
      : technician.image
        ? [technician.image]
        : [];

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-black/[0.04] bg-white/80 backdrop-blur-xl">
        <div className="flex h-14 items-center gap-3 px-4">
          <Link href="/search" className="text-on-surface-variant/50 hover:text-on-surface">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="truncate text-base font-bold text-on-surface">{technician.shopName}</h1>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Profile header */}
        <div className="flex gap-4">
          <div
            className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-surface-container"
            style={
              technician.image
                ? { backgroundImage: `url(${technician.image})`, backgroundSize: "cover", backgroundPosition: "center" }
                : undefined
            }
          />
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-extrabold text-on-surface">{technician.shopName}</h2>
            <p className="mt-0.5 text-sm text-on-surface-variant/50">{technician.name}</p>
            <div className="mt-2 flex items-center gap-3 text-sm">
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span className="font-bold text-on-surface">{technician.rating.toFixed(1)}</span>
                <span className="text-xs text-on-surface-variant/40">({technician.reviewCount})</span>
              </span>
              <span className="rounded-full bg-surface-container-low px-2.5 py-0.5 text-xs font-medium text-on-surface-variant/50">
                {technician.experienceYears} ปี
              </span>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-3 gap-2">
          <a
            href={`tel:${technician.phone}`}
            className="flex flex-col items-center gap-1.5 rounded-xl bg-surface-container-low py-3 text-xs font-medium text-on-surface-variant/60 transition-colors hover:bg-surface-container"
          >
            <PhoneCall className="h-5 w-5 text-primary" />
            โทร
          </a>
          <a
            href={technician.lineUrl}
            className="flex flex-col items-center gap-1.5 rounded-xl bg-surface-container-low py-3 text-xs font-medium text-on-surface-variant/60 transition-colors hover:bg-surface-container"
          >
            <MessageCircle className="h-5 w-5 text-[#06C755]" />
            LINE
          </a>
          <Link
            href={`/request?technician=${technician.slug}`}
            className="flex flex-col items-center gap-1.5 rounded-xl bg-surface-container-low py-3 text-xs font-medium text-on-surface-variant/60 transition-colors hover:bg-surface-container"
          >
            <CalendarDays className="h-5 w-5 text-primary" />
            จองงาน
          </Link>
        </div>

        {/* About */}
        <section className="space-y-3">
          <h3 className="text-sm font-bold text-on-surface">เกี่ยวกับทีมช่าง</h3>
          <p className="text-sm leading-relaxed text-on-surface-variant/60">{technician.headline}</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-surface-container-low p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant/30">เวลาทำการ</p>
              <p className="mt-1 text-sm font-semibold text-on-surface">{technician.hours}</p>
            </div>
            <div className="rounded-xl bg-surface-container-low p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant/30">ราคาเริ่มต้น</p>
              <p className="mt-1 text-sm font-semibold text-on-surface">{formatCurrency(technician.startingPrice)}</p>
            </div>
          </div>
        </section>

        {/* Services & Area */}
        <section className="space-y-3">
          <h3 className="text-sm font-bold text-on-surface">บริการ</h3>
          <div className="flex flex-wrap gap-1.5">
            {technician.services.map((service) => (
              <span
                key={service}
                className="rounded-lg bg-surface-container-low px-2.5 py-1 text-xs font-medium text-on-surface-variant/60"
              >
                {service}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-surface-container-low p-3 text-sm">
            <MapPin className="h-4 w-4 shrink-0 text-primary" />
            <span className="text-on-surface-variant/60">{technician.area.join(", ") || "-"}</span>
          </div>
        </section>

        {/* Gallery */}
        {gallery.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-sm font-bold text-on-surface">ผลงาน</h3>
            <div className="grid grid-cols-2 gap-2">
              {gallery.slice(0, 4).map((image, index) => (
                <div
                  key={`${image}-${index}`}
                  className="aspect-square overflow-hidden rounded-xl bg-surface-container"
                  style={{
                    backgroundImage: `url(${image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
              ))}
            </div>
          </section>
        )}

        {/* Reviews */}
        <section className="space-y-3">
          <h3 className="text-sm font-bold text-on-surface">รีวิว</h3>
          {technician.reviews.length > 0 ? (
            <div className="space-y-2">
              {technician.reviews.map((review, index) => (
                <div key={`${review.user}-${index}`} className="rounded-xl bg-surface-container-low p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold text-on-surface">{review.user}</span>
                    <span className="flex items-center gap-0.5 text-xs text-amber-500">
                      <Star className="h-3 w-3 fill-current" />
                      {review.rating}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-on-surface-variant/60">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-on-surface-variant/30">ยังไม่มีรีวิว</p>
          )}
        </section>

        {/* Sticky CTA */}
        <div className="pb-4">
          <Link
            href={`/request?technician=${technician.slug}`}
            className="flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:brightness-110 active:scale-[0.98]"
          >
            จองบริการตอนนี้
          </Link>
        </div>
      </main>
    </div>
  );
}
