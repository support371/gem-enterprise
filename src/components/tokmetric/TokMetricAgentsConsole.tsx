"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bot, CheckCircle2, CircleDashed, History, Loader2, Play, ShieldAlert } from "lucide-react";

type WorkspaceOption = { id: string; name: string; slug: string };
type AgentName = "content_strategist" | "script_writer" | "quality_reviewer" | "publishing_coordinator";

type AgentResponse = {
  ok: boolean;
  correlationId?: string;
  data?: {
    runId?: string;
    status?: string;
    outputType?: string;
    safety?: { state?: string; findings?: Array<{ code: string; severity: string; message: string }> };
    output?: unknown;
    modelVersion?: string;
    promptVersion?: string;
    durationMs?: number;
    externalActionTaken?: boolean;
    runs?: unknown[];
  };
  error?: { code?: string; message?: string; correlationId?: string };
};

const outputOptions: Record<AgentName, Array<{ value: string; label: string }>> = {
  content_strategist: [
    { value: "campaign_brief", label: "Campaign brief" },
    { value: "content_outline", label: "Content outline" },
    { value: "audience_notes", label: "Audience notes" },
  ],
  script_writer: [
    { value: "script", label: "Draft script" },
    { value: "caption", label: "Draft caption" },
    { value: "hashtags", label: "Hashtag set" },
  ],
  quality_reviewer: [
    { value: "findings", label: "Safety findings" },
    { value: "recommended_changes", label: "Recommended changes" },
    { value: "review_result", label: "Review result" },
  ],
  publishing_coordinator: [
    { value: "publish_plan", label: "Publishing plan" },
    { value: "job_request", label: "Internal job request" },
    { value: "preflight_report", label: "Preflight report" },
  ],
};

function StatusPill({ value }: { value: string }) {
  const positive = ["PASS", "COMPLETED"].includes(value);
  const warning = ["HUMAN_REVIEW_REQUIRED", "BLOCKED"].includes(value);
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${positive ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-200" : warning ? "border-amber-300/25 bg-amber-300/10 text-amber-200" : "border-white/10 bg-white/[0.04] text-white/55"}`}>
      {positive ? <CheckCircle2 className="h-3.5 w-3.5" /> : <CircleDashed className="h-3.5 w-3.5" />}
      {value}
    </span>
  );
}

