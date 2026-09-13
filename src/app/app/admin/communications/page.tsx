"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Mail, RefreshCw, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const statuses = ["PENDING", "ALLOWED", "BLOCKED"] as const;
const bases = [
  "EXPLICIT_CONSENT",
  "EXISTING_RELATIONSHIP",
  "LEGITIMATE_INTEREST_REVIEWED",
  "OTHER_REVIEWED",
] as const;

type Status = (typeof statuses)[number];
type Basis = (typeof bases)[number];

interface PreferenceRecord {
  id: string;
  userId: string | null;
  channel: string;
  destinationNormalized: string;
  purpose: string;
  status: Status;
  basis: Basis | null;
  jurisdiction: string | null;
  source: string;
  evidenceRef: string | null;
  changedById: string | null;
  createdAt: string;
  updatedAt: string;
}

function fieldClass() {
  return "mt-1 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-400/40";
}

function statusClass(status: Status) {
  if (status === "ALLOWED") return "border-emerald-500/25 bg-emerald-500/10 text-emerald-200";
  if (status === "BLOCKED") return "border-rose-500/25 bg-rose-500/10 text-rose-200";
  return "border-amber-500/25 bg-amber-500/10 text-amber-100";
}

export default function CommunicationGovernancePage() {
  const [preferences, setPreferences] = useState<PreferenceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("PENDING");
  const [basis, setBasis] = useState<Basis | "">("");
  const [jurisdiction, setJurisdiction] = useState("");
  const [evidenceRef, setEvidenceRef] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/communications/preferences", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to load communication preferences");
      setPreferences(result.preferences ?? []);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load communication preferences");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function save(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/communications/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          status,
          basis: basis || null,
          jurisdiction: jurisdiction.trim() || null,
          evidenceRef: evidenceRef.trim() || null,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        const details = result.details?.fieldErrors
          ? Object.values(result.details.fieldErrors).flat().filter(Boolean).join(" ")
          : "";
        throw new Error(details || result.error || "Unable to save communication preference");
      }
      setEmail("");
      setStatus("PENDING");
      setBasis("");
      setJurisdiction("");
      setEvidenceRef("");
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save communication preference");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <Link href="/app/admin/market/operations" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-200">
          <ArrowLeft className="h-4 w-4" /> Commercial operations
        </Link>
        <div className="mt-5 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-4xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-xs font-mono uppercase tracking-wider text-cyan-300">
              <Mail className="h-3.5 w-3.5" /> Permission & suppression ledger
            </div>
            <h1 className="text-2xl font-bold text-white">Communication Governance</h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Review marketing-email permission one address at a time. Campaign delivery is fail-closed: an active verified user still cannot receive a GEM marketing campaign unless the address is explicitly marked ALLOWED here with a reviewed basis.
            </p>
          </div>
          <Button type="button" variant="outline" className="gap-2" onClick={() => void load()}>
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        </div>
      </header>

      <section className="rounded-2xl border border-cyan-500/15 bg-cyan-500/[0.04] p-5">
        <div className="flex gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" />
          <p className="text-sm leading-6 text-slate-300">
            This ledger does not decide whether a communication is lawful in every jurisdiction. It records the reviewed decision, basis, source, evidence reference, changes, and recipient opt-outs so GEM can enforce the decision consistently. A recipient unsubscribe always changes marketing email to BLOCKED.
          </p>
        </div>
      </section>

      {error && (
        <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,.75fr)_minmax(0,1.25fr)]">
        <Card className="border-white/10 bg-card">
          <CardHeader>
            <CardTitle className="text-base text-white">Review one email destination</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={save}>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
                Email address
                <input className={fieldClass()} type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="off" />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Marketing status
                  <select className={fieldClass()} value={status} onChange={(event) => setStatus(event.target.value as Status)}>
                    {statuses.map((value) => <option key={value}>{value}</option>)}
                  </select>
                </label>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Reviewed basis
                  <select className={fieldClass()} value={basis} onChange={(event) => setBasis(event.target.value as Basis | "")}>
                    <option value="">Not established</option>
                    {bases.map((value) => <option key={value}>{value}</option>)}
                  </select>
                </label>
              </div>

              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
                Jurisdiction/context
                <input className={fieldClass()} value={jurisdiction} onChange={(event) => setJurisdiction(event.target.value)} placeholder="e.g. US / existing client relationship" />
              </label>

              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
                Evidence reference
                <input className={fieldClass()} value={evidenceRef} onChange={(event) => setEvidenceRef(event.target.value)} placeholder="Consent record, contract, intake reference, or reviewed evidence ID" />
              </label>

              <Button type="submit" className="w-full gap-2" disabled={saving || !email.trim()}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Save reviewed preference
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-card">
          <CardHeader>
            <CardTitle className="text-base text-white">Current marketing-email ledger</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-16 text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
            ) : preferences.length === 0 ? (
              <p className="rounded-xl border border-white/10 bg-white/[0.025] p-5 text-sm leading-6 text-slate-400">
                No communication-preference records exist yet. Until an address has an ALLOWED marketing-email record, the governed campaign sender excludes it.
              </p>
            ) : (
              <div className="space-y-3">
                {preferences.map((preference) => (
                  <div key={preference.id} className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-sm text-white">{preference.destinationNormalized}</p>
                        <p className="mt-1 text-xs text-slate-500">{preference.channel} · {preference.purpose} · source: {preference.source}</p>
                      </div>
                      <Badge variant="outline" className={statusClass(preference.status)}>{preference.status}</Badge>
                    </div>
                    <div className="mt-3 grid gap-2 text-xs text-slate-400 sm:grid-cols-2">
                      <p>Basis: {preference.basis ?? "Not established"}</p>
                      <p>Jurisdiction: {preference.jurisdiction ?? "Not recorded"}</p>
                      <p className="sm:col-span-2">Evidence: {preference.evidenceRef ?? "No reference recorded"}</p>
                      <p className="sm:col-span-2">Updated: {new Date(preference.updatedAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
