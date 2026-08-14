"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Building2,
  FileSearch,
  Landmark,
  Loader2,
  LockKeyhole,
  Plus,
  RefreshCw,
  Scale,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface WorkspaceSummary {
  id: string;
  name: string;
  slug: string;
  organization: { id: string; name: string; slug: string; billingPlan: string | null };
  role: { name: string; description: string | null };
  controls: { globalEmergencyLock: boolean };
}

interface CapitalSnapshot {
  availability: "ready" | "configuration_required";
  workspaceId: string;
  generatedAt: string;
  metrics: {
    opportunities: number;
    qualifiedOpportunities: number;
    activeMatters: number;
    activeHolds: number;
    criticalOpenFindings: number;
    activeLicensedPartners: number;
    controlledOutreachEntries: number;
    activeDataRooms: number;
    activePostCloseContracts: number;
    recordedRevenue: string;
  };
  stages: Array<{ status: string; count: number }>;
  blockers: string[];
}

interface OpportunitySummary {
  id: string;
  publicId: string;
  legalEntityName: string;
  jurisdiction: string;
  projectType: string;
  status: string;
  activityClassification: string;
  targetAmount: string | number | null;
  currency: string;
  createdAt: string;
  contacts: Array<{ name: string; email: string }>;
  _count: { kybCases: number; engagements: number; matters: number };
}

const WORKSTREAMS = [
  ["Corporate", "15%"],
  ["Financial", "20%"],
  ["Commercial", "10%"],
  ["Management", "10%"],
  ["Cybersecurity", "15%"],
  ["Compliance", "15%"],
  ["Transaction", "10%"],
  ["Data room", "5%"],
] as const;

const PIPELINE = [
  "LEAD_RECEIVED",
  "KYB_AND_CONFLICT_REVIEW",
  "READINESS_ASSESSMENT",
  "INTERNAL_COMMITTEE",
  "LICENSED_PARTNER_REVIEW",
  "CONTROLLED_MARKET_PROCESS",
  "DILIGENCE_AND_PROPOSALS",
  "PRE_CLOSING",
  "CLOSED",
] as const;

const SELECT_CLASS =
  "h-10 w-full rounded-md border border-white/10 bg-background px-3 text-sm text-slate-200 outline-none focus:border-cyan-500/50";

function statusClass(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes("ready") || normalized.includes("qualified") || normalized.includes("active") || normalized.includes("closed")) {
    return "border-emerald-500/25 bg-emerald-500/10 text-emerald-300";
  }
  if (normalized.includes("blocked") || normalized.includes("critical") || normalized.includes("hold") || normalized.includes("declined")) {
    return "border-rose-500/25 bg-rose-500/10 text-rose-300";
  }
  return "border-amber-500/25 bg-amber-500/10 text-amber-300";
}

function MetricCard({ label, value, detail }: { label: string; value: string | number; detail: string }) {
  return (
    <div className="rounded-xl border border-cyan-500/15 bg-cyan-500/[0.05] p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-3 text-2xl font-bold text-white">{value}</p>
      <p className="mt-1 text-xs leading-relaxed text-slate-400">{detail}</p>
    </div>
  );
}

function formatMoney(value: string, currency = "USD") {
  const number = Number(value);
  if (!Number.isFinite(number)) return `${currency} 0`;
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(number);
}

