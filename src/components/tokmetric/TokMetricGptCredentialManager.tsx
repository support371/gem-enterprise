"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Check,
  Clipboard,
  KeyRound,
  Loader2,
  RefreshCw,
  ShieldAlert,
  Trash2,
  X,
} from "lucide-react";

type Credential = {
  id: string;
  label: string;
  status: "active" | "revoked";
  actorUserId: string;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string | null;
  lastUsedAt: string | null;
};

type CredentialListResponse = {
  ok: true;
  credentials: Credential[];
  workspace: {
    id: string;
    name: string;
    publishingDisabled: boolean;
    advertisingDisabled: boolean;
    shopWriteDisabled: boolean;
  };
};

type IssueResponse = {
  ok: true;
  credential: Credential;
  bearer: string;
  oneTimeDisplay: true;
  warning: string;
};

type ErrorResponse = {
  error?: string;
  code?: string;
};

function formatDate(value: string | null) {
  if (!value) return "Never";
  const date = new Date(value);
  return Number.isFinite(date.getTime())
    ? new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date)
    : "Unknown";
}

async function readJson<T>(response: Response): Promise<T> {
  return (await response.json().catch(() => ({}))) as T;
}

export function TokMetricGptCredentialManager() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [workspaceId, setWorkspaceId] = useState("");
  const [workspaceName, setWorkspaceName] = useState("TokMetric Production");
  const [loading, setLoading] = useState(true);
  const [issuing, setIssuing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [bearer, setBearer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [label, setLabel] = useState("Platform Operations Agent");
  const [reason, setReason] = useState(
    "Replace the invalid Custom GPT bearer after controlled certification failure.",
  );
  const [expiresInDays, setExpiresInDays] = useState(90);
  const [confirmed, setConfirmed] = useState(false);
  const [revocationCredential, setRevocationCredential] =
    useState<Credential | null>(null);
  const [revocationReason, setRevocationReason] = useState("");
  const [revocationLabelConfirmation, setRevocationLabelConfirmation] =
    useState("");
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const loadCredentials = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/tokmetric/gpt-credentials", {
        method: "GET",
        cache: "no-store",
      });
      const body = await readJson<CredentialListResponse & ErrorResponse>(response);
      if (!response.ok || body.ok !== true) {
        throw new Error(body.error || "Credential list could not be loaded.");
      }
      setCredentials(body.credentials);
      setWorkspaceId(body.workspace.id);
      setWorkspaceName(body.workspace.name);
      setConfirmed(false);
    } catch (requestError) {
      setWorkspaceId("");
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Credential list could not be loaded.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCredentials();
  }, [loadCredentials]);

  async function issueCredential() {
    if (!workspaceId) {
      setError("The production workspace must load before issuing a credential.");
      return;
    }
    if (!confirmed) {
      setError("Confirm the production workspace before issuing a credential.");
      return;
    }
    if (label.trim().length < 3 || reason.trim().length < 10) {
      setError("A label and a detailed issuance reason are required.");
      return;
    }

    setIssuing(true);
    setError(null);
    setBearer(null);
    setCopied(false);

    try {
      const response = await fetch("/api/tokmetric/gpt-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "issue",
          label: label.trim(),
          reason: reason.trim(),
          expiresInDays,
          confirmWorkspaceId: workspaceId,
        }),
      });
      const body = await readJson<IssueResponse & ErrorResponse>(response);
      if (!response.ok || body.ok !== true || !body.bearer) {
        throw new Error(body.error || "Credential could not be issued.");
      }

      setBearer(body.bearer);
      setCredentials((current) => [
        body.credential,
        ...current.filter((item) => item.id !== body.credential.id),
      ]);
      setConfirmed(false);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Credential could not be issued.",
      );
    } finally {
      setIssuing(false);
    }
  }

  async function copyBearer() {
    if (!bearer) return;
    try {
      await navigator.clipboard.writeText(bearer);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 3_000);
    } catch {
      setError("Automatic copy failed. Select and copy the bearer manually.");
    }
  }

  function openRevocationDialog(credential: Credential) {
    if (revokingId) return;
    setError(null);
    setRevocationCredential(credential);
    setRevocationReason("");
    setRevocationLabelConfirmation("");
  }

  function closeRevocationDialog() {
    if (revokingId) return;
    setRevocationCredential(null);
    setRevocationReason("");
    setRevocationLabelConfirmation("");
  }

  async function confirmRevocation() {
    if (!revocationCredential || revokingId) return;
    const trimmedReason = revocationReason.trim();
    if (trimmedReason.length < 10) {
      setError("Revocation reason must be at least 10 characters.");
      return;
    }
    if (revocationLabelConfirmation !== revocationCredential.label) {
      setError("Credential label confirmation did not match.");
      return;
    }

    setRevokingId(revocationCredential.id);
    setError(null);
    try {
      const response = await fetch("/api/tokmetric/gpt-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "revoke",
          credentialId: revocationCredential.id,
          confirmLabel: revocationCredential.label,
          reason: trimmedReason,
        }),
      });
      const body = await readJson<
        { ok: true; credential: Credential } & ErrorResponse
      >(response);
      if (!response.ok || body.ok !== true) {
        throw new Error(body.error || "Credential could not be revoked.");
      }
      setCredentials((current) =>
        current.map((item) =>
          item.id === body.credential.id ? body.credential : item,
        ),
      );
      setRevocationCredential(null);
      setRevocationReason("");
      setRevocationLabelConfirmation("");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Credential could not be revoked.",
      );
    } finally {
      setRevokingId(null);
    }
  }

  const activeCount = credentials.filter((item) => item.status === "active").length;

  return (
    <>
      <section className="rounded-2xl border border-cyan-500/20 bg-card/80 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-cyan-300" />
              <h2 className="text-lg font-bold text-white">
                Custom GPT bearer credentials
              </h2>
            </div>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              Issue a workspace-bound bearer for the Platform Operations Agent.
              GEM stores only its SHA-256 hash. The readable bearer is displayed
              once and cannot be recovered later.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadCredentials()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-white/[0.05] disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {error ? (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-500/25 bg-rose-500/10 p-3 text-sm text-rose-200">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        {bearer ? (
          <div className="mt-5 rounded-2xl border border-amber-500/30 bg-amber-500/[0.08] p-4">
            <div className="flex items-start gap-2 text-sm font-semibold text-amber-200">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
              One-time bearer — copy it into GPT Builder now
            </div>
            <p className="mt-2 text-xs leading-5 text-amber-100/70">
              This value disappears when the page reloads. Enter it under
              Authentication → API Key → Bearer. Do not add the word “Bearer”.
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <textarea
                readOnly
                value={bearer}
                rows={3}
                className="min-h-20 flex-1 resize-none rounded-xl border border-amber-500/25 bg-black/30 p-3 font-mono text-xs text-amber-50 outline-none"
                aria-label="One-time TokMetric GPT bearer"
              />
              <button
                type="button"
                onClick={() => void copyBearer()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-300 px-4 py-3 text-sm font-bold text-black hover:bg-amber-200"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Clipboard className="h-4 w-4" />
                )}
                {copied ? "Copied" : "Copy bearer"}
              </button>
            </div>
          </div>
        ) : null}

        <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_0.9fr]">
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
            <h3 className="font-semibold text-white">Issue replacement bearer</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="text-sm text-slate-300">
                Credential label
                <input
                  value={label}
                  onChange={(event) => setLabel(event.target.value)}
                  maxLength={120}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-white outline-none focus:border-cyan-500/50"
                />
              </label>
              <label className="text-sm text-slate-300">
                Expiry
                <select
                  value={expiresInDays}
                  onChange={(event) => setExpiresInDays(Number(event.target.value))}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-white outline-none focus:border-cyan-500/50"
                >
                  <option value={30}>30 days</option>
                  <option value={60}>60 days</option>
                  <option value={90}>90 days</option>
                  <option value={180}>180 days</option>
                  <option value={365}>365 days</option>
                </select>
              </label>
            </div>
            <label className="mt-4 block text-sm text-slate-300">
              Audit reason
              <textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                maxLength={500}
                rows={3}
                className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-white outline-none focus:border-cyan-500/50"
              />
            </label>
            <label className="mt-4 flex items-start gap-3 rounded-xl border border-white/10 bg-black/15 p-3 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(event) => setConfirmed(event.target.checked)}
                disabled={!workspaceId || loading}
                className="mt-1 h-4 w-4"
              />
              <span>
                I confirm this bearer is for <strong>{workspaceName}</strong>
                <span className="mt-1 block break-all font-mono text-xs text-slate-500">
                  {workspaceId || "Loading authorized workspace…"}
                </span>
              </span>
            </label>
            <button
              type="button"
              onClick={() => void issueCredential()}
              disabled={issuing || !confirmed || !workspaceId || loading}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-bold text-black hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {issuing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <KeyRound className="h-4 w-4" />
              )}
              {issuing ? "Issuing…" : "Issue one-time bearer"}
            </button>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold text-white">Credential registry</h3>
              <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-400">
                {activeCount} active
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {loading ? (
                <div className="flex items-center gap-2 py-6 text-sm text-slate-400">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading credentials…
                </div>
              ) : credentials.length === 0 ? (
                <p className="py-6 text-sm text-slate-400">
                  No TokMetric GPT credentials were found.
                </p>
              ) : (
                credentials.map((credential) => (
                  <article
                    key={credential.id}
                    className="rounded-xl border border-white/8 bg-black/15 p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">
                          {credential.label}
                        </p>
                        <p className="mt-1 break-all font-mono text-[10px] text-slate-600">
                          {credential.id}
                        </p>
                      </div>
                      <span
                        className={`rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                          credential.status === "active"
                            ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
                            : "border-slate-500/25 bg-slate-500/10 text-slate-400"
                        }`}
                      >
                        {credential.status}
                      </span>
                    </div>
                    <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <dt className="text-slate-600">Last used</dt>
                        <dd className="mt-1 text-slate-400">
                          {formatDate(credential.lastUsedAt)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-600">Expires</dt>
                        <dd className="mt-1 text-slate-400">
                          {formatDate(credential.expiresAt)}
                        </dd>
                      </div>
                    </dl>
                    {credential.status === "active" ? (
                      <button
                        type="button"
                        onClick={() => openRevocationDialog(credential)}
                        disabled={revokingId !== null}
                        className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-rose-300 hover:text-rose-200 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {revokingId === credential.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                        {revokingId === credential.id
                          ? "Revoking…"
                          : "Revoke credential"}
                      </button>
                    ) : null}
                  </article>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {revocationCredential ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeRevocationDialog();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="tokmetric-revoke-title"
            className="w-full max-w-lg rounded-2xl border border-rose-500/25 bg-slate-950 p-5 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3
                  id="tokmetric-revoke-title"
                  className="text-lg font-bold text-white"
                >
                  Revoke TokMetric GPT credential
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Revocation is immediate. The connected GPT will stop
                  authenticating with this credential.
                </p>
              </div>
              <button
                type="button"
                onClick={closeRevocationDialog}
                disabled={revokingId !== null}
                aria-label="Close revocation dialog"
                className="rounded-lg border border-white/10 p-2 text-slate-400 hover:text-white disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3">
              <p className="text-sm font-semibold text-white">
                {revocationCredential.label}
              </p>
              <p className="mt-1 break-all font-mono text-[10px] text-slate-600">
                {revocationCredential.id}
              </p>
            </div>

            <label className="mt-4 block text-sm text-slate-300">
              Revocation reason
              <textarea
                value={revocationReason}
                onChange={(event) => setRevocationReason(event.target.value)}
                rows={3}
                maxLength={500}
                disabled={revokingId !== null}
                className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-white outline-none focus:border-rose-500/50 disabled:opacity-50"
                placeholder="Explain why this credential is being revoked."
              />
            </label>

            <label className="mt-4 block text-sm text-slate-300">
              Type the exact credential label to confirm
              <input
                value={revocationLabelConfirmation}
                onChange={(event) =>
                  setRevocationLabelConfirmation(event.target.value)
                }
                disabled={revokingId !== null}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-white outline-none focus:border-rose-500/50 disabled:opacity-50"
                autoComplete="off"
              />
            </label>

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeRevocationDialog}
                disabled={revokingId !== null}
                className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/[0.05] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void confirmRevocation()}
                disabled={revokingId !== null}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {revokingId ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                {revokingId ? "Revoking…" : "Revoke credential"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
