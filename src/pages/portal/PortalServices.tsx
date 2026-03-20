import { Shield, CheckCircle2, Clock, Zap, Lock, Globe, Server } from "lucide-react";
import { PortalLayout } from "@/components/portal/PortalLayout";

const services = [
  {
    id: "SVC-001",
    name: "Threat Detection",
    description: "Real-time monitoring and automated threat detection across all endpoints.",
    status: "Active",
    uptime: "99.9%",
    uptimeNum: 99.9,
    icon: Shield,
    accent: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
  },
  {
    id: "SVC-002",
    name: "Vulnerability Management",
    description: "Continuous scanning and prioritized remediation of security vulnerabilities.",
    status: "Active",
    uptime: "99.7%",
    uptimeNum: 99.7,
    icon: Lock,
    accent: "text-success",
    bg: "bg-success/10",
    border: "border-success/20",
  },
  {
    id: "SVC-003",
    name: "SIEM & Log Management",
    description: "Centralized security event correlation and audit log retention.",
    status: "Active",
    uptime: "99.9%",
    uptimeNum: 99.9,
    icon: Server,
    accent: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
  },
  {
    id: "SVC-004",
    name: "Zero Trust Network Access",
    description: "Identity-aware access control with least-privilege enforcement.",
    status: "Active",
    uptime: "100%",
    uptimeNum: 100,
    icon: Globe,
    accent: "text-success",
    bg: "bg-success/10",
    border: "border-success/20",
  },
  {
    id: "SVC-005",
    name: "Incident Response",
    description: "24/7 incident triage, containment, and post-incident reporting.",
    status: "Active",
    uptime: "99.8%",
    uptimeNum: 99.8,
    icon: Zap,
    accent: "text-[hsl(38_90%_58%)]",
    bg: "bg-[hsl(38_90%_55%/0.1)]",
    border: "border-[hsl(38_90%_55%/0.2)]",
  },
];

const statusConfig: Record<string, { badge: string; dot: string }> = {
  Active:  { badge: "bg-success/10 text-success border-success/20",         dot: "bg-success" },
  Degraded:{ badge: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", dot: "bg-yellow-400" },
  Outage:  { badge: "bg-destructive/10 text-destructive border-destructive/20", dot: "bg-destructive" },
};

export default function PortalServices() {
  return (
    <PortalLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              GEM Fortress Portal
            </span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Services</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Active security services and their current operational status.
          </p>
        </div>

        {/* Services Grid — 2 columns on md+ */}
        <div className="grid md:grid-cols-2 gap-4">
          {services.map((svc) => (
            <div
              key={svc.id}
              className={`glass-panel bento-card rounded-xl border ${svc.border} p-5 flex items-start gap-4`}
            >
              <div className={`w-10 h-10 rounded-lg ${svc.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                <svc.icon className={`w-5 h-5 ${svc.accent}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <div>
                    <span className="text-xs font-mono text-muted-foreground/70">{svc.id}</span>
                    <h3 className="text-sm font-semibold text-foreground leading-tight">{svc.name}</h3>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full border shrink-0 ${statusConfig[svc.status].badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[svc.status].dot} animate-pulse`} />
                    {svc.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{svc.description}</p>

                {/* Uptime bar */}
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                      <span>Uptime {svc.uptime}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>2 min ago</span>
                    </div>
                  </div>
                  <div className="h-1 rounded-full bg-border/60 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${svc.uptimeNum >= 99.9 ? "bg-success" : svc.uptimeNum >= 99 ? "bg-primary" : "bg-yellow-400"}`}
                      style={{ width: `${svc.uptimeNum}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PortalLayout>
  );
}
