import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ProfileBubble } from "@/components/shared/profile-bubble";
import { TopAppBar } from "@/components/shared/top-app-bar";
import { getCustomer, jobs, technicians } from "@/lib/mock-data";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = getCustomer(id);

  if (!customer) {
    notFound();
  }

  return (
    <div>
      <TopAppBar
        title="Customer"
        left={
          <button className="rounded-full p-2 text-on-surface transition-transform active:scale-95">
            <ArrowLeft className="h-5 w-5" />
          </button>
        }
        right={<ProfileBubble image={technicians[0]?.heroImage} />}
      />
      <main className="page-content page-stack">
        <section className="surface-card rounded-[1.75rem] p-5 ambient-shadow md:p-6">
          <div className="page-hero">
            <p className="text-sm font-bold uppercase tracking-widest text-primary">Customer profile</p>
            <h1 className="headline-font text-3xl font-extrabold tracking-tight">{customer.name}</h1>
            <p className="text-sm text-on-surface-variant">{customer.phone} • {customer.area}</p>
          </div>
        </section>

        <section className="surface-card rounded-[1.75rem] p-5 ambient-shadow md:p-6">
          <div className="section-stack-sm">
            <p className="text-sm font-semibold text-on-surface">ข้อมูลติดต่อและ note</p>
            <p className="text-sm text-on-surface-variant">{customer.note}</p>
            <p className="text-sm text-on-surface-variant">
              ยอดใช้จ่ายรวม {customer.totalSpend.toLocaleString("th-TH")} บาท
            </p>
          </div>
        </section>

        <section className="surface-card rounded-[1.75rem] p-5 ambient-shadow md:p-6">
          <div className="section-stack">
            <p className="text-sm font-semibold text-on-surface">งานที่ผ่านมา</p>
            <div className="card-stack">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="rounded-[1.5rem] bg-surface-container-low p-4 text-sm text-on-surface-variant"
                >
                  <p className="font-medium text-on-surface">{job.code}</p>
                  <p>{job.serviceType} • {job.appointmentDate}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
