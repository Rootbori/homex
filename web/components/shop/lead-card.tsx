import Link from "next/link";
import { Clock3, MessageCircle, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import type { Lead } from "@/lib/mock-data";

export function LeadCard({ lead }: { lead: Lead }) {
  return (
    <div className="surface-card rounded-[1.75rem] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-transform active:scale-[0.98]">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Badge variant={lead.status === "new" ? "warning" : lead.status === "quoted" ? "default" : "success"}>
                {lead.status === "new" ? "ใหม่" : lead.status === "quoted" ? "รอติดต่อ" : "สร้างใบเสนอราคาแล้ว"}
              </Badge>
              <span className="flex items-center gap-1 text-[11px] font-medium text-on-surface-variant">
                <Clock3 className="h-3.5 w-3.5" />
                {lead.time}
              </span>
            </div>
            <p className="headline-font text-lg font-bold text-on-surface">{lead.customerName}</p>
            <p className="text-sm font-medium text-primary">{lead.phone}</p>
          </div>
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${
              lead.source === "line_oa" ? "bg-[#E8F7EE]" : "bg-primary/5"
            }`}
          >
            {lead.source === "line_oa" ? (
              <MessageCircle className="h-5 w-5 text-[#06C755]" />
            ) : (
              <Search className="h-5 w-5 text-primary" />
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-border/15 pt-3.5">
          <div>
            <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">
              Service
            </span>
            <span className="text-sm font-bold text-on-surface">{lead.serviceType}</span>
          </div>
          <div>
            <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">
              AC Unit
            </span>
            <span className="text-sm font-bold text-on-surface">{lead.units} เครื่อง</span>
          </div>
        </div>

        <Link href={`/portal/leads/${lead.id}`} className={buttonVariants({ variant: "ghost" })}>
          เปิดรายละเอียด lead
        </Link>
      </div>
    </div>
  );
}
