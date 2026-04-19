import { cookies } from "next/headers";
import Link from "next/link";
import { ArrowLeft, Wrench } from "lucide-react";
import { JobCard } from "@/components/shop/job-card";
import { localizeAppPath } from "@/lib/auth-flow";
import { getStaffDictionary } from "@/lib/i18n/staff";
import { getJobsForTechnician } from "@/lib/server-data";

export default async function TechnicianMyJobsPage({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const cookieStore = await cookies();
  const technicianId = cookieStore.get("homex_technician_id")?.value ?? "";
  const { locale } = await params;
  const [t, myJobs] = await Promise.all([
    Promise.resolve(getStaffDictionary(locale)),
    technicianId ? getJobsForTechnician(technicianId) : Promise.resolve([]),
  ]);

  const onTheWay = myJobs.filter((job) => job.status === "on_the_way").length;
  const inProgress = myJobs.filter((job) => job.status === "in_progress").length;

  return (
    <div className="mx-auto max-w-3xl">
      <header className="sticky top-0 z-50 border-b border-black/[0.04] bg-white/80 backdrop-blur-xl">
        <div className="flex h-14 items-center gap-3 px-4">
          <Link
            href={localizeAppPath("/portal/more", locale)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant/50 transition-colors hover:bg-surface-container-low hover:text-on-surface"
            aria-label={t.common.backToMore}
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-base font-bold text-on-surface">{t.myJobs.title}</h1>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-primary/5 p-3 text-center">
            <p className="text-xl font-extrabold text-primary">{myJobs.length}</p>
            <p className="text-[10px] font-medium text-primary/60">{t.common.all}</p>
          </div>
          <div className="rounded-xl bg-surface-container-low p-3 text-center">
            <p className="text-xl font-extrabold text-on-surface">{onTheWay}</p>
            <p className="text-[10px] font-medium text-on-surface-variant/40">{t.myJobs.onTheWay}</p>
          </div>
          <div className="rounded-xl bg-surface-container-low p-3 text-center">
            <p className="text-xl font-extrabold text-on-surface">{inProgress}</p>
            <p className="text-[10px] font-medium text-on-surface-variant/40">{t.myJobs.inProgress}</p>
          </div>
        </div>

        {/* Job list */}
        <div className="space-y-2">
          {myJobs.length > 0 ? (
            myJobs.map((job) => <JobCard key={job.id} job={job} />)
          ) : (
            <div className="flex flex-col items-center py-16 text-center">
              <Wrench className="mb-3 h-8 w-8 text-on-surface-variant/15" />
              <p className="text-sm font-bold text-on-surface">
                {technicianId ? t.myJobs.emptyAssigned : t.myJobs.emptyUnlinked}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
