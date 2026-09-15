"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2, RefreshCw, ShieldCheck, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  customerHealthStatuses,
  customerLifecycleStates,
  customerOutcomeStatuses,
  customerSuccessActionTypes,
  type CustomerHealthStatus,
  type CustomerLifecycleState,
  type CustomerOutcomeStatus,
  type CustomerSuccessActionStatus,
  type CustomerSuccessActionType,
} from "@/lib/customer-success/contracts";

interface WorkspaceOption {
  id: string;
  name: string;
  organization: { id: string; name: string };
  organizationProjects: Array<{ id: string; name: string; status: string }>;
}

interface ProfileRecord {
  id: string;
  workspaceId: string;
  projectId: string | null;
  lifecycleState: CustomerLifecycleState;
  healthStatus: CustomerHealthStatus;
  outcomeStatus: CustomerOutcomeStatus;
  satisfactionScore: number | null;
  outcomeSummary: string | null;
  nextReviewAt: string | null;
  organizationName: string;
  workspaceName: string;
  projectName: string | null;
}

interface ActionRecord {
  id: string;
  actionType: CustomerSuccessActionType;
  status: CustomerSuccessActionStatus;
  title: string;
  notes: string | null;
  dueAt: string | null;
}

const fieldClass = "mt-1 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/40";

function dateLabel(value: string | null) {
  return value ? new Date(value).toLocaleDateString() : "Not scheduled";
}

function dateTimeInputValue(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const localTime = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localTime.toISOString().slice(0, 16);
}

