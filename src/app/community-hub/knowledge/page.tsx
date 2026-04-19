"use client";

import { useMemo, useState } from "react";
import { Search, BookOpenText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { HubSectionHeader } from "@/components/hub/HubSectionHeader";
import { ResourceCard } from "@/components/hub/ResourceCard";
import { AccessRequestCTA } from "@/components/hub/AccessRequestCTA";
import { RESOURCES, type ResourceKind } from "@/lib/hub/mock-data";
import { cn } from "@/lib/utils";

const KINDS: ("All" | ResourceKind)[] = [
  "All",
  "Intelligence Brief",
  "Market Report",
  "Playbook",
  "Framework",
  "Regulatory",
];

export default function KnowledgePage() {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<(typeof KINDS)[number]>("All");

  const filtered = useMemo(() => {
    return RESOURCES.filter((r) => {
      if (kind !== "All" && r.kind !== kind) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        return (
          r.title.toLowerCase().includes(q) ||
          r.summary.toLowerCase().includes(q) ||
          r.topic.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [query, kind]);

  const featured = filtered.find((r) => r.featured);
  const rest = featured
    ? filtered.filter((r) => r.id !== featured.id)
    : filtered;

  return (
    <>
      <section className="border-b border-white/[0.06]">
        <div className="mx-auto max-w-screen-xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-md border border-primary/25 bg-primary/10 text-primary">
            <BookOpenText className="h-4.5 w-4.5" aria-hidden="true" />
          </div>
          <HubSectionHeader
            eyebrow="Knowledge Center"
            title={<>Intelligence authored for working principals</>}
            description="Briefs, playbooks, and regulatory analysis from GEM analysts. Public items are freely downloadable — gated items are available to verified members."
          />

          <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-white/[0.07] bg-[#0e1420] p-4">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40"
                aria-hidden="true"
              />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search the knowledge library"
                aria-label="Search resources"
                className="h-10 border-white/10 bg-white/[0.02] pl-9 text-sm placeholder:text-white/35"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 border-t border-white/[0.05] pt-3">
              <span className="min-w-14 font-mono text-[10px] font-semibold uppercase tracking-widest text-white/40">
                Type
              </span>
              {KINDS.map((k) => {
                const active = kind === k;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setKind(k)}
                    aria-pressed={active}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs transition-colors",
                      active
                        ? "border-primary/30 bg-primary/10 text-primary"
                        : "border-white/10 bg-white/[0.02] text-white/55 hover:border-white/20 hover:text-white"
                    )}
                  >
                    {k}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {featured && (
        <section className="mx-auto max-w-screen-xl px-4 py-10 sm:px-6 lg:px-8">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/50">
            Featured
          </h2>
          <div className="grid gap-5 md:grid-cols-2">
            <ResourceCard resource={featured} />
            <div className="rounded-2xl border border-white/[0.07] bg-[#0b111c] p-6">
              <h3 className="text-base font-semibold text-foreground">
                Published cadence
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                GEM publishes one flagship Intelligence Brief each quarter and
                continuous playbooks, regulatory summaries, and market reports
                in between. Members can subscribe to category-level alerts to
                be notified the moment new material is released.
              </p>
              <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-white/[0.05] pt-4 text-xs">
                <div>
                  <dt className="text-white/40">Active topics</dt>
                  <dd className="mt-0.5 font-medium text-white/80">12</dd>
                </div>
                <div>
                  <dt className="text-white/40">Published items</dt>
                  <dd className="mt-0.5 font-medium text-white/80">
                    {RESOURCES.length * 18}+
                  </dd>
                </div>
                <div>
                  <dt className="text-white/40">Analyst contributors</dt>
                  <dd className="mt-0.5 font-medium text-white/80">19</dd>
                </div>
                <div>
                  <dt className="text-white/40">Update cadence</dt>
                  <dd className="mt-0.5 font-medium text-white/80">Weekly+</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-screen-xl px-4 pb-12 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-sm font-semibold uppercase tracking-widest text-white/50">
          Library
        </h2>
        {rest.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((r) => (
              <ResourceCard key={r.id} resource={r} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/[0.07] bg-[#0e1420] px-8 py-12 text-center">
            <h3 className="text-base font-semibold text-foreground">
              No resources match
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Try broadening your search or clearing the type filter.
            </p>
          </div>
        )}
      </section>

      <section className="mx-auto max-w-screen-xl px-4 pb-16 sm:px-6 lg:px-8">
        <AccessRequestCTA
          title="Unlock the full library"
          description="Members can download gated briefs, subscribe to category alerts, and request bespoke analysis from GEM."
        />
      </section>
    </>
  );
}
