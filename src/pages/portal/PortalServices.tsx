import { Shield, CheckCircle2, Clock, ArrowRight, Zap, Lock, Globe, Server } from "lucide-react";
import { PortalLayout } from "@/components/portal/PortalLayout";

const services = [
  {
    id: "SVC-001",
    name: "Threat Detection",
    description: "Real-time monitoring and automated threat detection across all endpoints.",
    status: "Active",
    uptime: "99.9%",
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
    icon: Zap,
    accent: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
  },
];

const statusBadge: Record<string, string> = {
  Active: "bg-success/10 text-success border-success/20",
  Degraded: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Outage: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function PortalServices() {
  return (
    <PortalLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              GEM Fortress Portal
            </span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Services</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Active security services and their current operational status.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid gap-4">
          {services.map((svc) => (
            <div
              key={svc.id}
              className={`glass-panel rounded-xl border ${svc.border} p-5 flex items-start gap-4`}
            >
              <div className={`w-10 h-10 rounded-lg ${svc.bg} flex items-center justify-center shrink-0`}>
                <svc.icon className={`w-5 h-5 ${svc.accent}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <div>
                    <span className="text-xs font-mono text-muted-foreground">{svc.id}</span>
                    <h3 className="text-sm font-semibold text-foreground">{svc.name}</h3>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded border shrink-0 ${statusBadge[svc.status]}`}>
                    {svc.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{svc.description}</p>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                    <span>Uptime {svc.uptime}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Last checked 2 min ago</span>
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
            </div>
          ))}
        </div>
      </div>
    </PortalLayout>
  );
}