export default function CustomerSuccessPage() {
  const [profiles, setProfiles] = useState<ProfileRecord[]>([]);
  const [workspaces, setWorkspaces] = useState<WorkspaceOption[]>([]);
  const [actions, setActions] = useState<ActionRecord[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [workspaceId, setWorkspaceId] = useState("");
  const [hydratedWorkspaceId, setHydratedWorkspaceId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState("");
  const [lifecycleState, setLifecycleState] = useState<CustomerLifecycleState>("ACTIVE");
  const [healthStatus, setHealthStatus] = useState<CustomerHealthStatus>("UNKNOWN");
  const [outcomeStatus, setOutcomeStatus] = useState<CustomerOutcomeStatus>("NOT_REVIEWED");
  const [satisfactionScore, setSatisfactionScore] = useState("");
  const [outcomeSummary, setOutcomeSummary] = useState("");
  const [nextReviewAt, setNextReviewAt] = useState("");
  const [actionType, setActionType] = useState<CustomerSuccessActionType>("FOLLOW_UP");
  const [actionTitle, setActionTitle] = useState("");
  const [actionNotes, setActionNotes] = useState("");
  const [actionDueAt, setActionDueAt] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const actionsRequestRef = useRef(0);
  const selectedProfileIdRef = useRef<string | null>(null);

  const selectedWorkspace = useMemo(
    () => workspaces.find((workspace) => workspace.id === workspaceId) ?? null,
    [workspaces, workspaceId],
  );
  const selectedProfile = useMemo(
    () => profiles.find((profile) => profile.id === selectedProfileId) ?? null,
    [profiles, selectedProfileId],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/customer-success", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to load customer-success operations");
      const nextProfiles = (result.profiles ?? []) as ProfileRecord[];
      const nextWorkspaces = (result.workspaces ?? []) as WorkspaceOption[];
      setProfiles(nextProfiles);
      setWorkspaces(nextWorkspaces);
      setHydratedWorkspaceId(null);
      setWorkspaceId((current) =>
        nextWorkspaces.some((workspace) => workspace.id === current)
          ? current
          : nextWorkspaces[0]?.id || "",
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load customer-success operations");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadActions = useCallback(async (profileId: string) => {
    const requestId = ++actionsRequestRef.current;
    try {
      const response = await fetch(`/api/admin/customer-success?profileId=${encodeURIComponent(profileId)}`, { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to load lifecycle actions");
      if (
        requestId !== actionsRequestRef.current ||
        selectedProfileIdRef.current !== profileId
      ) return;
      setActions(result.actions ?? []);
    } catch (caught) {
      if (
        requestId === actionsRequestRef.current &&
        selectedProfileIdRef.current === profileId
      ) {
        setError(caught instanceof Error ? caught.message : "Unable to load lifecycle actions");
      }
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    if (!workspaceId || hydratedWorkspaceId === workspaceId) return;

    const existing = profiles.find((profile) => profile.workspaceId === workspaceId) ?? null;
    if (existing) {
      setProjectId(existing.projectId ?? "");
      setLifecycleState(existing.lifecycleState);
      setHealthStatus(existing.healthStatus);
      setOutcomeStatus(existing.outcomeStatus);
      setSatisfactionScore(existing.satisfactionScore == null ? "" : String(existing.satisfactionScore));
      setOutcomeSummary(existing.outcomeSummary ?? "");
      setNextReviewAt(dateTimeInputValue(existing.nextReviewAt));
      selectedProfileIdRef.current = existing.id;
      setSelectedProfileId(existing.id);
      setHydratedWorkspaceId(workspaceId);
      void loadActions(existing.id);
      return;
    }

    actionsRequestRef.current += 1;
    selectedProfileIdRef.current = null;
    setProjectId("");
    setLifecycleState("ACTIVE");
    setHealthStatus("UNKNOWN");
    setOutcomeStatus("NOT_REVIEWED");
    setSatisfactionScore("");
    setOutcomeSummary("");
    setNextReviewAt("");
    setSelectedProfileId(null);
    setActions([]);
    setHydratedWorkspaceId(workspaceId);
  }, [hydratedWorkspaceId, loadActions, profiles, workspaceId]);

  useEffect(() => {
    if (projectId && !selectedWorkspace?.organizationProjects.some((project) => project.id === projectId)) setProjectId("");
  }, [projectId, selectedWorkspace]);

  function chooseWorkspace(nextWorkspaceId: string, profileId: string | null = null) {
    actionsRequestRef.current += 1;
    selectedProfileIdRef.current = profileId;
    setSelectedProfileId(profileId);
    setActions([]);
    setWorkspaceId(nextWorkspaceId);
    setHydratedWorkspaceId(null);
  }

  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    if (!workspaceId || hydratedWorkspaceId !== workspaceId) return;
    setSaving(true);
    setError(null);
    try {
      const score = satisfactionScore === "" ? null : Number(satisfactionScore);
      const response = await fetch("/api/admin/customer-success", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "profile",
          workspaceId,
          projectId: projectId || null,
          lifecycleState,
          healthStatus,
          outcomeStatus,
          satisfactionScore: Number.isFinite(score) ? score : null,
          outcomeSummary: outcomeSummary.trim() || null,
          nextReviewAt: nextReviewAt ? new Date(nextReviewAt).toISOString() : null,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to save customer-success profile");
      selectedProfileIdRef.current = result.profileId;
      setSelectedProfileId(result.profileId);
      await load();
      await loadActions(result.profileId);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save customer-success profile");
    } finally {
      setSaving(false);
    }
  }

  async function createAction(event: FormEvent) {
    event.preventDefault();
    const profileId = selectedProfileIdRef.current;
    if (!profileId || !actionTitle.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/customer-success", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "action",
          profileId,
          actionType,
          status: "PLANNED",
          title: actionTitle.trim(),
          notes: actionNotes.trim() || null,
          dueAt: actionDueAt ? new Date(actionDueAt).toISOString() : null,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to create lifecycle action");
      setActionTitle("");
      setActionNotes("");
      setActionDueAt("");
      if (selectedProfileIdRef.current === profileId) await loadActions(profileId);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to create lifecycle action");
    } finally {
      setSaving(false);
    }
  }

  async function completeAction(actionId: string) {
    const profileId = selectedProfileIdRef.current;
    setSaving(true);
    try {
      const response = await fetch("/api/admin/customer-success", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionId, status: "COMPLETED" }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to complete lifecycle action");
      if (profileId && selectedProfileIdRef.current === profileId) await loadActions(profileId);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to complete lifecycle action");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <Link href="/app/admin/market/operations" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-200"><ArrowLeft className="h-4 w-4" /> Commercial operations</Link>
        <div className="mt-5 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-4xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-mono uppercase tracking-wider text-emerald-300"><Users className="h-3.5 w-3.5" /> Post-conversion lifecycle</div>
            <h1 className="text-2xl font-bold text-white">Customer Success & Growth</h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">Track health, outcomes, follow-up, expansion, renewal, referral, and win-back inside the canonical GEM workspace. Creating an action never activates a service, sends a campaign, charges a customer, or publishes a testimonial.</p>
          </div>
          <Button type="button" variant="outline" className="gap-2" onClick={() => void load()}><RefreshCw className="h-4 w-4" /> Refresh</Button>
        </div>
      </header>

      {error && <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>}
      <section className="rounded-2xl border border-cyan-500/15 bg-cyan-500/[0.04] p-5"><div className="flex gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" /><p className="text-sm leading-6 text-slate-300">Customer Success extends Organization → Workspace → Project. Expansion and renewal are planning records only and still require normal GEM qualification, proposal, approval, payment, and entitlement gates.</p></div></section>

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
        <Card className="border-white/10 bg-card"><CardHeader><CardTitle className="text-base text-white">Initialize or update client success</CardTitle></CardHeader><CardContent>
          <form className="space-y-4" onSubmit={saveProfile}>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">Organization workspace<select className={fieldClass} value={workspaceId} onChange={(event) => chooseWorkspace(event.target.value)} required><option value="">Select workspace</option>{workspaces.map((workspace) => <option key={workspace.id} value={workspace.id}>{workspace.organization.name} · {workspace.name}</option>)}</select></label>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">Primary project<select className={fieldClass} value={projectId} onChange={(event) => setProjectId(event.target.value)}><option value="">Workspace-level relationship</option>{selectedWorkspace?.organizationProjects.map((project) => <option key={project.id} value={project.id}>{project.name} · {project.status}</option>)}</select></label>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Lifecycle<select className={fieldClass} value={lifecycleState} onChange={(event) => setLifecycleState(event.target.value as CustomerLifecycleState)}>{customerLifecycleStates.map((value) => <option key={value}>{value}</option>)}</select></label>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Health<select className={fieldClass} value={healthStatus} onChange={(event) => setHealthStatus(event.target.value as CustomerHealthStatus)}>{customerHealthStatuses.map((value) => <option key={value}>{value}</option>)}</select></label>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Outcome<select className={fieldClass} value={outcomeStatus} onChange={(event) => setOutcomeStatus(event.target.value as CustomerOutcomeStatus)}>{customerOutcomeStatuses.map((value) => <option key={value}>{value}</option>)}</select></label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Satisfaction (0–10)<input className={fieldClass} type="number" min="0" max="10" value={satisfactionScore} onChange={(event) => setSatisfactionScore(event.target.value)} /></label>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Next review<input className={fieldClass} type="datetime-local" value={nextReviewAt} onChange={(event) => setNextReviewAt(event.target.value)} /></label>
            </div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">Outcome summary<textarea className={`${fieldClass} min-h-24`} value={outcomeSummary} onChange={(event) => setOutcomeSummary(event.target.value)} /></label>
            <Button type="submit" disabled={saving || !workspaceId || hydratedWorkspaceId !== workspaceId} className="w-full gap-2">{saving && <Loader2 className="h-4 w-4 animate-spin" />} Save customer-success record</Button>
          </form>
        </CardContent></Card>

        <Card className="border-white/10 bg-card"><CardHeader><CardTitle className="text-base text-white">Client lifecycle register</CardTitle></CardHeader><CardContent>
          {loading ? <div className="flex justify-center gap-2 py-16 text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div> : profiles.length === 0 ? <p className="rounded-xl border border-white/10 p-5 text-sm text-slate-400">No customer-success profiles yet. Initialize only after commercial conversion and onboarding evidence is complete.</p> : <div className="space-y-3">{profiles.map((profile) => <button key={profile.id} type="button" onClick={() => chooseWorkspace(profile.workspaceId, profile.id)} className={`w-full rounded-xl border p-4 text-left ${selectedProfileId === profile.id ? "border-cyan-400/35 bg-cyan-400/[0.06]" : "border-white/10 bg-white/[0.025]"}`}><div className="flex flex-wrap justify-between gap-3"><div><p className="font-semibold text-white">{profile.organizationName}</p><p className="mt-1 text-xs text-slate-500">{profile.workspaceName}{profile.projectName ? ` · ${profile.projectName}` : ""}</p></div><div className="flex gap-2"><Badge variant="outline">{profile.lifecycleState}</Badge><Badge variant="outline">{profile.healthStatus}</Badge></div></div><p className="mt-3 text-sm text-slate-300">{profile.outcomeSummary || "Outcome review not recorded yet."}</p><div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500"><span>Outcome: {profile.outcomeStatus}</span><span>Satisfaction: {profile.satisfactionScore ?? "—"}</span><span>Next review: {dateLabel(profile.nextReviewAt)}</span></div></button>)}</div>}
        </CardContent></Card>
      </div>

      {selectedProfile && <section className="grid gap-6 2xl:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)]">
        <Card className="border-white/10 bg-card"><CardHeader><CardTitle className="text-base text-white">Create governed lifecycle action</CardTitle><p className="text-xs text-slate-500">{selectedProfile.organizationName} · {selectedProfile.workspaceName}</p></CardHeader><CardContent><form className="space-y-4" onSubmit={createAction}>
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">Action type<select className={fieldClass} value={actionType} onChange={(event) => setActionType(event.target.value as CustomerSuccessActionType)}>{customerSuccessActionTypes.map((value) => <option key={value}>{value}</option>)}</select></label>
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">Title<input className={fieldClass} value={actionTitle} onChange={(event) => setActionTitle(event.target.value)} required /></label>
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">Due date<input className={fieldClass} type="datetime-local" value={actionDueAt} onChange={(event) => setActionDueAt(event.target.value)} /></label>
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">Notes<textarea className={`${fieldClass} min-h-24`} value={actionNotes} onChange={(event) => setActionNotes(event.target.value)} /></label>
          <Button type="submit" disabled={saving || !actionTitle.trim()} className="w-full gap-2">{saving && <Loader2 className="h-4 w-4 animate-spin" />} Create planning action</Button>
        </form></CardContent></Card>
        <Card className="border-white/10 bg-card"><CardHeader><CardTitle className="text-base text-white">Open and historical actions</CardTitle></CardHeader><CardContent>{actions.length === 0 ? <p className="rounded-xl border border-white/10 p-5 text-sm text-slate-400">No lifecycle actions recorded.</p> : <div className="space-y-3">{actions.map((action) => <div key={action.id} className="rounded-xl border border-white/10 bg-white/[0.025] p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><p className="font-semibold text-white">{action.title}</p><Badge variant="outline">{action.actionType}</Badge><Badge variant="outline">{action.status}</Badge></div>{action.notes && <p className="mt-2 text-sm text-slate-400">{action.notes}</p>}<p className="mt-2 text-xs text-slate-500">Due: {dateLabel(action.dueAt)}</p></div>{action.status !== "COMPLETED" && action.status !== "CANCELLED" && <Button type="button" variant="outline" size="sm" className="gap-2" disabled={saving} onClick={() => void completeAction(action.id)}><CheckCircle2 className="h-4 w-4" /> Complete</Button>}</div></div>)}</div>}</CardContent></Card>
      </section>}

      <section className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-5 text-sm leading-6 text-amber-50/80"><strong className="text-amber-100">Human gate:</strong> EXPANSION, RENEWAL and REFERRAL records do not authorize a new scope, recurring charge, public testimonial, referral disclosure, or customer contact by themselves.</section>
    </div>
  );
}
