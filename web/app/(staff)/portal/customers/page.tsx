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
      <main className="page-content page-stack">
        <section className="page-hero">
          <span className="block text-sm font-bold uppercase tracking-widest text-primary">Admin only</span>
          <h1 className="headline-font text-3xl font-extrabold tracking-tight">Customers</h1>
        </section>

        <div className="card-stack">
          {staffCustomers.map((customer) => (
            <div
              key={customer.id}
              className="surface-card rounded-[1.75rem] p-5 ambient-shadow md:p-6"
            >
              <div className="section-stack-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="headline-font text-lg font-bold">{customer.name}</p>
                    <p className="text-sm text-on-surface-variant">{customer.phone}</p>
                  </div>
                  <p className="text-sm font-medium text-on-surface">
                    {formatCurrency(customer.totalSpend)}
                  </p>
                </div>

                <div className="grid gap-3 text-sm text-on-surface-variant sm:grid-cols-2">
                  <p>พื้นที่: {customer.area}</p>
                  <p>งานที่ผ่านมา: {customer.jobsCount} งาน</p>
                </div>

                <Link
                  href={`/portal/customers/${customer.id}`}
                  className={`${buttonVariants({ variant: "secondary" })} w-full sm:w-auto`}
                >
                  เปิดโปรไฟล์ลูกค้า
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
