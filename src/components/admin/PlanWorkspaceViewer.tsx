"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronRight,
  Eye,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  UserRoundCog,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PlanWorkspaceDefinition, PlanWorkspaceId } from "@/lib/planWorkspaces";
import { cn } from "@/lib/utils";

const accentStyles = {
  cyan: "border-cyan-400/35 bg-cyan-400/10 text-cyan-200",
  emerald: "border-emerald-400/35 bg-emerald-400/10 text-emerald-200",
  violet: "border-violet-400/35 bg-violet-400/10 text-violet-200",
};

const metricStyles = {
  cyan: "border-cyan-400/20 bg-cyan-400/[0.06] text-cyan-300",
  emerald: "border-emerald-400/20 bg-emerald-400/[0.06] text-emerald-300",
  amber: "border-amber-400/20 bg-amber-400/[0.06] text-amber-300",
  violet: "border-violet-400/20 bg-violet-400/[0.06] text-violet-300",
};

const statusStyles = {
  Ready: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
  "Needs review": "border-amber-400/25 bg-amber-400/10 text-amber-300",
  Waiting: "border-slate-400/25 bg-slate-400/10 text-slate-300",
  Draft: "border-violet-400/25 bg-violet-400/10 text-violet-300",
};

export function PlanWorkspaceViewer({ plans }: { plans: PlanWorkspaceDefinition[] }) {
  const [planId, setPlanId] = useState<PlanWorkspaceId>(plans[0]?.id ?? "basic");
  const [personaId, setPersonaId] = useState(plans[0]?.personas[0]?.id ?? "client-admin");

  const planIndex = Math.max(0, plans.findIndex((plan) => plan.id === planId));
  const plan = plans[planIndex] ?? plans[0];
  const persona = useMemo(
    () => plan.personas.find((item) => item.id === personaId) ?? plan.personas[0],
    [personaId, plan],
  );

  function selectPlan(nextPlan: PlanWorkspaceDefinition) {
    setPlanId(nextPlan.id);
    setPersonaId(nextPlan.personas[0]?.id ?? "client-admin");
  }

  function movePlan(direction: -1 | 1) {
    const nextIndex = Math.min(plans.length - 1, Math.max(0, planIndex + direction));
    selectPlan(plans[nextIndex]);
  }

  return (
    <div className="space-y-6 pb-10">
      <section className="overflow-hidden rounded-2xl border border-cyan-400/20 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.13),transparent_38%),linear-gradient(145deg,rgba(15,23,42,0.96),rgba(2,6,23,0.98))] p-5 shadow-2xl shadow-cyan-950/20 sm:p-7">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge className="border-cyan-400/30 bg-cyan-400/10 text-cyan-200">
                <LockKeyhole className="mr-1.5 h-3.5 w-3.5" /> Platform Owner only
              </Badge>
              <Badge variant="outline" className="border-white/15 text-slate-300">
                <Eye className="mr-1.5 h-3.5 w-3.5" /> Read-only preview
              </Badge>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Plan Workspace Viewer</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Use your existing owner account to inspect every planned customer workspace and representative role experience one after another.
            </p>
          </div>
          <div className="grid min-w-full grid-cols-2 gap-2 sm:min-w-[340px]">
            <Button
              variant="outline"
              className="border-white/15 bg-white/[0.03] text-slate-200"
              disabled={planIndex === 0}
              onClick={() => movePlan(-1)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            <Button
              className="bg-cyan-300 text-slate-950 hover:bg-cyan-200"
              disabled={planIndex === plans.length - 1}
              onClick={() => movePlan(1)}
            >
              Next plan <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      <section aria-labelledby="plan-selector-title">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Workspace sequence</p>
            <h2 id="plan-selector-title" className="mt-1 text-lg font-semibold text-white">Select a plan experience</h2>
          </div>
          <span className="text-xs text-slate-500">{planIndex + 1} of {plans.length}</span>
        </div>
        <div className="grid gap-3 lg:grid-cols-3">
          {plans.map((item, index) => {
            const active = item.id === plan.id;
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => selectPlan(item)}
                aria-pressed={active}
                className={cn(
                  "rounded-xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300",
                  active ? accentStyles[item.accent] : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-mono uppercase tracking-widest">Plan {index + 1}</span>
                  {active && <CheckCircle2 className="h-4 w-4" />}
                </div>
                <p className="mt-3 text-lg font-semibold text-white">{item.name}</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">{item.audience}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
        <Card className="h-fit border-white/10 bg-white/[0.03] xl:sticky xl:top-20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-white">
              <UserRoundCog className="h-4 w-4 text-cyan-300" /> View as role
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {plan.personas.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => setPersonaId(item.id)}
                aria-pressed={item.id === persona.id}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300",
                  item.id === persona.id
                    ? "border-cyan-400/35 bg-cyan-400/10 text-white"
                    : "border-white/8 bg-black/10 text-slate-400 hover:border-white/20 hover:text-white",
                )}
              >
                <span>
                  <span className="block text-sm font-medium">{item.label}</span>
                  <span className="mt-0.5 block text-[11px] text-slate-500">{item.perspective}</span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0" />
              </button>
            ))}
          </CardContent>
        </Card>

        <div className="min-w-0 space-y-5">
          <Card className="overflow-hidden border-white/10 bg-card">
            <CardContent className="p-0">
              <div className="border-b border-white/10 bg-white/[0.03] p-5 sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={accentStyles[plan.accent]}>{plan.name} workspace</Badge>
                      <Badge variant="outline" className="border-white/15 text-slate-300">{persona.label}</Badge>
                    </div>
                    <h2 className="mt-4 text-xl font-semibold text-white">{persona.perspective}</h2>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{persona.summary}</p>
                  </div>
                  <div className="rounded-lg border border-amber-400/20 bg-amber-400/[0.06] px-3 py-2 text-xs leading-5 text-amber-200 lg:max-w-xs">
                    {plan.commercialStatus}
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {plan.metrics.map((metric) => (
                    <div key={metric.label} className={cn("rounded-xl border p-4", metricStyles[metric.tone])}>
                      <p className="text-xs font-medium text-slate-400">{metric.label}</p>
                      <p className="mt-2 text-2xl font-bold text-white">{metric.value}</p>
                      <p className="mt-1 text-[11px]">{metric.context}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-5 lg:grid-cols-2">
            <Card className="border-white/10 bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm text-white">
                  <Building2 className="h-4 w-4 text-cyan-300" /> Included workspace areas
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {plan.modules.map((module) => (
                  <Badge key={module} variant="outline" className="border-white/12 bg-white/[0.03] py-1.5 text-slate-300">
                    {module}
                  </Badge>
                ))}
              </CardContent>
            </Card>
            <Card className="border-white/10 bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm text-white">
                  <Sparkles className="h-4 w-4 text-violet-300" /> Primary actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {persona.primaryActions.map((action) => (
                  <div key={action} className="flex items-center gap-2 rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2 text-sm text-slate-300">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" /> {action}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card className="border-white/10 bg-card">
            <CardHeader className="flex-row items-center justify-between gap-3">
              <CardTitle className="text-sm text-white">Representative action queue</CardTitle>
              <Badge variant="outline" className="border-white/15 text-slate-400">Preview records only</Badge>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left text-sm">
                <thead className="border-b border-white/10 text-[11px] uppercase tracking-wider text-slate-500">
                  <tr><th className="pb-3">ID</th><th className="pb-3">Action</th><th className="pb-3">Area</th><th className="pb-3">Owner</th><th className="pb-3 text-right">Status</th></tr>
                </thead>
                <tbody className="divide-y divide-white/8">
                  {plan.queue.map((item) => (
                    <tr key={item.id}>
                      <td className="py-4 font-mono text-xs text-slate-500">{item.id}</td>
                      <td className="py-4 font-medium text-white">{item.title}</td>
                      <td className="py-4 text-slate-400">{item.area}</td>
                      <td className="py-4 text-slate-400">{item.owner}</td>
                      <td className="py-4 text-right"><Badge className={statusStyles[item.status]}>{item.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <div className="grid gap-5 lg:grid-cols-2">
            <Card className="border-emerald-400/15 bg-emerald-400/[0.03]">
              <CardHeader><CardTitle className="flex items-center gap-2 text-sm text-white"><ShieldCheck className="h-4 w-4 text-emerald-300" /> Visible to this role</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {persona.visibleAreas.map((area) => <p key={area} className="flex items-center gap-2 text-sm text-slate-300"><CheckCircle2 className="h-4 w-4 text-emerald-300" />{area}</p>)}
              </CardContent>
            </Card>
            <Card className="border-rose-400/15 bg-rose-400/[0.03]">
              <CardHeader><CardTitle className="flex items-center gap-2 text-sm text-white"><LockKeyhole className="h-4 w-4 text-rose-300" /> Restricted from this role</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {persona.restrictedAreas.map((area) => <p key={area} className="flex items-center gap-2 text-sm text-slate-300"><XCircle className="h-4 w-4 text-rose-300" />{area}</p>)}
              </CardContent>
            </Card>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-xs leading-5 text-slate-400">
            This viewer changes only the on-screen preview. It does not impersonate a client, alter a subscription, change permissions, expose another organization, or execute production actions.
          </div>
        </div>
      </section>
    </div>
  );
}
