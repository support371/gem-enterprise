import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { VerificationBadge } from "./VerificationBadge";
import type { DirectoryMember } from "@/lib/hub/mock-data";

interface MemberCardProps {
  member: DirectoryMember;
  onIntro?: (id: string) => void;
  compact?: boolean;
}

export function MemberCard({ member, onIntro, compact = false }: MemberCardProps) {
  const { id, name, initials, title, company, location, sector, tier, verified, online } = member;

  return (
    <article
      className={cn(
        "group relative flex flex-col gap-4 rounded-2xl border border-white/[0.07] bg-[#0e1420] p-5 transition-all",
        "hover:border-primary/20 hover:bg-[#101826]",
        compact && "p-4"
      )}
    >
      {/* Identity row */}
      <div className="flex items-start gap-3">
        <div className="relative shrink-0">
          <div
            aria-hidden="true"
            className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/20 bg-primary/10 font-mono text-sm font-semibold text-primary"
          >
            {initials}
          </div>
          {online && (
            <span
              aria-label="Online"
              className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-[#0e1420]"
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-foreground">{name}</h3>
          <p className="truncate text-xs text-white/55">{title}</p>
          <p className="mt-0.5 truncate text-xs font-medium text-primary/85">{company}</p>
        </div>

        <VerificationBadge status={verified} />
      </div>

      {/* Meta chips */}
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge className="rounded-full border border-white/10 bg-white/[0.03] text-[10px] font-medium uppercase tracking-wider text-white/60">
          {tier}
        </Badge>
        <Badge className="rounded-full border border-white/10 bg-white/[0.03] text-[10px] font-medium uppercase tracking-wider text-white/60">
          {sector}
        </Badge>
        <span className="inline-flex items-center gap-1 text-[11px] text-white/40">
          <MapPin className="h-3 w-3" aria-hidden="true" />
          {location}
        </span>
      </div>

      {/* Action */}
      {!compact && (
        <div className="mt-auto flex items-center justify-end border-t border-white/[0.05] pt-3">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onIntro ? () => onIntro(id) : undefined}
            className="h-8 border border-white/10 bg-transparent text-xs text-white/70 hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
          >
            Request introduction
          </Button>
        </div>
      )}
    </article>
  );
}
