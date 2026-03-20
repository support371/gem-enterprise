import { Shield, AlertTriangle, ClipboardList, Users, Activity, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const stats = [
  {
    label: "Active Incidents",
    value: "3",
    delta: "+1 today",
    icon: AlertTriangle,
    accent: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/20",
    leftBorder: "stat-card-danger",
  },
  {
    label: "Open Tasks",
    value: "12",
    delta: "4 high priority",
    icon: ClipboardList,
    accent: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
    leftBorder: "stat-card-cyan",
  },
  {
    label: "Team Members",
    value: "8",
    delta: "6 online now",
    icon: Users,
    accent: "text-success",
    bg: "bg-success/10",
    border: "border-success/20",
    leftBorder: "stat-card-success",
  },
  {
    label: "Uptime",
    value: "99.9%",
    delta: "Last 30 days",
    icon: TrendingUp,
    accent: "text-[hsl(38_90%_58%)]",
    bg: "bg-[hsl(38_90%_55%/0.1)]",
    border: "border-[hsl(38_90%_55%/0.2)]",
    leftBorder: "stat-card-warn",
  },
];

const recentIncidents = [
  { id: "INC-2024-003", title: "Unauthorized API access attempt", severity: "Critical", status: "Active", time: "18 min ago" },
  { id: "INC-2024-001", title: "Suspicious login attempts – EU region", severity: "High", status: "Investigating", time: "2 hr ago" },
  { id: "INC-2024-002", title: "Phishing email campaign detected", severity: "Medium", status: "Investigating", time: "5 hr ago" },
];

const recentActivity = [
  { actor: "Jane Smith", action: "updated status of INC-2024-003 to Active", time: "18 min ago" },
  { actor: "Mike Johnson", action: "assigned task CVE-2024-1234 patch to Sarah Chen", time: "42 min ago" },
  { actor: "System", action: "completed automated backup — all 14 nodes", time: "1 hr ago" },
  { actor: "Sarah Chen", action: "closed TASK-0041 — firewall rule audit", time: "3 hr ago" },
];

const severityBadge: Record<string, string> = {
  Critical: "bg-destructive/10 text-destructive border-destructive/20",
  High:     "bg-orange-500/10 text-orange-400 border-orange-500/20",
  Medium:   "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Low:      "bg-muted text-muted-foreground border-border",
};

const statusBadge: Record<string, string> = {
  Active:       "bg-destructive/10 text-destructive border-destructive/20",
  Investigating:"bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Resolved:     "bg-success/10 text-success border-success/20",
};

const actorInitialColor = (actor: string) =>
  actor === "System" ? "bg-success/10 border-success/20 text-success" : "bg-primary/10 border-primary/20 text-primary";

export default function Portal() {
  const { user } = useAuth();
  const { role } = useUserRole();

  const roleLabel = role
    ? { admin: "Administrator", manager: "Manager", analyst: "Analyst", viewer: "Viewer" }[role]
    : "User";

  const avatarUrl: string = (user?.user_metadata?.avatar_url as string) || "";
  const displayName: string =
    (user?.user_metadata?.full_name as string) ||
    (user?.user_metadata?.name as string) ||
    user?.email?.split("@")[0] ||
    "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <PortalLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12 ring-2 ring-primary/25 ring-offset-2 ring-offset-background shrink-0 shadow-[0_0_14px_hsl(var(--electric-cyan)/0.2)]">
              <AvatarImage src={avatarUrl} alt={displayName} />
              <AvatarFallback className="bg-primary/15 text-primary font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <Shield className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                  GEM Fortress Portal
                </span>
              </div>
              <h1 className="text-2xl font-bold text-foreground">Security Overview</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Welcome back,{" "}
                <span className="text-foreground font-semibold">{displayName}</span>
              </p>
            </div>
          </div>
          <span className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border bg-primary/10 text-primary border-primary/25">
            {roleLabel}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className={`glass-panel bento-card rounded-xl p-4 border ${s.border} ${s.leftBorder}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground">{s.label}</span>
                <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`w-4 h-4 ${s.accent}`} />
                </div>
              </div>
              <p className={`text-3xl font-bold tracking-tight ${s.accent}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.delta}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Incidents */}
          <div className="glass-panel rounded-xl border border-border/50 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/50 bg-destructive/[0.03]">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                Recent Incidents
              </h2>
              <Link
                to="/portal/incidents"
                className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
              >
                View all →
              </Link>
            </div>
            <div className="divide-y divide-border/40">
              {recentIncidents.map((inc) => (
                <div
                  key={inc.id}
                  className="px-5 py-3.5 flex items-start gap-3 card-hover-row"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-muted-foreground/70">{inc.id}</span>
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded border ${severityBadge[inc.severity]}`}>
                        {inc.severity}
                      </span>
                    </div>
                    <p className="text-sm text-foreground truncate font-medium">{inc.title}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded border ${statusBadge[inc.status]}`}>
                      {inc.status}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">{inc.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="glass-panel rounded-xl border border-border/50 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/50 bg-primary/[0.03]">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Recent Activity
              </h2>
              <Link
                to="/portal/activity"
                className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
              >
                View all →
              </Link>
            </div>
            <div className="divide-y divide-border/40">
              {recentActivity.map((a, i) => (
                <div key={i} className="px-5 py-3.5 flex items-start gap-3 card-hover-row">
                  <div className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${actorInitialColor(a.actor)}`}>
                    {a.actor === "System" ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <span className="text-xs font-bold">{a.actor[0]}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground leading-snug">
                      <span className="font-semibold">{a.actor}</span>{" "}
                      <span className="text-muted-foreground">{a.action}</span>
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3 text-muted-foreground/60" />
                      <span className="text-xs text-muted-foreground/70">{a.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
