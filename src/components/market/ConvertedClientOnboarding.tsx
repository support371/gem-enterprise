"use client";

import { FormEvent, useEffect, useState } from "react";
import { CheckCircle2, Copy, Loader2, LockKeyhole, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { IntakeSubmissionRecord } from "@/lib/intake/types";

const fieldClass =
  "mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none transition focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/15";

export function ConvertedClientOnboarding({ submission }: { submission: IntakeSubmissionRecord }) {
  const [viewerRole, setViewerRole] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [workspaceName, setWorkspaceName] = useState("Main Workspace");
  const [projectName, setProjectName] = useState("Business Security & Operations Review");
  const [projectSummary, setProjectSummary] = useState(
    `GEM founding Business Security & Operations Review. Opportunity reference: ${submission.publicId}.`,
  );
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [setupUrl, setSetupUrl] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/session", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((session) => {
        if (active) setViewerRole(session?.role ?? null);
      })
      .catch(() => {
        if (active) setViewerRole(null);
      });
    return () => {
      active = false;
    };
  }, []);

  const platformOwner = viewerRole === "super_admin";
  const organizationName = submission.organization || submission.name;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setSetupUrl(null);
    setExpiresAt(null);

    try {
      const response = await fetch("/api/admin/workspace-invitations", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email: submission.email,
          confirmEmail,
          organizationName,
          workspaceName,
          projectName: projectName || null,
          projectSummary: projectSummary || null,
          reason,
          expiresMinutes: 1440,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        code?: string;
        setupUrl?: string;
        invitation?: { expiresAt?: string };
      };
      if (!response.ok || !data.setupUrl) {
        throw new Error(data.error || "The protected owner invitation could not be created.");
      }
      setSetupUrl(data.setupUrl);
      setExpiresAt(data.invitation?.expiresAt ?? null);
      setConfirmEmail("");
      setReason("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The protected owner invitation could not be created.");
    } finally {
      setBusy(false);
    }
  }

  async function copySetupUrl() {
    if (setupUrl) await navigator.clipboard.writeText(setupUrl);
  }

  return (
    <section className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.035] p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
          <UserPlus className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-emerald-300">Payment verified</p>
          <h3 className="mt-1 text-lg font-semibold text-white">Continue to controlled client onboarding</h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            The opportunity is converted, but payment does not create credentials or grant access. A Platform Owner must review and issue the existing one-time organization-owner invitation.
          </p>
        </div>
      </div>

      {!platformOwner ? (
        <div className="mt-5 rounded-xl border border-amber-500/25 bg-amber-500/10 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-200">
            <LockKeyhole className="h-4 w-4" aria-hidden="true" /> Platform Owner action required
          </div>
          <p className="mt-2 text-xs leading-5 text-amber-100/75">
            This authenticated role can review the converted opportunity, but only Super Admin / Platform Owner authority can create the organization-owner invitation.
          </p>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-6 grid gap-4 lg:grid-cols-2">
          <label className="text-xs text-slate-400">
            Owner first name
            <input className={fieldClass} value={firstName} onChange={(event) => setFirstName(event.target.value)} required minLength={1} maxLength={80} autoComplete="off" />
          </label>
          <label className="text-xs text-slate-400">
            Owner last name
            <input className={fieldClass} value={lastName} onChange={(event) => setLastName(event.target.value)} required minLength={1} maxLength={80} autoComplete="off" />
          </label>
          <label className="text-xs text-slate-400">
            Approved owner email
            <input className={fieldClass} value={submission.email} readOnly aria-readonly="true" />
          </label>
          <label className="text-xs text-slate-400">
            Confirm owner email exactly
            <input className={fieldClass} type="email" value={confirmEmail} onChange={(event) => setConfirmEmail(event.target.value)} required autoComplete="off" />
          </label>
          <label className="text-xs text-slate-400">
            Organization
            <input className={fieldClass} value={organizationName} readOnly aria-readonly="true" />
          </label>
          <label className="text-xs text-slate-400">
            Workspace name
            <input className={fieldClass} value={workspaceName} onChange={(event) => setWorkspaceName(event.target.value)} required minLength={2} maxLength={120} />
          </label>
          <label className="text-xs text-slate-400">
            First project
            <input className={fieldClass} value={projectName} onChange={(event) => setProjectName(event.target.value)} maxLength={120} />
          </label>
          <label className="text-xs text-slate-400">
            Written onboarding reason
            <input className={fieldClass} value={reason} onChange={(event) => setReason(event.target.value)} required minLength={12} maxLength={500} placeholder="Confirm why this converted client should receive workspace access" />
          </label>
          <label className="text-xs text-slate-400 lg:col-span-2">
            Initial project summary
            <textarea className={`${fieldClass} min-h-24 resize-y`} value={projectSummary} onChange={(event) => setProjectSummary(event.target.value)} minLength={10} maxLength={2000} />
          </label>
          <div className="lg:col-span-2">
            <Button
              type="submit"
              disabled={busy || confirmEmail.toLowerCase() !== submission.email.toLowerCase()}
              className="gap-2 bg-emerald-300 text-slate-950 hover:bg-emerald-200"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <UserPlus className="h-4 w-4" aria-hidden="true" />}
              {busy ? "Creating protected invitation…" : "Create one-time owner invitation"}
            </Button>
          </div>
        </form>
      )}

      {setupUrl && (
        <div className="mt-6 rounded-xl border border-emerald-400/25 bg-emerald-400/10 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-100">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Protected setup link created
          </div>
          <p className="mt-2 break-all font-mono text-xs text-emerald-50/80">{setupUrl}</p>
          {expiresAt && <p className="mt-2 text-xs text-emerald-50/65">Expires {new Date(expiresAt).toLocaleString()}.</p>}
          <Button type="button" onClick={() => void copySetupUrl()} variant="outline" size="sm" className="mt-4 gap-2">
            <Copy className="h-4 w-4" aria-hidden="true" /> Copy one-time link
          </Button>
          <p className="mt-3 text-xs leading-5 text-slate-400">
            Share only through an approved secure channel. The link is a temporary capability and must not be placed in public messages, tickets, or logs.
          </p>
        </div>
      )}

      {error && <p className="mt-4 text-sm text-red-300" role="alert">{error}</p>}
    </section>
  );
}
