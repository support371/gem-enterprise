"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  CircleOff,
  Film,
  Loader2,
  Play,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

type ContentVersion = {
  id: string;
  settings?: Record<string, unknown> | null;
};

type ContentItem = {
  id: string;
  title: string;
  state: string;
  versions?: ContentVersion[];
  reviews?: Array<{ id: string; result: string }>;
  approvals?: Array<{ id: string; state: string }>;
};

type CampaignResponse = {
  campaign?: {
    id: string;
    title: string;
    contents: ContentItem[];
  } | null;
};

type RenderState = {
  renderJobId?: string;
  promptId?: string | null;
  status?: string;
  error?: { type?: string | null; message?: string | null } | null;
  outputs?: Record<string, unknown>;
  queuedAt?: string;
  finalizedAt?: string | null;
};

const videoTypes = new Set(["SHORT_VIDEO", "LONG_VIDEO", "REEL"]);

function object(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function orchestrator(content: ContentItem) {
  const version = content.versions?.[0];
  return object(object(version?.settings).orchestrator);
}

function contentType(content: ContentItem) {
  const value = orchestrator(content).contentType;
  return typeof value === "string" ? value : "UNKNOWN";
}

function provider(content: ContentItem) {
  const value = orchestrator(content).provider;
  return typeof value === "string" ? value : "UNKNOWN";
}

function requestId(prefix: string) {
  return `${prefix}:${new Date().toISOString()}:${crypto.randomUUID()}`;
}

export function ContentOrchestratorPanel() {
  const [workspaceId, setWorkspaceId] = useState("");
  const [planDate, setPlanDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [campaign, setCampaign] = useState<CampaignResponse["campaign"]>(null);
  const [selectedContentId, setSelectedContentId] = useState("");
  const [render, setRender] = useState<RenderState | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem("gem-social-workspace-id");
    if (saved) setWorkspaceId(saved);
  }, []);

  useEffect(() => {
    if (workspaceId) window.localStorage.setItem("gem-social-workspace-id", workspaceId);
  }, [workspaceId]);

  const selected = useMemo(
    () => campaign?.contents.find((content) => content.id === selectedContentId),
    [campaign, selectedContentId],
  );

  async function loadPlan() {
    if (!workspaceId || !planDate) {
      setMessage("Enter the workspace ID and plan date.");
      return;
    }
    setLoading("load");
    setMessage("");
    try {
      const response = await fetch(
        `/api/social-media/orchestrator/daily?workspaceId=${encodeURIComponent(workspaceId)}&planDate=${encodeURIComponent(planDate)}`,
        { cache: "no-store" },
      );
      const payload = (await response.json()) as CampaignResponse & {
        error?: { message?: string };
      };
      if (!response.ok) {
        throw new Error(payload.error?.message || "The content plan could not be loaded.");
      }
      setCampaign(payload.campaign ?? null);
      setSelectedContentId((current) =>
        payload.campaign?.contents.some((content) => content.id === current)
          ? current
          : payload.campaign?.contents[0]?.id ?? "",
      );
      setMessage(payload.campaign ? "Daily content plan loaded." : "No plan exists for this date yet.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The content plan could not be loaded.");
    } finally {
      setLoading(null);
    }
  }

  async function generatePlan() {
    if (!workspaceId || !planDate) {
      setMessage("Enter the workspace ID and plan date.");
      return;
    }
    setLoading("generate");
    setMessage("");
    try {
      const response = await fetch("/api/social-media/orchestrator/daily", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": requestId(`daily-plan:${workspaceId}:${planDate}`),
        },
        body: JSON.stringify({
          workspaceId,
          planDate: `${planDate}T12:00:00.000Z`,
          enabledProviders: [
            "TIKTOK",
            "FACEBOOK_PAGE",
            "INSTAGRAM_PROFESSIONAL",
            "X",
            "NEXTDOOR",
          ],
          useGemCatalog: true,
          minimumTikTokItems: 20,
          maxItemsPerOtherProvider: 3,
          requestApprovals: true,
          forceRegenerate: false,
        }),
      });
      const payload = (await response.json()) as {
        data?: { materialized?: unknown[] };
        error?: { message?: string };
      };
      if (!response.ok) {
        throw new Error(payload.error?.message || "The daily plan could not be generated.");
      }
      setMessage(
        `Daily plan generated. ${payload.data?.materialized?.length ?? 0} content items were prepared.`,
      );
      await loadPlan();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The daily plan could not be generated.");
    } finally {
      setLoading(null);
    }
  }

  async function queueRender() {
    if (!workspaceId || !selectedContentId) return;
    setLoading("render");
    setMessage("");
    try {
      const response = await fetch(`/api/video/content/${selectedContentId}/render`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": requestId(`video-render:${selectedContentId}`),
        },
        body: JSON.stringify({ workspaceId }),
      });
      const payload = (await response.json()) as {
        data?: RenderState;
        error?: { message?: string };
      };
      if (!response.ok) {
        throw new Error(payload.error?.message || "The render could not be queued.");
      }
      setRender(payload.data ?? null);
      setMessage(
        `Render queued${payload.data?.promptId ? `: ${payload.data.promptId}` : "."}`,
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The render could not be queued.");
    } finally {
      setLoading(null);
    }
  }

  async function refreshRender() {
    if (!workspaceId || !selectedContentId) return;
    setLoading("status");
    setMessage("");
    try {
      const response = await fetch(
        `/api/video/content/${selectedContentId}/render?workspaceId=${encodeURIComponent(workspaceId)}`,
        { cache: "no-store" },
      );
      const payload = (await response.json()) as {
        render?: RenderState | null;
        error?: { message?: string };
      };
      if (!response.ok) {
        throw new Error(payload.error?.message || "Render status could not be loaded.");
      }
      setRender(payload.render ?? null);
      setMessage(
        payload.render
          ? `Render status: ${payload.render.status ?? "unknown"}.`
          : "No render job exists for this content item.",
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Render status could not be loaded.");
    } finally {
      setLoading(null);
    }
  }

  async function finalizeRender() {
    if (!workspaceId || !selectedContentId || !render?.promptId) return;
    setLoading("finalize");
    setMessage("");
    try {
      const response = await fetch(`/api/video/content/${selectedContentId}/finalize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": requestId(`video-finalize:${render.promptId}`),
        },
        body: JSON.stringify({
          workspaceId,
          promptId: render.promptId,
        }),
      });
      const payload = (await response.json()) as {
        data?: {
          contentVersionId?: string;
          approvalRequestId?: string;
        };
        error?: { message?: string };
      };
      if (!response.ok) {
        throw new Error(payload.error?.message || "The rendered asset could not be finalized.");
      }
      setMessage(
        `Video finalized into content version ${payload.data?.contentVersionId ?? "unknown"}. Fresh approval is required.`,
      );
      await loadPlan();
      await refreshRender();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The rendered asset could not be finalized.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-card/75 p-5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <div className="flex items-center gap-2">
            <Film className="h-5 w-5 text-cyan-300" />
            <h2 className="text-lg font-bold text-white">
              Content Orchestrator and Video Renderer
            </h2>
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            Generate the governed daily plan, queue an exact reviewed video version, and return the trusted worker output to compliance and approval.
          </p>
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.06] px-3 py-2 text-xs text-amber-100/80">
          Rendering does not publish. Final media still requires approval by another authorized operator.
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-[1fr_190px_auto_auto]">
        <input
          value={workspaceId}
          onChange={(event) => setWorkspaceId(event.target.value)}
          placeholder="TokMetric workspace ID"
          className="rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500/40"
        />
        <input
          type="date"
          value={planDate}
          onChange={(event) => setPlanDate(event.target.value)}
          className="rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500/40"
        />
        <button
          type="button"
          onClick={loadPlan}
          disabled={Boolean(loading)}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/[0.05] disabled:opacity-50"
        >
          {loading === "load" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Load
        </button>
        <button
          type="button"
          onClick={generatePlan}
          disabled={Boolean(loading)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-black hover:bg-cyan-300 disabled:opacity-50"
        >
          {loading === "generate" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          Generate daily plan
        </button>
      </div>

      {message ? (
        <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3 text-sm text-slate-300">
          {message}
        </div>
      ) : null}

      {campaign ? (
        <div className="mt-5 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="max-h-[520px] space-y-2 overflow-y-auto pr-1">
            {campaign.contents.map((content) => {
              const type = contentType(content);
              const renderable = videoTypes.has(type);
              const selectedNow = selectedContentId === content.id;
              return (
                <button
                  type="button"
                  key={content.id}
                  onClick={() => {
                    setSelectedContentId(content.id);
                    setRender(null);
                  }}
                  className={`w-full rounded-xl border p-3 text-left transition ${
                    selectedNow
                      ? "border-cyan-500/35 bg-cyan-500/[0.08]"
                      : "border-white/8 bg-white/[0.02] hover:border-white/15"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-white">{content.title}</div>
                      <div className="mt-1 text-xs text-slate-500">
                        {provider(content).replaceAll("_", " ")} · {type.replaceAll("_", " ")}
                      </div>
                    </div>
                    {renderable ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" />
                    ) : (
                      <CircleOff className="h-4 w-4 shrink-0 text-slate-600" />
                    )}
                  </div>
                  <div className="mt-2 text-[11px] uppercase tracking-[0.08em] text-slate-500">
                    {content.state.replaceAll("_", " ")}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="rounded-xl border border-white/8 bg-black/15 p-4">
            {selected ? (
              <>
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <h3 className="font-semibold text-white">{selected.title}</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Content ID: <code>{selected.id}</code>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={queueRender}
                      disabled={Boolean(loading) || !videoTypes.has(contentType(selected))}
                      className="inline-flex items-center gap-2 rounded-lg bg-violet-400 px-3 py-2 text-xs font-semibold text-black hover:bg-violet-300 disabled:opacity-40"
                    >
                      {loading === "render" ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Film className="h-3.5 w-3.5" />
                      )}
                      Queue render
                    </button>
                    <button
                      type="button"
                      onClick={refreshRender}
                      disabled={Boolean(loading)}
                      className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/[0.05] disabled:opacity-40"
                    >
                      {loading === "status" ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3.5 w-3.5" />
                      )}
                      Status
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <Status label="Compliance" value={selected.reviews?.[0]?.result ?? "Not reviewed"} />
                  <Status label="Approval" value={selected.approvals?.[0]?.state ?? "Not requested"} />
                  <Status label="Render" value={render?.status ?? "Not queued"} />
                </div>

                {render?.error ? (
                  <div className="mt-4 flex gap-2 rounded-lg border border-rose-500/20 bg-rose-500/[0.06] p-3 text-xs text-rose-200">
                    <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>
                      {render.error.type}: {render.error.message}
                    </span>
                  </div>
                ) : null}

                {render?.status === "completed" && render.promptId ? (
                  <div className="mt-5 space-y-3 border-t border-white/8 pt-5">
                    <div className="flex items-center gap-2 text-sm font-semibold text-white">
                      <ShieldCheck className="h-4 w-4 text-emerald-300" />
                      Trusted upload handoff
                    </div>
                    <p className="text-xs leading-5 text-slate-400">
                      The render worker must upload the exact provider output, calculate its SHA-256 checksum, and call the protected upload-verification endpoint. The browser cannot supply or override that evidence.
                    </p>
                    <div className="rounded-lg border border-white/8 bg-white/[0.02] p-3 text-xs text-slate-400">
                      <div>
                        Render job: <code className="text-slate-200">{render.renderJobId ?? "unknown"}</code>
                      </div>
                      <div className="mt-1">
                        Provider prompt: <code className="text-slate-200">{render.promptId}</code>
                      </div>
                      <div className="mt-1">
                        Worker callback: <code className="text-slate-200">POST /api/video/uploads/verify</code>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={finalizeRender}
                      disabled={Boolean(loading)}
                      className="inline-flex items-center gap-2 rounded-lg bg-emerald-400 px-4 py-2.5 text-xs font-semibold text-black hover:bg-emerald-300 disabled:opacity-40"
                    >
                      {loading === "finalize" ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      )}
                      Finalize verified upload
                    </button>
                  </div>
                ) : null}
              </>
            ) : (
              <p className="text-sm text-slate-500">
                Select a content item to inspect its review and render state.
              </p>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function Status({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/8 bg-white/[0.02] p-3">
      <div className="text-[10px] uppercase tracking-[0.1em] text-slate-500">{label}</div>
      <div className="mt-1 text-xs font-semibold text-slate-200">
        {value.replaceAll("_", " ")}
      </div>
    </div>
  );
}
