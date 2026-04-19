"use client";

import { Bookmark, MapPin, Clock, Building2, ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Opportunity } from "@/lib/hub/mock-data";

const STAGE_TONE: Record<Opportunity["stage"], string> = {
  Sourcing: "border-white/15 bg-white/5 text-white/70",
  Active: "border-primary/30 bg-primary/10 text-primary",
  "Due Diligence": "border-amber-400/30 bg-amber-400/10 text-amber-300",
  Closing: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  Closed: "border-white/10 bg-white/5 text-white/40",
};

interface OpportunityCardProps {
  opportunity: Opportunity;
  onSave?: (id: string) => void;
  saved?: boolean;
}

export function OpportunityCard({
  opportunity,
  onSave,
  saved = false,
}: OpportunityCardProps) {
  const {
    id,
    title,
    sector,
    region,
    stage,
    type,
    ticket,
    summary,
    verified,
    featured,
    postedBy,
    postedAt,
    closesIn,
  } = opportunity;

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col gap-4 rounded-2xl border border-white/[0.07] bg-[#0e1420] p-6 transition-all",
        "hover:border-primary/25 hover:bg-[#101826]",
        featured && "ring-1 ring-primary/20"
      )}
    >
      {/* Header row: stage + verified + save */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge
            className={cn(
              "rounded-full border font-mono text-[10px] uppercase tracking-wider",
              STAGE_TONE[stage]
            )}
          >
            {stage}
          </Badge>
          <Badge className="rounded-full border border-white/10 bg-white/[0.03] font-mono text-[10px] uppercase tracking-wider text-white/60">
            {type}
          </Badge>
          {verified && (
            <Badge className="rounded-full border border-primary/25 bg-primary/8 font-mono text-[10px] uppercase tracking-wider text-primary/90">
              <ShieldCheck className="mr-1 h-3 w-3" aria-hidden="true" />
              Verified
            </Badge>
          )}
          {featured && (
            <Badge className="rounded-full border border-amber-400/25 bg-amber-400/8 font-mono text-[10px] uppercase tracking-wider text-amber-300">
              <Sparkles className="mr-1 h-3 w-3" aria-hidden="true" />
              Featured
            </Badge>
          )}
        </div>

        {onSave && (
          <button
            type="button"
            onClick={() => onSave(id)}
            aria-label={saved ? "Unsave opportunity" : "Save opportunity"}
            aria-pressed={saved}
            className={cn(
              "shrink-0 rounded-md border p-2 transition-colors",
              saved
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-white/10 bg-transparent text-white/40 hover:border-white/20 hover:text-white"
            )}
          >
            <Bookmark
              className={cn("h-4 w-4", saved && "fill-current")}
              aria-hidden="true"
            />
          </button>
        )}
      </div>

      {/* Title + summary */}
      <div className="flex flex-col gap-2">
        <h3 className="text-base font-semibold leading-snug text-foreground text-pretty">
          {title}
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
          {summary}
        </p>
      </div>

      {/* Meta grid */}
      <dl className="grid grid-cols-2 gap-3 rounded-lg border border-white/[0.05] bg-white/[0.02] p-3 text-xs">
        <div>
          <dt className="text-white/40">Sector</dt>
          <dd className="mt-0.5 font-medium text-white/80">{sector}</dd>
        </div>
        <div>
          <dt className="text-white/40">Region</dt>
          <dd className="mt-0.5 flex items-center gap-1 font-medium text-white/80">
            <MapPin className="h-3 w-3 text-white/40" aria-hidden="true" />
            {region}
          </dd>
        </div>
        <div>
          <dt className="text-white/40">Ticket</dt>
          <dd className="mt-0.5 font-mono font-medium text-primary">{ticket}</dd>
        </div>
        {closesIn && (
          <div>
            <dt className="text-white/40">Closes in</dt>
            <dd className="mt-0.5 flex items-center gap-1 font-medium text-white/80">
              <Clock className="h-3 w-3 text-white/40" aria-hidden="true" />
              {closesIn}
            </dd>
          </div>
        )}
      </dl>

      {/* Footer: posted by */}
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/[0.05] pt-3 text-xs text-white/45">
        <span className="flex items-center gap-1.5">
          <Building2 className="h-3 w-3" aria-hidden="true" />
          {postedBy}
        </span>
        <span>{postedAt}</span>
      </div>
    </article>
  );
}
