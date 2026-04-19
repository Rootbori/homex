import Link from "next/link";
import { cookies } from "next/headers";
import { ChevronRight, LogOut, User } from "lucide-react";
import { auth } from "@/auth";
import { signOutAction } from "@/lib/auth/actions";
import { providerLabel } from "@/lib/auth-flow";
import { getStaffDictionary } from "@/lib/i18n/staff";
import { getJobs, getPortalStore, getTechnicians, getUsers } from "@/lib/server-data";

export default async function MorePage({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const cookieStore = await cookies();
  const actorRole = cookieStore.get("homex_role")?.value ?? "";
  const { locale } = await params;
  const [session, store, technicians, users, jobs, t] = await Promise.all([
    auth(),
    getPortalStore(),
    getTechnicians(),
    getUsers(),
    getJobs(),
    Promise.resolve(getStaffDictionary(locale)),
  ]);
  const displayName = session?.user?.name ?? t.more.defaultName;
  const displayEmail = session?.user?.email ?? t.more.noEmail;
  const loginProvider = providerLabel(session?.provider ?? session?.user?.provider);
  const isTechnicianView = actorRole === "technician";
  const links = [
    { href: "/portal/setup", ...t.more.links.setup },
    { href: "/portal/quotation", ...t.more.links.quotation },
    { href: "/portal/technicians", ...t.more.links.technicians },
    { href: "/portal/my-jobs", ...t.more.links.myJobs },
    { href: "/portal/users", ...t.more.links.users },
  ];
  const statCards = [
    {
      href: "/portal/technicians",
      value: technicians.length,
      label: t.common.technician,
      description: t.more.stats.techniciansDescription,
    },
    {
      href: "/portal/users",
      value: users.length,
      label: t.common.customer,
      description: t.more.stats.usersDescription,
    },
    {
      href: "/portal/jobs",
      value: jobs.length,
      label: t.common.jobs,
      description: isTechnicianView ? t.more.stats.jobsDescriptionTechnician : t.more.stats.jobsDescriptionAll,
    },
  ] as const;

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-black/[0.04] bg-white/80 backdrop-blur-xl">
        <div className="flex h-14 items-center px-4">
          <h1 className="text-base font-bold text-on-surface">{t.more.title}</h1>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Profile card */}
        <div className="flex items-center gap-4 rounded-2xl bg-surface-container-low p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <User className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-on-surface">{displayName}</h2>
            <p className="text-xs text-on-surface-variant/50">
              {displayEmail} • {loginProvider}
            </p>
            <p className="mt-1 text-[11px] font-medium text-on-surface-variant/40">
              {t.common.currentStore}: {store?.name ?? t.common.storeNotFound}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {statCards.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl bg-surface-container-low p-3 text-center transition-colors hover:bg-surface-container"
            >
              <p className="text-xl font-extrabold text-on-surface">{item.value}</p>
              <p className="text-[10px] font-medium text-on-surface-variant/40">{item.label}</p>
            </Link>
          ))}
        </div>

        <div className="rounded-2xl bg-surface-container-low p-4 text-xs leading-6 text-on-surface-variant">
          {statCards.map((item) => (
            <p key={`${item.href}-description`}>
              <span className="font-semibold text-on-surface">{item.label}:</span> {item.description}
            </p>
          ))}
        </div>

        {/* Menu links */}
        <div className="rounded-2xl bg-white ring-1 ring-black/[0.04] divide-y divide-black/[0.04]">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-surface-container-low"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-on-surface">{item.label}</p>
                <p className="text-xs text-on-surface-variant/40">{item.description}</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-on-surface-variant/20" />
            </Link>
          ))}
        </div>

        {/* Logout */}
        <form action={signOutAction}>
          <input name="redirectTo" type="hidden" value={`/${locale}/login`} />
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            {t.more.logout}
          </button>
        </form>
      </main>
    </div>
  );
}
