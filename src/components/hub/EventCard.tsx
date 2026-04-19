import Link from "next/link";
import { MapPin, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { HubEvent } from "@/lib/hub/mock-data";

const FORMAT_TONE: Record<HubEvent["format"], string> = {
  "Private Briefing": "border-primary/30 bg-primary/10 text-primary",
  "In-Person": "border-amber-400/30 bg-amber-400/10 text-amber-300",
  Virtual: "border-white/15 bg-white/5 text-white/80",
  "Closed Summit": "border-[hsl(280,40%,60%)]/30 bg-[hsl(280,40%,60%)]/10 text-[hsl(280,60%,75%)]",
};

interface EventCardProps {
  event: HubEvent;
  compact?: boolean;
}

export function EventCard({ event, compact = false }: EventCardProps) {
  const { month, day, title, format, location, abstract, seats } = event;

  return (
    <article
      className={cn(
        "group flex h-full gap-4 rounded-2xl border border-white/[0.07] bg-[#0e1420] p-5 transition-all hover:border-primary/20 hover:bg-[#101826]",
        compact && "p-4"
      )}
    >
      {/* Date block */}
      <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl border border-primary/20 bg-primary/5">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-primary/80">
          {month}
        </span>
        <span className="font-mono text-xl font-bold leading-none text-primary">
          {day}
        </span>
      </div>

      {/* Body */}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge
            className={cn(
              "rounded-full border font-mono text-[10px] uppercase tracking-wider",
              FORMAT_TONE[format]
            )}
          >
            {format}
          </Badge>
          {location && (
            <span className="inline-flex items-center gap-1 text-[11px] text-white/40">
              <MapPin className="h-3 w-3" aria-hidden="true" />
              {location}
            </span>
          )}
        </div>

        <h3 className="text-sm font-semibold leading-snug text-foreground text-pretty">
          {title}
        </h3>

        {!compact && (
          <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
            {abstract}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          {seats && (
            <span className="text-[11px] text-white/40">{seats}</span>
          )}
          <Link
            href="/community-hub/events"
            className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-primary/80 hover:text-primary"
          >
            Register
            <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
