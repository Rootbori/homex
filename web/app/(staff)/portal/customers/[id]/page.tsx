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
      <main className="space-y-4 px-6 pb-24 pt-24">
        <section className="surface-card rounded-[2rem] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.02)]">
          <p className="mb-2 text-sm font-bold uppercase tracking-widest text-primary">Customer profile</p>
          <h1 className="headline-font text-3xl font-extrabold tracking-tight">{customer.name}</h1>
          <p className="mt-2 text-sm text-on-surface-variant">{customer.phone} • {customer.area}</p>
        </section>

        <section className="surface-card rounded-[2rem] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.02)]">
          <p className="mb-3 text-sm font-semibold text-on-surface">ข้อมูลติดต่อและ note</p>
          <p className="text-sm text-on-surface-variant">{customer.note}</p>
          <p className="mt-3 text-sm text-on-surface-variant">
            ยอดใช้จ่ายรวม {customer.totalSpend.toLocaleString("th-TH")} บาท
          </p>
        </section>

        <section className="surface-card rounded-[2rem] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.02)]">
          <p className="mb-3 text-sm font-semibold text-on-surface">งานที่ผ่านมา</p>
          {jobs.map((job) => (
            <div key={job.id} className="mb-3 rounded-[24px] bg-surface-container-low p-4 text-sm text-on-surface-variant last:mb-0">
              <p className="font-medium text-on-surface">{job.code}</p>
              <p>{job.serviceType} • {job.appointmentDate}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
