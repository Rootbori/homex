import Link from "next/link";
import { auth } from "@/auth";
import { LogoutButton } from "@/components/auth/logout-button";
import { buttonVariants } from "@/components/ui/button";
import { ProfileBubble } from "@/components/shared/profile-bubble";
import { TopAppBar } from "@/components/shared/top-app-bar";
import { providerLabel } from "@/lib/auth-flow";
import { getCustomers, getJobs, getTechnicians } from "@/lib/server-data";

const links = [
  { href: "/portal/quotation", label: "Quotation", description: "เตรียมใบเสนอราคาและส่งผ่าน LINE" },
  { href: "/portal/technicians", label: "Technicians", description: "ดูโปรไฟล์ทีมช่างและ performance" },
  { href: "/portal/my-jobs", label: "Technician My Jobs", description: "หน้ามุมมองของช่างที่เห็นเฉพาะงานตัวเอง" },
  { href: "/portal/customers", label: "Customers", description: "ข้อมูลลูกค้าและประวัติการใช้บริการ" },
];

export default async function MorePage() {
  const [session, technicians, customers, jobs] = await Promise.all([
    auth(),
    getTechnicians(),
    getCustomers(),
    getJobs(),
  ]);
  const displayName = session?.user?.name ?? "ทีมช่าง Homex";
  const displayEmail = session?.user?.email ?? "ยังไม่ได้เชื่อมอีเมล";
  const loginProvider = providerLabel(session?.provider ?? session?.user?.provider);

  return (
    <div>
      <TopAppBar title="More" right={<ProfileBubble image={session?.user?.image ?? undefined} />} />
      <main className="page-content page-stack">
        <section className="page-hero">
          <span className="block text-sm font-bold uppercase tracking-widest text-primary">More</span>
          <h1 className="headline-font text-3xl font-extrabold tracking-tight text-on-surface">การตั้งค่าและเมนูเสริม</h1>
        </section>

        <section className="surface-card rounded-[1.75rem] p-5 ambient-shadow md:p-6">
          <div className="section-stack-sm">
            <div>
              <p className="headline-font text-lg font-bold text-on-surface">{displayName}</p>
              <p className="text-sm text-on-surface-variant">
                {displayEmail} • เข้าสู่ระบบผ่าน {loginProvider}
              </p>
            </div>
            <p className="text-sm text-on-surface-variant">
              สิทธิ์ปัจจุบัน: {session?.accountType === "staff" ? "staff / ทีมช่าง" : "customer"}
            </p>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-[1.5rem] bg-primary-container p-4 text-on-primary">
            <p className="text-[11px] font-semibold uppercase tracking-widest opacity-80">Technicians</p>
            <p className="mt-2 text-3xl font-extrabold">{technicians.length}</p>
          </div>
          <div className="rounded-[1.5rem] bg-surface-container-low p-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant">Customers</p>
            <p className="mt-2 text-3xl font-extrabold text-on-surface">{customers.length}</p>
          </div>
          <div className="rounded-[1.5rem] bg-surface-container-low p-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant">Jobs</p>
            <p className="mt-2 text-3xl font-extrabold text-on-surface">{jobs.length}</p>
          </div>
        </section>

        <div className="card-stack">
          {links.map((item) => (
            <div key={item.href} className="surface-card rounded-[1.75rem] p-5 ambient-shadow md:p-6">
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="headline-font text-lg font-bold text-on-surface">{item.label}</p>
                  <p className="mt-1 text-sm text-on-surface-variant">{item.description}</p>
                </div>
                <Link href={item.href} className={`${buttonVariants({ variant: "secondary" })} w-full sm:w-auto`}>
                  เปิด
                </Link>
              </div>
            </div>
          ))}
        </div>

        <LogoutButton redirectTo="/login" />
      </main>
    </div>
  );
}
