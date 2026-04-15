import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import type { Technician } from "@/lib/mock-data";

export function TechnicianCard({ technician }: { technician: Technician }) {
  return (
    <div className="surface-card rounded-[2rem] border border-border/20 p-6 shadow-sm transition-transform duration-200 active:scale-95">
      <div className="space-y-5">
        <div className="flex items-start gap-3">
          <Avatar label={technician.name} image={technician.heroImage} />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <p className="headline-font text-xl font-bold text-on-surface">
                    {technician.shopName}
                  </p>
                  <span className="rounded-full bg-primary-fixed-dim/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-on-primary-fixed-variant">
                    {technician.availability === "available" ? "ว่าง" : "busy"}
                  </span>
                </div>
                <p className="text-sm text-on-surface-variant">{technician.name}</p>
              </div>
            </div>
            <div className="mt-1 flex items-center gap-1 text-secondary">
              <Star className="h-4 w-4 fill-current text-secondary" />
              <span className="text-sm font-bold text-on-surface">{technician.rating}</span>
              <span className="ml-1 text-xs text-on-surface-variant">
                ({technician.reviewCount} รีวิว)
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-on-surface-variant">
            <MapPin className="h-4 w-4" />
            <span className="text-sm font-medium">{technician.area.join(", ")}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {technician.services.map((service) => (
              <span
                key={service}
                className="rounded-lg bg-surface-container-low px-3 py-1 text-xs font-medium text-on-surface-variant"
              >
                {service}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              ราคาเริ่มต้น
            </span>
            <span className="text-2xl font-extrabold text-primary">
              {technician.startingPrice}฿
            </span>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/technicians/${technician.slug}`}
              className={buttonVariants({ variant: "secondary" })}
            >
              ดูโปรไฟล์
            </Link>
            <Link href={`/request?technician=${technician.slug}`} className={buttonVariants()}>
              ส่งคำขอ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