export function CapitalReadinessCommandCenter() {
  const [workspaces, setWorkspaces] = useState<WorkspaceSummary[]>([]);
  const [workspaceId, setWorkspaceId] = useState("");
  const [snapshot, setSnapshot] = useState<CapitalSnapshot | null>(null);
  const [opportunities, setOpportunities] = useState<OpportunitySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<string | null>(null);

  const selectedWorkspace = useMemo(
    () => workspaces.find((workspace) => workspace.id === workspaceId) ?? null,
    [workspaceId, workspaces],
  );

  const loadWorkspace = useCallback(async (selectedId: string, quiet = false) => {
    if (!selectedId) return;
    if (!quiet) setRefreshing(true);
    setError(null);

    try {
      const [snapshotResponse, opportunitiesResponse] = await Promise.all([
        fetch(`/api/capital-readiness/snapshot?workspaceId=${encodeURIComponent(selectedId)}`, { cache: "no-store" }),
        fetch(`/api/capital-readiness/opportunities?workspaceId=${encodeURIComponent(selectedId)}&limit=50`, { cache: "no-store" }),
      ]);
      const snapshotPayload = (await snapshotResponse.json()) as CapitalSnapshot & { error?: string };
      const opportunityPayload = (await opportunitiesResponse.json()) as { opportunities?: OpportunitySummary[]; error?: string };

      setSnapshot(snapshotPayload);
      setOpportunities(opportunityPayload.opportunities ?? []);
      if (!snapshotResponse.ok && snapshotResponse.status !== 503) throw new Error(snapshotPayload.error ?? "Unable to load the snapshot.");
      if (!opportunitiesResponse.ok && opportunitiesResponse.status !== 503) throw new Error(opportunityPayload.error ?? "Unable to load opportunities.");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load the capital-readiness workspace.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    async function initialize() {
      try {
        const response = await fetch("/api/capital-readiness/workspaces", { cache: "no-store" });
        const payload = (await response.json()) as { workspaces?: WorkspaceSummary[]; error?: string };
        if (!response.ok) throw new Error(payload.error ?? "Unable to load workspaces.");
        if (!active) return;
        const accessible = payload.workspaces ?? [];
        setWorkspaces(accessible);
        const first = accessible[0]?.id ?? "";
        setWorkspaceId(first);
        if (first) await loadWorkspace(first, true);
        else setLoading(false);
      } catch (initializationError) {
        if (!active) return;
        setError(initializationError instanceof Error ? initializationError.message : "Unable to initialize the command center.");
        setLoading(false);
      }
    }
    void initialize();
    return () => {
      active = false;
    };
  }, [loadWorkspace]);

  async function submitOpportunity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!workspaceId) return;
    setSubmitting(true);
    setFormMessage(null);

    const form = new FormData(event.currentTarget);
    const amountValue = String(form.get("targetAmount") ?? "").trim();
    const existingDebtValue = String(form.get("existingDebt") ?? "").trim();

    const payload = {
      workspaceId,
      legalEntityName: String(form.get("legalEntityName") ?? ""),
      jurisdiction: String(form.get("jurisdiction") ?? ""),
      registrationNumber: String(form.get("registrationNumber") ?? "") || undefined,
      projectType: String(form.get("projectType") ?? ""),
      targetAmount: amountValue ? Number(amountValue) : undefined,
      currency: String(form.get("currency") ?? "USD").toUpperCase(),
      useOfProceeds: String(form.get("useOfProceeds") ?? ""),
      timingConstraint: String(form.get("timingConstraint") ?? "") || undefined,
      existingDebt: existingDebtValue ? Number(existingDebtValue) : undefined,
      referralSource: String(form.get("referralSource") ?? "") || undefined,
      activityClassification: "GREEN_NON_REGULATED",
      consentVersion: "capital-readiness-v1",
      consentGivenAt: new Date().toISOString(),
      privacyVersion: "privacy-current",
      privacyAcceptedAt: new Date().toISOString(),
      primaryContact: {
        name: String(form.get("contactName") ?? ""),
        email: String(form.get("contactEmail") ?? ""),
        phone: String(form.get("contactPhone") ?? "") || undefined,
        title: String(form.get("contactTitle") ?? "") || undefined,
      },
    };

    try {
      const response = await fetch("/api/capital-readiness/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { opportunity?: { publicId: string }; error?: string; fields?: unknown };
      if (!response.ok) throw new Error(result.error ?? "Unable to create the opportunity.");
      event.currentTarget.reset();
      setFormMessage(`Opportunity ${result.opportunity?.publicId ?? "created"} was recorded with an audit event.`);
      setShowForm(false);
      await loadWorkspace(workspaceId);
    } catch (submissionError) {
      setFormMessage(submissionError instanceof Error ? submissionError.message : "Unable to create the opportunity.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="flex min-h-[420px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-cyan-300" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-cyan-500/15 bg-gradient-to-br from-cyan-500/[0.08] via-card/70 to-violet-500/[0.05] p-6">
        <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-start">
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge className="border-cyan-500/25 bg-cyan-500/10 text-cyan-300"><Landmark className="mr-1 h-3 w-3" />Capital Readiness</Badge>
              <Badge className="border-emerald-500/25 bg-emerald-500/10 text-emerald-300">No custody</Badge>
              <Badge className="border-amber-500/25 bg-amber-500/10 text-amber-300">Licensed execution gated</Badge>
            </div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">Capital Readiness & Transaction Command Center</h1>
            <p className="mt-2 max-w-4xl text-sm leading-relaxed text-slate-400">
              Qualify opportunities, control KYB and readiness, route regulated execution to verified partners, govern secure diligence, and convert closed matters into recurring cybersecurity and compliance services.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={workspaceId}
              onChange={(event) => {
                setWorkspaceId(event.target.value);
                void loadWorkspace(event.target.value);
              }}
              className={SELECT_CLASS}
              aria-label="Capital-readiness workspace"
            >
              {workspaces.map((workspace) => <option key={workspace.id} value={workspace.id}>{workspace.organization.name} · {workspace.name}</option>)}
            </select>
            <Button variant="outline" className="border-white/10" onClick={() => void loadWorkspace(workspaceId)} disabled={!workspaceId || refreshing}>
              {refreshing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}Refresh
            </Button>
            <Button className="bg-cyan-500 text-black hover:bg-cyan-400" onClick={() => setShowForm((value) => !value)} disabled={!workspaceId}>
              <Plus className="mr-2 h-4 w-4" />New opportunity
            </Button>
          </div>
        </div>
        {selectedWorkspace ? <p className="mt-4 text-xs text-slate-500">Authorized as {selectedWorkspace.role.name} in {selectedWorkspace.organization.name}. Workspace emergency lock: {selectedWorkspace.controls.globalEmergencyLock ? "ACTIVE" : "off"}.</p> : null}
      </div>

      {error ? <div className="rounded-xl border border-rose-500/20 bg-rose-500/[0.06] p-4 text-sm text-rose-200">{error}</div> : null}
      {formMessage ? <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/[0.06] p-4 text-sm text-cyan-100">{formMessage}</div> : null}

      {showForm ? (
        <Card className="border-cyan-500/20 bg-card/85">
          <CardHeader><CardTitle className="flex items-center gap-2 text-white"><Plus className="h-4 w-4 text-cyan-300" />Record qualified-intake information</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={submitOpportunity} className="grid gap-4 md:grid-cols-2">
              <div><Label htmlFor="legalEntityName">Legal entity name</Label><Input id="legalEntityName" name="legalEntityName" required minLength={2} className="mt-1" /></div>
              <div><Label htmlFor="jurisdiction">Jurisdiction</Label><Input id="jurisdiction" name="jurisdiction" required minLength={2} className="mt-1" /></div>
              <div><Label htmlFor="registrationNumber">Registration number</Label><Input id="registrationNumber" name="registrationNumber" className="mt-1" /></div>
              <div><Label htmlFor="projectType">Project or transaction type</Label><Input id="projectType" name="projectType" required minLength={2} className="mt-1" placeholder="Growth capital, refinancing, acquisition, real estate" /></div>
              <div><Label htmlFor="targetAmount">Target amount</Label><Input id="targetAmount" name="targetAmount" type="number" min="0" step="0.01" className="mt-1" /></div>
              <div><Label htmlFor="currency">Currency</Label><Input id="currency" name="currency" defaultValue="USD" pattern="[A-Za-z]{3}" maxLength={3} className="mt-1 uppercase" /></div>
              <div><Label htmlFor="existingDebt">Existing debt</Label><Input id="existingDebt" name="existingDebt" type="number" min="0" step="0.01" className="mt-1" /></div>
              <div><Label htmlFor="timingConstraint">Timing constraint</Label><Input id="timingConstraint" name="timingConstraint" className="mt-1" /></div>
              <div><Label htmlFor="referralSource">Referral source</Label><Input id="referralSource" name="referralSource" className="mt-1" /></div>
              <div><Label htmlFor="contactName">Primary contact</Label><Input id="contactName" name="contactName" required minLength={2} className="mt-1" /></div>
              <div><Label htmlFor="contactEmail">Contact email</Label><Input id="contactEmail" name="contactEmail" type="email" required className="mt-1" /></div>
              <div><Label htmlFor="contactPhone">Contact phone</Label><Input id="contactPhone" name="contactPhone" className="mt-1" /></div>
              <div><Label htmlFor="contactTitle">Contact title</Label><Input id="contactTitle" name="contactTitle" className="mt-1" /></div>
              <div className="md:col-span-2"><Label htmlFor="useOfProceeds">Use of proceeds</Label><Textarea id="useOfProceeds" name="useOfProceeds" required minLength={10} maxLength={5000} className="mt-1 min-h-28" /></div>
              <div className="md:col-span-2 flex flex-wrap justify-end gap-2"><Button type="button" variant="outline" className="border-white/10" onClick={() => setShowForm(false)}>Cancel</Button><Button type="submit" className="bg-cyan-500 text-black hover:bg-cyan-400" disabled={submitting}>{submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Create controlled opportunity</Button></div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Opportunities" value={snapshot?.metrics.opportunities ?? 0} detail="Workspace-scoped intake records" />
        <MetricCard label="Qualified" value={snapshot?.metrics.qualifiedOpportunities ?? 0} detail="Passed initial qualification" />
        <MetricCard label="Active matters" value={snapshot?.metrics.activeMatters ?? 0} detail="Non-terminal transaction workflows" />
        <MetricCard label="Critical blockers" value={(snapshot?.metrics.activeHolds ?? 0) + (snapshot?.metrics.criticalOpenFindings ?? 0)} detail="Holds plus unresolved critical findings" />
        <MetricCard label="Recorded revenue" value={formatMoney(snapshot?.metrics.recordedRevenue ?? "0")} detail="Invoiced, collected, or recognized events" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <Card className="border-white/10 bg-card/80">
          <CardHeader><CardTitle className="flex items-center gap-2 text-white"><Workflow className="h-4 w-4 text-cyan-300" />Controlled transaction pipeline</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {PIPELINE.map((stage, index) => {
              const count = snapshot?.stages.find((item) => item.status === stage)?.count ?? 0;
              return <div key={stage} className="flex items-center gap-3 rounded-lg border border-white/8 p-3"><div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-xs font-bold text-cyan-300">{index + 1}</div><div className="min-w-0 flex-1"><p className="truncate text-sm text-slate-200">{stage.replaceAll("_", " ")}</p></div><Badge className={statusClass(count > 0 ? "active" : "pending")}>{count}</Badge></div>;
            })}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-card/80">
          <CardHeader><CardTitle className="flex items-center gap-2 text-white"><LockKeyhole className="h-4 w-4 text-amber-300" />Activation blockers</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {(snapshot?.blockers.length ? snapshot.blockers : ["No live blocker is recorded for the selected workspace."]).map((blocker) => <div key={blocker} className="flex items-start gap-2 rounded-lg border border-amber-500/15 bg-amber-500/[0.04] p-3 text-sm text-slate-300"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />{blocker}</div>)}
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs"><div className="rounded-lg border border-white/8 p-3"><p className="text-slate-500">Licensed partners</p><p className="mt-1 text-xl font-bold text-white">{snapshot?.metrics.activeLicensedPartners ?? 0}</p></div><div className="rounded-lg border border-white/8 p-3"><p className="text-slate-500">Approved outreach</p><p className="mt-1 text-xl font-bold text-white">{snapshot?.metrics.controlledOutreachEntries ?? 0}</p></div><div className="rounded-lg border border-white/8 p-3"><p className="text-slate-500">Data rooms</p><p className="mt-1 text-xl font-bold text-white">{snapshot?.metrics.activeDataRooms ?? 0}</p></div><div className="rounded-lg border border-white/8 p-3"><p className="text-slate-500">Post-close contracts</p><p className="mt-1 text-xl font-bold text-white">{snapshot?.metrics.activePostCloseContracts ?? 0}</p></div></div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/10 bg-card/80">
        <CardHeader><CardTitle className="flex items-center gap-2 text-white"><Building2 className="h-4 w-4 text-cyan-300" />Opportunity register</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="text-[11px] uppercase tracking-wider text-slate-500"><tr><th className="pb-3">Opportunity</th><th className="pb-3">Jurisdiction</th><th className="pb-3">Type</th><th className="pb-3">Amount</th><th className="pb-3">Status</th><th className="pb-3">Boundary</th><th className="pb-3">Linked records</th></tr></thead>
              <tbody className="divide-y divide-white/8">
                {opportunities.length ? opportunities.map((opportunity) => <tr key={opportunity.id}><td className="py-4"><p className="font-medium text-white">{opportunity.legalEntityName}</p><p className="text-xs text-slate-500">{opportunity.publicId} · {opportunity.contacts[0]?.email ?? "No primary contact"}</p></td><td className="py-4 text-slate-300">{opportunity.jurisdiction}</td><td className="py-4 text-slate-300">{opportunity.projectType}</td><td className="py-4 font-medium text-white">{opportunity.targetAmount == null ? "Not set" : formatMoney(String(opportunity.targetAmount), opportunity.currency)}</td><td className="py-4"><Badge className={statusClass(opportunity.status)}>{opportunity.status}</Badge></td><td className="py-4"><Badge className={statusClass(opportunity.activityClassification)}>{opportunity.activityClassification}</Badge></td><td className="py-4 text-xs text-slate-400">KYB {opportunity._count.kybCases} · engagements {opportunity._count.engagements} · matters {opportunity._count.matters}</td></tr>) : <tr><td colSpan={7} className="py-10 text-center text-slate-500">No capital-readiness opportunity has been recorded in this workspace.</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-white/10 bg-card/80">
          <CardHeader><CardTitle className="flex items-center gap-2 text-white"><FileSearch className="h-4 w-4 text-violet-300" />Readiness methodology</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {WORKSTREAMS.map(([name, weight]) => <div key={name} className="flex items-center justify-between rounded-lg border border-white/8 p-3"><span className="text-sm text-slate-300">{name}</span><Badge className="border-violet-500/20 bg-violet-500/10 text-violet-300">{weight}</Badge></div>)}
            <div className="sm:col-span-2 rounded-lg border border-rose-500/15 bg-rose-500/[0.04] p-3 text-xs text-rose-100/80">Any unresolved critical compliance or integrity finding forces BLOCKED regardless of the weighted score.</div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-card/80">
          <CardHeader><CardTitle className="flex items-center gap-2 text-white"><Scale className="h-4 w-4 text-emerald-300" />Non-negotiable control posture</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {["GEM does not hold client or investor funds or securities.", "Investor solicitation, recommendations, negotiation, and order transmission remain licensed-partner-only.", "Transaction-based compensation is disabled until counsel, partner, compliance, and human approvals exist.", "AI agents remain read-only by default and cannot send external communications without human approval.", "Every material write is workspace-scoped and creates an audit event."].map((control) => <div key={control} className="flex items-start gap-2 rounded-lg border border-emerald-500/12 bg-emerald-500/[0.035] p-3 text-sm text-slate-300"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />{control}</div>)}
          </CardContent>
        </Card>
      </div>

      {snapshot?.availability === "configuration_required" ? <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.05] p-4 text-sm text-amber-100">The software module is installed, but the selected environment has not yet applied the reviewed capital-readiness database migration. No synthetic records are shown.</div> : null}
    </div>
  );
}