export function TokMetricAgentsConsole({ workspaces }: { workspaces: WorkspaceOption[] }) {
  const [workspaceId, setWorkspaceId] = useState(workspaces[0]?.id ?? "");
  const [agent, setAgent] = useState<AgentName>("content_strategist");
  const [outputType, setOutputType] = useState(outputOptions.content_strategist[0].value);
  const [brief, setBrief] = useState("");
  const [result, setResult] = useState<AgentResponse | null>(null);
  const [history, setHistory] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  const outputs = useMemo(() => outputOptions[agent], [agent]);

  useEffect(() => {
    setOutputType(outputOptions[agent][0].value);
  }, [agent]);

  useEffect(() => {
    if (!workspaceId) return;
    let active = true;
    setHistoryLoading(true);
    fetch(`/api/tokmetric/agents?workspaceId=${encodeURIComponent(workspaceId)}&limit=20`, { cache: "no-store" })
      .then(async (response) => ({ response, json: (await response.json()) as AgentResponse }))
      .then(({ response, json }) => {
        if (!active) return;
        if (response.ok && Array.isArray(json.data?.runs)) setHistory(json.data.runs);
        else setHistory([]);
      })
      .catch(() => active && setHistory([]))
      .finally(() => active && setHistoryLoading(false));
    return () => { active = false; };
  }, [workspaceId, result?.data?.runId]);

  async function runAgent() {
    if (!workspaceId || !brief.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch("/api/tokmetric/agents", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ workspaceId, agent, outputType, brief }),
      });
      const json = (await response.json()) as AgentResponse;
      setResult(json);
    } catch {
      setResult({ ok: false, error: { code: "NETWORK_ERROR", message: "The agent request could not be completed." } });
    } finally {
      setLoading(false);
    }
  }

  if (!workspaces.length) {
    return (
      <div className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-6 text-amber-100/80">
        No authorized TokMetric workspace is available for this account.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-3xl border border-white/[0.09] bg-white/[0.03] p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10">
              <Bot className="h-5 w-5 text-cyan-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Create a controlled agent run</h2>
              <p className="text-sm text-white/45">Structured drafts only. No external publishing or account changes.</p>
            </div>
          </div>

          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-white/60">
              <span className="font-semibold text-white/80">Workspace</span>
              <select value={workspaceId} onChange={(event) => setWorkspaceId(event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0a121d] px-4 py-3 text-white outline-none focus:border-cyan-300/50">
                {workspaces.map((workspace) => <option key={workspace.id} value={workspace.id}>{workspace.name}</option>)}
              </select>
            </label>

            <label className="space-y-2 text-sm text-white/60">
              <span className="font-semibold text-white/80">Specialized agent</span>
              <select value={agent} onChange={(event) => setAgent(event.target.value as AgentName)} className="w-full rounded-xl border border-white/10 bg-[#0a121d] px-4 py-3 text-white outline-none focus:border-cyan-300/50">
                <option value="content_strategist">Content Strategist</option>
                <option value="script_writer">Script Writer</option>
                <option value="quality_reviewer">Quality Reviewer</option>
                <option value="publishing_coordinator">Publishing Coordinator</option>
              </select>
            </label>

            <label className="space-y-2 text-sm text-white/60 sm:col-span-2">
              <span className="font-semibold text-white/80">Output type</span>
              <select value={outputType} onChange={(event) => setOutputType(event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0a121d] px-4 py-3 text-white outline-none focus:border-cyan-300/50">
                {outputs.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>

            <label className="space-y-2 text-sm text-white/60 sm:col-span-2">
              <span className="font-semibold text-white/80">Brief</span>
              <textarea value={brief} onChange={(event) => setBrief(event.target.value)} maxLength={5000} rows={8} placeholder="Describe the content objective, audience, constraints, and evidence available for review." className="w-full resize-y rounded-xl border border-white/10 bg-[#0a121d] px-4 py-3 leading-7 text-white outline-none placeholder:text-white/25 focus:border-cyan-300/50" />
              <span className="block text-right text-xs text-white/30">{brief.length}/5000</span>
            </label>
          </div>

          <button type="button" disabled={loading || !brief.trim()} onClick={runAgent} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 font-semibold text-[#071019] transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-45">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {loading ? "Running controlled checks" : "Run specialized agent"}
          </button>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.06] p-5">
            <div className="flex items-center gap-2 font-semibold text-emerald-100">
              <CheckCircle2 className="h-4 w-4" />
              Enforced controls
            </div>
            <ul className="mt-4 space-y-2 text-sm leading-6 text-emerald-50/65">
              <li>• Schema-bound output</li>
              <li>• Prompt and model version tracking</li>
              <li>• Secret-pattern redaction and blocking</li>
              <li>• Workspace retrieval with access checks</li>
              <li>• Audit and domain-event records</li>
              <li>• External actions always disabled</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-5">
            <div className="flex items-center gap-2 font-semibold text-amber-100">
              <ShieldAlert className="h-4 w-4" />
              Human responsibility
            </div>
            <p className="mt-3 text-sm leading-6 text-amber-50/65">Agent output is an internal draft or review aid. A qualified human must verify claims, rights, disclosures, and the exact version before approval.</p>
          </div>
        </aside>
      </section>

      {result && (
        <section className="rounded-3xl border border-white/[0.09] bg-white/[0.03] p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold">Latest result</h2>
            {result.ok && result.data?.status ? <StatusPill value={result.data.status} /> : null}
          </div>
          {result.ok ? (
            <div className="mt-5 space-y-5">
              <div className="flex flex-wrap gap-2">
                {result.data?.safety?.state ? <StatusPill value={result.data.safety.state} /> : null}
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/45">{result.data?.modelVersion}</span>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/45">{result.data?.promptVersion}</span>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/45">{result.data?.durationMs ?? 0} ms</span>
              </div>
              <pre className="max-h-[560px] overflow-auto rounded-2xl border border-white/[0.08] bg-[#071019] p-5 text-xs leading-6 text-cyan-50/75">{JSON.stringify(result.data?.output, null, 2)}</pre>
              <p className="text-xs text-white/35">External action taken: {String(result.data?.externalActionTaken ?? false)}</p>
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-red-300/20 bg-red-300/[0.06] p-5 text-sm text-red-100/75">
              <strong>{result.error?.code ?? "REQUEST_FAILED"}</strong>: {result.error?.message ?? "The request failed."}
            </div>
          )}
        </section>
      )}

      <section className="rounded-3xl border border-white/[0.09] bg-white/[0.03] p-6 sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <History className="h-5 w-5 text-cyan-300" />
            <h2 className="text-xl font-bold">Recent agent-run events</h2>
          </div>
          {historyLoading ? <Loader2 className="h-4 w-4 animate-spin text-white/40" /> : <span className="text-xs text-white/35">{history.length} records</span>}
        </div>
        <pre className="mt-5 max-h-[420px] overflow-auto rounded-2xl border border-white/[0.08] bg-[#071019] p-5 text-xs leading-6 text-white/55">{history.length ? JSON.stringify(history, null, 2) : "No agent-run event is available for this workspace."}</pre>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link href="/tokmetric/dashboard" className="rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold hover:bg-white/[0.06]">Back to dashboard</Link>
        <Link href="/tokmetric/developer" className="rounded-xl border border-cyan-300/25 bg-cyan-300/[0.06] px-4 py-3 text-sm font-semibold text-cyan-200 hover:bg-cyan-300/[0.1]">Developer controls</Link>
      </div>
    </div>
  );
}
