"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileClock,
  Gavel,
  Loader2,
  LockKeyhole,
  Plus,
  RefreshCw,
  Scale,
  ShieldAlert,
  Trash2,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Policy = {
  id: string;
  documentType: string;
  version: number;
  policyName: string | null;
  purpose: string | null;
  retentionDays: number;
  legalBasis: string;
  jurisdiction: string | null;
  status: string;
  isActive: boolean;
  createdByUserId: string | null;
  approvedByUserId: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  effectiveAt: string | null;
  supersededAt: string | null;
  reviewDueAt: string | null;
  createdAt: string | null;
};

type PolicyResponse = {
  viewerRole?: string;
  policies?: Policy[];
  error?: string;
};

type DryRunResponse = {
  evaluatedAt?: string;
  deletionPerformed?: boolean;
  summary?: {
    evaluated: number;
    eligible: number;
    blocked: number;
    blockerCounts: Record<string, number>;
  };
  error?: string;
};

type DeletionRequest = {
  id: string;
  evidenceId: string;
  applicationId: string;
  documentType: string;
  evidenceStatus: string;
  legalHold: boolean;
  retentionUntil: string | null;
  requestedByUserId: string | null;
  approvedByUserId: string | null;
  rejectedByUserId: string | null;
  status: string;
  reason: string;
  rejectionReason: string | null;
  requestedAt: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
};

type DeletionQueueResponse = {
  viewerRole?: string;
  deletionRequests?: DeletionRequest[];
  error?: string;
};

type VaultResponse = {
  vault?: { readyForUpload: boolean; failClosed: boolean };
  counts?: {
    evidenceItems: number;
    activeRetentionPolicies: number;
    storedObjects: number;
    scanJobs?: number;
  };
  error?: string;
};

type DraftForm = {
  documentType: string;
  policyName: string;
  purpose: string;
  retentionDays: string;
  legalBasis: string;
  jurisdiction: string;
  reviewDueAt: string;
};

type MetricCard = {
  label: string;
  value: number;
  icon: LucideIcon;
};

const initialDraft: DraftForm = {
  documentType: "",
  policyName: "",
  purpose: "",
  retentionDays: "",
  legalBasis: "",
  jurisdiction: "",
  reviewDueAt: "",
};

