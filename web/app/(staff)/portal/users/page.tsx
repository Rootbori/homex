import Link from "next/link";
import { auth } from "@/auth";
import { buttonVariants } from "@/components/ui/button";
import { ProfileBubble } from "@/components/shared/profile-bubble";
import { TopAppBar } from "@/components/shared/top-app-bar";
import { formatCurrency } from "@/lib/format";
import { getUsers } from "@/lib/server-data";

export default async function UsersPage() {
  const [session, users] = await Promise.all([auth(), getUsers()]);
  const totalSpend = users.reduce((sum, user) => sum + user.totalSpend, 0);

  return (
    <div>
      <TopAppBar title="Users" right={<ProfileBubble image={session?.user?.image ?? undefined} />} />
      <main className="page-content page-stack">
        <section className="page-hero">
          <span className="block text-sm font-bold uppercase tracking-widest text-primary">Admin Only</span>
          <h1 className="headline-font text-3xl font-extrabold tracking-tight text-on-surface">ลูกค้าในระบบ</h1>
          <p className="mt-2 text-sm leading-6 text-on-surface-variant">
            ดูข้อมูลติดต่อ, ยอดใช้จ่าย, และประวัติงานของลูกค้าแต่ละรายจาก CRM กลางของร้าน
          </p>
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-[1.5rem] bg-primary-container p-4 text-on-primary">
            <p className="text-[11px] font-semibold uppercase tracking-widest opacity-80">ลูกค้าทั้งหมด</p>
            <p className="mt-2 text-3xl font-extrabold">{users.length}</p>
          </div>
          <div className="rounded-[1.5rem] bg-surface-container-low p-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant">ยอดใช้จ่ายรวม</p>
            <p className="mt-2 text-2xl font-extrabold text-on-surface">{formatCurrency(totalSpend)}</p>
          </div>
          <div className="rounded-[1.5rem] bg-surface-container-low p-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant">เฉลี่ยต่อราย</p>
            <p className="mt-2 text-2xl font-extrabold text-on-surface">
              {formatCurrency(users.length > 0 ? Math.round(totalSpend / users.length) : 0)}
            </p>
          </div>
        </section>

        <div className="card-stack">
          {users.length > 0 ? (
            users.map((user) => (
              <div key={user.id} className="surface-card rounded-[1.75rem] p-5 ambient-shadow md:p-6">
                <div className="section-stack-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="headline-font text-lg font-bold text-on-surface">{user.name}</p>
                      <p className="text-sm text-on-surface-variant">{user.phone}</p>
                    </div>
                    <p className="text-sm font-semibold text-on-surface">{formatCurrency(user.totalSpend)}</p>
                  </div>

                  <div className="grid gap-3 rounded-[1.25rem] bg-surface-container-low p-4 text-sm text-on-surface-variant sm:grid-cols-2">
                    <p>พื้นที่: {user.area}</p>
                    <p>งานที่ผ่านมา: {user.jobsCount} งาน</p>
                  </div>

                  <p className="rounded-[1.25rem] bg-surface-container-lowest p-4 text-sm leading-6 text-on-surface-variant">
                    {user.note}
                  </p>

                  <Link
                    href={`/portal/users/${user.id}`}
                    className={`${buttonVariants({ variant: "secondary" })} w-full sm:w-auto`}
                  >
                    เปิดโปรไฟล์ลูกค้า
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="surface-card rounded-[1.75rem] p-5 text-sm text-on-surface-variant">
              ยังไม่มีข้อมูลลูกค้าในระบบ
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
