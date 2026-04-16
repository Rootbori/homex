import { ArrowRight, User } from "lucide-react";
import { TopAppBar } from "@/components/shared/top-app-bar";
import { ProfileBubble } from "@/components/shared/profile-bubble";
import { jobs, technicians } from "@/lib/mock-data";

export default function ProfilePage() {
  return (
    <div>
      <TopAppBar
        title="Atmospheric"
        right={<ProfileBubble image={technicians[0]?.heroImage} />}
      />
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
                <h2 className="headline-font text-xl font-bold">คุณแพร</h2>
                <p className="text-sm text-on-surface-variant">095-232-4444 • ใช้งานผ่าน LINE เป็นหลัก</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-on-surface-variant">
              <p>พื้นที่หลัก: รามคำแหง</p>
              <p>ที่อยู่ล่าสุด: คอนโด The Base ชั้น 9 ห้อง 912</p>
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
      </main>
    </div>
  );
}
