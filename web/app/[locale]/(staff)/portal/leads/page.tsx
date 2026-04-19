import { Search } from "lucide-react";
import { LeadCard } from "@/components/shop/lead-card";
import { Input } from "@/components/ui/input";
import { getStaffDictionary } from "@/lib/i18n/staff";
import { getLeads } from "@/lib/server-data";

export default async function LeadsPage({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const [leads, t] = await Promise.all([getLeads(), Promise.resolve(getStaffDictionary(locale))]);

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-black/[0.04] bg-white/80 backdrop-blur-xl">
        <div className="flex h-14 items-center px-4">
          <h1 className="text-base font-bold text-on-surface">{t.leads.title}</h1>
          <span className="ml-2 rounded-full bg-primary/5 px-2 py-0.5 text-[11px] font-bold text-primary">
            {leads.length}
          </span>
        </div>
      </header>

      <main className="px-4 py-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant/30" />
          <Input
            className="bg-surface-container-low pl-10 ring-0 focus:ring-2 focus:ring-primary/10"
            placeholder={t.leads.searchPlaceholder}
          />
        </div>

        {/* Quick filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {t.leads.filters.map((label, i) => (
            <button
              key={label}
              className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                i === 0
                  ? "bg-on-surface text-white"
                  : "bg-surface-container-low text-on-surface-variant/50 hover:bg-surface-container"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Lead list */}
        <div className="space-y-2">
          {leads.length > 0 ? (
            leads.map((lead) => <LeadCard key={lead.id} lead={lead} />)
          ) : (
            <p className="py-16 text-center text-sm text-on-surface-variant/30">
              {t.leads.empty}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
