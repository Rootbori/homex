import type { Metadata } from "next";
import { ChevronRight, LogOut, User } from "lucide-react";
import { auth } from "@/auth";
import { signOutAction } from "@/lib/auth/actions";
import { localizeAppPath, providerLabel } from "@/lib/auth-flow";
import { getPreferredLocale } from "@/lib/i18n/server";
import { getUserJobs } from "@/lib/server-data";

export const metadata: Metadata = {
  title: "โปรไฟล์",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ProfilePage() {
  const [session, jobs, locale] = await Promise.all([auth(), getUserJobs(), getPreferredLocale()]);
  const displayName = session?.user?.name ?? "ผู้ใช้งาน Homex";
  const displayEmail = session?.user?.email ?? "ยังไม่ได้เชื่อมอีเมล";
  const loginProvider = providerLabel(session?.provider ?? session?.user?.provider);

  return (
    <div className="mx-auto max-w-3xl">
      <header className="sticky top-0 z-50 border-b border-black/[0.04] bg-white/80 backdrop-blur-xl">
        <div className="flex h-14 items-center px-4">
          <h1 className="text-base font-bold text-on-surface">โปรไฟล์</h1>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Profile card */}
        <div className="flex items-center gap-4 rounded-2xl bg-surface-container-low p-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/5 text-primary">
            <User className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-on-surface">{displayName}</h2>
            <p className="text-sm text-on-surface-variant/50">
              {displayEmail}
            </p>
            <p className="mt-0.5 text-xs text-on-surface-variant/30">
              เข้าสู่ระบบผ่าน {loginProvider} • {jobs.length} งาน
            </p>
          </div>
        </div>

        {/* Menu items */}
        <div className="rounded-2xl bg-white ring-1 ring-black/[0.04]">
          <button className="flex w-full items-center justify-between px-5 py-4 text-sm font-medium text-on-surface hover:bg-surface-container-low transition-colors rounded-2xl">
            <span>แก้ไขข้อมูลส่วนตัว</span>
            <ChevronRight className="h-4 w-4 text-on-surface-variant/20" />
          </button>
        </div>

        {/* Logout */}
        <form action={signOutAction}>
          <input name="redirectTo" type="hidden" value={localizeAppPath("/login", locale)} />
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            ออกจากระบบ
          </button>
        </form>
      </main>
    </div>
  );
}
