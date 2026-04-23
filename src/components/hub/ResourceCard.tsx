import { FileText, Lock, ArrowUpRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { HubResource } from "@/lib/hub/mock-data";

const KIND_TONE: Record<HubResource["kind"], string> = {
  "Intelligence Brief": "border-primary/30 bg-primary/10 text-primary",
  Playbook: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  Framework: "border-white/15 bg-white/5 text-white/80",
  Regulatory: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  "Market Report": "border-[hsl(280,40%,60%)]/30 bg-[hsl(280,40%,60%)]/10 text-[hsl(280,60%,75%)]",
};

interface ResourceCardProps {
  resource: HubResource;
  compact?: boolean;
}

export function ResourceCard({ resource, compact = false }: ResourceCardProps) {
  const { title, kind, topic, summary, date, pages, gated, featured } = resource;

  return (
    <article
      className={cn(
        "group flex h-full flex-col gap-3 rounded-2xl border border-white/[0.07] bg-[#0e1420] p-5 transition-all hover:border-primary/20 hover:bg-[#101826]",
        featured && "ring-1 ring-primary/20"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
          <FileText className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {featured && (
            <Badge className="rounded-full border border-amber-400/25 bg-amber-400/8 font-mono text-[10px] uppercase tracking-wider text-amber-300">
              <Sparkles className="mr-1 h-3 w-3" aria-hidden="true" />
              Featured
            </Badge>
          )}
          <Badge
            className={cn(
              "rounded-full border font-mono text-[10px] uppercase tracking-wider",
              KIND_TONE[kind]
            )}
          >
            {kind}
          </Badge>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <h3 className="text-sm font-semibold leading-snug text-foreground text-pretty">
          {title}
        </h3>
        {!compact && (
          <p className="text-xs leading-relaxed text-muted-foreground line-clamp-3">
            {summary}
          </p>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-white/[0.05] pt-3 text-[11px] text-white/45">
        <div className="flex items-center gap-2">
          <span>{topic}</span>
          <span className="opacity-40">·</span>
          <span>{date}</span>
          <span className="opacity-40">·</span>
          <span>{pages}p</span>
        </div>
        <span className="inline-flex items-center gap-1 font-medium text-primary/80">
          {gated ? (
            <>
              <Lock className="h-3 w-3" aria-hidden="true" />
              Members
            </>
          ) : (
            <>
              Open
              <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
            </>
          )}
        </span>
      </div>
    </article>
  );
}
