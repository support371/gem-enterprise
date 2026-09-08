"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Loader2,
  MapPin,
  Megaphone,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import {
  buildSecurityPostureCampaignRequest,
  securityPostureCampaignProviders,
} from "@/lib/social-media/orchestration/security-posture-campaign";

type MaterializedItem = {
  contentId: string;
  provider: string;
  complianceResult: string;
  approvalRequestId?: string;
  state: string;
};

type CampaignResult = {
  campaignId?: string;
  reusedExistingPlan: boolean;
  materialized: MaterializedItem[];
  externalActionTaken: false;
};

function requestId(workspaceId: string, planDate: string) {
  return `security-posture:${workspaceId}:${planDate}:${crypto.randomUUID()}`;
}

export function SecurityPostureCampaignPanel() {
  const [workspaceId, setWorkspaceId] = useState("");
  const [planDate, setPlanDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [localContext, setLocalContext] = useState("");
  const [result, setResult] = useState<CampaignResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem("gem-social-workspace-id");
    if (saved) setWorkspaceId(saved);
  }, []);

  useEffect(() => {
    if (workspaceId) {
      window.localStorage.setItem("gem-social-workspace-id", workspaceId);
    }
  }, [workspaceId]);

  const providerSummary = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of result?.materialized ?? []) {
      counts.set(item.provider, (counts.get(item.provider) ?? 0) + 1);
    }
    return [...counts.entries()];
  }, [result]);

  const approvalCount =
    result?.materialized.filter((item) => item.approvalRequestId).length ?? 0;
  const blockedCount =
    result?.materialized.filter((item) => item.state === "COMPLIANCE_BLOCKED")
      .length ?? 0;

  async function prepareCampaign() {
    if (!workspaceId.trim() || !planDate) {
      setMessage("Enter the authorized workspace ID and campaign date.");
      return;
    }

    setLoading(true);
    setMessage("");
    setResult(null);
    try {
      const body = buildSecurityPostureCampaignRequest({
        workspaceId,
        planDate,
        localContext,
      });
      const response = await fetch("/api/social-media/orchestrator/daily", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": requestId(workspaceId, planDate),
        },
        body: JSON.stringify(body),
      });
      const payload = (await response.json()) as {
        data?: CampaignResult;
        error?: { message?: string };
      };
      if (!response.ok || !payload.data) {
        throw new Error(
          payload.error?.message || "The governed campaign could not be prepared.",
        );
      }
      setResult(payload.data);
      setMessage(
        payload.data.reusedExistingPlan
          ? "The existing governed campaign was loaded without creating duplicate content."
          : "The campaign was created, compliance-reviewed, and routed for exact-version approval.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "The governed campaign could not be prepared.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-cyan-500/15 bg-card/75 p-5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <div className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-cyan-300" />
            <h2 className="text-lg font-bold text-white">
              Know Your Security Posture campaign
            </h2>
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            Prepare the approved cross-platform package for TikTok, Facebook Page,
            Instagram, X, and Nextdoor. Indeed is excluded because this is not a
            vacancy or employer update.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] px-3 py-2 text-xs text-emerald-200">
          <ShieldCheck className="h-4 w-4" />
          Compliance and human approval enforced
        </div>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_190px_1.5fr_auto]">
        <input
          value={workspaceId}
          onChange={(event) => setWorkspaceId(event.target.value)}
          placeholder="Authorized workspace ID"
          className="rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500/40"
        />
        <input
          type="date"
          value={planDate}
          onChange={(event) => setPlanDate(event.target.value)}
          className="rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500/40"
        />
        <div className="relative">
          <MapPin className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-500" />
          <input
            value={localContext}
            onChange={(event) => setLocalContext(event.target.value)}
            placeholder="Nextdoor local context, service area, or business locality"
            className="w-full rounded-xl border border-white/10 bg-black/20 py-2.5 pl-9 pr-3 text-sm text-white outline-none focus:border-cyan-500/40"
          />
        </div>
        <button
          type="button"
          onClick={prepareCampaign}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-black hover:bg-cyan-300 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          Prepare campaign
        </button>
      </div>

      {!localContext.trim() ? (
        <div className="mt-3 flex gap-2 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] px-4 py-3 text-xs text-amber-100/80">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Nextdoor will remain compliance-blocked until documented local relevance
            is supplied. The other platform drafts can still proceed to approval.
          </span>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {securityPostureCampaignProviders.map((provider) => (
          <span
            key={provider}
            className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-semibold text-slate-300"
          >
            {provider.replaceAll("_", " ")}
          </span>
        ))}
      </div>

      {message ? (
        <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3 text-sm text-slate-300">
          {message}
        </div>
      ) : null}

      {result ? (
        <div className="mt-5 space-y-4">
          <div className="grid gap-3 sm:grid-cols-4">
            <Status label="Prepared" value={String(result.materialized.length)} />
            <Status label="Approval requests" value={String(approvalCount)} />
            <Status label="Compliance blocked" value={String(blockedCount)} />
            <Status
              label="External action"
              value={result.externalActionTaken ? "Taken" : "None"}
            />
          </div>
          <div className="rounded-xl border border-white/8 bg-black/15 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
              Materialized by platform
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {providerSummary.map(([provider, count]) => (
                <span
                  key={provider}
                  className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-slate-300"
                >
                  {provider.replaceAll("_", " ")}: {count}
                </span>
              ))}
            </div>
            {result.campaignId ? (
              <div className="mt-3 text-xs text-slate-500">
                Campaign ID: <code className="text-slate-300">{result.campaignId}</code>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function Status({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
      <div className="text-[10px] uppercase tracking-[0.1em] text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-white">{value}</div>
    </div>
  );
}
