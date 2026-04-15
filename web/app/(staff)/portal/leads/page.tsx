import { CalendarDays, Filter, Globe2, MapPin, Search } from "lucide-react";
import { LeadCard } from "@/components/shop/lead-card";
import { ProfileBubble } from "@/components/shared/profile-bubble";
import { TopAppBar } from "@/components/shared/top-app-bar";
import { Input } from "@/components/ui/input";
import { leads, technicians } from "@/lib/mock-data";

export default function LeadsPage() {
  return (
    <div>
      <TopAppBar
        title="Atmospheric"
        right={<ProfileBubble image={technicians[0]?.heroImage} />}
      />
      <main className="min-h-screen max-w-md px-6 pb-32 pt-24">
        <div className="mb-8 pt-4">
          <span className="mb-1 block text-sm font-bold uppercase tracking-widest text-primary">
            Sales Funnel
          </span>
          <h2 className="headline-font text-3xl font-extrabold tracking-tight text-on-surface">
            Leads รายใหม่
          </h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            จัดการรายชื่อลูกค้าที่สนใจบริการของคุณ
          </p>
        </div>

        <section className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
            <Input className="pl-12" placeholder="ค้นหาชื่อลูกค้าหรือเบอร์โทร..." />
          </div>
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2">
            <button className="flex items-center gap-2 whitespace-nowrap rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-on-primary">
              <Filter className="h-4 w-4" />
              กรองข้อมูล
            </button>
            <button className="flex items-center gap-2 whitespace-nowrap rounded-full bg-surface-container-high px-4 py-2 text-sm font-medium text-on-surface-variant">
              <Globe2 className="h-4 w-4" />
              LINE/Web
            </button>
            <button className="flex items-center gap-2 whitespace-nowrap rounded-full bg-surface-container-high px-4 py-2 text-sm font-medium text-on-surface-variant">
              <MapPin className="h-4 w-4" />
              พื้นที่
            </button>
            <button className="flex items-center gap-2 whitespace-nowrap rounded-full bg-surface-container-high px-4 py-2 text-sm font-medium text-on-surface-variant">
              <CalendarDays className="h-4 w-4" />
              วันที่
            </button>
          </div>
        </section>

        <div className="space-y-4">
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </div>
      </main>
    </div>
  );
}
