"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MapPin, Search, SlidersHorizontal } from "lucide-react";
import { TechnicianCard } from "@/components/user/technician-card";
import { Input } from "@/components/ui/input";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { Logo } from "@/components/ui/logo";
import { SelectField } from "@/components/ui/select-field";
import type { TechnicianSummary } from "@/lib/api-types";
import type { Locale } from "@/lib/i18n/config";
import { formatLocalizedText, type PublicMessages } from "@/lib/i18n/messages";
import { priceOptionsForLocale } from "@/lib/i18n/public-copy";

type DiscoveryViewProps = {
  compact?: boolean;
  technicians: TechnicianSummary[];
  allTechnicians: TechnicianSummary[];
  query?: string;
  service?: string;
  area?: string;
  availability?: string;
  maxPrice?: string;
  seoContent?: {
    title: string;
    description: string;
    highlights?: string[];
    links?: Array<{
      href: string;
      label: string;
    }>;
  };
  locale?: Locale;
  messages: PublicMessages;
};

export function DiscoveryView({
  compact = false,
  technicians,
  allTechnicians,
  query: initialQuery = "",
  service: initialService = "",
  area: initialArea = "",
  availability: initialAvailability = "",
  maxPrice: initialMaxPrice = "",
  seoContent,
  locale = "th",
  messages,
}: Readonly<DiscoveryViewProps>) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(initialQuery);
  const [service, setService] = useState(initialService);
  const [area, setArea] = useState(initialArea);
  const [availability, setAvailability] = useState(initialAvailability);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);

  useEffect(() => setQuery(initialQuery), [initialQuery]);
  useEffect(() => setService(initialService), [initialService]);
  useEffect(() => setArea(initialArea), [initialArea]);
  useEffect(() => setAvailability(initialAvailability), [initialAvailability]);
  useEffect(() => setMaxPrice(initialMaxPrice), [initialMaxPrice]);

  const serviceOptions = useMemo(() => {
    const labels = new Set<string>();
    for (const technician of allTechnicians) {
      for (const item of technician.services) {
        if (item.trim()) labels.add(item.trim());
      }
    }
    return Array.from(labels).sort((a, b) => a.localeCompare(b, "th"));
  }, [allTechnicians]);

  const areaOptions = useMemo(() => {
    const labels = new Set<string>();
    for (const technician of allTechnicians) {
      for (const item of technician.area) {
        if (item.trim()) labels.add(item.trim());
      }
    }
    return Array.from(labels).sort((a, b) => a.localeCompare(b, "th"));
  }, [allTechnicians]);

  const activeFilterCount = [service, area, availability, maxPrice].filter(Boolean).length;
  const priceOptions = useMemo(() => priceOptionsForLocale(locale), [locale]);
  const activeFiltersLabel =
    activeFilterCount > 0
      ? formatLocalizedText(messages.search.filtersActive, { count: activeFilterCount })
      : messages.search.filtersEmpty;
  const resultsTitle = formatLocalizedText(messages.search.resultTitle, { count: technicians.length });
  const resultsSummary = initialQuery
    ? formatLocalizedText(messages.search.resultSummary, { query: initialQuery })
    : messages.search.resultFallback;

  function pushFilters(next?: Partial<{ query: string; service: string; area: string; availability: string; maxPrice: string }>) {
    const params = new URLSearchParams();
    const nextQuery = next?.query ?? query;
    const nextService = next?.service ?? service;
    const nextArea = next?.area ?? area;
    const nextAvailability = next?.availability ?? availability;
    const nextMaxPrice = next?.maxPrice ?? maxPrice;

    if (nextQuery.trim()) params.set("q", nextQuery.trim());
    if (nextService) params.set("service", nextService);
    if (nextArea) params.set("area", nextArea);
    if (nextAvailability) params.set("availability", nextAvailability);
    if (nextMaxPrice) params.set("max_price", nextMaxPrice);

    const targetPath = compact ? `/${locale}/search` : pathname || `/${locale}`;
    const href = params.toString() ? `${targetPath}?${params.toString()}` : targetPath;
    router.push(href);
  }

  function handleSearch(event: React.SyntheticEvent) {
    event.preventDefault();
    pushFilters({ query });
  }

  function clearFilters() {
    setService("");
    setArea("");
    setAvailability("");
    setMaxPrice("");
    const targetPath = compact ? `/${locale}/search` : `/${locale}`;
    if (query.trim()) {
      router.push(`${targetPath}?q=${encodeURIComponent(query.trim())}`);
      return;
    }
    router.push(targetPath);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="sticky top-0 z-50 border-b border-black/[0.04] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(245,248,252,0.94))] px-4 pb-4 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
        <div className="pt-3">
          <div className="overflow-hidden rounded-[1.9rem] bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(239,246,255,0.92))] p-3 shadow-[0_24px_50px_-36px_rgba(15,23,42,0.28)] ring-1 ring-black/[0.05]">
            <div className="flex items-start justify-between gap-3">
              <Link
                href={`/${locale}`}
                className="flex min-w-0 items-center gap-3 rounded-2xl transition-colors hover:opacity-90"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-[0_18px_35px_-18px_rgba(59,130,246,0.7)]">
                  <Logo className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-on-surface-variant/45">
                    Homex
                  </p>
                  <h1 className="truncate text-sm font-bold text-on-surface">
                    {messages.header.searchTitle}
                  </h1>
                  <p className="truncate text-[11px] text-on-surface-variant/55">
                    {messages.header.searchSubtitle}
                  </p>
                </div>
              </Link>

              <div className="rounded-xl bg-white/85 p-1 ring-1 ring-black/[0.05]">
                <LanguageSwitcher locale={locale} messages={messages} />
              </div>
            </div>

            <form
              onSubmit={handleSearch}
              className="relative mt-3 rounded-[1.35rem] bg-white/82 p-1.5 shadow-[0_18px_36px_-30px_rgba(15,23,42,0.32)] ring-1 ring-black/[0.06]"
            >
              <Search className="absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant/30" />
              <Input
                className="h-11 rounded-[1rem] border-0 bg-transparent pl-11 pr-4 shadow-none ring-0 placeholder:text-on-surface-variant/38"
                placeholder={messages.search.inputPlaceholder}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </form>

            {activeFilterCount > 0 || area ? (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {activeFilterCount > 0 ? (
                  <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-on-surface shadow-[0_10px_24px_-18px_rgba(15,23,42,0.26)] ring-1 ring-black/[0.05]">
                    {activeFiltersLabel}
                  </span>
                ) : null}
                {area ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/8 px-3 py-1 text-[11px] font-semibold text-primary">
                    <MapPin className="h-3.5 w-3.5" />
                    {area}
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <main className="space-y-6 px-4 py-6">
        {!initialQuery && !compact ? (
          <section className="rounded-[1.9rem] bg-[linear-gradient(135deg,rgba(255,255,255,1),rgba(239,246,255,0.95))] p-6 shadow-[0_24px_60px_-34px_rgba(30,64,175,0.35)] ring-1 ring-primary/10">
            <h1 className="headline-font text-[1.95rem] font-extrabold leading-tight tracking-tight text-on-surface">
              {messages.home.heroTitleFirst}
              <br />
              <span className="text-primary">{messages.home.heroTitleHighlight}</span>
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-on-surface-variant">
              {messages.home.heroDescription}
            </p>
          </section>
        ) : null}

        <section className="rounded-[1.8rem] bg-white p-4 shadow-sm ring-1 ring-black/[0.04]">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <SlidersHorizontal className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-on-surface">{messages.search.filtersTitle}</p>
                <p className="text-xs text-on-surface-variant/50">
                  {activeFiltersLabel}
                </p>
              </div>
            </div>
            {activeFilterCount > 0 ? (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-semibold text-primary"
              >
                {messages.search.clearFilters}
              </button>
            ) : null}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            <button
              type="button"
              onClick={() => {
                setService("");
                pushFilters({ service: "" });
              }}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                service === "" ? "bg-on-surface text-white" : "bg-surface-container-low text-on-surface-variant/70"
              }`}
            >
              {messages.search.all}
            </button>
            {serviceOptions.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  setService(label);
                  pushFilters({ service: label });
                }}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                  service === label ? "bg-primary text-white" : "bg-surface-container-low text-on-surface-variant/70"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <SelectField
              id="search_area"
              label={messages.search.areaLabel}
              value={area}
              onChange={(event) => {
                const value = event.target.value;
                setArea(value);
                pushFilters({ area: value });
              }}
              placeholder={messages.search.areaPlaceholder}
              options={areaOptions.map((label) => ({ value: label, label }))}
            />
            <SelectField
              id="search_price"
              label={messages.search.priceLabel}
              value={maxPrice}
              onChange={(event) => {
                const value = event.target.value;
                setMaxPrice(value);
                pushFilters({ maxPrice: value });
              }}
              options={priceOptions}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                const next = availability === "available" ? "" : "available";
                setAvailability(next);
                pushFilters({ availability: next });
              }}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                availability === "available"
                  ? "bg-emerald-500 text-white"
                  : "bg-surface-container-low text-on-surface-variant/70"
              }`}
            >
              {messages.search.availableNow}
            </button>
            <button
              type="button"
              onClick={() => {
                const next = availability === "busy" ? "" : "busy";
                setAvailability(next);
                pushFilters({ availability: next });
              }}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                availability === "busy"
                  ? "bg-amber-500 text-white"
                  : "bg-surface-container-low text-on-surface-variant/70"
              }`}
            >
              {messages.search.busy}
            </button>
          </div>
        </section>

        <section className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-on-surface-variant/40">{messages.search.resultEyebrow}</p>
            <h2 className="headline-font mt-1 text-xl font-bold text-on-surface">
              {resultsTitle}
            </h2>
            {(initialQuery || service || area || availability || maxPrice) && (
              <p className="mt-1 text-sm text-on-surface-variant/55">
                {resultsSummary}
              </p>
            )}
          </div>
          {area ? (
            <div className="hidden items-center gap-1 rounded-full bg-surface-container-low px-3 py-2 text-xs font-semibold text-on-surface-variant md:flex">
              <MapPin className="h-3.5 w-3.5" />
              {area}
            </div>
          ) : null}
        </section>

        <div className="space-y-3">
          {technicians.length > 0 ? (
            technicians.map((technician) => (
              <TechnicianCard key={technician.id} technician={technician} locale={locale} messages={messages} />
            ))
          ) : (
            <div className="rounded-[1.8rem] bg-white px-6 py-14 text-center shadow-sm ring-1 ring-black/[0.04]">
              <Search className="mx-auto mb-4 h-10 w-10 text-on-surface-variant/15" />
              <p className="text-base font-bold text-on-surface">{messages.search.emptyTitle}</p>
              <p className="mt-2 text-sm leading-6 text-on-surface-variant/55">
                {messages.search.emptyDescription}
              </p>
            </div>
          )}
        </div>

        <div className="grid gap-2">
          <Link
            href={`/${locale}/request`}
            className="flex h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:brightness-110 active:scale-[0.98]"
          >
            {messages.search.createRequest}
          </Link>
        </div>

        {seoContent ? (
          <section className="rounded-[1.8rem] bg-white p-5 shadow-sm ring-1 ring-black/[0.04]">
            <h2 className="headline-font text-xl font-bold text-on-surface">{seoContent.title}</h2>
            <p className="mt-3 text-sm leading-7 text-on-surface-variant">{seoContent.description}</p>

            {seoContent.highlights && seoContent.highlights.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {seoContent.highlights.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-surface-container-low px-3 py-2 text-xs font-semibold text-on-surface-variant"
                  >
                    {item}
                  </span>
                ))}
              </div>
            ) : null}

            {seoContent.links && seoContent.links.length > 0 ? (
              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant/40">
                  {messages.search.seoPopularAreas}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {seoContent.links.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="rounded-full bg-primary/5 px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </section>
        ) : null}
      </main>
    </div>
  );
}
