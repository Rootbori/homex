import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, PhoneCall, Star } from "lucide-react";
import { CreateRequestForm } from "@/components/user/create-request-form";
import { getMessages } from "@/lib/i18n/messages";
import { isLocale } from "@/lib/i18n/config";
import { getPublicTechnicianDetail } from "@/lib/server-data";
import { languageAlternates, localizedAbsoluteUrl } from "@/lib/site";

export async function generateMetadata({
  params,
}: Readonly<{
  params: Promise<{ locale: string; slug: string }>;
}>): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) {
    return {};
  }

  const technician = await getPublicTechnicianDetail(slug);
  if (!technician) {
    return {};
  }

  const areaText = technician.area.join(", ");
  const serviceText = technician.services.join(", ");

  const serviceInfo = serviceText ? `บริการ: ${serviceText}.` : "";
  const areaInfo = areaText ? `พื้นที่: ${areaText}.` : "";

  return {
    title: `${technician.shopName} | ${areaText || technician.name}`,
    description: `${technician.headline} ${serviceInfo} ${areaInfo}`.trim().replaceAll(/\s+/g, " "),
    alternates: {
      canonical: `/${locale}/technicians/${slug}`,
      languages: languageAlternates(`/technicians/${slug}`),
    },
    openGraph: {
      images: technician.image ? [{ url: technician.image }] : undefined,
    },
  };
}

export default async function LocalizedTechnicianPage({
  params,
}: Readonly<{
  params: Promise<{ locale: string; slug: string }>;
}>) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const [technician, messages] = await Promise.all([
    getPublicTechnicianDetail(slug),
    Promise.resolve(getMessages(locale)),
  ]);

  if (!technician) {
    notFound();
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: messages.seo.common.homeLabel,
        item: localizedAbsoluteUrl(locale, "/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: messages.seo.common.searchLabel,
        item: localizedAbsoluteUrl(locale, "/search"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: technician.shopName,
        item: localizedAbsoluteUrl(locale, `/technicians/${technician.slug}`),
      },
    ],
  };

  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: technician.shopName,
    image: technician.image ? [technician.image] : undefined,
    telephone: technician.phone || undefined,
    areaServed: technician.area,
    priceRange: technician.startingPrice > 0 ? `THB ${technician.startingPrice}+` : undefined,
    aggregateRating:
      technician.reviewCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: technician.rating,
            reviewCount: technician.reviewCount,
          }
        : undefined,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }} />
      <div className="mx-auto max-w-3xl">
        <header className="sticky top-0 z-50 border-b border-black/[0.04] bg-white/85 px-4 pb-3 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
          <div className="flex h-14 items-center gap-3">
            <Link href={`/${locale}/search`} className="text-sm font-semibold text-primary">
              {messages.technician.backToSearch}
            </Link>
          </div>
        </header>

        <main className="space-y-6 px-4 py-6">
          <section className="rounded-[1.9rem] bg-white p-5 shadow-sm ring-1 ring-black/[0.04]">
            <div className="flex gap-4">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-surface-container">
                {technician.image ? (
                  <div
                    className="h-full w-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${technician.image})` }}
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="headline-font text-2xl font-extrabold tracking-tight text-on-surface">
                  {technician.shopName}
                </h1>
                <p className="mt-1 text-sm text-on-surface-variant">{technician.headline}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-on-surface-variant/70">
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-on-surface">{technician.rating.toFixed(1)}</span>
                    <span>({technician.reviewCount})</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{technician.area.join(", ")}</span>
                  </span>
                  <span>{technician.experienceYears} {messages.technician.years}</span>
                </div>
                <div className="mt-4 flex gap-2">
                  <a
                    href={`tel:${technician.phone}`}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-bold text-white"
                  >
                    <PhoneCall className="h-4 w-4" />
                    {messages.technician.call}
                  </a>
                  <a
                    href={technician.lineUrl || "#"}
                    className="inline-flex h-11 items-center justify-center rounded-2xl bg-surface-container-low px-4 text-sm font-semibold text-on-surface"
                  >
                    {messages.technician.line}
                  </a>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.8rem] bg-white p-5 shadow-sm ring-1 ring-black/[0.04]">
              <h2 className="text-sm font-bold text-on-surface">{messages.technician.services}</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {technician.services.map((service) => (
                  <span key={service} className="rounded-full bg-surface-container-low px-3 py-1.5 text-xs font-semibold text-on-surface">
                    {service}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-sm font-bold text-on-surface">
                {messages.technician.startingPrice}: ฿{technician.startingPrice}
              </p>
              <p className="mt-2 text-sm text-on-surface-variant">
                {messages.technician.hours}: {technician.hours}
              </p>
            </div>

            <div className="rounded-[1.8rem] bg-white p-5 shadow-sm ring-1 ring-black/[0.04]">
              <h2 className="text-sm font-bold text-on-surface">{messages.technician.reviews}</h2>
              <div className="mt-3 space-y-3">
                {technician.reviews.length > 0 ? (
                  technician.reviews.slice(0, 3).map((review, index) => (
                    <div key={`${review.user}-${index}`} className="rounded-2xl bg-surface-container-low p-3">
                      <p className="text-sm font-semibold text-on-surface">{review.user}</p>
                      <p className="mt-1 text-sm text-on-surface-variant">{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-on-surface-variant">{messages.technician.noReviews}</p>
                )}
              </div>
            </div>
          </section>

          <CreateRequestForm
            selectedTechnician={{
              slug: technician.slug,
              name: technician.name,
              shopName: technician.shopName,
            }}
          />
        </main>
      </div>
    </>
  );
}
