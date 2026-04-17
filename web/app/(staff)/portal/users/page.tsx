import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { getPortalStore, getUsers } from "@/lib/server-data";

export default async function UsersPage() {
  const [store, users] = await Promise.all([getPortalStore(), getUsers()]);
  const totalSpend = users.reduce((sum, user) => sum + user.totalSpend, 0);

  return (
    <div className="mx-auto max-w-3xl">
      <header className="sticky top-0 z-50 border-b border-black/[0.04] bg-white/80 backdrop-blur-xl">
        <div className="flex h-14 items-center px-4">
          <h1 className="text-base font-bold text-on-surface">ลูกค้า</h1>
          <span className="ml-2 rounded-full bg-primary/5 px-2 py-0.5 text-[11px] font-bold text-primary">
            {users.length}
          </span>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        <div className="rounded-2xl bg-surface-container-low p-4 text-sm leading-6 text-on-surface-variant">
          แสดงเฉพาะลูกค้าที่มีงานหรือเคยใช้บริการกับ <span className="font-semibold text-on-surface">{store?.name ?? "ร้านปัจจุบัน"}</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-surface-container-low p-3 text-center">
            <p className="text-xl font-extrabold text-on-surface">{users.length}</p>
            <p className="text-[10px] font-medium text-on-surface-variant/40">ลูกค้า</p>
          </div>
          <div className="rounded-xl bg-surface-container-low p-3 text-center">
            <p className="text-lg font-extrabold text-on-surface">{formatCurrency(totalSpend)}</p>
            <p className="text-[10px] font-medium text-on-surface-variant/40">ยอดรวม</p>
          </div>
          <div className="rounded-xl bg-surface-container-low p-3 text-center">
            <p className="text-lg font-extrabold text-on-surface">
              {formatCurrency(users.length > 0 ? Math.round(totalSpend / users.length) : 0)}
            </p>
            <p className="text-[10px] font-medium text-on-surface-variant/40">เฉลี่ย/ราย</p>
          </div>
        </div>

        {/* User list */}
        <div className="space-y-2">
          {users.length > 0 ? (
            users.map((user) => (
              <Link
                key={user.id}
                href={`/portal/users/${user.id}`}
                className="group flex items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-black/[0.04] transition-all hover:shadow-md active:scale-[0.99]"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] font-bold text-on-surface">{user.name}</span>
                    <span className="text-xs font-semibold text-on-surface-variant/40">
                      {formatCurrency(user.totalSpend)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-on-surface-variant/40">
                    {user.phone} • {user.area} • {user.jobsCount} งาน
                  </p>
                  {user.note && (
                    <p className="mt-1 line-clamp-1 text-xs text-on-surface-variant/30">{user.note}</p>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-on-surface-variant/20 transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))
          ) : (
            <p className="py-16 text-center text-sm text-on-surface-variant/30">
              ยังไม่มีลูกค้าในระบบ
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
