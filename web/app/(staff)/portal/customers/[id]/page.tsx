import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { StatusChip } from "@/components/shared/status-chip";
import { ProfileBubble } from "@/components/shared/profile-bubble";
import { TopAppBar } from "@/components/shared/top-app-bar";
import { buttonVariants } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { getCustomerByID, getJobsForCustomer } from "@/lib/server-data";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [session, customer, jobs] = await Promise.all([
    auth(),
    getCustomerByID(id),
    getJobsForCustomer(id),
  ]);

  if (!customer) {
    notFound();
  }

  return (
    <div>
      <TopAppBar
        title="Customer"
        left={
          <Link href="/portal/customers" className="rounded-full p-2 text-primary transition-transform active:scale-95">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        }
        right={<ProfileBubble image={session?.user?.image ?? undefined} />}
      />
      <main className="page-content page-stack">
        <section className="surface-card rounded-[1.75rem] p-5 ambient-shadow md:p-6">
          <div className="page-hero">
            <p className="text-sm font-bold uppercase tracking-widest text-primary">Customer Profile</p>
            <h1 className="headline-font text-3xl font-extrabold tracking-tight text-on-surface">{customer.name}</h1>
            <p className="text-sm text-on-surface-variant">
              {customer.phone} • {customer.area}
            </p>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-[1.5rem] bg-primary-container p-4 text-on-primary">
            <p className="text-[11px] font-semibold uppercase tracking-widest opacity-80">ยอดใช้จ่ายรวม</p>
            <p className="mt-2 text-2xl font-extrabold">{formatCurrency(customer.totalSpend)}</p>
          </div>
          <div className="rounded-[1.5rem] bg-surface-container-low p-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant">จำนวนงาน</p>
            <p className="mt-2 text-3xl font-extrabold text-on-surface">{jobs.length}</p>
          </div>
          <div className="rounded-[1.5rem] bg-surface-container-low p-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant">ค่าใช้จ่ายเฉลี่ย</p>
            <p className="mt-2 text-2xl font-extrabold text-on-surface">
              {formatCurrency(jobs.length > 0 ? Math.round(customer.totalSpend / jobs.length) : 0)}
            </p>
          </div>
        </section>

        <section className="surface-card rounded-[1.75rem] p-5 ambient-shadow md:p-6">
          <div className="section-stack-sm">
            <p className="text-sm font-semibold text-on-surface">บันทึกและการติดต่อ</p>
            <p className="rounded-[1.25rem] bg-surface-container-low p-4 text-sm leading-6 text-on-surface-variant">
              {customer.note}
            </p>
            <div className="flex flex-wrap gap-3">
              <a href={`tel:${customer.phone}`} className={`${buttonVariants({ variant: "secondary" })} w-full sm:w-auto`}>
                โทรหาลูกค้า
              </a>
              <Link href="/portal/jobs" className={`${buttonVariants({ variant: "outline" })} w-full sm:w-auto`}>
                เปิดรายการงานทั้งหมด
              </Link>
            </div>
          </div>
        </section>

        <section className="surface-card rounded-[1.75rem] p-5 ambient-shadow md:p-6">
          <div className="section-stack">
            <p className="text-sm font-semibold text-on-surface">ประวัติงาน</p>
            <div className="card-stack">
              {jobs.length > 0 ? (
                jobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/portal/jobs/${job.id}`}
                    className="rounded-[1.5rem] bg-surface-container-low p-4 transition-transform active:scale-[0.99]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-on-surface">{job.code}</p>
                        <p className="mt-1 text-sm text-on-surface-variant">
                          {job.serviceType} • {job.appointmentDate}
                        </p>
                        <p className="mt-1 text-sm text-on-surface-variant">{job.assignedTechnicianName}</p>
                      </div>
                      <StatusChip status={job.status} />
                    </div>
                  </Link>
                ))
              ) : (
                <div className="rounded-[1.5rem] bg-surface-container-low p-4 text-sm text-on-surface-variant">
                  ยังไม่มีประวัติงานของลูกค้ารายนี้
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
