import Link from "next/link";
import { Menu, MapPin, Search, Zap } from "lucide-react";
import { TechnicianCard } from "@/components/customer/technician-card";
import { ProfileBubble } from "@/components/shared/profile-bubble";
import { TopAppBar } from "@/components/shared/top-app-bar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { technicians } from "@/lib/mock-data";

export function DiscoveryView({ compact = false }: { compact?: boolean }) {
  return (
    <div>
      <TopAppBar
        title="Atmospheric"
        left={
          <button className="rounded-full p-2 text-primary transition-transform active:scale-95">
            <Menu className="h-5 w-5" />
          </button>
        }
        right={<ProfileBubble image={technicians[0]?.heroImage} />}
      />
      <main className="page-content page-stack">
        <section className="page-hero">
          <h1 className="headline-font text-4xl font-extrabold leading-tight tracking-tight text-on-surface">
            Air Service
          </h1>
          <p className="text-lg text-on-surface-variant">จัดการความเย็นให้สมบูรณ์แบบ</p>
        </section>

        <div className={`${compact ? "" : "sticky top-20 z-40"} -mx-5 bg-surface/95 px-5 py-3.5 backdrop-blur-sm md:-mx-6 md:px-6`}>
          <div className="group relative transition-all duration-300">
            <Input className="pl-12 pr-4" placeholder="ค้นหาช่างแอร์ในพื้นที่ของคุณ" />
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant transition-colors group-focus-within:text-primary" />
          </div>
          <div className="no-scrollbar mt-3.5 flex gap-2 overflow-x-auto pb-1">
            <button className="flex items-center gap-1 whitespace-nowrap rounded-full bg-primary px-5 py-2 text-sm font-semibold text-on-primary">
              <MapPin className="h-4 w-4" /> พื้นที่
            </button>
            <button className="whitespace-nowrap rounded-full bg-surface-container-highest px-5 py-2 text-sm font-semibold text-on-surface-variant">
              ล้างแอร์
            </button>
            <button className="whitespace-nowrap rounded-full bg-surface-container-highest px-5 py-2 text-sm font-semibold text-on-surface-variant">
              ซ่อมแอร์
            </button>
            <button className="flex items-center gap-1 whitespace-nowrap rounded-full bg-secondary-container px-5 py-2 text-sm font-semibold text-on-secondary-container">
              <Zap className="h-4 w-4" /> ว่างตอนนี้
            </button>
          </div>
        </div>

        <div className="card-stack">
          {technicians.map((technician) => (
            <TechnicianCard key={technician.id} technician={technician} />
          ))}
        </div>

        {!compact ? (
          <div className="relative flex h-64 flex-col justify-end overflow-hidden rounded-[2.25rem] bg-[#001a41] p-6 md:p-8 text-on-primary">
            <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-primary-container/20 blur-3xl" />
            <div className="relative z-10">
              <Badge variant="warning">Flash Deal</Badge>
              <h2 className="headline-font mb-2 mt-4 text-3xl font-bold leading-tight">
                ล้างแอร์ยกบ้าน
                <br />
                รับส่วนลด 20%
              </h2>
              <p className="text-sm text-primary-fixed opacity-80">
                เฉพาะวันจันทร์-ศุกร์ ในเขตกรุงเทพฯ
              </p>
            </div>
          </div>
        ) : null}

        <Link href="/request" className={buttonVariants({ size: "lg" })}>
          สร้างคำขอ
        </Link>
        <Link href="/signup" className={buttonVariants({ variant: "outline", size: "lg" })}>
          สมัครผู้หางาน / ผู้รับงาน
        </Link>
      </main>
    </div>
  );
}
