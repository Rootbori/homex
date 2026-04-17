import Link from "next/link";
import { Clock3, MessageCircle, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { LeadSummary } from "@/lib/api-types";

export function LeadCard({ lead }: Readonly<{ lead: LeadSummary }>) {
  const isNew = lead.status === "new";
  const isQuoted = lead.status === "quoted";

  const getStatusInfo = () => {
    if (isNew) return { variant: "warning" as const, label: "New Lead" };
    if (isQuoted) return { variant: "default" as const, label: "Pending" };
    return { variant: "success" as const, label: "Converted" };
  };

  const { variant: statusVariant, label: statusLabel } = getStatusInfo();

  return (
    <div className="premium-card p-6 border-none ring-1 ring-black/[0.03] transition-all hover:scale-[1.01]">
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Badge variant={statusVariant} className="h-5 px-2 text-[9px] font-black uppercase tracking-tighter">
                {statusLabel}
              </Badge>
              <span className="flex items-center gap-1 text-[10px] font-bold text-on-surface-variant/40">
                <Clock3 className="h-3.5 w-3.5" />
                {lead.time}
              </span>
            </div>
            <p className="headline-font text-xl font-extrabold tracking-tight text-on-surface">คุณ{lead.userName}</p>
            <p className="text-xs font-bold text-primary mt-0.5">{lead.phone}</p>
          </div>
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-inner ${
              lead.source === "line_oa" ? "bg-emerald-50" : "bg-primary/5"
            }`}
          >
            {lead.source === "line_oa" ? (
              <MessageCircle className="h-6 w-6 text-emerald-500" />
            ) : (
              <Search className="h-6 w-6 text-primary" />
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-black/5 pt-4">
          <div>
            <span className="mb-0.5 block text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40">
              Service
            </span>
            <span className="text-sm font-bold text-on-surface">{lead.serviceType}</span>
          </div>
          <div>
            <span className="mb-0.5 block text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40">
              Quantity
            </span>
            <span className="text-sm font-bold text-on-surface">{lead.units} เครื่อง</span>
          </div>
        </div>

        <Link href={`/portal/leads/${lead.id}`} className="flex h-11 w-full items-center justify-center rounded-xl bg-surface-container text-xs font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors">
          ดูรายละเอียดลีดนี้
        </Link>
      </div>
    </div>
  );
}
