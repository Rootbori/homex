import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { TechnicianSummary } from "@/lib/api-types";

export function TechnicianCard({ technician }: Readonly<{ technician: TechnicianSummary }>) {
  return (
    <div className="premium-card p-6 border-none ring-1 ring-black/[0.03]">
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl bg-surface-container shadow-inner">
             {technician.image ? (
               <img src={technician.image} alt={technician.name} className="h-full w-full object-cover" />
             ) : (
               <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-primary/40">
                  {technician.name.charAt(0)}
               </div>
             )}
             <div className={`absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-white shadow-sm ${technician.availability === "available" ? "bg-emerald-500" : "bg-amber-500"}`} />
          </div>
          <div className="min-w-0 flex-1 pt-1">
            <div className="flex items-center gap-2 mb-0.5">
              <h4 className="headline-font truncate text-xl font-extrabold text-on-surface">
                {technician.shopName}
              </h4>
              {technician.rating >= 4.8 && (
                <Badge variant="default" className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-2 py-0 h-5 text-[10px] font-bold uppercase tracking-tighter">Top Rated</Badge>
              )}
            </div>
            <p className="text-sm font-medium text-on-surface-variant/70 mb-2 truncate">{technician.headline}</p>
            
            <div className="flex items-center gap-3">
               <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span className="text-sm font-bold text-on-surface">{technician.rating}</span>
                <span className="text-xs text-on-surface-variant">({technician.reviewCount})</span>
              </div>
              <div className="flex items-center gap-1 text-on-surface-variant">
                <MapPin className="h-3.5 w-3.5" />
                <span className="text-xs font-semibold truncate max-w-[120px]">{Array.isArray(technician.area) ? technician.area.join(", ") : technician.area}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-black/5 pt-5">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">
              เริ่มต้นต่อครั้ง
            </span>
            <div className="flex items-baseline gap-1">
               <span className="text-2xl font-black text-primary italic">฿{technician.startingPrice}</span>
               <span className="text-[10px] font-bold text-on-surface-variant/40">.00</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/technicians/${technician.slug}`}
              className="interactive-scale flex h-11 items-center justify-center rounded-xl bg-surface-container px-6 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-high"
            >
              โปรไฟล์
            </Link>
            <Link 
              href={`/request?technician=${technician.slug}`} 
              className="interactive-scale flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-bold text-on-primary atmospheric-glow"
            >
              จองเลย
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
