import { useState } from "react";
import { AlertTriangle, Clock, User, ChevronDown, ChevronUp } from "lucide-react";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { cn } from "@/lib/utils";

type Severity = "Critical" | "High" | "Medium" | "Low";
type IncidentStatus = "Active" | "Investigating" | "Resolved";

interface Incident {
  id: string;
  title: string;
  type: string;
  severity: Severity;
  status: IncidentStatus;
  assignee: string;
  opened: string;
  summary: string;
}

const incidents: Incident[] = [
  {
    id: "INC-2024-003",
    title: "Unauthorized API access attempt",
    type: "Access Control",
    severity: "Critical",
    status: "Active",
    assignee: "Sarah Chen",
    opened: "Mar 16, 09:42",
    summary: "Multiple unauthorized requests to the /admin/export API endpoint from IP 185.220.101.x. Requests attempted bearer token replay. Blocked at WAF layer; full investigation ongoing.",
  },
  {
    id: "INC-2024-004",
    title: "Malware detected on endpoint EP-0091",
    type: "Endpoint Security",
    severity: "High",
    status: "Investigating",
    assignee: "Mike Johnson",
    opened: "Mar 15, 14:17",
    summary: "EDR flagged Trojan.GenericKD variant on workstation EP-0091 assigned to user t.wilson@gem.io. Machine isolated. Forensic acquisition in progress.",
  },
  {
    id: "INC-2024-001",
    title: "Suspicious login attempts — EU region",
    type: "Authentication",
    severity: "High",
    status: "Investigating",
    assignee: "Jane Smith",
    opened: "Mar 16, 07:55",
    summary: "SIEM detected 240 failed login attempts against 3 admin accounts from IP range in Romania over 6 hours. Accounts locked; MFA enforcement review initiated.",
  },
  {
    id: "INC-2024-002",
    title: "Phishing email campaign detected",
    type: "Social Engineering",
    severity: "Medium",
    status: "Investigating",
    assignee: "Sarah Chen",
    opened: "Mar 16, 05:30",
    summary: "12 employees received crafted phishing emails impersonating IT helpdesk requesting credential re-verification. Two clicks recorded. Email gateway rules updated; awareness notification sent.",
  },
  {
    id: "INC-2024-000",
    title: "Expired TLS certificate on api-gateway-02",
    type: "Configuration",
    severity: "Low",
    status: "Resolved",
    assignee: "Tom Wilson",
    opened: "Mar 14, 11:00",
    summary: "Certificate on api-gateway-02 expired without auto-renewal. Service degraded for 22 minutes. Certificate renewed; auto-renewal pipeline reviewed and re-enabled.",
  },
];

const severityBadge: Record<Severity, string> = {
  Critical: "bg-destructive/10 text-destructive border-destructive/20",
  High: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  Medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Low: "bg-muted text-muted-foreground border-border",
};

const statusBadge: Record<IncidentStatus, string> = {
  Active: "bg-destructive/10 text-destructive",
  Investigating: "bg-yellow-500/10 text-yellow-400",
  Resolved: "bg-success/10 text-success",
};

const severityFilters: (Severity | "All")[] = ["All", "Critical", "High", "Medium", "Low"];

export default function PortalIncidents() {
  const [severityFilter, setSeverityFilter] = useState<Severity | "All">("All");
  const [expanded, setExpanded] = useState<string | null>(null);

  const visible =
    severityFilter === "All"
      ? incidents
      : incidents.filter((i) => i.severity === severityFilter);

  return (
    <PortalLayout>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Incidents</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Incident Tracker</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor and manage active security incidents across the platform.
          </p>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-secondary/30 w-fit flex-wrap">
          {severityFilters.map((f) => (
            <button
              key={f}
              onClick={() => setSeverityFilter(f)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                severityFilter === f
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f}
              <span className="ml-1.5 text-muted-foreground">
                {f === "All" ? incidents.length : incidents.filter((i) => i.severity === f).length}
              </span>
            </button>
          ))}
        </div>

        {/* Incident List */}
        <div className="space-y-3">
          {visible.map((inc) => (
            <div
              key={inc.id}
              className="glass-panel rounded-xl border border-border/50 overflow-hidden"
            >
              <button
                className="w-full text-left p-4 hover:bg-secondary/20 transition-colors"
                onClick={() => setExpanded(expanded === inc.id ? null : inc.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-mono text-muted-foreground">{inc.id}</span>
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded border ${severityBadge[inc.severity]}`}>
                        {inc.severity}
                      </span>
                      <span className="text-xs text-muted-foreground">{inc.type}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">{inc.title}</h3>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <User className="w-3 h-3" />
                        {inc.assignee}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {inc.opened}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusBadge[inc.status]}`}>
                      {inc.status}
                    </span>
                    {expanded === inc.id ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </button>

              {expanded === inc.id && (
                <div className="px-4 pb-4 pt-0 border-t border-border/30">
                  <p className="text-sm text-muted-foreground leading-relaxed mt-3">
                    {inc.summary}
                  </p>
                </div>
              )}
            </div>
          ))}

          {visible.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No incidents matching the selected severity.
            </div>
          )}
        </div>
      </div>
    </PortalLayout>
  );
}
