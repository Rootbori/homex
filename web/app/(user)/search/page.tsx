import type { Metadata } from "next";
import { DiscoveryView } from "@/components/user/discovery-view";
import { getPublicTechnicians } from "@/lib/server-data";
import { absoluteUrl } from "@/lib/site";

export async function generateMetadata({
  searchParams,
}: Readonly<{
  searchParams: Promise<{
    q?: string;
    service?: string;
    area?: string;
    availability?: string;
    max_price?: string;
  }>;
}>): Promise<Metadata> {
  const { q = "", service = "", area = "" } = await searchParams;
  const focus = [service, area, q].filter(Boolean).join(" • ");
  const title = focus ? `ค้นหาช่างแอร์ ${focus}` : "ค้นหาช่างแอร์";
  const description = focus
    ? `ค้นหาร้านและช่างแอร์สำหรับ ${focus} พร้อมดูบริการ พื้นที่ให้บริการ และราคาเริ่มต้นบน Homex`
    : "ค้นหาช่างแอร์ ร้านแอร์ และบริการล้าง ซ่อม ติดตั้งแอร์ พร้อมกรองตามพื้นที่และราคาเริ่มต้น";

  return {
    title,
    description,
    alternates: {
      canonical: "/search",
    },
  };
}

export default async function SearchPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{
    q?: string;
    service?: string;
    area?: string;
    availability?: string;
    max_price?: string;
  }>;
}>) {
  const { q = "", service = "", area = "", availability = "", max_price = "" } = await searchParams;
  const [technicians, allTechnicians] = await Promise.all([
    getPublicTechnicians({ q, service, area, availability, max_price }),
    getPublicTechnicians(),
  ]);

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "SearchResultsPage",
    name: "ผลการค้นหาช่างแอร์",
    url: absoluteUrl("/search"),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: technicians.length,
      itemListElement: technicians.slice(0, 20).map((technician, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absoluteUrl(`/technicians/${technician.slug}`),
        name: technician.shopName,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <DiscoveryView
        compact
        technicians={technicians}
        allTechnicians={allTechnicians}
        query={q}
        service={service}
        area={area}
        availability={availability}
        maxPrice={max_price}
      />
    </>
  );
}
