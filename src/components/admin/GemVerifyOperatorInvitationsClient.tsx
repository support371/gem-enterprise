"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clipboard,
  Loader2,
  RefreshCw,
  ShieldCheck,
  UserPlus,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Invitation {
  id: string;
  email: string;
  role: "analyst" | "admin";
  firstName: string | null;
  lastName: string | null;
  expiresAt: string;
  usedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
  status: "active" | "used" | "revoked" | "expired";
}

interface ListResponse {
  invitations?: Invitation[];
  error?: string;
}

interface IssueResponse {
  setupUrl?: string;
  invitation?: Invitation;
  error?: string;
}

function statusTone(status: Invitation["status"]) {
  if (status === "used") return "border-emerald-400/30 bg-emerald-400/10 text-emerald-200";
  if (status === "active") return "border-cyan-400/30 bg-cyan-400/10 text-cyan-200";
  return "border-slate-500/30 bg-slate-500/10 text-slate-300";
}

export default function GemVerifyOperatorInvitationsClient() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState<"analyst" | "admin">("analyst");
  const [expiresMinutes, setExpiresMinutes] = useState("60");
  const [setupUrl, setSetupUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/operator-invitations", {
        cache: "no-store",
      });
      if (response.status === 401) {
        window.location.assign(
          "/client-login?next=%2Fapp%2Fadmin%2Fgem-verify%2Foperators",
        );
        return;
      }
      const body = (await response.json().catch(() => ({}))) as ListResponse;
      if (!response.ok) throw new Error(body.error ?? "Invitations are unavailable.");
      setInvitations(body.invitations ?? []);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Invitations are unavailable.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function issue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setNotice(null);
    setSetupUrl(null);
    try {
      const response = await fetch("/api/admin/operator-invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          role,
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          expiresMinutes: Number(expiresMinutes),
        }),
      });
      const body = (await response.json().catch(() => ({}))) as IssueResponse;
      if (!response.ok || !body.setupUrl) {
        throw new Error(body.error ?? "Invitation could not be created.");
      }
      setSetupUrl(body.setupUrl);
      setNotice(
        "Invitation created. Copy the one-time link now and send it through a secure channel. It cannot be recovered later.",
      );
      setEmail("");
      setFirstName("");
      setLastName("");
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Invitation could not be created.");
    } finally {
      setSubmitting(false);
    }
  }

  async function copySetupUrl() {
    if (!setupUrl) return;
    await navigator.clipboard.writeText(setupUrl);
    setNotice("The one-time setup link was copied. Send it only to the intended operator.");
  }

  async function revoke(id: string) {
    if (!window.confirm("Revoke this operator invitation immediately?")) return;
    setRevoking(id);
    setError(null);
    try {
      const response = await fetch("/api/admin/operator-invitations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(body.error ?? "Invitation could not be revoked.");
      setNotice("Invitation revoked.");
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Invitation could not be revoked.");
    } finally {
      setRevoking(null);
    }
  }

  return (
    <section className="rounded-2xl border border-cyan-400/20 bg-slate-950/65 p-6 shadow-xl shadow-cyan-950/10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-cyan-200">
            <UserPlus className="h-5 w-5" aria-hidden="true" />
            First-party operator onboarding
          </div>
          <h2 className="mt-2 text-2xl font-black text-white">Operator Invitations</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            Invite one analyst and a separate administrator for GEM Verify. The
            capability is returned once, carried in the URL fragment, stored only
            as a SHA-256 digest and expires automatically.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={() => void load()} disabled={loading}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
          )}
          Refresh
        </Button>
      </div>

      {error ? (
        <div className="mt-5 flex gap-3 rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-100">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : null}
      {notice ? (
        <div className="mt-5 flex gap-3 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm text-emerald-100">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <span>{notice}</span>
        </div>
      ) : null}

      {setupUrl ? (
        <div className="mt-5 rounded-xl border border-amber-400/30 bg-amber-400/[0.07] p-4">
          <div className="flex items-center gap-2 font-semibold text-amber-100">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            One-time setup link
          </div>
          <p className="mt-2 break-all rounded-lg bg-slate-950/80 p-3 font-mono text-xs text-slate-200">
            {setupUrl}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" onClick={() => void copySetupUrl()}>
              <Clipboard className="mr-2 h-4 w-4" aria-hidden="true" />
              Copy secure link
            </Button>
            <Button type="button" variant="outline" onClick={() => setSetupUrl(null)}>
              Clear from screen
            </Button>
          </div>
        </div>
      ) : null}

      <form onSubmit={issue} className="mt-6 grid gap-4 rounded-xl border border-white/10 bg-white/[0.025] p-5 md:grid-cols-2 xl:grid-cols-5">
        <div className="space-y-2 xl:col-span-2">
          <Label htmlFor="operator-email">Operator email</Label>
          <Input
            id="operator-email"
            type="email"
            required
            maxLength={254}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="operator@gemcybersecurityassist.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="operator-first-name">First name</Label>
          <Input
            id="operator-first-name"
            maxLength={80}
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="operator-last-name">Last name</Label>
          <Input
            id="operator-last-name"
            maxLength={80}
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Role</Label>
          <Select value={role} onValueChange={(value) => setRole(value as "analyst" | "admin")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="analyst">Verification analyst</SelectItem>
              <SelectItem value="admin">Activation administrator</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Expiry</Label>
          <Select value={expiresMinutes} onValueChange={setExpiresMinutes}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="60">1 hour</SelectItem>
              <SelectItem value="240">4 hours</SelectItem>
              <SelectItem value="1440">24 hours</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end md:col-span-2 xl:col-span-4">
          <p className="text-xs leading-5 text-slate-500">
            Confirm the intended recipient independently before sharing the link.
            Do not send it to a group chat or place it in a ticket.
          </p>
        </div>
        <div className="flex items-end">
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <UserPlus className="mr-2 h-4 w-4" aria-hidden="true" />
            )}
            Issue invitation
          </Button>
        </div>
      </form>

      <div className="mt-6 overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-white/[0.04] text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Recipient</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Expires</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {invitations.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">No operator invitations have been issued.</td></tr>
            ) : invitations.map((invitation) => (
              <tr key={invitation.id} className="border-t border-white/10 text-slate-300">
                <td className="px-4 py-3">
                  <p className="font-medium text-white">{invitation.email}</p>
                  <p className="text-xs text-slate-500">{[invitation.firstName, invitation.lastName].filter(Boolean).join(" ") || "Name not supplied"}</p>
                </td>
                <td className="px-4 py-3 capitalize">{invitation.role.replace("_", " ")}</td>
                <td className="px-4 py-3">{new Date(invitation.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3">{new Date(invitation.expiresAt).toLocaleString()}</td>
                <td className="px-4 py-3"><Badge className={statusTone(invitation.status)}>{invitation.status}</Badge></td>
                <td className="px-4 py-3 text-right">
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    disabled={invitation.status !== "active" || revoking === invitation.id}
                    onClick={() => void revoke(invitation.id)}
                  >
                    {revoking === invitation.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <XCircle className="mr-2 h-4 w-4" aria-hidden="true" />
                    )}
                    Revoke
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
