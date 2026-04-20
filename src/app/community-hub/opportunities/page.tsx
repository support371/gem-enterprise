"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HubSectionHeader } from "@/components/hub/HubSectionHeader";
import { OpportunityCard } from "@/components/hub/OpportunityCard";
import { AccessRequestCTA } from "@/components/hub/AccessRequestCTA";
import { OPPORTUNITIES, type OpportunityStage } from "@/lib/hub/mock-data";
import { cn } from "@/lib/utils";

const SECTORS = ["All", "Logistics", "Real Estate", "Compliance", "Private Credit", "Infrastructure", "Distribution"];
const STAGES: (OpportunityStage | "All")[] = ["All", "Sourcing", "Active", "Due Diligence", "Closing"];
const TYPES = ["All", "Capital", "Acquisition", "Partnership", "Mandate", "Secondary"];

export default function OpportunitiesPage() {
  const [query, setQuery] = useState("");
  const [sector, setSector] = useState("All");
  const [stage, setStage] = useState<OpportunityStage | "All">("All");
  const [type, setType] = useState("All");
  const [savedIds, setSavedIds] = useState<string[]>([]);

  const filtered = useMemo(() => {
    return OPPORTUNITIES.filter((o) => {
      if (sector !== "All" && o.sector !== sector) return false;
      if (stage !== "All" && o.stage !== stage) return false;
      if (type !== "All" && o.type !== type) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        return (
          o.title.toLowerCase().includes(q) ||
          o.summary.toLowerCase().includes(q) ||
          o.region.toLowerCase().includes(q) ||
          o.postedBy.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [query, sector, stage, type]);

  const handleSave = (id: string) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const featured = filtered.filter((o) => o.featured);
  const recommended = filtered.filter((o) => !o.featured);

  return (
    <>
      {/* Header */}
      <section className="border-b border-white/[0.06]">
        <div className="mx-auto max-w-screen-xl px-4 py-12 sm:px-6 lg:px-8">
          <HubSectionHeader
            eyebrow="Opportunity Marketplace"
            title={<>Qualified flow for verified members</>}
            description="Filter by sector, region, stage, and type. Save opportunities to your workspace — introductions and full disclosures require verified membership."
          />

          {/* Filter / search bar */}
          <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-white/[0.07] bg-[#0e1420] p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40"
                  aria-hidden="true"
                />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by title, sector, region, or sponsor"
                  aria-label="Search opportunities"
                  className="h-10 border-white/10 bg-white/[0.02] pl-9 text-sm placeholder:text-white/35"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                className="h-10 shrink-0 border border-white/10 bg-transparent text-sm text-white/70 hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
              >
                <SlidersHorizontal className="mr-2 h-4 w-4" aria-hidden="true" />
                Saved search alerts
              </Button>
            </div>

            {/* Filter chip groups */}
            <div className="flex flex-col gap-3 border-t border-white/[0.05] pt-3">
              <FilterChips
                label="Sector"
                options={SECTORS}
                value={sector}
                onChange={setSector}
              />
              <FilterChips
                label="Stage"
                options={STAGES}
                value={stage}
                onChange={(v) => setStage(v as OpportunityStage | "All")}
              />
              <FilterChips
                label="Type"
                options={TYPES}
                value={type}
                onChange={setType}
              />
            </div>

            <div className="flex items-center justify-between border-t border-white/[0.05] pt-3 text-xs text-white/45">
              <span>
                Showing{" "}
                <span className="font-mono text-primary">{filtered.length}</span>{" "}
                of {OPPORTUNITIES.length} opportunities
              </span>
              <span className="font-mono">
                {savedIds.length} saved
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured rail */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-screen-xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center gap-3">
            <Badge className="rounded-full border border-amber-400/25 bg-amber-400/8 font-mono text-[10px] uppercase tracking-wider text-amber-300">
              <Sparkles className="mr-1 h-3 w-3" aria-hidden="true" />
              Featured
            </Badge>
            <span className="text-sm text-white/50">
              Personalized for your profile
            </span>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((op) => (
              <OpportunityCard
                key={op.id}
                opportunity={op}
                onSave={handleSave}
                saved={savedIds.includes(op.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Full list */}
      <section className="mx-auto max-w-screen-xl px-4 pb-16 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-sm font-semibold uppercase tracking-widest text-white/50">
          All opportunities
        </h2>
        {recommended.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {recommended.map((op) => (
              <OpportunityCard
                key={op.id}
                opportunity={op}
                onSave={handleSave}
                saved={savedIds.includes(op.id)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/[0.07] bg-[#0e1420] px-8 py-12 text-center">
            <h3 className="text-base font-semibold text-foreground">
              No opportunities match these filters
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Adjust your filters or save your criteria as an alert — we&apos;ll
              notify you when a match is listed.
            </p>
          </div>
        )}
      </section>

      <section className="mx-auto max-w-screen-xl px-4 pb-16 sm:px-6 lg:px-8">
        <AccessRequestCTA
          title="See the full opportunity surface"
          description="Verified members see the complete listing with sponsor diligence, data room access, and direct introductions."
          primaryLabel="Request Access"
          secondaryLabel="Member Login"
        />
      </section>
    </>
  );
}

// ─── Filter chips ──────────────────────────────────────────────────────────────

function FilterChips<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="min-w-16 font-mono text-[10px] font-semibold uppercase tracking-widest text-white/40">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const active = value === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition-colors",
                active
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-white/10 bg-white/[0.02] text-white/55 hover:border-white/20 hover:text-white"
              )}
              aria-pressed={active}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
