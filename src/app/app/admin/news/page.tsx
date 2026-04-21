"use client";

// GEM Intel — admin control console for the news pipeline.
// - Shows source telemetry (last fetch, errors, article counts)
// - Allows toggling sources on/off
// - Trigger a manual ingestion run (all sources or scoped)
// - Shows recent ingestion run history

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  PlayCircle,
  RefreshCw,
  Rss,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

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
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
}

function fmtDuration(ms: number | null): string {
  if (!ms) return "—";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function StatusBadge({ status }: { status: IngestionRun["status"] }) {
  const map: Record<
    IngestionRun["status"],
    { text: string; className: string; Icon: typeof CheckCircle2 }
  > = {
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
      className: "bg-primary/10 text-primary border-primary/30",
      Icon: Clock,
    },
  };
  const { text, className, Icon } = map[status];
  return (
    <Badge className={`${className} text-xs gap-1 border`}>
      <Icon className="h-3 w-3" />
      {text}
    </Badge>
  );
}

export default function AdminNewsPage() {
  const [sources, setSources] = useState<AdminSource[]>([]);
  const [runs, setRuns] = useState<IngestionRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sourcesRes, runsRes] = await Promise.all([
        fetch("/api/admin/news/sources", { cache: "no-store" }),
        fetch("/api/admin/news/ingest", { cache: "no-store" }),
      ]);
      if (!sourcesRes.ok) throw new Error("Failed to load sources");
      if (!runsRes.ok) throw new Error("Failed to load runs");
      const sourcesData = (await sourcesRes.json()) as { sources: AdminSource[] };
      const runsData = (await runsRes.json()) as { runs: IngestionRun[] };
      setSources(sourcesData.sources);
      setRuns(runsData.runs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const triggerRun = useCallback(
    async (sourceIds?: string[]) => {
      setTriggering(true);
      setMessage(null);
      setError(null);
      try {
        const res = await fetch("/api/admin/news/ingest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sourceIds?.length ? { sourceIds } : {}),
        });
        const data = (await res.json()) as {
          ok: boolean;
          result?: { articlesCreated: number; articlesUpdated: number; status: string };
          error?: string;
        };
        if (!res.ok || !data.ok) {
          throw new Error(data.error ?? `Request failed (${res.status})`);
        }
        setMessage(
          `Run ${data.result?.status ?? "complete"} · ${
            data.result?.articlesCreated ?? 0
          } new, ${data.result?.articlesUpdated ?? 0} updated`,
        );
        await loadAll();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Trigger failed");
      } finally {
        setTriggering(false);
      }
    },
    [loadAll],
  );

  const toggleSource = useCallback(
    async (source: AdminSource, nextActive: boolean) => {
      // Optimistic update
      setSources((prev) =>
        prev.map((s) => (s.id === source.id ? { ...s, isActive: nextActive } : s)),
      );
      try {
        const res = await fetch("/api/admin/news/sources", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sourceId: source.id, isActive: nextActive }),
        });
        if (!res.ok) throw new Error(`Update failed (${res.status})`);
      } catch (err) {
        // Rollback
        setSources((prev) =>
          prev.map((s) =>
            s.id === source.id ? { ...s, isActive: source.isActive } : s,
          ),
        );
        setError(err instanceof Error ? err.message : "Toggle failed");
      }
    },
    [],
  );

  const groupedSources = useMemo(() => {
    const groups = new Map<string, AdminSource[]>();
    for (const s of sources) {
      const arr = groups.get(s.category) ?? [];
      arr.push(s);
      groups.set(s.category, arr);
    }
    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [sources]);

  const totals = useMemo(() => {
    return {
      sources: sources.length,
      active: sources.filter((s) => s.isActive).length,
      failing: sources.filter((s) => s.consecutiveFailures > 0).length,
      articles: sources.reduce((sum, s) => sum + s._count.articles, 0),
    };
  }, [sources]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Rss className="w-6 h-6 text-[hsl(var(--svc-cyber))]" />
            News Ingestion
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Manage RSS sources, trigger manual ingestion runs, and review the
            cron history.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={loadAll}
            disabled={loading}
            className="border-border/60 gap-1.5"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            onClick={() => triggerRun()}
            disabled={triggering}
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
          >
            <PlayCircle className="h-4 w-4" />
            {triggering ? "Running…" : "Run Ingestion"}
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {message && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" /> {message}
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-400 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Sources", value: totals.sources },
          { label: "Active", value: totals.active },
          { label: "Failing", value: totals.failing },
          { label: "Articles Indexed", value: totals.articles },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="glass-panel rounded-xl p-5 bento-card flex flex-col gap-2"
          >
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">
              {kpi.label}
            </p>
            <p className="text-3xl font-bold text-white">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Sources grouped by category */}
      <Card className="bg-card border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-sm">RSS Sources</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {groupedSources.length === 0 && !loading && (
            <p className="text-sm text-muted-foreground">
              No sources configured yet.
            </p>
          )}
          {groupedSources.map(([category, rows]) => (
            <div key={category}>
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
                {CATEGORY_LABEL[category] ?? category} · {rows.length}
              </p>
              <div className="rounded-lg border border-border/50 divide-y divide-border/40">
                {rows.map((source) => (
                  <div
                    key={source.id}
                    className="flex items-center gap-4 p-4 text-sm"
                  >
                    <Switch
                      checked={source.isActive}
                      onCheckedChange={(v) => toggleSource(source, v)}
                      aria-label={`Toggle ${source.name}`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-foreground truncate">
                          {source.name}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">
                          /{source.slug}
                        </span>
                        {source.consecutiveFailures > 0 && (
                          <Badge className="bg-red-500/10 text-red-400 border-red-500/30 text-xs">
                            {source.consecutiveFailures} fails
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {source.description ?? source.feedUrl}
                      </p>
                      {source.lastError && (
                        <p className="text-xs text-red-400 mt-1 truncate">
                          {source.lastError}
                        </p>
                      )}
                    </div>
                    <div className="hidden md:flex flex-col items-end text-xs text-muted-foreground shrink-0">
                      <span>{source._count.articles} articles</span>
                      <span>Last: {fmtDate(source.lastSuccessAt)}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-border/60 text-xs gap-1.5 shrink-0"
                      disabled={triggering || !source.isActive}
                      onClick={() => triggerRun([source.id])}
                    >
                      <PlayCircle className="h-3.5 w-3.5" />
                      Run
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Run history */}
      <Card className="bg-card border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-sm">
            Recent Ingestion Runs
          </CardTitle>
        </CardHeader>
        <CardContent>
          {runs.length === 0 && !loading && (
            <p className="text-sm text-muted-foreground">
              No runs recorded yet. Trigger one above to seed the pipeline.
            </p>
          )}
          {runs.map((run, i) => (
            <div key={run.id}>
              <div className="flex items-center gap-4 py-3 text-sm">
                <StatusBadge status={run.status} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-foreground font-medium">
                      {run.articlesCreated} new
                    </span>
                    <span className="text-muted-foreground">
                      · {run.articlesUpdated} updated · {run.articlesSkipped}{" "}
                      skipped
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {run.sourcesSucceeded}/{run.sourcesAttempted} sources ·
                    Trigger: {run.triggeredBy} · {fmtDuration(run.durationMs)}
                  </p>
                  {run.errorSummary && (
                    <p className="text-xs text-red-400 mt-1 truncate">
                      {run.errorSummary}
                    </p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {fmtDate(run.startedAt)}
                </span>
              </div>
              {i < runs.length - 1 && <Separator className="bg-white/5" />}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
