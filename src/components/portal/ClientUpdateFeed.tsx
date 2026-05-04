import { Clock, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

// -- Types ------------------------------------------------------------------

export interface ClientUpdate {
  id: string;
  caseId: string;
  timestamp: string;
  status: UpdateStatus;
  action: string;
  actor?: string;
  details?: string;
}

export type UpdateStatus =
  | "active"
  | "investigating"
  | "resolved"
  | "pending"
  | "critical"
  | "info";

// -- Status config ----------------------------------------------------------

const statusConfig: Record<UpdateStatus, { label: string; badge: string; dot: string }> = {
  active:        { label: "Active",        badge: "bg-destructive/10 text-destructive border-destructive/20", dot: "bg-destructive" },
  investigating: { label: "Investigating", badge: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",    dot: "bg-yellow-400" },
  resolved:      { label: "Resolved",      badge: "bg-success/10 text-success border-success/20",            dot: "bg-success" },
  pending:       { label: "Pending",       badge: "bg-primary/10 text-primary border-primary/20",            dot: "bg-primary" },
  critical:      { label: "Critical",      badge: "bg-destructive/10 text-destructive border-destructive/20", dot: "bg-destructive animate-pulse" },
  info:          { label: "Info",          badge: "bg-secondary text-muted-foreground border-border",        dot: "bg-muted-foreground" },
};

// -- Component: Single Update Row -------------------------------------------

function ClientUpdateRow({ update }: { update: ClientUpdate }) {
  const config = statusConfig[update.status] ?? statusConfig.info;

  return (
    <div className="px-5 py-3.5 flex items-start gap-3 hover:bg-sidebar-accent/30 transition-colors min-h-[44px]">
      {/* Status dot */}
      <div className="mt-1.5 shrink-0">
        <span className={cn("block w-2 h-2 rounded-full", config.dot)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span className="text-xs font-mono text-muted-foreground/70">{update.caseId}</span>
          <span className={cn(
            "text-xs font-medium px-1.5 py-0.5 rounded border inline-flex items-center gap-1",
            config.badge
          )}>
            {config.label}
          </span>
        </div>
        <p className="text-sm text-foreground font-medium truncate">{update.action}</p>
        {update.details && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{update.details}</p>
        )}
        {update.actor && (
          <p className="text-xs text-muted-foreground/60 mt-0.5">by {update.actor}</p>
        )}
      </div>

      {/* Timestamp */}
      <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0 mt-0.5">
        <Clock className="w-3 h-3" />
        <span>{update.timestamp}</span>
      </div>
    </div>
  );
}

// -- Component: Feed --------------------------------------------------------

interface ClientUpdateFeedProps {
  title: string;
  updates: ClientUpdate[];
  viewAllHref?: string;
  icon?: React.ElementType;
  emptyMessage?: string;
  className?: string;
}

export function ClientUpdateFeed({
  title,
  updates,
  viewAllHref,
  icon: Icon = Shield,
  emptyMessage = "No recent updates.",
  className,
}: ClientUpdateFeedProps) {
  return (
    <div className={cn("glass-panel rounded-xl border border-border/50 overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Icon className="w-4 h-4 text-primary" />
          {title}
        </h2>
        {viewAllHref && (
          <a
            href={viewAllHref}
            className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
          >
            View all
          </a>
        )}
      </div>

      {/* Updates */}
      {updates.length === 0 ? (
        <div className="px-5 py-8 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      ) : (
        <div className="divide-y divide-border/40">
          {updates.map((update) => (
            <ClientUpdateRow key={update.id} update={update} />
          ))}
        </div>
      )}
    </div>
  );
}
