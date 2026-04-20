import { Users, Lock, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Circle } from "@/lib/hub/mock-data";

interface CircleCardProps {
  circle: Circle;
}

export function CircleCard({ circle }: CircleCardProps) {
  const { name, focus, description, memberCount, private: isPrivate, cadence, chair } = circle;

  return (
    <article className="flex h-full flex-col gap-4 rounded-2xl border border-white/[0.07] bg-[#0e1420] p-6 transition-all hover:border-primary/20 hover:bg-[#101826]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/80">
            {focus}
          </span>
          <h3 className="text-base font-semibold text-foreground text-pretty">{name}</h3>
        </div>
        {isPrivate ? (
          <Badge className="shrink-0 rounded-full border border-primary/25 bg-primary/8 font-mono text-[10px] uppercase tracking-wider text-primary/90">
            <Lock className="mr-1 h-3 w-3" aria-hidden="true" />
            Private
          </Badge>
        ) : (
          <Badge className="shrink-0 rounded-full border border-white/10 bg-white/[0.03] font-mono text-[10px] uppercase tracking-wider text-white/60">
            Open
          </Badge>
        )}
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
        {description}
      </p>

      <dl className="grid grid-cols-3 gap-3 rounded-lg border border-white/[0.05] bg-white/[0.02] p-3 text-xs">
        <div>
          <dt className="text-white/40">Members</dt>
          <dd className="mt-0.5 flex items-center gap-1 font-medium text-white/85">
            <Users className="h-3 w-3 text-white/40" aria-hidden="true" />
            {memberCount}
          </dd>
        </div>
        <div>
          <dt className="text-white/40">Cadence</dt>
          <dd className="mt-0.5 flex items-center gap-1 font-medium text-white/85">
            <Calendar className="h-3 w-3 text-white/40" aria-hidden="true" />
            {cadence}
          </dd>
        </div>
        <div>
          <dt className="text-white/40">Chair</dt>
          <dd className="mt-0.5 truncate font-medium text-white/85">{chair}</dd>
        </div>
      </dl>

      <div className="mt-auto flex items-center justify-between border-t border-white/[0.05] pt-3">
        <span className="text-xs text-white/40">Strategic Circle</span>
        <Button
          asChild
          size="sm"
          variant="ghost"
          className="h-8 border border-white/10 bg-transparent text-xs text-white/70 hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
        >
          <Link href="/community-hub/circles">Request access</Link>
        </Button>
      </div>
    </article>
  );
}
