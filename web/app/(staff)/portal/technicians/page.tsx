import Link from "next/link";
import { auth } from "@/auth";
import { Avatar } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { ProfileBubble } from "@/components/shared/profile-bubble";
import { TopAppBar } from "@/components/shared/top-app-bar";
import { getTechnicians } from "@/lib/server-data";

export default async function TechniciansPage() {
  const [session, technicians] = await Promise.all([auth(), getTechnicians()]);

  return (
    <div>
      <TopAppBar title="Technicians" right={<ProfileBubble image={session?.user?.image ?? undefined} />} />
      <main className="page-content page-stack">
        <section className="page-hero">
          <span className="block text-sm font-bold uppercase tracking-widest text-primary">Team</span>
          <h1 className="headline-font text-3xl font-extrabold tracking-tight text-on-surface">ทีมช่าง</h1>
          <p className="mt-2 text-sm leading-6 text-on-surface-variant">
            รายชื่อช่างที่เปิดรับงานในร้าน พร้อม skill, พื้นที่ดูแล และสถานะ availability
          </p>
        </section>

        <div className="card-stack">
          {technicians.length > 0 ? (
            technicians.map((technician) => (
              <div key={technician.id} className="surface-card rounded-[1.75rem] p-5 ambient-shadow md:p-6">
                <div className="section-stack">
                  <div className="flex items-start gap-4">
                    <Avatar label={technician.name} image={technician.image} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="headline-font text-lg font-bold text-on-surface">{technician.name}</p>
                        <span className="rounded-full bg-primary-fixed-dim/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-on-primary-fixed-variant">
                          {technician.availability === "available" ? "available" : "busy"}
                        </span>
                      </div>
                      <p className="text-sm text-on-surface-variant">{technician.shopName}</p>
                      <p className="mt-2 text-sm text-on-surface-variant">
                        Skill: {technician.services.join(", ") || "-"}
                      </p>
                      <p className="text-sm text-on-surface-variant">
                        พื้นที่: {technician.area.join(", ") || "-"}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/portal/technicians/${technician.id}`}
                    className={`${buttonVariants({ variant: "secondary" })} w-full sm:w-auto`}
                  >
                    ดูรายละเอียดช่าง
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="surface-card rounded-[1.75rem] p-5 text-sm text-on-surface-variant">
              ยังไม่มีช่างในระบบ
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
