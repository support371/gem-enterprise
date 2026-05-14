"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Database,
  FileText,
  Fingerprint,
  Loader2,
  ShieldCheck,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auditSeverity, formatAuditAction } from "@/lib/auditTypes";

type AuditLogRow = {
  id: string;
  action: string;
  resource: string | null;
  resourceId: string | null;
  metadata: unknown;
  createdAt: string;
  user: {
    id: string;
    email: string;
    role?: string;
    profile?: {
      firstName?: string | null;
      lastName?: string | null;
      displayName?: string | null;
    } | null;
  } | null;
};

function actorName(log: AuditLogRow) {
  const profile = log.user?.profile;
  if (profile?.displayName) return profile.displayName;
  const name = [profile?.firstName, profile?.lastName].filter(Boolean).join(" ");
  return name || log.user?.email || "System";
}

function severityClass(action: string) {
  const severity = auditSeverity(action);
  if (severity === "high") return "border-red-500/25 bg-red-500/15 text-red-400";
  if (severity === "medium") return "border-yellow-500/25 bg-yellow-500/15 text-yellow-400";
  if (severity === "low") return "border-green-500/25 bg-green-500/15 text-green-400";
  return "border-white/10 bg-white/10 text-slate-300";
}

function safePreview(metadata: unknown) {
  if (!metadata) return "No metadata";
  try {
    const text = typeof metadata === "string" ? metadata : JSON.stringify(metadata);
    return text.length > 96 ? `${text.slice(0, 96)}…` : text;
  } catch {
    return "Metadata unavailable";
  }
}

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<AuditLogRow | null>(null);

  useEffect(() => {
    fetch("/api/admin/audit")
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data.logs)) setLogs(data.logs);
      })
      .finally(() => setLoading(false));
  }, []);

  const summary = useMemo(() => ({
    total: logs.length,
    high: logs.filter((log) => auditSeverity(log.action) === "high").length,
    medium: logs.filter((log) => auditSeverity(log.action) === "medium").length,
    low: logs.filter((log) => auditSeverity(log.action) === "low").length,
  }), [logs]);

  const cards = [
    { label: "Total Events", value: summary.total, icon: Database, color: "text-cyan-400", bg: "bg-cyan-500/10" },
    { label: "High Priority", value: summary.high, icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10" },
    { label: "Medium Priority", value: summary.medium, icon: Clock, color: "text-yellow-400", bg: "bg-yellow-500/10" },
    { label: "Normal Events", value: summary.low, icon: CheckCircle2, color: "text-green-400", bg: "bg-green-500/10" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex items-start gap-3">
          <Link href="/app/admin">
            <Button variant="ghost" size="icon" className="mt-1 h-8 w-8 text-slate-400 hover:text-white">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-xs font-mono uppercase tracking-wider text-cyan-400">
              <Fingerprint className="h-3.5 w-3.5" /> Audit Evidence
            </div>
            <h1 className="text-2xl font-bold text-white">Audit Log Viewer</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-400">
              Review authentication, compliance, KYC, document, AI, and admin events across the platform.
            </p>
          </div>
        </div>
        <Badge className="border-green-500/25 bg-green-500/15 text-green-400">
          <ShieldCheck className="mr-1 h-3.5 w-3.5" /> Evidence Stream Active
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="glass-panel bento-card rounded-xl p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${bg}`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <p className={`text-3xl font-bold ${color}`}>{loading ? "—" : value}</p>
            </div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      <div className={`grid gap-6 ${selected ? "xl:grid-cols-[1.2fr_0.8fr]" : ""}`}>
        <Card className="border-white/10 bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm text-white">
              <Activity className="h-4 w-4 text-cyan-400" /> Recent Audit Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-12 text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading audit events…
              </div>
            ) : logs.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
                <FileText className="mx-auto mb-3 h-8 w-8 text-slate-600" />
                <p className="text-sm text-slate-500">No audit events available yet.</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-white/10">
                <div className="grid grid-cols-[1fr_1fr_0.8fr_0.8fr] border-b border-white/10 bg-white/5 px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                  <span>Action</span><span>Actor</span><span>Resource</span><span className="text-right">Time</span>
                </div>
                {logs.map((log) => (
                  <button key={log.id} type="button" onClick={() => setSelected(log)} className="grid w-full grid-cols-[1fr_1fr_0.8fr_0.8fr] items-center border-b border-white/5 px-4 py-4 text-left transition hover:bg-white/5 last:border-b-0">
                    <div>
                      <Badge className={severityClass(log.action)}>{formatAuditAction(log.action)}</Badge>
                      <p className="mt-1 font-mono text-[11px] text-slate-600">{log.id.slice(0, 12)}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <User className="h-4 w-4 text-slate-500" /><span className="truncate">{actorName(log)}</span>
                    </div>
                    <span className="truncate text-sm text-slate-400">{log.resource || "Platform"}</span>
                    <span className="text-right font-mono text-xs text-slate-500">
                      {new Date(log.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {selected && (
          <Card className="sticky top-20 h-fit border-white/10 bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-white">Event Details</CardTitle>
                <Button variant="ghost" size="sm" className="text-xs text-slate-400" onClick={() => setSelected(null)}>Close</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Badge className={severityClass(selected.action)}>{formatAuditAction(selected.action)}</Badge>
                <p className="mt-3 font-mono text-xs text-slate-500">{selected.id}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {[["Actor", actorName(selected)], ["Resource", selected.resource || "Platform"], ["Resource ID", selected.resourceId || "—"], ["Role", selected.user?.role || "—"]].map(([label, value]) => (
                  <div key={label} className="rounded-lg bg-white/5 p-3">
                    <p className="text-slate-500">{label}</p><p className="mt-0.5 break-words font-medium text-white">{value}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-4">
                <p className="mb-2 text-sm font-semibold text-cyan-400">Metadata Preview</p>
                <p className="break-words font-mono text-xs leading-relaxed text-slate-400">{safePreview(selected.metadata)}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
