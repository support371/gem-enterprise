import { Globe, Shield, Zap, Link2, CheckCircle2, AlertTriangle, Clock, TrendingUp, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { PortalLayout } from "@/components/portal/PortalLayout";

const connectionStats = [
  { label: "Active Connections", value: "7", delta: "+2 this month", icon: Link2, accent: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
  { label: "Events Routed", value: "1.2M", delta: "Last 30 days", icon: TrendingUp, accent: "text-success", bg: "bg-success/10", border: "border-success/20" },
  { label: "Alerts Forwarded", value: "348", delta: "This week", icon: Zap, accent: "text-[hsl(38_90%_58%)]", bg: "bg-[hsl(38_90%_55%/0.1)]", border: "border-[hsl(38_90%_55%/0.2)]" },
  { label: "Errors", value: "3", delta: "Last 24 hours", icon: AlertTriangle, accent: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/20" },
];

const connections = [
  {
    id: "GW-001",
    name: "Mailchimp",
    category: "Marketing",
    status: "Connected",
    lastSync: "4 min ago",
    eventsToday: 1240,
    href: "/global-gateway/mailchimp",
    color: "text-[hsl(38_90%_58%)]",
    bg: "bg-[hsl(38_90%_55%/0.1)]",
    border: "border-[hsl(38_90%_55%/0.2)]",
  },
  {
    id: "GW-002",
    name: "Slack",
    category: "Notifications",
    status: "Connected",
    lastSync: "1 min ago",
    eventsToday: 892,
    href: "/global-gateway/connect",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
  },
  {
    id: "GW-003",
    name: "PagerDuty",
    category: "Incident Management",
    status: "Connected",
    lastSync: "2 min ago",
    eventsToday: 47,
    href: "/global-gateway/connect",
    color: "text-success",
    bg: "bg-success/10",
    border: "border-success/20",
  },
  {
    id: "GW-004",
    name: "Jira",
    category: "Ticketing",
    status: "Connected",
    lastSync: "8 min ago",
    eventsToday: 124,
    href: "/global-gateway/connect",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
  },
  {
    id: "GW-005",
    name: "Splunk",
    category: "SIEM",
    status: "Degraded",
    lastSync: "32 min ago",
    eventsToday: 8901,
    href: "/global-gateway/connect",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
  },
  {
    id: "GW-006",
    name: "Datadog",
    category: "Monitoring",
    status: "Connected",
    lastSync: "1 min ago",
    eventsToday: 3452,
    href: "/global-gateway/connect",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
  },
  {
    id: "GW-007",
    name: "Okta",
    category: "Identity",
    status: "Connected",
    lastSync: "3 min ago",
    eventsToday: 612,
    href: "/global-gateway/connect",
    color: "text-success",
    bg: "bg-success/10",
    border: "border-success/20",
  },
];

const statusConfig: Record<string, { badge: string; dot: string }> = {
  Connected: { badge: "bg-success/10 text-success border-success/20", dot: "bg-success" },
  Degraded:  { badge: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", dot: "bg-yellow-400" },
  Disconnected: { badge: "bg-destructive/10 text-destructive border-destructive/20", dot: "bg-destructive" },
};

export default function GlobalGateway() {
  return (
    <PortalLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Globe className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                GEM Fortress Portal
              </span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Global Gateway</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Central hub for all third-party integrations and data routing.
            </p>
          </div>
          <Link
            to="/global-gateway/connect"
            className="shrink-0 flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
          >
            <Link2 className="w-3.5 h-3.5" />
            Add Connection
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {connectionStats.map((s) => (
            <div key={s.label} className={`glass-panel rounded-xl p-4 border ${s.border}`}>
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

        {/* Connections Table */}
        <div className="glass-panel rounded-xl border border-border/50 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Active Connections
            </h2>
            <span className="text-xs text-muted-foreground">{connections.length} integrations</span>
          </div>
          <div className="divide-y divide-border/40">
            {connections.map((conn) => (
              <Link
                key={conn.id}
                to={conn.href}
                className="px-5 py-4 flex items-center gap-4 hover:bg-sidebar-accent/30 transition-colors group"
              >
                <div className={`w-9 h-9 rounded-lg ${conn.bg} border ${conn.border} flex items-center justify-center shrink-0 text-xs font-bold ${conn.color}`}>
                  {conn.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-medium text-foreground">{conn.name}</p>
                    <span className="text-xs text-muted-foreground/60 font-mono">{conn.id}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{conn.category}</p>
                </div>
                <div className="hidden md:flex items-center gap-5 text-xs text-muted-foreground shrink-0">
                  <div className="text-right">
                    <p className="text-foreground font-medium">{conn.eventsToday.toLocaleString()}</p>
                    <p>events today</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{conn.lastSync}</span>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border ${statusConfig[conn.status].badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[conn.status].dot} ${conn.status === "Connected" ? "animate-pulse" : ""}`} />
                    {conn.status}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Security notice */}
        <div className="flex items-start gap-3 p-4 rounded-xl border border-primary/20 bg-primary/5">
          <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">End-to-end encrypted routing</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              All data flowing through Global Gateway is encrypted in transit using TLS 1.3. Credentials are stored in the GEM Secrets Vault and never exposed in transit.
            </p>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
