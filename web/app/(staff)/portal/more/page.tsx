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
      <main className="page-content page-stack">
        <section className="page-hero">
          <span className="block text-sm font-bold uppercase tracking-widest text-primary">More</span>
          <h1 className="headline-font text-3xl font-extrabold tracking-tight">หน้าจอเพิ่มเติม</h1>
        </section>
        <div className="card-stack">
          {links.map((item) => (
            <div
              key={item.href}
              className="surface-card rounded-[1.75rem] p-5 ambient-shadow md:p-6"
            >
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="headline-font text-lg font-bold">{item.label}</p>
                <p className="text-sm text-on-surface-variant">
                  หน้าจอเสริมสำหรับ owner, admin และ technician
                </p>
              </div>
                <Link
                  href={item.href}
                  className={`${buttonVariants({ variant: "secondary" })} w-full sm:w-auto`}
                >
                เปิด
              </Link>
            </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
