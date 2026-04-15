import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ProfileBubble } from "@/components/shared/profile-bubble";
import { TopAppBar } from "@/components/shared/top-app-bar";
import { technicians } from "@/lib/mock-data";

const links = [
  { href: "/portal/quotation", label: "Quotation" },
  { href: "/portal/technicians", label: "Technicians" },
  { href: "/portal/my-jobs", label: "Technician My Jobs" },
  { href: "/portal/customers", label: "Customers" },
];

export default function MorePage() {
  return (
    <div>
      <TopAppBar
        title="Atmospheric"
        right={<ProfileBubble image={technicians[0]?.heroImage} />}
      />
      <main className="space-y-4 px-6 pb-24 pt-24">
        <section className="mb-6 pt-4">
          <span className="block text-sm font-bold uppercase tracking-widest text-primary">More</span>
          <h1 className="headline-font text-3xl font-extrabold tracking-tight">หน้าจอเพิ่มเติม</h1>
        </section>
        {links.map((item) => (
          <div key={item.href} className="surface-card rounded-[2rem] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="headline-font text-lg font-bold">{item.label}</p>
                <p className="text-sm text-on-surface-variant">
                  หน้าจอเสริมสำหรับ owner, admin และ technician
                </p>
              </div>
              <Link href={item.href} className={buttonVariants({ variant: "secondary" })}>
                เปิด
              </Link>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
