import { ArrowRight, User } from "lucide-react";
import { auth } from "@/auth";
import { LogoutButton } from "@/components/auth/logout-button";
import { TopAppBar } from "@/components/shared/top-app-bar";
import { ProfileBubble } from "@/components/shared/profile-bubble";
import { providerLabel } from "@/lib/auth-flow";
import { getCustomerJobs } from "@/lib/server-data";

export default async function ProfilePage() {
  const [session, jobs] = await Promise.all([auth(), getCustomerJobs()]);
  const displayName = session?.user?.name ?? "ผู้ใช้งาน Homex";
  const displayEmail = session?.user?.email ?? "ยังไม่ได้เชื่อมอีเมล";
  const loginProvider = providerLabel(session?.provider ?? session?.user?.provider);

  return (
    <div>
      <TopAppBar title="Atmospheric" right={<ProfileBubble image={session?.user?.image ?? undefined} />} />
      <main className="page-content page-stack">
        <section className="page-hero">
          <span className="block text-sm font-bold uppercase tracking-widest text-primary">Profile</span>
          <h1 className="headline-font text-3xl font-extrabold tracking-tight">บัญชีของฉัน</h1>
        </section>

        <div className="surface-card rounded-[1.75rem] p-5 ambient-shadow md:p-6">
          <div className="section-stack-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-fixed text-primary">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h2 className="headline-font text-xl font-bold">{displayName}</h2>
                <p className="text-sm text-on-surface-variant">
                  {displayEmail} • เข้าสู่ระบบผ่าน {loginProvider}
                </p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-on-surface-variant">
              <p>ประเภทบัญชี: customer</p>
              <p>งานที่ผ่านมา: {jobs.length} งาน</p>
            </div>
          </div>
        </div>

        <div className="surface-card rounded-[1.75rem] p-5 ambient-shadow md:p-6">
          <button className="flex w-full items-center justify-between gap-3 text-sm font-semibold text-primary">
            แก้ไขข้อมูลส่วนตัว
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <LogoutButton redirectTo="/login" />
      </main>
    </div>
  );
}
