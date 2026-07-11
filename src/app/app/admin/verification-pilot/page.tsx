"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Loader2,
  RefreshCw,
  ShieldCheck,
  UserCog,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AssignableRole = "client" | "analyst" | "admin";

type UserRecord = {
  id: string;
  email: string;
  role: string;
  status: string;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt: string | null;
  profile: {
    firstName: string | null;
    lastName: string | null;
    displayName: string | null;
    country: string | null;
  } | null;
};

type ReadinessCheck = {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
};

type ReadinessReport = {
  ready: boolean;
  evaluatedAt: string;
  mutatesProductionData: false;
  checks: ReadinessCheck[];
  counts: {
    totalAccounts: number;
    activeVerifiedAnalysts: number;
    activeVerifiedDecisionMakers: number;
  };
};

function displayName(user: UserRecord) {
  return (
    user.profile?.displayName ||
    [user.profile?.firstName, user.profile?.lastName].filter(Boolean).join(" ") ||
    user.email
  );
}

function formatRole(role: string) {
  return role.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function VerificationPilotPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [assignableRoles, setAssignableRoles] = useState<AssignableRole[]>([]);
  const [viewerRole, setViewerRole] = useState("");
  const [readiness, setReadiness] = useState<ReadinessReport | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [requestedRole, setRequestedRole] = useState<AssignableRole>("analyst");
  const [reason, setReason] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const selected = useMemo(
    () => users.find((user) => user.id === selectedId) ?? null,
    [selectedId, users],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersResponse, readinessResponse] = await Promise.all([
        fetch("/api/admin/users", { cache: "no-store" }),
        fetch("/api/verify/pilot-readiness", { cache: "no-store" }),
      ]);
      const usersBody = await usersResponse.json().catch(() => ({}));
      const readinessBody = await readinessResponse.json().catch(() => ({}));

      if (!usersResponse.ok) {
        throw new Error(usersBody.error ?? "User governance data could not be loaded.");
      }
      if (!readinessResponse.ok) {
        throw new Error(readinessBody.error ?? "Pilot readiness could not be loaded.");
      }

      setUsers(usersBody.users ?? []);
      setViewerRole(usersBody.viewerRole ?? "");
      setAssignableRoles(usersBody.rolePolicy?.assignableRoles ?? []);
      setReadiness(readinessBody as ReadinessReport);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Pilot governance data could not be loaded.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!assignableRoles.includes(requestedRole) && assignableRoles[0]) {
      setRequestedRole(assignableRoles[0]);
    }
  }, [assignableRoles, requestedRole]);

  async function assignRole() {
    if (!selected) return;
    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selected.id,
          role: requestedRole,
          reason,
          confirmEmail,
        }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(body.error ?? "Role assignment failed.");
      }

      setNotice(
        `${selected.email} was assigned ${formatRole(requestedRole)}. The account must sign out and sign in again before using the new navigation.`,
      );
      setReason("");
      setConfirmEmail("");
      setSelectedId("");
      await load();
    } catch (assignmentError) {
      setError(
        assignmentError instanceof Error
          ? assignmentError.message
          : "Role assignment failed.",
      );
    } finally {
      setSaving(false);
    }
  }

  const candidates = users.filter(
    (user) => !["super_admin", "internal"].includes(user.role),
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex items-start gap-3">
          <Button asChild variant="ghost" size="icon" className="mt-1 text-slate-400">
            <Link href="/app/admin/users"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-xs uppercase tracking-wider text-cyan-400">
              <ShieldCheck className="h-3.5 w-3.5" /> GEM Verify Phase 1B
            </div>
            <h1 className="text-2xl font-bold text-white">Reviewer designation and pilot readiness</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              Assign controlled review roles and evaluate the manual verification pilot without creating applicants, cases, documents, or decisions.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void load()} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
          <Button asChild className="bg-cyan-400 text-black hover:bg-cyan-300">
            <Link href="/review/verification">Open review queue <ExternalLink className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </div>

      {error && <div className="rounded-xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-300">{error}</div>}
      {notice && <div className="rounded-xl border border-green-500/25 bg-green-500/10 p-4 text-sm text-green-300">{notice}</div>}

      {loading ? (
        <div className="flex items-center gap-2 py-20 text-slate-400"><Loader2 className="h-5 w-5 animate-spin" /> Evaluating pilot controls</div>
      ) : (
        <>
          <section className={`rounded-2xl border p-6 ${readiness?.ready ? "border-green-500/25 bg-green-500/5" : "border-amber-500/25 bg-amber-500/5"}`}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-3">
                {readiness?.ready ? <CheckCircle2 className="mt-0.5 h-6 w-6 text-green-400" /> : <AlertTriangle className="mt-0.5 h-6 w-6 text-amber-400" />}
                <div>
                  <h2 className="text-lg font-semibold text-white">{readiness?.ready ? "Pilot controls ready" : "Pilot controls need attention"}</h2>
                  <p className="mt-1 text-sm text-slate-400">This check is read-only and does not mutate production data.</p>
                </div>
              </div>
              <Badge className={readiness?.ready ? "bg-green-500/15 text-green-400" : "bg-amber-500/15 text-amber-300"}>
                Viewer: {formatRole(viewerRole)}
              </Badge>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {readiness?.checks.map((check) => (
                <div key={check.id} className="rounded-xl border border-white/10 bg-black/10 p-4">
                  <div className="flex items-start gap-3">
                    {check.passed ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-400" /> : <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />}
                    <div><h3 className="text-sm font-semibold text-white">{check.label}</h3><p className="mt-1 text-xs leading-5 text-slate-400">{check.detail}</p></div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="mb-4 flex items-center justify-between">
                <div><h2 className="font-semibold text-white">Eligible account selection</h2><p className="mt-1 text-xs text-slate-500">Only active, email-verified accounts can be promoted to reviewer roles.</p></div>
                <Badge className="bg-white/5 text-slate-300">{candidates.length} accounts</Badge>
              </div>
              <div className="max-h-[520px] space-y-2 overflow-y-auto pr-1">
                {candidates.map((user) => {
                  const eligible = user.isActive && user.status === "active" && user.isEmailVerified;
                  return (
                    <button
                      type="button"
                      key={user.id}
                      onClick={() => { setSelectedId(user.id); setConfirmEmail(""); setReason(""); }}
                      className={`w-full rounded-xl border p-4 text-left transition ${selectedId === user.id ? "border-cyan-400/40 bg-cyan-500/5" : "border-white/10 bg-black/10 hover:border-white/20"}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div><p className="font-medium text-white">{displayName(user)}</p><p className="mt-1 text-xs text-slate-500">{user.email}</p></div>
                        <div className="text-right"><p className="text-xs font-semibold text-cyan-400">{formatRole(user.role)}</p><p className={`mt-1 text-[11px] ${eligible ? "text-green-400" : "text-amber-400"}`}>{eligible ? "Eligible" : "Not eligible for promotion"}</p></div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="h-fit rounded-2xl border border-white/10 bg-white/[0.03] p-5 xl:sticky xl:top-20">
              <div className="flex items-center gap-2"><UserCog className="h-5 w-5 text-cyan-400" /><h2 className="font-semibold text-white">Assign role</h2></div>
              {!selected ? (
                <p className="mt-4 text-sm leading-6 text-slate-400">Select an account to begin. No role changes occur until the email and reason are confirmed.</p>
              ) : (
                <div className="mt-5 space-y-4">
                  <div className="rounded-lg border border-white/10 bg-black/10 p-3 text-sm"><p className="font-medium text-white">{displayName(selected)}</p><p className="text-xs text-slate-500">{selected.email}</p></div>
                  <div className="space-y-1.5"><Label htmlFor="requestedRole">New role</Label><select id="requestedRole" value={requestedRole} onChange={(event) => setRequestedRole(event.target.value as AssignableRole)} className="w-full rounded-md border border-white/10 bg-[#111827] px-3 py-2 text-sm text-white">{assignableRoles.map((role) => <option key={role} value={role}>{formatRole(role)}</option>)}</select></div>
                  <div className="space-y-1.5"><Label htmlFor="confirmEmail">Confirm target email</Label><Input id="confirmEmail" value={confirmEmail} onChange={(event) => setConfirmEmail(event.target.value)} placeholder={selected.email} className="border-white/10 bg-black/20 text-white" /></div>
                  <div className="space-y-1.5"><Label htmlFor="reason">Reason</Label><textarea id="reason" rows={4} maxLength={500} value={reason} onChange={(event) => setReason(event.target.value)} className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white" placeholder="Explain why this account requires the role." /></div>
                  <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs leading-5 text-amber-100/80">Role changes are audited. The target account must sign out and sign in again for navigation to reflect a promotion. Demotion takes effect immediately for protected APIs.</div>
                  <Button onClick={() => void assignRole()} disabled={saving || reason.trim().length < 10 || confirmEmail.trim().toLowerCase() !== selected.email.toLowerCase() || assignableRoles.length === 0} className="w-full bg-cyan-400 text-black hover:bg-cyan-300">{saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Assigning</> : "Confirm role assignment"}</Button>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
