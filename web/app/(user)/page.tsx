import type { Metadata } from "next";
import { DiscoveryView } from "@/components/user/discovery-view";
import { getPublicTechnicians } from "@/lib/server-data";
import { absoluteUrl, siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "หาช่างแอร์ใกล้คุณ",
  description: siteConfig.description,
  alternates: {
    canonical: "/",
  },
};

export default async function HomePage({
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
    "@type": "ItemList",
    name: "รายชื่อช่างแอร์และร้านแอร์บน Homex",
    url: absoluteUrl("/"),
    numberOfItems: technicians.length,
    itemListElement: technicians.slice(0, 20).map((technician, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(`/technicians/${technician.slug}`),
      name: technician.shopName,
    })),
  };
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Homex ใช้ทำอะไรได้บ้าง",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Homex ช่วยให้ลูกค้าค้นหาช่างแอร์ ดูโปรไฟล์ร้าน เปรียบเทียบบริการ ราคาเริ่มต้น และส่งคำขอใช้บริการผ่านมือถือได้ง่ายขึ้น",
        },
      },
      {
        "@type": "Question",
        name: "ลูกค้าสามารถค้นหาช่างแอร์ตามพื้นที่ได้ไหม",
        acceptedAnswer: {
          "@type": "Answer",
          text: "ได้ ลูกค้าสามารถกรองตามพื้นที่ให้บริการ บริการที่รับ สถานะรับงาน และราคาเริ่มต้นได้จากหน้าค้นหา",
        },
      },
      {
        "@type": "Question",
        name: "ร้านหรือช่างต้องตั้งค่าอะไรเพื่อให้ลูกค้าเห็น",
        acceptedAnswer: {
          "@type": "Answer",
          text: "ร้านหรือช่างควรตั้งค่าชื่อร้าน โปรไฟล์ช่าง บริการที่รับ ราคาเริ่มต้น และพื้นที่ให้บริการ เพื่อให้โปรไฟล์แสดงในหน้าค้นหาได้ครบถ้วน",
        },
      },
    ],
  };
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: absoluteUrl("/"),
    description: siteConfig.description,
    inLanguage: "th",
    potentialAction: {
      "@type": "SearchAction",
      target: `${absoluteUrl("/search")}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <DiscoveryView
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
