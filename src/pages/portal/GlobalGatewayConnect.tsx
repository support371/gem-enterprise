import { useState } from "react";
import { Globe, Link2, Shield, Search, CheckCircle2, Lock, Zap, Server, MessageSquare, BarChart2, Users, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { Input } from "@/components/ui/input";

interface Integration {
  id: string;
  name: string;
  category: string;
  description: string;
  status: "connected" | "available" | "coming-soon";
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
}

const integrations: Integration[] = [
  {
    id: "INT-001",
    name: "Mailchimp",
    category: "Marketing",
    description: "Sync security alerts and audience segments. Trigger email campaigns based on incident status changes.",
    status: "connected",
    icon: MessageSquare,
    color: "text-[hsl(38_90%_58%)]",
    bg: "bg-[hsl(38_90%_55%/0.1)]",
    border: "border-[hsl(38_90%_55%/0.2)]",
  },
  {
    id: "INT-002",
    name: "Slack",
    category: "Notifications",
    description: "Post incident alerts, task assignments, and security digest summaries to Slack channels.",
    status: "connected",
    icon: MessageSquare,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
  },
  {
    id: "INT-003",
    name: "PagerDuty",
    category: "Incident Management",
    description: "Automatically escalate critical incidents to on-call engineers via PagerDuty schedules.",
    status: "connected",
    icon: Zap,
    color: "text-success",
    bg: "bg-success/10",
    border: "border-success/20",
  },
  {
    id: "INT-004",
    name: "Jira",
    category: "Ticketing",
    description: "Create and update Jira issues from portal tasks and security findings automatically.",
    status: "connected",
    icon: CheckCircle2,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
  },
  {
    id: "INT-005",
    name: "Splunk",
    category: "SIEM",
    description: "Forward normalized security events and enriched alerts into your Splunk deployment.",
    status: "connected",
    icon: Server,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
  },
  {
    id: "INT-006",
    name: "Datadog",
    category: "Monitoring",
    description: "Stream infrastructure health metrics and security signals into Datadog dashboards.",
    status: "connected",
    icon: BarChart2,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
  },
  {
    id: "INT-007",
    name: "Okta",
    category: "Identity",
    description: "Sync user provisioning events and enforce identity policies across the portal.",
    status: "connected",
    icon: Users,
    color: "text-success",
    bg: "bg-success/10",
    border: "border-success/20",
  },
  {
    id: "INT-008",
    name: "ServiceNow",
    category: "ITSM",
    description: "Create and manage change requests and incident records directly from the portal.",
    status: "available",
    icon: Shield,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
  },
  {
    id: "INT-009",
    name: "Microsoft Teams",
    category: "Notifications",
    description: "Deliver security alerts and daily digests to Microsoft Teams channels and chats.",
    status: "available",
    icon: MessageSquare,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
  },
  {
    id: "INT-010",
    name: "Crowdstrike",
    category: "EDR",
    description: "Ingest endpoint detection events and correlate with portal incidents.",
    status: "coming-soon",
    icon: Shield,
    color: "text-muted-foreground",
    bg: "bg-muted/50",
    border: "border-border",
  },
  {
    id: "INT-011",
    name: "SentinelOne",
    category: "EDR",
    description: "Correlate SentinelOne threat data with portal incidents for unified response.",
    status: "coming-soon",
    icon: Lock,
    color: "text-muted-foreground",
    bg: "bg-muted/50",
    border: "border-border",
  },
];

const categories = ["All", ...Array.from(new Set(integrations.map((i) => i.category)))];

const statusLabel: Record<Integration["status"], string> = {
  connected: "Connected",
  available: "Connect",
  "coming-soon": "Coming Soon",
};

const statusStyle: Record<Integration["status"], string> = {
  connected: "bg-success/10 text-success border-success/20",
  available: "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 cursor-pointer",
  "coming-soon": "bg-muted/50 text-muted-foreground border-border cursor-default",
};

export default function GlobalGatewayConnect() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = integrations.filter((i) => {
    const matchesSearch =
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || i.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const connectedCount = integrations.filter((i) => i.status === "connected").length;

  return (
    <PortalLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <Link
            to="/global-gateway"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Global Gateway
          </Link>
          <div className="flex items-center gap-2 mb-1">
            <Globe className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              GEM Fortress Portal
            </span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Connections</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Browse and manage all available integrations. {connectedCount} of {integrations.length} connected.
          </p>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search integrations…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-sm"
            />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                  activeCategory === cat
                    ? "bg-primary/10 text-primary border-primary/20"
                    : "bg-transparent text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Integration Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-sm text-muted-foreground">
            No integrations match your search.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((intg) => (
              <div
                key={intg.id}
                className={`glass-panel rounded-xl border ${intg.border} p-5 flex flex-col gap-3 ${intg.status === "coming-soon" ? "opacity-60" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg ${intg.bg} border ${intg.border} flex items-center justify-center shrink-0`}>
                      <intg.icon className={`w-4 h-4 ${intg.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{intg.name}</p>
                      <p className="text-xs text-muted-foreground">{intg.category}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border shrink-0 transition-colors ${statusStyle[intg.status]}`}>
                    {intg.status === "connected" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                    )}
                    {statusLabel[intg.status]}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed flex-1">{intg.description}</p>
                {intg.status === "connected" && intg.name === "Mailchimp" && (
                  <Link
                    to="/global-gateway/mailchimp"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                  >
                    <Link2 className="w-3 h-3" />
                    Configure
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Trust footer */}
        <div className="flex items-start gap-3 p-4 rounded-xl border border-border/50 bg-sidebar-accent/20">
          <Lock className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            All integration credentials are stored in the GEM Secrets Vault using AES-256 encryption. Connection tokens are rotated every 90 days and are never logged or exposed in API responses.
          </p>
        </div>
      </div>
    </PortalLayout>
  );
}
