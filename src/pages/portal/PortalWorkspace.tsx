import { FolderOpen, Shield, FileText, File, Download, Clock, Lock } from "lucide-react";
import { PortalLayout } from "@/components/portal/PortalLayout";

const documents = [
  {
    id: "DOC-001",
    name: "Incident Response Playbook v3.2",
    type: "Playbook",
    classification: "Internal",
    updatedBy: "Jane Smith",
    updatedAt: "Mar 18, 2026",
    size: "1.4 MB",
    icon: FileText,
  },
  {
    id: "DOC-002",
    name: "Security Policy — Acceptable Use",
    type: "Policy",
    classification: "Internal",
    updatedBy: "Admin",
    updatedAt: "Mar 12, 2026",
    size: "320 KB",
    icon: Lock,
  },
  {
    id: "DOC-003",
    name: "Vulnerability Remediation SLA",
    type: "SLA",
    classification: "Confidential",
    updatedBy: "Mike Johnson",
    updatedAt: "Mar 10, 2026",
    size: "480 KB",
    icon: FileText,
  },
  {
    id: "DOC-004",
    name: "Q1 2026 Security Assessment Report",
    type: "Report",
    classification: "Confidential",
    updatedBy: "Sarah Chen",
    updatedAt: "Mar 5, 2026",
    size: "2.1 MB",
    icon: File,
  },
  {
    id: "DOC-005",
    name: "Zero Trust Architecture Design",
    type: "Architecture",
    classification: "Restricted",
    updatedBy: "Alex Rivera",
    updatedAt: "Feb 28, 2026",
    size: "3.7 MB",
    icon: File,
  },
  {
    id: "DOC-006",
    name: "SIEM Tuning Runbook",
    type: "Runbook",
    classification: "Internal",
    updatedBy: "Dana Lee",
    updatedAt: "Feb 22, 2026",
    size: "560 KB",
    icon: FileText,
  },
];

const classificationConfig: Record<string, { badge: string; iconColor: string }> = {
  Internal:     { badge: "bg-primary/10 text-primary border-primary/20",                icon: "text-primary" },
  Confidential: { badge: "bg-orange-500/10 text-orange-400 border-orange-500/20",       icon: "text-orange-400" },
  Restricted:   { badge: "bg-destructive/10 text-destructive border-destructive/20",     icon: "text-destructive" },
};

const typeBadge = "bg-muted text-muted-foreground border-border";

export default function PortalWorkspace() {
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
          <h1 className="text-2xl font-bold text-foreground">Workspace</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Shared documents, playbooks, policies, and reports.
          </p>
        </div>

        {/* Documents Table */}
        <div className="glass-panel rounded-xl border border-border/50 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/50 bg-primary/[0.03]">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-primary" />
              Documents
            </h2>
            <span className="text-xs text-muted-foreground">{documents.length} files</span>
          </div>
          <div className="divide-y divide-border/40">
            {documents.map((doc) => {
              const cfg = classificationConfig[doc.classification] || classificationConfig["Internal"];
              return (
                <div
                  key={doc.id}
                  className="px-5 py-4 flex items-center gap-4 card-hover-row group"
                >
                  <div className={`w-9 h-9 rounded-lg bg-card border border-border flex items-center justify-center shrink-0 transition-colors group-hover:border-primary/30 group-hover:bg-primary/5`}>
                    <doc.icon className={`w-4 h-4 ${cfg.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate mb-1">{doc.name}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded border ${typeBadge}`}>
                        {doc.type}
                      </span>
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded border ${cfg.badge}`}>
                        {doc.classification}
                      </span>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center gap-4 text-xs text-muted-foreground shrink-0">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{doc.updatedAt}</span>
                    </div>
                    <span className="font-mono text-foreground/40">{doc.size}</span>
                  </div>
                  <button
                    className="shrink-0 p-2 rounded-lg border border-transparent hover:border-primary/30 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all duration-150"
                    title={`Download ${doc.name}`}
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
