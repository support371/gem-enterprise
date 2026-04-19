"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Shield,
  AlertTriangle,
  Users,
  Key,
  Brain,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  Server,
  Zap,
  Lock,
  Eye,
  Flag,
  ChevronRight,
  AlertOctagon,
  RefreshCw,
  Download,
  UserCheck,
  Database,
  Globe,
  Bell,
  CreditCard,
  MessageSquare,
  Link2,
  Cpu,
  BarChart3,
  TrendingUp,
  Hash,
  CalendarDays,
  Info,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type TabId =
  | "overview"
  | "governance"
  | "moderation"
  | "audit"
  | "ai"
  | "approvals"
  | "system";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function ProgressBar({
  value,
  color = "bg-primary",
}: {
  value: number;
  color?: string;
}) {
  return (
    <div className="h-1.5 rounded-full bg-muted">
      <div
        className={`h-full rounded-full ${color}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span
      className={`inline-block h-2 w-2 rounded-full ${ok ? "bg-emerald-400" : "bg-red-400"}`}
    />
  );
}

function SeverityBadge({ level }: { level: string }) {
  const map: Record<string, string> = {
    CRITICAL: "bg-red-400/20 text-red-400 border border-red-400/30",
    HIGH: "bg-amber-400/20 text-amber-400 border border-amber-400/30",
    MEDIUM: "bg-yellow-400/20 text-yellow-400 border border-yellow-400/30",
    LOW: "bg-muted text-muted-foreground border border-border",
    P1: "bg-red-400/20 text-red-400 border border-red-400/30",
    P2: "bg-amber-400/20 text-amber-400 border border-amber-400/30",
    P3: "bg-yellow-400/20 text-yellow-400 border border-yellow-400/30",
  };
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wide ${map[level] ?? "bg-muted text-muted-foreground"}`}
    >
      {level}
    </span>
  );
}

function SlaLabel({ label, urgent }: { label: string; urgent?: "red" | "amber" | "green" }) {
  const color =
    urgent === "red"
      ? "text-red-400"
      : urgent === "amber"
        ? "text-amber-400"
        : "text-emerald-400";
  return <span className={`text-xs font-mono ${color}`}>{label}</span>;
}

function AuditStatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    success: "bg-emerald-400/10 text-emerald-400",
    blocked: "bg-red-400/10 text-red-400",
    denied: "bg-red-400/10 text-red-400",
    warning: "bg-amber-400/10 text-amber-400",
  };
  return (
    <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${map[status] ?? "bg-muted text-muted-foreground"}`}>
      {status}
    </span>
  );
}

// ─── Section Components ───────────────────────────────────────────────────────

function KpiStrip() {
  const kpis = [
    {
      label: "Pending Approvals",
      value: "14",
      icon: Clock,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
    },
    {
      label: "Flagged Content",
      value: "7",
      icon: Flag,
      color: "text-red-400",
      bg: "bg-red-400/10",
    },
    {
      label: "Active Moderators",
      value: "3",
      icon: UserCheck,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Role Changes Today",
      value: "5",
      icon: Key,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
    },
    {
      label: "AI Usage Today",
      value: "2,847",
      unit: "tokens",
      icon: Brain,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
    },
    {
      label: "Audit Events",
      value: "142",
      icon: FileText,
      color: "text-muted-foreground",
      bg: "bg-muted",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 px-6 py-4 sm:grid-cols-3 lg:grid-cols-6">
      {kpis.map((k) => (
        <div
          key={k.label}
          className="glass-panel bento-card rounded-lg p-3 flex flex-col gap-1"
        >
          <div className="flex items-center gap-1.5">
            <div className={`rounded p-1 ${k.bg}`}>
              <k.icon className={`h-3.5 w-3.5 ${k.color}`} />
            </div>
            <span className="text-[10px] text-muted-foreground leading-tight">{k.label}</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-xl font-bold tabular-nums ${k.color}`}>{k.value}</span>
            {k.unit && <span className="text-[10px] text-muted-foreground">{k.unit}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Governance Tab ───────────────────────────────────────────────────────────

function AccessControlCard() {
  const rows = [
    { label: "Total Users", value: 487, max: 500, color: "bg-primary" },
    { label: "Admin Accounts", value: 12, max: 500, color: "bg-purple-400" },
    { label: "Service Accounts", value: 34, max: 500, color: "bg-amber-400" },
    { label: "Inactive (90d)", value: 23, max: 500, color: "bg-red-400" },
  ];
  return (
    <Card className="glass-panel bento-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Users className="h-4 w-4 text-primary" />
          Access Control Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {rows.map((r) => (
          <div key={r.label} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{r.label}</span>
              <span className="text-xs font-mono font-semibold text-foreground">{r.value}</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted">
              <div
                className={`h-full rounded-full ${r.color}`}
                style={{ width: `${(r.value / r.max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function RoleDistributionCard() {
  const roles = [
    { name: "Super Admin", count: 3, total: 487, color: "bg-red-400" },
    { name: "Platform Admin", count: 9, total: 487, color: "bg-amber-400" },
    { name: "Moderator", count: 18, total: 487, color: "bg-purple-400" },
    { name: "Analyst", count: 127, total: 487, color: "bg-primary" },
    { name: "Client", count: 325, total: 487, color: "bg-emerald-400" },
    { name: "Guest", count: 5, total: 487, color: "bg-muted-foreground" },
  ];
  return (
    <Card className="glass-panel bento-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <BarChart3 className="h-4 w-4 text-primary" />
          Role Distribution
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {roles.map((r) => (
          <div key={r.name} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{r.name}</span>
              <span className="text-xs font-mono font-semibold text-foreground">{r.count}</span>
            </div>
            <div className="h-2 rounded-full bg-muted">
              <div
                className={`h-full rounded-full ${r.color}`}
                style={{ width: `${(r.count / r.total) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function MfaSecurityCard() {
  return (
    <Card className="glass-panel bento-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Lock className="h-4 w-4 text-primary" />
          MFA &amp; Security
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">MFA Enabled</span>
            <span className="text-xs font-mono font-semibold text-emerald-400">94.2%</span>
          </div>
          <ProgressBar value={94.2} color="bg-emerald-400" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-md bg-emerald-400/10 px-3 py-2">
            <div>
              <p className="text-xs font-medium text-foreground">Privileged Accounts</p>
              <p className="text-[10px] text-muted-foreground">MFA required — 12/12</p>
            </div>
            <CheckCircle className="h-4 w-4 text-emerald-400" />
          </div>

          <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2">
            <div>
              <p className="text-xs font-medium text-foreground">Password Resets</p>
              <p className="text-[10px] text-muted-foreground">Last 7 days</p>
            </div>
            <span className="text-sm font-bold text-amber-400">8</span>
          </div>

          <div className="flex items-center justify-between rounded-md bg-red-400/10 px-3 py-2">
            <div>
              <p className="text-xs font-medium text-foreground">Locked Accounts</p>
              <p className="text-[10px] text-muted-foreground">Require manual review</p>
            </div>
            <span className="text-sm font-bold text-red-400">2</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function GovernanceSection() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <AccessControlCard />
        <RoleDistributionCard />
        <MfaSecurityCard />
      </div>
    </div>
  );
}

// ─── Moderation Tab ───────────────────────────────────────────────────────────

function FlaggedContentTable() {
  const rows = [
    {
      content: "Suspicious upload in documents",
      type: "File",
      severity: "HIGH",
      reportedBy: "System",
      status: "Pending",
      actions: ["Review", "Dismiss"],
    },
    {
      content: "Profanity in discussion thread #47",
      type: "Post",
      severity: "LOW",
      reportedBy: "user-234",
      status: "In Review",
      actions: ["Resolve"],
    },
    {
      content: "Unverified external link",
      type: "Link",
      severity: "MEDIUM",
      reportedBy: "user-891",
      status: "Pending",
      actions: ["Review"],
    },
    {
      content: "Mass download attempt",
      type: "Activity",
      severity: "HIGH",
      reportedBy: "System",
      status: "Escalated",
      actions: ["View"],
    },
    {
      content: "KYC document mismatch",
      type: "Document",
      severity: "CRITICAL",
      reportedBy: "System",
      status: "Pending",
      actions: ["Review", "Escalate"],
    },
  ];

  const statusColor: Record<string, string> = {
    Pending: "text-amber-400",
    "In Review": "text-primary",
    Escalated: "text-red-400",
    Resolved: "text-emerald-400",
  };

  return (
    <Card className="glass-panel bento-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Flag className="h-4 w-4 text-red-400" />
          Flagged Content Queue
          <span className="ml-auto rounded-full bg-red-400/20 px-2 py-0.5 text-[10px] font-bold text-red-400">
            5 items
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Content
                </th>
                <th className="px-4 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Type
                </th>
                <th className="px-4 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Severity
                </th>
                <th className="px-4 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Reported By
                </th>
                <th className="px-4 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r, i) => (
                <tr key={i} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-2.5 text-foreground max-w-[200px] truncate">{r.content}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{r.type}</td>
                  <td className="px-4 py-2.5">
                    <SeverityBadge level={r.severity} />
                  </td>
                  <td className="px-4 py-2.5 font-mono text-muted-foreground">{r.reportedBy}</td>
                  <td className={`px-4 py-2.5 font-semibold ${statusColor[r.status]}`}>
                    {r.status}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-1">
                      {r.actions.map((a) => (
                        <Button
                          key={a}
                          variant="outline"
                          size="sm"
                          className="h-6 px-2 text-[10px] border-border hover:border-primary/50 hover:text-primary"
                        >
                          {a}
                        </Button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function EscalationsPanel() {
  const escalations = [
    {
      id: "ESC-2041",
      title: "KYC Document Forgery Suspected",
      severity: "CRITICAL",
      description:
        "System-detected inconsistency between uploaded KYC ID and facial verification data. Requires immediate senior reviewer action.",
      assigned: "Unassigned",
      sla: "30 min remaining",
      slaUrgent: "red" as const,
    },
    {
      id: "ESC-2039",
      title: "Mass Download Anomaly — Client #4821",
      severity: "HIGH",
      description:
        "Client triggered bulk download of 847 documents within 4 minutes. Possible data exfiltration pattern flagged by DLP engine.",
      assigned: "A. Reyes",
      sla: "2h 15m remaining",
      slaUrgent: "amber" as const,
    },
  ];

  return (
    <Card className="glass-panel bento-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <AlertOctagon className="h-4 w-4 text-red-400" />
          Open Escalations
          <span className="ml-auto rounded-full bg-red-400/20 px-2 py-0.5 text-[10px] font-bold text-red-400">
            2 open
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {escalations.map((e) => (
          <div
            key={e.id}
            className="rounded-lg border border-border bg-card p-3 space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <SeverityBadge level={e.severity} />
                <span className="font-mono text-[10px] text-muted-foreground">{e.id}</span>
              </div>
              <SlaLabel label={e.sla} urgent={e.slaUrgent} />
            </div>
            <p className="text-xs font-semibold text-foreground">{e.title}</p>
            <p className="text-[10px] text-muted-foreground leading-relaxed">{e.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">
                Assigned: <span className="text-foreground">{e.assigned}</span>
              </span>
              <div className="flex gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-[10px] border-border hover:border-primary/50"
                >
                  Assign
                </Button>
                <Button
                  size="sm"
                  className="h-6 px-2 text-[10px] bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  View Detail
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ModerationSection() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <FlaggedContentTable />
      <EscalationsPanel />
    </div>
  );
}

// ─── Audit Tab ────────────────────────────────────────────────────────────────

function AuditLogTable() {
  const entries = [
    {
      time: "14:32:01",
      user: "admin@gem.io",
      action: "login",
      resource: "Auth Portal",
      ip: "10.0.1.42",
      status: "success",
    },
    {
      time: "14:29:18",
      user: "admin@gem.io",
      action: "permission_grant",
      resource: "User #4821",
      ip: "10.0.1.42",
      status: "success",
    },
    {
      time: "14:17:54",
      user: "sys-provisioner",
      action: "role_change",
      resource: "M.Sterling → Analyst",
      ip: "10.0.0.5",
      status: "success",
    },
    {
      time: "13:58:22",
      user: "compliance@gem.io",
      action: "export_data",
      resource: "Q4 Audit Report",
      ip: "10.0.2.11",
      status: "success",
    },
    {
      time: "13:44:09",
      user: "integrationbot",
      action: "api_key_create",
      resource: "Stripe Webhook",
      ip: "10.0.3.99",
      status: "success",
    },
    {
      time: "13:31:47",
      user: "admin@gem.io",
      action: "config_update",
      resource: "MFA Policy v2",
      ip: "10.0.1.42",
      status: "success",
    },
    {
      time: "12:55:30",
      user: "mod@gem.io",
      action: "user_suspend",
      resource: "Client #3204",
      ip: "10.0.1.88",
      status: "success",
    },
    {
      time: "12:38:14",
      user: "client-4112@ext",
      action: "mfa_disable_attempt",
      resource: "Account Settings",
      ip: "84.23.11.200",
      status: "blocked",
    },
    {
      time: "11:52:06",
      user: "databot",
      action: "bulk_delete",
      resource: "Archive /2023/Q1",
      ip: "10.0.0.12",
      status: "denied",
    },
    {
      time: "11:14:33",
      user: "analyst@gem.io",
      action: "report_generate",
      resource: "Usage Analytics",
      ip: "10.0.1.77",
      status: "success",
    },
  ];

  const actionColor: Record<string, string> = {
    login: "text-primary",
    permission_grant: "text-purple-400",
    role_change: "text-purple-400",
    export_data: "text-amber-400",
    api_key_create: "text-primary",
    config_update: "text-amber-400",
    user_suspend: "text-red-400",
    mfa_disable_attempt: "text-red-400",
    bulk_delete: "text-red-400",
    report_generate: "text-emerald-400",
  };

  return (
    <Card className="glass-panel bento-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <FileText className="h-4 w-4 text-primary" />
          Audit Log — Last 10 Events
          <span className="ml-auto text-[10px] text-muted-foreground font-mono">
            142 events today
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                {["Time", "User", "Action", "Resource", "IP", "Status"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {entries.map((e, i) => (
                <tr key={i} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-2 font-mono text-muted-foreground">{e.time}</td>
                  <td className="px-4 py-2 text-foreground font-mono">{e.user}</td>
                  <td className={`px-4 py-2 font-mono font-semibold ${actionColor[e.action]}`}>
                    {e.action}
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">{e.resource}</td>
                  <td className="px-4 py-2 font-mono text-muted-foreground">{e.ip}</td>
                  <td className="px-4 py-2">
                    <AuditStatusChip status={e.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function PolicyExceptionsCards() {
  const exceptions = [
    {
      policy: "MFA Enforcement Policy",
      reason: "Legacy API integration requires password-only auth during migration window",
      approvedBy: "CTO — D. Mercer",
      expires: "2026-04-01",
    },
    {
      policy: "Data Retention — 90 Day",
      reason: "Ongoing litigation hold requires extended retention for client #3107 records",
      approvedBy: "Legal — S. Quinn",
      expires: "2026-06-15",
    },
    {
      policy: "IP Allowlist Enforcement",
      reason: "Temporary exception for remote audit team accessing from approved VPN range",
      approvedBy: "CISO — A. Patel",
      expires: "2026-03-25",
    },
  ];

  return (
    <div className="space-y-3">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <AlertTriangle className="h-4 w-4 text-amber-400" />
        Active Policy Exceptions
      </h3>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {exceptions.map((e, i) => (
          <div key={i} className="glass-panel rounded-lg p-3 space-y-2 border-amber-400/20">
            <div className="flex items-center gap-2">
              <span className="rounded bg-amber-400/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-400">
                EXCEPTION
              </span>
            </div>
            <p className="text-xs font-semibold text-foreground">{e.policy}</p>
            <p className="text-[10px] text-muted-foreground leading-relaxed">{e.reason}</p>
            <div className="border-t border-border pt-2 space-y-1">
              <p className="text-[10px] text-muted-foreground">
                Approved by: <span className="text-foreground">{e.approvedBy}</span>
              </p>
              <p className="text-[10px] text-muted-foreground">
                Expires: <span className="font-mono text-amber-400">{e.expires}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AuditPrepCards() {
  return (
    <div className="space-y-3">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Shield className="h-4 w-4 text-primary" />
        Audit Readiness
      </h3>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Card className="glass-panel bento-card border-border">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">SOC 2 Readiness</span>
              <span className="text-sm font-bold text-amber-400">78%</span>
            </div>
            <ProgressBar value={78} color="bg-amber-400" />
            <p className="text-[10px] text-muted-foreground">
              14 controls verified · 4 in review · 2 pending evidence
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full h-7 text-xs border-border hover:border-primary/50 hover:text-primary"
            >
              View Controls
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-panel bento-card border-border">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">ISO Control Mapping</span>
              <span className="text-sm font-bold text-emerald-400">85%</span>
            </div>
            <ProgressBar value={85} color="bg-emerald-400" />
            <p className="text-[10px] text-muted-foreground">
              ISO 27001 · 34/40 controls mapped · Next review: Apr 2026
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full h-7 text-xs border-border hover:border-primary/50 hover:text-primary"
            >
              View Mapping
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-panel bento-card border-border">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">Compliance Calendar</span>
              <CalendarDays className="h-4 w-4 text-primary" />
            </div>
            <div className="space-y-1.5">
              {[
                { date: "Mar 25", event: "Internal SOC 2 Review", color: "text-amber-400" },
                { date: "Apr 10", event: "Pen Test Kickoff", color: "text-primary" },
                { date: "Jun 01", event: "ISO 27001 Audit", color: "text-emerald-400" },
              ].map((item) => (
                <div key={item.date} className="flex items-center gap-2">
                  <span className={`font-mono text-[10px] ${item.color}`}>{item.date}</span>
                  <span className="text-[10px] text-muted-foreground">{item.event}</span>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full h-7 text-xs border-border hover:border-primary/50 hover:text-primary"
            >
              Full Calendar
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DisclaimerBanner() {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-3">
      <Info className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
      <p className="text-xs text-amber-400">
        <span className="font-bold">Audit Data Notice:</span> This platform maintains internal audit
        logs for operational governance purposes. All data shown is fictional demo data for platform
        preview only. No real user data, credentials, or access records are represented in this
        interface.
      </p>
    </div>
  );
}

function AuditSection() {
  return (
    <div className="space-y-6">
      <AuditLogTable />
      <PolicyExceptionsCards />
      <AuditPrepCards />
      <DisclaimerBanner />
    </div>
  );
}

// ─── AI Governance Tab ────────────────────────────────────────────────────────

function ModelUsageCard() {
  const models = [
    { name: "claude-sonnet-4-6", requests: 1847, pct: 67, primary: true },
    { name: "claude-haiku-4-5", requests: 892, pct: 33, primary: false },
  ];
  return (
    <Card className="glass-panel bento-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Cpu className="h-4 w-4 text-purple-400" />
          Model Usage
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {models.map((m) => (
          <div key={m.name} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-xs text-foreground">{m.name}</span>
                {m.primary && (
                  <span className="rounded bg-primary/10 px-1 py-0.5 text-[9px] font-bold text-primary">
                    PRIMARY
                  </span>
                )}
              </div>
              <span className="font-mono text-xs text-muted-foreground">
                {m.requests.toLocaleString()} req
              </span>
            </div>
            <ProgressBar value={m.pct} color={m.primary ? "bg-purple-400" : "bg-primary"} />
          </div>
        ))}

        <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-2 mt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Daily Quota Used</span>
            <span className="text-xs font-bold text-amber-400">67%</span>
          </div>
          <ProgressBar value={67} color="bg-amber-400" />
          <p className="text-[10px] text-muted-foreground">
            2,739 / 4,096 requests · resets in 9h 28m
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function PromptApprovalCard() {
  const pending = [
    { risk: "HIGH", label: "Bulk user data query with PII fields" },
    { risk: "HIGH", label: "Unrestricted document search across all clients" },
    { risk: "MEDIUM", label: "Cross-tenant analytics comparison prompt" },
    { risk: "MEDIUM", label: "External API data enrichment request" },
  ];
  return (
    <Card className="glass-panel bento-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Eye className="h-4 w-4 text-purple-400" />
          Prompt Approval Workflow
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {pending.map((p, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-md border border-border bg-muted/20 px-3 py-2"
            >
              <SeverityBadge level={p.risk} />
              <span className="flex-1 text-[10px] text-muted-foreground truncate">{p.label}</span>
              <Button
                size="sm"
                variant="outline"
                className="h-5 px-1.5 text-[9px] border-border hover:border-primary/50 hover:text-primary flex-shrink-0"
              >
                Review
              </Button>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 border-t border-border pt-3">
          <div className="text-center">
            <p className="text-lg font-bold text-emerald-400">234</p>
            <p className="text-[10px] text-muted-foreground">Auto-approved today</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-red-400">3</p>
            <p className="text-[10px] text-muted-foreground">Rejected today</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FlaggedAiOutputsCard() {
  const items = [
    {
      label: "PII Detected",
      count: 2,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
      border: "border-amber-400/20",
      icon: AlertTriangle,
    },
    {
      label: "Policy Violation",
      count: 1,
      color: "text-red-400",
      bg: "bg-red-400/10",
      border: "border-red-400/20",
      icon: XCircle,
    },
    {
      label: "Hallucination Reports",
      count: 0,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      border: "border-emerald-400/20",
      icon: CheckCircle,
    },
  ];
  return (
    <Card className="glass-panel bento-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <AlertOctagon className="h-4 w-4 text-red-400" />
          Flagged AI Outputs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div
            key={item.label}
            className={`flex items-center justify-between rounded-lg border ${item.border} ${item.bg} px-3 py-2.5`}
          >
            <div className="flex items-center gap-2">
              <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
              <span className="text-xs text-foreground">{item.label}</span>
            </div>
            <span className={`text-sm font-bold ${item.color}`}>{item.count} flagged</span>
          </div>
        ))}

        <div className="mt-2 rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-3 py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-xs text-foreground">Knowledge Source Health</span>
            </div>
            <span className="text-xs font-bold text-emerald-400">3/3 active</span>
          </div>
          <div className="mt-2 space-y-1">
            {["Core Knowledge Base", "Client Documents", "Policy Repository"].map((src) => (
              <div key={src} className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" />
                <span className="text-[10px] text-muted-foreground">{src}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AiSection() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <ModelUsageCard />
      <PromptApprovalCard />
      <FlaggedAiOutputsCard />
    </div>
  );
}

// ─── Approvals Tab ────────────────────────────────────────────────────────────

function PendingRequestsList() {
  const requests = [
    {
      title: "Access Upgrade Request",
      requester: "DataTeam / J.Walker",
      priority: "HIGH",
      due: "Due in 2h",
      dueUrgent: "red" as const,
      avatar: "JW",
    },
    {
      title: "New API Key — IntegrationBot",
      requester: "IntegrationBot",
      priority: "NORMAL",
      due: "Due in 24h",
      dueUrgent: "green" as const,
      avatar: "IB",
    },
    {
      title: "Custom Role Creation",
      requester: "HR / M.Sterling",
      priority: "NORMAL",
      due: "Due in 48h",
      dueUrgent: "green" as const,
      avatar: "MS",
    },
    {
      title: "Data Export Approval",
      requester: "Compliance / S.Wu",
      priority: "HIGH",
      due: "Due in 1h",
      dueUrgent: "red" as const,
      avatar: "SW",
    },
    {
      title: "KYC Exception Request",
      requester: "Client #4891",
      priority: "CRITICAL",
      due: "Due in 30m",
      dueUrgent: "red" as const,
      avatar: "C4",
    },
  ];

  const priorityStyle: Record<string, string> = {
    CRITICAL: "bg-red-400/20 text-red-400 border border-red-400/30",
    HIGH: "bg-amber-400/20 text-amber-400 border border-amber-400/30",
    NORMAL: "bg-muted text-muted-foreground border border-border",
  };

  return (
    <Card className="glass-panel bento-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <CheckCircle className="h-4 w-4 text-primary" />
          Pending Service Requests
          <span className="ml-auto rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-400">
            5 pending
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {requests.map((r, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 p-3 hover:bg-muted/30 transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary flex-shrink-0">
              {r.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{r.title}</p>
              <p className="text-[10px] text-muted-foreground">{r.requester}</p>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <span
                className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${priorityStyle[r.priority]}`}
              >
                {r.priority}
              </span>
              <SlaLabel label={r.due} urgent={r.dueUrgent} />
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <Button
                size="sm"
                className="h-6 px-2 text-[10px] bg-emerald-400/20 text-emerald-400 hover:bg-emerald-400/30 border border-emerald-400/30"
                variant="outline"
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-6 px-2 text-[10px] border-border text-red-400 hover:bg-red-400/10 hover:border-red-400/30"
              >
                Deny
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ApprovalStatsCard() {
  const stats = [
    { label: "Avg Approval Time", value: "4.2h", color: "text-primary", note: "last 30 days" },
    { label: "SLA Breaches This Week", value: "2", color: "text-amber-400", note: "target: 0" },
    { label: "Approvals Completed Today", value: "31", color: "text-emerald-400", note: "of 45 total" },
    { label: "Pending > 24h", value: "3", color: "text-red-400", note: "requires attention" },
  ];
  return (
    <Card className="glass-panel bento-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <TrendingUp className="h-4 w-4 text-primary" />
          Approval Workflow Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        {stats.map((s, i) => (
          <div key={i} className="rounded-lg border border-border bg-muted/20 p-3 space-y-1">
            <p className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
            <p className="text-xs font-medium text-foreground leading-tight">{s.label}</p>
            <p className="text-[10px] text-muted-foreground">{s.note}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ApprovalsSection() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <PendingRequestsList />
      <ApprovalStatsCard />
    </div>
  );
}

// ─── System Tab ───────────────────────────────────────────────────────────────

function IncidentsSummaryCard() {
  return (
    <Card className="glass-panel bento-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          Incidents Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-amber-400/20 bg-amber-400/10 p-3 text-center">
            <p className="text-2xl font-bold text-amber-400">1</p>
            <p className="text-[10px] text-muted-foreground">Open Incident</p>
            <span className="mt-1 inline-block rounded bg-yellow-400/20 px-1.5 py-0.5 text-[9px] font-bold text-yellow-400">
              P3 — minor
            </span>
          </div>
          <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 p-3 text-center">
            <p className="text-2xl font-bold text-emerald-400">3</p>
            <p className="text-[10px] text-muted-foreground">Resolved Today</p>
          </div>
        </div>
        <div className="space-y-2 border-t border-border pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Mean Time to Resolve</span>
            <span className="font-mono text-xs font-bold text-primary">42 min</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Last Incident</span>
            <span className="font-mono text-xs text-muted-foreground">6h ago</span>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-muted/20 p-2.5">
          <p className="text-[10px] font-semibold text-amber-400">Active: INC-0089</p>
          <p className="text-[10px] text-muted-foreground">AI Inference — elevated latency (p99: 4.2s)</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ServiceHealthCard() {
  const services = [
    { name: "API Gateway", status: "Operational", ok: true },
    { name: "Auth Service", status: "Operational", ok: true },
    { name: "AI Inference", status: "Degraded", ok: false, note: "↑ latency" },
    { name: "Database", status: "Operational", ok: true },
    { name: "CDN", status: "Operational", ok: true },
    { name: "Notifications", status: "Operational", ok: true },
  ];
  return (
    <Card className="glass-panel bento-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Activity className="h-4 w-4 text-primary" />
          Service Health
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {services.map((s) => (
          <div
            key={s.name}
            className="flex items-center justify-between rounded-md border border-border bg-muted/20 px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <StatusDot ok={s.ok} />
              <span className="text-xs text-foreground">{s.name}</span>
              {s.note && (
                <span className="text-[10px] text-amber-400 font-mono">{s.note}</span>
              )}
            </div>
            <span
              className={`text-xs font-semibold ${s.ok ? "text-emerald-400" : "text-amber-400"}`}
            >
              {s.status}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function IntegrationStatusCard() {
  const integrations = [
    { name: "Slack", icon: MessageSquare, connected: true },
    { name: "Stripe", icon: CreditCard, connected: true },
    { name: "SendGrid", icon: Bell, connected: true },
    { name: "Jira", icon: Hash, connected: false },
    { name: "Salesforce", icon: Globe, connected: true },
  ];
  return (
    <Card className="glass-panel bento-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Link2 className="h-4 w-4 text-primary" />
          Integration Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {integrations.map((intg) => (
          <div
            key={intg.name}
            className="flex items-center justify-between rounded-md border border-border bg-muted/20 px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <intg.icon className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-foreground">{intg.name}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <StatusDot ok={intg.connected} />
              <span
                className={`text-xs font-semibold ${intg.connected ? "text-emerald-400" : "text-red-400"}`}
              >
                {intg.connected ? "Connected" : "Disconnected"}
              </span>
              {!intg.connected && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-5 px-1.5 text-[9px] border-red-400/30 text-red-400 hover:bg-red-400/10 ml-1"
                >
                  Fix
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function SystemSection() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <IncidentsSummaryCard />
      <ServiceHealthCard />
      <IntegrationStatusCard />
    </div>
  );
}

// ─── Overview Tab (aggregate) ─────────────────────────────────────────────────

function OverviewSection() {
  return (
    <div className="space-y-6">
      {/* Governance top-row */}
      <div>
        <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          <Shield className="h-3.5 w-3.5" /> Governance
        </h2>
        <GovernanceSection />
      </div>

      {/* System + AI row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <Activity className="h-3.5 w-3.5" /> System Health (Summary)
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <IncidentsSummaryCard />
            <ServiceHealthCard />
          </div>
        </div>
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <Brain className="h-3.5 w-3.5" /> AI Governance (Summary)
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ModelUsageCard />
            <FlaggedAiOutputsCard />
          </div>
        </div>
      </div>

      {/* Audit disclaimer */}
      <DisclaimerBanner />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: Zap },
  { id: "governance", label: "Governance", icon: Shield },
  { id: "moderation", label: "Moderation", icon: Flag },
  { id: "audit", label: "Audit", icon: FileText },
  { id: "ai", label: "AI", icon: Brain },
  { id: "approvals", label: "Approvals", icon: CheckCircle },
  { id: "system", label: "System", icon: Server },
];

export default function AdminCommandCenter() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Sticky Command Header ── */}
      <div className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold tracking-tight text-foreground">
                Admin Command Center
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Governance · Approvals · Role Control · Platform Health · Audit Visibility
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-emerald-400 font-mono">Live</span>
              </div>
              <Badge className="bg-primary/10 text-primary border border-primary/30 font-bold tracking-wider">
                ADMIN ACCESS
              </Badge>
            </div>
          </div>
        </div>

        {/* ── Tab Bar ── */}
        <div className="flex gap-1 overflow-x-auto px-6 pb-0 scrollbar-none">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2 text-xs font-semibold transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── KPI Strip ── */}
      <KpiStrip />

      {/* ── Main Content ── */}
      <div className="px-6 pb-10 space-y-6">
        {activeTab === "overview" && <OverviewSection />}
        {activeTab === "governance" && <GovernanceSection />}
        {activeTab === "moderation" && <ModerationSection />}
        {activeTab === "audit" && <AuditSection />}
        {activeTab === "ai" && <AiSection />}
        {activeTab === "approvals" && <ApprovalsSection />}
        {activeTab === "system" && <SystemSection />}
      </div>
    </div>
  );
}
