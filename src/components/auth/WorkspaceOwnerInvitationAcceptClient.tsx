"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  FolderKanban,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface StatusResponse {
  valid?: boolean;
  maskedEmail?: string | null;
  organizationName?: string | null;
  workspaceName?: string | null;
  projectName?: string | null;
  expiresAt?: string | null;
  error?: string;
}

export default function WorkspaceOwnerInvitationAcceptClient() {
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [complete, setComplete] = useState<{ email: string; redirect: string } | null>(null);

  useEffect(() => {
    const capability = window.location.hash.slice(1).trim();
    window.history.replaceState(null, "", window.location.pathname);
    if (!capability) {
      setStatus({ valid: false, error: "The workspace invitation capability is missing." });
      setChecking(false);
      return;
    }
    setToken(capability);

    void (async () => {
      try {
        const response = await fetch("/api/auth/workspace-invitation/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: capability }),
          cache: "no-store",
        });
        const body = (await response.json().catch(() => ({}))) as StatusResponse;
        if (!response.ok || body.valid !== true) {
          setStatus({ valid: false, error: body.error ?? "This invitation is invalid or expired." });
          return;
        }
        setStatus(body);
      } catch {
        setStatus({ valid: false, error: "Invitation validation is unavailable." });
      } finally {
        setChecking(false);
      }
    })();
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/workspace-invitation/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, firstName, lastName, password, confirmPassword }),
      });
      const body = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        email?: string;
        redirect?: string;
        error?: string;
        details?: Record<string, string[]>;
      };
      if (!response.ok || !body.ok || !body.email || !body.redirect) {
        const firstDetail = body.details ? Object.values(body.details).flat().find(Boolean) : null;
        throw new Error(firstDetail || body.error || "Workspace owner account could not be created.");
      }
      setToken("");
      setPassword("");
      setConfirmPassword("");
      setComplete({ email: body.email, redirect: body.redirect });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Workspace owner account could not be created.");
    } finally {
      setSubmitting(false);
    }
  }

  if (checking) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-300">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          Validating your secure workspace invitation…
        </div>
      </div>
    );
  }

  if (complete) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-emerald-400/25 bg-slate-950/80 p-8 text-center shadow-2xl shadow-emerald-950/20">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-300" aria-hidden="true" />
        <h1 className="mt-4 text-3xl font-black text-white">Your workspace is ready</h1>
        <p className="mt-3 text-sm leading-7 text-slate-400">
          Your client account, organization workspace, owner access, and first project were created
          together. Sign in with <span className="font-semibold text-white">{complete.email}</span> to
          enter your official project home.
        </p>
        <Button asChild className="mt-6 w-full bg-cyan-300 text-slate-950 hover:bg-cyan-200">
          <Link href={complete.redirect}>Continue to secure login</Link>
        </Button>
      </div>
    );
  }

  if (!status?.valid) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-red-400/25 bg-slate-950/80 p-8 text-center shadow-2xl shadow-red-950/20">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-300" aria-hidden="true" />
        <h1 className="mt-4 text-3xl font-black text-white">Invitation unavailable</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          {status?.error ?? "This invitation is invalid, expired, revoked, or already used."}
        </p>
        <Button asChild variant="outline" className="mt-6 w-full">
          <Link href="/client-login">Return to login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-cyan-400/20 bg-slate-950/85 shadow-2xl shadow-cyan-950/20">
      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,.14),transparent_40%),linear-gradient(145deg,rgba(15,23,42,.98),rgba(2,6,23,.98))] p-7 sm:p-9">
        <div className="flex items-center gap-2 text-sm font-semibold text-cyan-200">
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          Official organization-owner invitation
        </div>
        <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">Activate your project workspace</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
          This single-use invitation creates a client account without granting GEM administrator
          authority. The capability has already been removed from the address bar.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            { label: "Organization", value: status.organizationName, Icon: Building2 },
            { label: "Workspace", value: status.workspaceName, Icon: ShieldCheck },
            { label: "First project", value: status.projectName || "Created after sign-in", Icon: FolderKanban },
          ].map(({ label, value, Icon }) => (
            <div key={label} className="rounded-xl border border-white/10 bg-black/20 p-4">
              <Icon className="h-4 w-4 text-cyan-300" aria-hidden="true" />
              <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
              <p className="mt-1 text-sm font-semibold text-white">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="p-7 sm:p-9">
        <p className="text-sm leading-6 text-slate-400">
          Invitation for <strong className="text-white">{status.maskedEmail}</strong>. Enter your own
          name and create a unique password. GEM never generates or displays your password.
        </p>

        <div className="mt-5 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] p-4 text-sm leading-6 text-amber-100">
          <LockKeyhole className="mr-2 inline h-4 w-4" aria-hidden="true" />
          Use at least 12 characters with uppercase, lowercase, number, and symbol. Do not share this
          page or reuse the invitation link.
        </div>

        {error ? (
          <div className="mt-5 flex gap-3 rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-100">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        ) : null}

        <form onSubmit={submit} className="mt-6 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="first-name">First name</Label>
              <Input id="first-name" autoComplete="given-name" required maxLength={80} value={firstName} onChange={(event) => setFirstName(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last-name">Last name</Label>
              <Input id="last-name" autoComplete="family-name" required maxLength={80} value={lastName} onChange={(event) => setLastName(event.target.value)} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete="new-password" required minLength={12} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm password</Label>
              <Input id="confirm-password" type="password" autoComplete="new-password" required minLength={12} maxLength={128} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
            </div>
          </div>
          <Button type="submit" className="w-full bg-cyan-300 text-slate-950 hover:bg-cyan-200" disabled={submitting || !token}>
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : <UserCheck className="mr-2 h-4 w-4" aria-hidden="true" />}
            Create my protected workspace
          </Button>
        </form>

        <p className="mt-5 text-center text-xs leading-5 text-slate-500">
          Expires {status.expiresAt ? new Date(status.expiresAt).toLocaleString() : "automatically"}.
          The account remains a client account; workspace permissions cannot create platform-admin access.
        </p>
      </section>
    </div>
  );
}
