import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, MapPin, MessageCircle, PhoneCall, Star } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { TopAppBar } from "@/components/shared/top-app-bar";
import { ProfileBubble } from "@/components/shared/profile-bubble";
import { getTechnician } from "@/lib/mock-data";

export default async function TechnicianProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const technician = getTechnician(slug);

  if (!technician) {
    notFound();
  }

  return (
    <div>
      <TopAppBar
        title="Technician Profile"
        left={
          <button className="rounded-full p-2 text-on-surface transition-transform active:scale-95">
            <ArrowLeft className="h-5 w-5" />
          </button>
        }
        right={<ProfileBubble image={technician.heroImage} />}
      />
      <main className="mt-20 px-6 pb-32">
        <section className="mb-8 flex flex-col items-start gap-4">
          <div className="relative flex w-full items-end gap-6 pt-6">
            <div
              className="h-28 w-28 overflow-hidden rounded-2xl shadow-xl shadow-primary/10"
              style={{
                backgroundImage: `url(${technician.gallery[0] ?? technician.heroImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <div className="flex-1">
              <h1 className="headline-font text-2xl font-extrabold leading-tight text-on-surface">
                {technician.name}
              </h1>
              <div className="mt-1 flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                <span className="text-sm font-bold text-on-surface">{technician.rating}</span>
                <span className="text-sm text-on-surface-variant">
                  ({technician.reviewCount} รีวิว)
                </span>
              </div>
              <div className="mt-2 inline-flex items-center rounded-full bg-secondary-container px-3 py-1 text-xs font-semibold text-on-secondary-container">
                ประสบการณ์ {technician.experienceYears} ปี
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8 grid grid-cols-3 gap-3">
          <a
            href={`tel:${technician.phone}`}
            className="flex flex-col items-center justify-center gap-2 rounded-xl bg-surface-container-low py-4 transition-colors duration-200 active:scale-95"
          >
            <PhoneCall className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium">โทร</span>
          </a>
          <a
            href={technician.lineUrl}
            className="flex flex-col items-center justify-center gap-2 rounded-xl bg-surface-container-low py-4 transition-colors duration-200 active:scale-95"
          >
            <MessageCircle className="h-5 w-5 text-[#06C755]" />
            <span className="text-xs font-medium">LINE</span>
          </a>
          <button className="flex flex-col items-center justify-center gap-2 rounded-xl bg-surface-container-low py-4 transition-colors duration-200 active:scale-95">
            <MessageCircle className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium">แชท</span>
          </button>
        </section>

        <section className="mb-10">
          <h2 className="headline-font mb-3 text-lg font-bold">เกี่ยวกับช่าง</h2>
          <p className="text-sm leading-relaxed text-on-surface-variant">
            ผู้เชี่ยวชาญด้านระบบปรับอากาศทุกชนิด ประสบการณ์ยาวนานกว่า{" "}
            {technician.experienceYears} ปี เน้นงานละเอียด ตรงต่อเวลา และรับประกันหลังการซ่อม
            บริการด้วยใจในราคามิตรภาพ
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-lg bg-primary/5 px-4 py-2 text-xs font-semibold text-primary">
              งานด่วน 24 ชม.
            </span>
            <span className="rounded-lg bg-primary/5 px-4 py-2 text-xs font-semibold text-primary">
              รับประกัน 90 วัน
            </span>
            <span className="rounded-lg bg-primary/5 px-4 py-2 text-xs font-semibold text-primary">
              ใบประกอบวิชาชีพ
            </span>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="headline-font mb-4 text-lg font-bold">บริการและราคา</h2>
          <div className="space-y-3">
            {technician.services.map((service, index) => (
              <div
                key={service}
                className="flex items-center justify-between rounded-2xl bg-surface-container-lowest p-5"
              >
                <div>
                  <h3 className="font-bold text-on-surface">{service}</h3>
                  <p className="text-xs text-on-surface-variant">
                    {index === 0 ? "เริ่มต้น 9,000 - 24,000 BTU" : "ตรวจเช็คอาการและเสนอราคา"}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-extrabold text-primary">
                    ฿{technician.startingPrice + index * 150}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="headline-font mb-3 text-lg font-bold">พื้นที่ให้บริการ</h2>
          <div className="flex items-start gap-3 rounded-xl bg-surface-container-low p-4">
            <MapPin className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-on-surface">กรุงเทพฯ และปริมณฑล</p>
              <p className="mt-1 text-xs text-on-surface-variant">
                {technician.area.join(", ")}
              </p>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="headline-font mb-4 text-lg font-bold">ผลงานที่ผ่านมา</h2>
          <div className="grid grid-cols-2 gap-3">
            {technician.gallery.map((image, index) => (
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
            <div
              className="relative aspect-square overflow-hidden rounded-2xl bg-surface-container-high"
              style={{
                backgroundImage: `url(${technician.heroImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 text-white">
                +15 รูป
              </div>
            </div>
          </div>
        </section>
      </main>

      <div className="fixed bottom-24 left-0 z-40 w-full px-6">
        <Link
          href={`/request?technician=${technician.slug}`}
          className={`${buttonVariants({ size: "lg" })} w-full`}
        >
          จองบริการตอนนี้
          <CalendarDays className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
}
