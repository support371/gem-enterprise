"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Building2, Loader2, RefreshCw, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { IntakeSubmissionRecord } from "@/lib/intake/types";
import { marketLabelForStatus, marketPipeline } from "@/lib/market/launchOffer";

const proposalStatuses = new Set(["QUALIFIED", "APPROVED", "CONVERTED"]);

function formatDate(value: Date | string) {
  return new Date(value).toLocaleString();
}

function payloadText(submission: IntakeSubmissionRecord, key: string) {
  const value = submission.payload?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export default function AdminMarketPage() {
  const [submissions, setSubmissions] = useState<IntakeSubmissionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/intake?kind=ENTERPRISE", { cache: "no-store" });
      const result = (await response.json()) as {
        submissions?: IntakeSubmissionRecord[];
        error?: string;
      };
      if (!response.ok) throw new Error(result.error || "Unable to load enterprise opportunities");
      setSubmissions(result.submissions ?? []);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load enterprise opportunities");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const pipeline = useMemo(
    () =>
      marketPipeline.map((stage) => ({
        ...stage,
        opportunities: submissions.filter((submission) => submission.status === stage.key),
      })),
    [submissions],
  );

  const sourceMix = useMemo(() => {
    const counts = new Map<string, number>();
    for (const submission of submissions) {
      const source = payloadText(submission, "leadSource") || "unattributed";
      counts.set(source, (counts.get(source) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [submissions]);

  const qualifiedCount = submissions.filter((submission) =>
    ["QUALIFIED", "APPROVED", "CONVERTED"].includes(submission.status),
  ).length;
  const convertedCount = submissions.filter((submission) => submission.status === "CONVERTED").length;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-xs font-mono uppercase tracking-wider text-cyan-300">
            <TrendingUp className="h-3.5 w-3.5" /> Market entry
          </div>
          <h1 className="text-2xl font-bold text-white">Enterprise Opportunity Pipeline</h1>
          <p className="mt-1 max-w-3xl text-sm text-slate-400">
            A commercial view over the existing governed enterprise intake queue. Qualification and
            status changes remain controlled by the authoritative Intake Governance workflow.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <a href="/app/admin/intake">Open Intake Governance</a>
          </Button>
          <Button onClick={() => void load()} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="glass-panel rounded-xl p-5">
          <p className="text-xs uppercase tracking-wide text-slate-400">Enterprise leads</p>
          <p className="mt-4 text-3xl font-bold text-white">{loading ? "—" : submissions.length}</p>
        </div>
        <div className="glass-panel rounded-xl p-5">
          <p className="text-xs uppercase tracking-wide text-slate-400">Qualified+</p>
          <p className="mt-4 text-3xl font-bold text-white">{loading ? "—" : qualifiedCount}</p>
        </div>
        <div className="glass-panel rounded-xl p-5">
          <p className="text-xs uppercase tracking-wide text-slate-400">Converted</p>
          <p className="mt-4 text-3xl font-bold text-white">{loading ? "—" : convertedCount}</p>
        </div>
      </div>

      {!loading && sourceMix.length > 0 && (
        <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-semibold uppercase tracking-[.14em] text-slate-500">Acquisition source</span>
            {sourceMix.map(([source, count]) => (
              <Badge key={source} variant="outline" className="border-white/10 bg-black/10 text-slate-300">
                {source} · {count}
              </Badge>
            ))}
          </div>
        </section>
      )}

      {error && (
        <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading market pipeline…
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {pipeline.map((stage) => (
            <Card key={stage.key} className="border-white/10 bg-card">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-base text-white">{stage.label}</CardTitle>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{stage.description}</p>
                  </div>
                  <Badge variant="outline">{stage.opportunities.length}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {stage.opportunities.length === 0 ? (
                  <p className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-500">
                    No opportunities in this stage.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {stage.opportunities.map((submission) => {
                      const proposalReady = proposalStatuses.has(submission.status);
                      const leadSource = payloadText(submission, "leadSource");
                      const campaignCode = payloadText(submission, "campaignCode");
                      return (
                        <a
                          key={submission.id}
                          href={
                            proposalReady
                              ? `/app/admin/market/proposal?intakeId=${encodeURIComponent(submission.id)}`
                              : "/app/admin/intake"
                          }
                          className="block rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-cyan-500/30 hover:bg-cyan-500/5"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-cyan-300" />
                                <p className="text-sm font-semibold text-white">
                                  {submission.organization || submission.name}
                                </p>
                              </div>
                              <p className="mt-2 text-sm text-slate-300">{submission.subject}</p>
                              <p className="mt-1 text-xs text-slate-500">
                                {submission.name} · {submission.email}
                              </p>
                              {(leadSource || campaignCode) && (
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                  {leadSource && <Badge variant="outline" className="border-white/10 text-[10px] text-slate-400">source: {leadSource}</Badge>}
                                  {campaignCode && <Badge variant="outline" className="border-cyan-500/20 text-[10px] text-cyan-300">campaign: {campaignCode}</Badge>}
                                </div>
                              )}
                            </div>
                            <span className="font-mono text-[11px] text-cyan-300">{submission.publicId}</span>
                          </div>
                          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                            <span>{marketLabelForStatus(submission.status)}</span>
                            <span>{proposalReady ? "Open commercial handoff →" : formatDate(submission.createdAt)}</span>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
