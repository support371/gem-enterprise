import { Shield, AlertTriangle, ClipboardList, Users, Activity, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";

const stats = [
  { label: "Active Incidents", value: "3", delta: "+1 today", icon: AlertTriangle, accent: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/20" },
  { label: "Open Tasks", value: "12", delta: "4 high priority", icon: ClipboardList, accent: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
  { label: "Team Members", value: "8", delta: "6 online now", icon: Users, accent: "text-success", bg: "bg-success/10", border: "border-success/20" },
  { label: "Uptime", value: "99.9%", delta: "Last 30 days", icon: TrendingUp, accent: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
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
  High: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  Medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Low: "bg-muted text-muted-foreground border-border",
};

const statusBadge: Record<string, string> = {
  Active: "bg-destructive/10 text-destructive",
  Investigating: "bg-yellow-500/10 text-yellow-400",
  Resolved: "bg-success/10 text-success",
};

export default function Portal() {
  const { user } = useAuth();
  const { role } = useUserRole();

  const roleLabel = role
    ? { admin: "Administrator", manager: "Manager", analyst: "Analyst", viewer: "Viewer" }[role]
    : "User";

  return (
    <PortalLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-5 h-5 text-primary" />
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                GEM Fortress Portal
              </span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Security Overview</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Welcome back, <span className="text-foreground font-medium">{user?.email}</span>
            </p>
          </div>
          <span className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border bg-primary/10 text-primary border-primary/20">
            {roleLabel}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className={`glass-panel rounded-xl p-4 border ${s.border}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground">{s.label}</span>
                <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`w-4 h-4 ${s.accent}`} />
                </div>
              </div>
              <p className={`text-2xl font-bold ${s.accent}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.delta}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Incidents */}
          <div className="glass-panel rounded-xl border border-border/50 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                Recent Incidents
              </h2>
              <Link
                to="/portal/incidents"
                className="text-xs text-primary hover:underline"
              >
                View all →
              </Link>
            </div>
            <div className="divide-y divide-border/40">
              {recentIncidents.map((inc) => (
                <div key={inc.id} className="px-5 py-3.5 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-muted-foreground">{inc.id}</span>
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded border ${severityBadge[inc.severity]}`}>
                        {inc.severity}
                      </span>
                    </div>
                    <p className="text-sm text-foreground truncate">{inc.title}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusBadge[inc.status]}`}>
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
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Recent Activity
              </h2>
              <Link
                to="/portal/activity"
                className="text-xs text-primary hover:underline"
              >
                View all →
              </Link>
            </div>
            <div className="divide-y divide-border/40">
              {recentActivity.map((a, i) => (
                <div key={i} className="px-5 py-3.5 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                    {a.actor === "System" ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                    ) : (
                      <span className="text-xs font-bold text-primary">
                        {a.actor[0]}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">
                      <span className="font-medium">{a.actor}</span>{" "}
                      <span className="text-muted-foreground">{a.action}</span>
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{a.time}</span>
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
