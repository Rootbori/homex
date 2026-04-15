import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ProfileBubble } from "@/components/shared/profile-bubble";
import { TopAppBar } from "@/components/shared/top-app-bar";
import { formatCurrency, staffCustomers, technicians } from "@/lib/mock-data";

export default function CustomersPage() {
  return (
    <div>
      <TopAppBar
        title="Atmospheric"
        right={<ProfileBubble image={technicians[0]?.heroImage} />}
      />
      <main className="space-y-4 px-6 pb-24 pt-24">
        <section className="mb-6 pt-4">
          <span className="block text-sm font-bold uppercase tracking-widest text-primary">Admin only</span>
          <h1 className="headline-font text-3xl font-extrabold tracking-tight">Customers</h1>
        </section>
        {staffCustomers.map((customer) => (
          <div key={customer.id} className="surface-card rounded-[2rem] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.02)]">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="headline-font text-lg font-bold">{customer.name}</p>
                  <p className="text-sm text-on-surface-variant">{customer.phone}</p>
                </div>
                <p className="text-sm font-medium text-on-surface">{formatCurrency(customer.totalSpend)}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm text-on-surface-variant">
                <p>พื้นที่: {customer.area}</p>
                <p>งานที่ผ่านมา: {customer.jobsCount} งาน</p>
              </div>
              <Link href={`/portal/customers/${customer.id}`} className={buttonVariants({ variant: "secondary" })}>
                เปิดโปรไฟล์ลูกค้า
              </Link>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
