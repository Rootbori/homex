import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import type { TechnicianSummary } from "@/lib/api-types";
import type { Locale } from "@/lib/i18n/config";
import type { PublicMessages } from "@/lib/i18n/messages";

export function TechnicianCard({
  technician,
  locale = "th",
  messages,
}: Readonly<{ technician: TechnicianSummary; locale?: Locale; messages: PublicMessages }>) {
  return (
    <Link
      href={`/${locale}/technicians/${technician.slug}`}
      className="group flex gap-4 rounded-2xl bg-white p-4 ring-1 ring-black/[0.04] transition-all hover:shadow-md active:scale-[0.99]"
    >
      {/* Avatar */}
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-surface-container">
        {technician.image ? (
          <div
            className="h-full w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${technician.image})` }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-lg font-bold text-primary/30">
            {technician.name.charAt(0)}
          </div>
        )}
        <div
          className={`absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full border-2 border-white ${
            technician.availability === "available" ? "bg-emerald-400" : "bg-amber-400"
          }`}
        />
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-[15px] font-bold text-on-surface">
            {technician.shopName}
          </h3>
          {technician.rating >= 4.8 && (
            <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-600">
              {messages.technicianCard.topBadge}
            </span>
          )}
        </div>
        <p className="mt-0.5 truncate text-xs text-on-surface-variant/50">
          {technician.headline}
        </p>

        <div className="mt-2 flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-on-surface-variant/60">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-on-surface">{technician.rating}</span>
            <span>({technician.reviewCount})</span>
          </span>
          <span className="flex items-center gap-1 text-on-surface-variant/40">
            <MapPin className="h-3 w-3" />
            <span className="max-w-[100px] truncate">
              {Array.isArray(technician.area) ? technician.area.join(", ") : technician.area}
            </span>
          </span>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm font-bold text-on-surface">
            ฿{technician.startingPrice}
            <span className="text-xs font-normal text-on-surface-variant/40">{messages.technicianCard.perVisit}</span>
          </span>
          <span className="rounded-lg bg-primary/5 px-3 py-1.5 text-xs font-bold text-primary transition-colors group-hover:bg-primary group-hover:text-white">
            {messages.technicianCard.viewProfile}
          </span>
        </div>
      </div>
    </Link>
  );
}
