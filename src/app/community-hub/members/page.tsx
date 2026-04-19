"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { HubSectionHeader } from "@/components/hub/HubSectionHeader";
import { MemberCard } from "@/components/hub/MemberCard";
import { AccessRequestCTA } from "@/components/hub/AccessRequestCTA";
import { DIRECTORY_MEMBERS, type MemberTier } from "@/lib/hub/mock-data";
import { cn } from "@/lib/utils";

const TIERS: ("All" | MemberTier)[] = [
  "All",
  "Partner",
  "Operator",
  "Investor",
  "Client",
  "Advisor",
];

const SECTORS = [
  "All",
  "Private Credit",
  "Capital Markets",
  "Real Estate",
  "Infrastructure",
  "Legal",
  "Family Office",
  "Diversified",
  "Logistics",
  "Industrial",
];

export default function MembersPage() {
  const [query, setQuery] = useState("");
  const [tier, setTier] = useState<(typeof TIERS)[number]>("All");
  const [sector, setSector] = useState<string>("All");

  const filtered = useMemo(() => {
    return DIRECTORY_MEMBERS.filter((m) => {
      if (tier !== "All" && m.tier !== tier) return false;
      if (sector !== "All" && m.sector !== sector) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        return (
          m.name.toLowerCase().includes(q) ||
          m.company.toLowerCase().includes(q) ||
          m.title.toLowerCase().includes(q) ||
          m.location.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [query, tier, sector]);

  return (
    <>
      <section className="border-b border-white/[0.06]">
        <div className="mx-auto max-w-screen-xl px-4 py-12 sm:px-6 lg:px-8">
          <HubSectionHeader
            eyebrow="Verified Member Directory"
            title={<>The network, by name</>}
            description="Every member in the Hub is identity-verified, entitlement-screened, and introduced on-record. Preview below — full directory, profile drawers, and intro requests require membership."
          />

          {/* Search + chip filters */}
          <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-white/[0.07] bg-[#0e1420] p-4">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40"
                aria-hidden="true"
              />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search members by name, company, title, or location"
                aria-label="Search members"
                className="h-10 border-white/10 bg-white/[0.02] pl-9 text-sm placeholder:text-white/35"
              />
            </div>

            <div className="flex flex-col gap-3 border-t border-white/[0.05] pt-3">
              <ChipGroup
                label="Tier"
                options={TIERS}
                value={tier}
                onChange={(v) => setTier(v as (typeof TIERS)[number])}
              />
              <ChipGroup
                label="Sector"
                options={SECTORS}
                value={sector}
                onChange={setSector}
              />
            </div>

            <div className="flex items-center justify-between border-t border-white/[0.05] pt-3 text-xs text-white/45">
              <span>
                <span className="font-mono text-primary">{filtered.length}</span>{" "}
                members shown · 1,100+ verified in total
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-screen-xl px-4 py-12 sm:px-6 lg:px-8">
        {filtered.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((m) => (
              <MemberCard key={m.id} member={m} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/[0.07] bg-[#0e1420] px-8 py-12 text-center">
            <h3 className="text-base font-semibold text-foreground">
              No members match these filters
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Adjust filters or request access to the full directory.
            </p>
          </div>
        )}
      </section>

      <section className="mx-auto max-w-screen-xl px-4 pb-16 sm:px-6 lg:px-8">
        <AccessRequestCTA
          title="Open the full directory"
          description="Verified members see the complete directory, detailed profile drawers, and can send direct introduction requests on-record."
        />
      </section>
    </>
  );
}

function ChipGroup<T extends string>({
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
      <span className="min-w-14 font-mono text-[10px] font-semibold uppercase tracking-widest text-white/40">
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
