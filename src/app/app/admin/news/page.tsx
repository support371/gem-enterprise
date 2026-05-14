"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  RefreshCw,
  Rss,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type AdminSource = {
  id: string;
  name: string;
  slug: string;
  feedUrl: string;
  siteUrl: string | null;
  category: string;
  description: string | null;
  isActive: boolean;
  pollIntervalMinutes: number;
  lastFetchedAt: string | null;
  lastSuccessAt: string | null;
  lastErrorAt: string | null;
  lastError: string | null;
  consecutiveFailures: number;
  _count: { articles: number };
};

type IngestionRun = {
  id: string;
  status: "running" | "success" | "partial" | "failed";
  triggeredBy: string;
  sourcesAttempted: number;
  sourcesSucceeded: number;
  sourcesFailed: number;
  articlesFound: number;
  articlesCreated: number;
  articlesUpdated: number;
  articlesSkipped: number;
  durationMs: number | null;
  errorSummary: string | null;
  startedAt: string;
  completedAt: string | null;
};

const CATEGORY_LABEL: Record<string, string> = {
  crypto: "Crypto",
  cybersecurity: "Cybersecurity",
  markets: "Markets",
  geopolitics: "Geopolitics",
  policy: "Policy",
  real_estate: "Real Estate",
  alternatives: "Alternatives",
  general: "General",
};

function fmtDate(iso: string | null): string {
  if (!iso) return "Never";
  const date = new Date(iso);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

function fmtDuration(ms: number | null): string {
  if (!ms) return "—";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function StatusBadge({ status }: { status: IngestionRun["status"] }) {
  const map = {
    success: {
      text: "Success",
      className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      Icon: CheckCircle2,
    },
    partial: {
      text: "Partial",
      className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
      Icon: AlertCircle,
    },
    failed: {
      text: "Failed",
      className: "bg-red-500/10 text-red-400 border-red-500/30",
      Icon: XCircle,
    },
    running: {
      text: "Running",
      className: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
      Icon: Clock,
    },
  } satisfies Record<IngestionRun["status"], { text: string; className: string; Icon: typeof CheckCircle2 }>;

  const { text, className, Icon } = map[status];

  return (
    <Badge className={`${className} gap-1 border text-xs`}>
      <Icon className="h-3 w-3" />
      {text}
    </Badge>
  );
}

export default function AdminNewsPage() {
  const [sources, setSources] = useState<AdminSource[]>([]);
  const [runs, setRuns] = useState<IngestionRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sourcesResponse, runsResponse] = await Promise.all([
        fetch("/api/admin/news/sources", { cache: "no-store" }),
        fetch("/api/admin/news/ingest", { cache: "no-store" }),
      ]);

      if (!sourcesResponse.ok) throw new Error("Failed to load sources");
      if (!runsResponse.ok) throw new Error("Failed to load runs");

      const sourcesData = (await sourcesResponse.json()) as { sources: AdminSource[] };
      const runsData = (await runsResponse.json()) as { runs: IngestionRun[] };

      setSources(sourcesData.sources);
      setRuns(runsData.runs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load news operations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const groupedSources = useMemo(() => {
    const groups = new Map<string, AdminSource[]>();
    for (const source of sources) {
      const arr = groups.get(source.category) ?? [];
      arr.push(source);
      groups.set(source.category, arr);
    }
    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [sources]);

  const totals = useMemo(() => ({
    sources: sources.length,
    active: sources.filter((source) => source.isActive).length,
    failing: sources.filter((source) => source.consecutiveFailures > 0).length,
    articles: sources.reduce((sum, source) => sum + source._count.articles, 0),
  }), [sources]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-xs font-mono uppercase tracking-wider text-cyan-400">
            <Rss className="h-3.5 w-3.5" /> Intelligence Source Governance
          </div>
          <h1 className="text-2xl font-bold text-white">News Ingestion</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">
            Review RSS source health, ingestion telemetry, and run history. Manual ingestion and source changes remain approval-gated operations.
          </p>
        </div>
        <Button variant="outline" onClick={loadAll} disabled={loading} className="border-white/10 text-slate-300 hover:bg-white/10 hover:text-white">
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-5">
        <div className="mb-2 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-yellow-400" />
          <p className="text-sm font-semibold text-yellow-400">Ingestion approval gate active</p>
        </div>
        <p className="text-sm leading-relaxed text-slate-400">
          Running ingestion or changing source activation can affect public intelligence content. Those actions should only be triggered through explicit operator approval.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Sources", value: totals.sources },
          { label: "Active", value: totals.active },
          { label: "Failing", value: totals.failing },
          { label: "Articles Indexed", value: totals.articles },
        ].map((kpi) => (
          <div key={kpi.label} className="glass-panel bento-card flex flex-col gap-2 rounded-xl p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{kpi.label}</p>
            <p className="text-3xl font-bold text-white">{loading ? "—" : kpi.value}</p>
          </div>
        ))}
      </div>

      <Card className="border-white/10 bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-white">RSS Sources</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading sources…
            </div>
          ) : groupedSources.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sources configured yet.</p>
          ) : (
            groupedSources.map(([category, rows]) => (
              <div key={category}>
                <p className="mb-2 text-xs font-mono uppercase tracking-widest text-muted-foreground">
                  {CATEGORY_LABEL[category] ?? category} · {rows.length}
                </p>
                <div className="divide-y divide-border/40 rounded-lg border border-border/50">
                  {rows.map((source) => (
                    <div key={source.id} className="flex items-center gap-4 p-4 text-sm">
                      <Badge className={source.isActive ? "border-green-500/25 bg-green-500/15 text-green-400" : "border-white/10 bg-white/10 text-slate-400"}>
                        {source.isActive ? "Active" : "Paused"}
                      </Badge>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="truncate font-medium text-foreground">{source.name}</span>
                          <span className="font-mono text-xs text-muted-foreground">/{source.slug}</span>
                          {source.consecutiveFailures > 0 && (
                            <Badge className="border-red-500/30 bg-red-500/10 text-xs text-red-400">{source.consecutiveFailures} fails</Badge>
                          )}
                        </div>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">{source.description ?? source.feedUrl}</p>
                        {source.lastError && <p className="mt-1 truncate text-xs text-red-400">{source.lastError}</p>}
                      </div>
                      <div className="hidden shrink-0 flex-col items-end text-xs text-muted-foreground md:flex">
                        <span>{source._count.articles} articles</span>
                        <span>Last: {fmtDate(source.lastSuccessAt)}</span>
                      </div>
                      {source.siteUrl && (
                        <a href={source.siteUrl} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-cyan-400">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-white">Recent Ingestion Runs</CardTitle>
        </CardHeader>
        <CardContent>
          {runs.length === 0 && !loading ? (
            <p className="text-sm text-muted-foreground">No runs recorded yet.</p>
          ) : (
            runs.map((run, index) => (
              <div key={run.id}>
                <div className="flex items-center gap-4 py-3 text-sm">
                  <StatusBadge status={run.status} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-foreground">{run.articlesCreated} new</span>
                      <span className="text-muted-foreground">· {run.articlesUpdated} updated · {run.articlesSkipped} skipped</span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {run.sourcesSucceeded}/{run.sourcesAttempted} sources · Trigger: {run.triggeredBy} · {fmtDuration(run.durationMs)}
                    </p>
                    {run.errorSummary && <p className="mt-1 truncate text-xs text-red-400">{run.errorSummary}</p>}
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{fmtDate(run.startedAt)}</span>
                </div>
                {index < runs.length - 1 && <Separator className="bg-white/5" />}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
