import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { ProfileBubble } from "@/components/shared/profile-bubble";
import { TopAppBar } from "@/components/shared/top-app-bar";
import { technicians } from "@/lib/mock-data";

export default function TechniciansPage() {
  return (
    <div>
      <TopAppBar
        title="Atmospheric"
        right={<ProfileBubble image={technicians[0]?.heroImage} />}
      />
      <main className="space-y-4 px-6 pb-24 pt-24">
        <section className="mb-6 pt-4">
          <span className="block text-sm font-bold uppercase tracking-widest text-primary">Team</span>
          <h1 className="headline-font text-3xl font-extrabold tracking-tight">Technicians</h1>
        </section>
        {technicians.map((technician) => (
          <div key={technician.id} className="surface-card rounded-[2rem] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.02)]">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <Avatar label={technician.name} image={technician.heroImage} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="headline-font text-lg font-bold text-on-surface">{technician.name}</p>
                    <span className="rounded-full bg-primary-fixed-dim/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-on-primary-fixed-variant">
                      {technician.availability}
                    </span>
                  </div>
                  <p className="text-sm text-on-surface-variant">{technician.shopName}</p>
                  <p className="mt-2 text-sm text-on-surface-variant">
                    Skill: {technician.services.join(", ")}
                  </p>
                  <p className="text-sm text-on-surface-variant">
                    พื้นที่: {technician.area.join(", ")}
                  </p>
                </div>
              </div>
              <Link href={`/portal/technicians/${technician.id}`} className={buttonVariants({ variant: "secondary" })}>
                ดูรายละเอียดช่าง
              </Link>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