function human(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function displayDate(value: string | null | undefined) {
  return value ? new Date(value).toLocaleString() : "Not set";
}

function policyTone(status: string, active: boolean) {
  if (active) {
    return "border-emerald-400/30 bg-emerald-400/10 text-emerald-200";
  }
  if (status === "pending_approval") {
    return "border-amber-400/30 bg-amber-400/10 text-amber-200";
  }
  if (status === "rejected") {
    return "border-red-400/30 bg-red-400/10 text-red-200";
  }
  return "border-white/15 bg-white/5 text-slate-300";
}

async function readBody<T>(response: Response): Promise<T> {
  return (await response.json().catch(() => ({}))) as T;
}

export default function GemVerifyEvidenceGovernanceClient() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [deletionRequests, setDeletionRequests] = useState<DeletionRequest[]>([]);
  const [dryRun, setDryRun] = useState<DryRunResponse | null>(null);
  const [vault, setVault] = useState<VaultResponse | null>(null);
  const [viewerRole, setViewerRole] = useState("");
  const [draft, setDraft] = useState<DraftForm>(initialDraft);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const responses = await Promise.all([
        fetch("/api/verify/evidence/status", { cache: "no-store" }),
        fetch("/api/verify/evidence/retention-policies", { cache: "no-store" }),
        fetch("/api/verify/evidence/retention/dry-run?limit=100", {
          cache: "no-store",
        }),
        fetch("/api/verify/evidence/deletion-requests", {
          cache: "no-store",
        }),
      ]);

      if (responses.some((response) => response.status === 401)) {
        window.location.assign(
          "/client-login?next=%2Fapp%2Fadmin%2Fgem-verify%2Fevidence%2Fgovernance",
        );
        return;
      }

      const [vaultBody, policyBody, dryRunBody, queueBody] = await Promise.all([
        readBody<VaultResponse>(responses[0]),
        readBody<PolicyResponse>(responses[1]),
        readBody<DryRunResponse>(responses[2]),
        readBody<DeletionQueueResponse>(responses[3]),
      ]);

      setVault(vaultBody);
      setPolicies(policyBody.policies ?? []);
      setDryRun(dryRunBody);
      setDeletionRequests(queueBody.deletionRequests ?? []);
      setViewerRole(policyBody.viewerRole ?? queueBody.viewerRole ?? "");

      const firstError = [
        vaultBody.error,
        policyBody.error,
        dryRunBody.error,
        queueBody.error,
      ].find(Boolean);
      if (firstError) setError(firstError ?? null);
    } catch {
      setError("Evidence governance data could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const activePolicies = useMemo(
    () => policies.filter((policy) => policy.isActive),
    [policies],
  );
  const pendingPolicies = useMemo(
    () => policies.filter((policy) => policy.status === "pending_approval"),
    [policies],
  );
  const pendingDeletions = useMemo(
    () => deletionRequests.filter((request) => request.status === "requested"),
    [deletionRequests],
  );
  const isSuperAdmin = viewerRole === "super_admin";

  const metricCards: MetricCard[] = [
    {
      label: "Active policies",
      value: activePolicies.length,
      icon: Scale,
    },
    {
      label: "Pending policy decisions",
      value: pendingPolicies.length,
      icon: Gavel,
    },
    {
      label: "Deletion candidates",
      value: dryRun?.summary?.eligible ?? 0,
      icon: FileClock,
    },
    {
      label: "Pending deletion decisions",
      value: pendingDeletions.length,
      icon: Trash2,
    },
  ];

  function updateDraft(field: keyof DraftForm, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  async function createDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActing("create-policy");
    setError(null);
    setNotice(null);

    const retentionDays = Number(draft.retentionDays);
    if (
      !Number.isInteger(retentionDays) ||
      retentionDays < 1 ||
      retentionDays > 3650
    ) {
      setError("Retention days must be a whole number between 1 and 3650.");
      setActing(null);
      return;
    }

    try {
      const response = await fetch("/api/verify/evidence/retention-policies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentType: draft.documentType,
          policyName: draft.policyName,
          purpose: draft.purpose,
          retentionDays,
          legalBasis: draft.legalBasis,
          ...(draft.jurisdiction
            ? { jurisdiction: draft.jurisdiction }
            : {}),
          ...(draft.reviewDueAt
            ? { reviewDueAt: new Date(draft.reviewDueAt).toISOString() }
            : {}),
        }),
      });
      const body = await readBody<{ error?: string }>(response);
      if (!response.ok) {
        throw new Error(body.error ?? "Policy draft was not created.");
      }
      setDraft(initialDraft);
      setNotice(
        "Retention policy draft created. It is not active until independently approved.",
      );
      await load();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Policy draft was not created.",
      );
    } finally {
      setActing(null);
    }
  }

  async function policyAction(
    policy: Policy,
    action: "submit" | "approve" | "reject" | "deactivate",
  ) {
    let reason: string | undefined;
    if (action !== "submit") {
      const supplied = window.prompt(
        action === "approve"
          ? "Record an approval rationale of at least 10 characters."
          : `Record the ${action} reason of at least 10 characters.`,
      );
      if (supplied === null) return;
      reason = supplied.trim();
      if (reason.length < 10) {
        setError(
          "A documented rationale of at least 10 characters is required.",
        );
        return;
      }
    }

    setActing(`${action}:${policy.id}`);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch(
        `/api/verify/evidence/retention-policies/${encodeURIComponent(policy.id)}/action`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, ...(reason ? { reason } : {}) }),
        },
      );
      const body = await readBody<{ error?: string }>(response);
      if (!response.ok) {
        throw new Error(body.error ?? "Policy action failed.");
      }
      setNotice(
        `Policy version ${policy.version} moved to ${human(action)}.`,
      );
      await load();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Policy action failed.",
      );
    } finally {
      setActing(null);
    }
  }

  async function deletionAction(
    request: DeletionRequest,
    action: "approve" | "reject",
  ) {
    const supplied = window.prompt(
      `Record the ${action} rationale of at least 10 characters. No object will be deleted by this decision.`,
    );
    if (supplied === null) return;
    const reason = supplied.trim();
    if (reason.length < 10) {
      setError(
        "A documented rationale of at least 10 characters is required.",
      );
      return;
    }

    setActing(`${action}:deletion:${request.id}`);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch(
        `/api/verify/evidence/deletion-requests/${encodeURIComponent(request.id)}/action`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, reason }),
        },
      );
      const body = await readBody<{ error?: string }>(response);
      if (!response.ok) {
        throw new Error(body.error ?? "Deletion decision failed.");
      }
      setNotice(
        action === "approve"
          ? "Deletion request approved. Physical deletion remains unavailable."
          : "Deletion request rejected and the evidence record remains preserved.",
      );
      await load();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Deletion decision failed.",
      );
    } finally {
      setActing(null);
    }
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map(({ label, value, icon: Icon }) => (
          <article
            key={label}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
          >
            <Icon className="h-5 w-5 text-cyan-300" aria-hidden="true" />
            <p className="mt-4 text-3xl font-black text-white">{value}</p>
            <p className="mt-1 text-xs uppercase tracking-widest text-slate-500">
              {label}
            </p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-red-500/25 bg-red-500/5 p-5">
        <div className="flex items-start gap-3">
          <ShieldAlert
            className="mt-0.5 h-6 w-6 shrink-0 text-red-300"
            aria-hidden="true"
          />
          <div>
            <h2 className="font-bold text-white">
              Physical deletion execution is disabled
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              This console can evaluate eligibility and record two-person
              decisions. It cannot delete a database record or storage object.
              Legal holds, unfinished scans and unfinished reviews remain hard
              blockers.
            </p>
          </div>
          <Badge className="ml-auto border-red-500/25 bg-red-500/10 text-red-200">
            Fail closed
          </Badge>
        </div>
      </section>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-100">
          <AlertTriangle
            className="mt-0.5 h-5 w-5 shrink-0"
            aria-hidden="true"
          />
          <p>{error}</p>
        </div>
      )}
      {notice && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4 text-sm text-emerald-100">
          <CheckCircle2
            className="mt-0.5 h-5 w-5 shrink-0"
            aria-hidden="true"
          />
          <p>{notice}</p>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-slate-400">
          Role:{" "}
          <span className="font-mono text-cyan-300">
            {viewerRole || "unavailable"}
          </span>
          <span className="mx-2">·</span>
          Upload runtime: {vault?.vault?.readyForUpload ? "ready" : "disabled"}
        </div>
        <Button
          variant="outline"
          onClick={() => void load()}
          disabled={loading}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            aria-hidden="true"
          />
          Refresh governance
        </Button>
      </div>

      {loading && !policies.length && !deletionRequests.length ? (
        <div className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] py-20 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          Loading evidence governance
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
          <form
            onSubmit={createDraft}
            className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"
          >
            <div className="flex items-center gap-3">
              <Plus className="h-5 w-5 text-cyan-300" aria-hidden="true" />
              <div>
                <h2 className="text-lg font-bold text-white">
                  New retention-policy draft
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Creation never activates the policy.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4">
              <label className="grid gap-2 text-sm text-slate-300">
                Document type
                <input
                  value={draft.documentType}
                  onChange={(event) =>
                    updateDraft("documentType", event.target.value)
                  }
                  placeholder="passport_or_identity_document"
                  className="h-11 rounded-lg border border-white/10 bg-black/20 px-3 text-white outline-none focus:border-cyan-400"
                  required
                />
              </label>
              <label className="grid gap-2 text-sm text-slate-300">
                Policy name
                <input
                  value={draft.policyName}
                  onChange={(event) =>
                    updateDraft("policyName", event.target.value)
                  }
                  placeholder="Identity evidence retention"
                  className="h-11 rounded-lg border border-white/10 bg-black/20 px-3 text-white outline-none focus:border-cyan-400"
                  required
                />
              </label>
              <label className="grid gap-2 text-sm text-slate-300">
                Jurisdiction
                <input
                  value={draft.jurisdiction}
                  onChange={(event) =>
                    updateDraft("jurisdiction", event.target.value)
                  }
                  placeholder="United States"
                  className="h-11 rounded-lg border border-white/10 bg-black/20 px-3 text-white outline-none focus:border-cyan-400"
                />
              </label>
              <label className="grid gap-2 text-sm text-slate-300">
                Retention days
                <input
                  type="number"
                  min={1}
                  max={3650}
                  value={draft.retentionDays}
                  onChange={(event) =>
                    updateDraft("retentionDays", event.target.value)
                  }
                  className="h-11 rounded-lg border border-white/10 bg-black/20 px-3 text-white outline-none focus:border-cyan-400"
                  required
                />
              </label>
              <label className="grid gap-2 text-sm text-slate-300">
                Purpose
                <textarea
                  value={draft.purpose}
                  onChange={(event) =>
                    updateDraft("purpose", event.target.value)
                  }
                  className="min-h-24 rounded-lg border border-white/10 bg-black/20 p-3 text-white outline-none focus:border-cyan-400"
                  required
                />
              </label>
              <label className="grid gap-2 text-sm text-slate-300">
                Legal basis
                <textarea
                  value={draft.legalBasis}
                  onChange={(event) =>
                    updateDraft("legalBasis", event.target.value)
                  }
                  className="min-h-24 rounded-lg border border-white/10 bg-black/20 p-3 text-white outline-none focus:border-cyan-400"
                  required
                />
              </label>
              <label className="grid gap-2 text-sm text-slate-300">
                Review due date
                <input
                  type="datetime-local"
                  value={draft.reviewDueAt}
                  onChange={(event) =>
                    updateDraft("reviewDueAt", event.target.value)
                  }
                  className="h-11 rounded-lg border border-white/10 bg-black/20 px-3 text-white outline-none focus:border-cyan-400"
                />
              </label>
            </div>

            <Button
              type="submit"
              disabled={acting === "create-policy"}
              className="mt-5 w-full bg-cyan-300 font-semibold text-black hover:bg-cyan-200"
            >
              {acting === "create-policy" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Create draft
            </Button>
          </form>

          <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-white">
                  Retention policy versions
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  A different super administrator must make the final decision.
                </p>
              </div>
              <Badge className="border-white/10 bg-white/5 text-slate-300">
                {policies.length} versions
              </Badge>
            </div>

            <div className="mt-5 space-y-3">
              {!policies.length && (
                <p className="rounded-xl border border-white/10 bg-black/10 p-4 text-sm text-slate-500">
                  No retention-policy version has been created.
                </p>
              )}
              {policies.map((policy) => (
                <article
                  key={policy.id}
                  className="rounded-xl border border-white/10 bg-black/10 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold text-white">
                        {policy.policyName ?? human(policy.documentType)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {human(policy.documentType)} · version {policy.version} ·{" "}
                        {policy.retentionDays} days
                      </p>
                    </div>
                    <Badge
                      className={policyTone(policy.status, policy.isActive)}
                    >
                      {policy.isActive ? "Active" : human(policy.status)}
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {policy.purpose}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    Review due: {displayDate(policy.reviewDueAt)}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {policy.status === "draft" && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={acting !== null}
                        onClick={() => void policyAction(policy, "submit")}
                      >
                        <Clock3 className="mr-2 h-4 w-4" /> Submit
                      </Button>
                    )}
                    {policy.status === "pending_approval" && isSuperAdmin && (
                      <>
                        <Button
                          size="sm"
                          disabled={acting !== null}
                          onClick={() => void policyAction(policy, "approve")}
                          className="bg-emerald-400 text-black hover:bg-emerald-300"
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={acting !== null}
                          onClick={() => void policyAction(policy, "reject")}
                        >
                          <XCircle className="mr-2 h-4 w-4" /> Reject
                        </Button>
                      </>
                    )}
                    {policy.isActive && isSuperAdmin && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={acting !== null}
                        onClick={() => void policyAction(policy, "deactivate")}
                      >
                        Deactivate
                      </Button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white">
                Deletion eligibility dry run
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Evaluates rules without changing evidence.
              </p>
            </div>
            <Badge className="border-cyan-500/20 bg-cyan-500/10 text-cyan-200">
              No deletion
            </Badge>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            {[
              { label: "Evaluated", value: dryRun?.summary?.evaluated ?? 0 },
              { label: "Eligible", value: dryRun?.summary?.eligible ?? 0 },
              { label: "Blocked", value: dryRun?.summary?.blocked ?? 0 },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-white/10 bg-black/10 p-3"
              >
                <p className="text-2xl font-black text-white">{item.value}</p>
                <p className="mt-1 text-[10px] uppercase tracking-widest text-slate-500">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2">
            {Object.entries(dryRun?.summary?.blockerCounts ?? {}).map(
              ([blocker, count]) => (
                <div
                  key={blocker}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-black/10 px-3 py-2 text-xs"
                >
                  <span className="text-slate-400">{human(blocker)}</span>
                  <span className="font-mono text-amber-300">{count}</span>
                </div>
              ),
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white">
                Deletion decision queue
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Approval still cannot execute deletion.
              </p>
            </div>
            <Badge className="border-amber-500/25 bg-amber-500/10 text-amber-200">
              {pendingDeletions.length} pending
            </Badge>
          </div>
          <div className="mt-5 space-y-3">
            {!deletionRequests.length && (
              <p className="rounded-xl border border-white/10 bg-black/10 p-4 text-sm text-slate-500">
                No deletion request has been created.
              </p>
            )}
            {deletionRequests.map((request) => (
              <article
                key={request.id}
                className="rounded-xl border border-white/10 bg-black/10 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">
                      {human(request.documentType)}
                    </p>
                    <p className="mt-1 font-mono text-xs text-slate-500">
                      {request.evidenceId}
                    </p>
                  </div>
                  <Badge className={policyTone(request.status, false)}>
                    {human(request.status)}
                  </Badge>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  {request.reason}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Requested: {displayDate(request.requestedAt)} · Retention:{" "}
                  {displayDate(request.retentionUntil)}
                </p>
                {request.status === "requested" && isSuperAdmin && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      disabled={acting !== null}
                      onClick={() => void deletionAction(request, "approve")}
                      className="bg-emerald-400 text-black hover:bg-emerald-300"
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" /> Approve record
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={acting !== null}
                      onClick={() => void deletionAction(request, "reject")}
                    >
                      <XCircle className="mr-2 h-4 w-4" /> Reject
                    </Button>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5 text-sm leading-6 text-slate-300">
        <div className="flex items-start gap-3">
          <LockKeyhole
            className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300"
            aria-hidden="true"
          />
          <p>
            Governance records are server-only, RLS protected and append-only
            where required. This interface never exposes storage paths, scanner
            credentials, service-role credentials or temporary evidence URLs.
          </p>
        </div>
      </section>
    </div>
  );
}
