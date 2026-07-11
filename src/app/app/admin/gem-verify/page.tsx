"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  FileLock2,
  Fingerprint,
  Loader2,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type ControlStatus = "operational" | "controlled_pilot" | "blocked" | "planned";

type Module = {
  id: string;
  name: string;
  status: ControlStatus;
  route: string | null;
  description: string;
};

type AssuranceLevel = {
  id: string;
  name: string;
  purpose: string;
  status: ControlStatus;
  requiredEvidence: string[];
  requiredControls: string[];
  limitations: string[];
};

type ReadinessCheck = {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
};

type SystemResponse = {
  ok: boolean;
  error?: string;
  diagnostic?: string;
  system: {
    policyVersion: string;
    principles: string[];
  };
  modules: Module[];
  assuranceLevels: AssuranceLevel[];
  readiness?: {
    ready: boolean;
    checks: ReadinessCheck[];
  };
  operations?: {
    totalApplications: number;
    applicationsByStatus: Record<string, number>;
    reviewEvents: number;
    finalDecisions: number;
    storedDocuments: number;
  };
};

type MetricCard = {
  label: string;
  value: number;
  icon: LucideIcon;
};

const statusStyle: Record<ControlStatus, string> = {
  operational: "border-green-500/25 bg-green-500/10 text-green-300",
  controlled_pilot: "border-cyan-500/25 bg-cyan-500/10 text-cyan-300",
  blocked: "border-amber-500/25 bg-amber-500/10 text-amber-300",
  planned: "border-slate-500/25 bg-slate-500/10 text-slate-300",
};

const statusLabel: Record<ControlStatus, string> = {
  operational: "Operational",
  controlled_pilot: "Controlled pilot",
  blocked: "Blocked safely",
  planned: "Planned",
};

function titleCase(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function GemVerifyControlCenterPage() {
  const [data, setData] = useState<SystemResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/verify/system", { cache: "no-store" });
      const body = (await response.json().catch(() => ({}))) as SystemResponse;
      setData(body);
      if (!response.ok) setError(body.error ?? "GEM Verify status could not be loaded.");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "GEM Verify status could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const activeCases = data?.operations
    ? Object.entries(data.operations.applicationsByStatus)
        .filter(([status]) => ["started", "in_progress", "documents_uploaded", "under_review", "manual_review"].includes(status))
        .reduce((total, [, count]) => total + count, 0)
    : 0;

  const metrics: MetricCard[] = [
    { label: "Applications", value: data?.operations?.totalApplications ?? 0, icon: ClipboardCheck },
    { label: "Active cases", value: activeCases, icon: UserCheck },
    { label: "Review events", value: data?.operations?.reviewEvents ?? 0, icon: Users },
    { label: "Final decisions", value: data?.operations?.finalDecisions ?? 0, icon: CheckCircle2 },
    { label: "Stored documents", value: data?.operations?.storedDocuments ?? 0, icon: FileLock2 },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-300">
            <ShieldCheck className="h-3.5 w-3.5" /> First-party identity assurance
          </div>
          <h1 className="mt-3 text-3xl font-black text-white">GEM Verify Control Center</h1>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">
            Operate GEM&apos;s own consent, identity-assurance, manual-review, decision, and audit workflow. Persona, Veriff, or another identity provider is not required for this controlled first-party flow.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => void load()} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh status
          </Button>
          <Button asChild className="bg-cyan-400 font-semibold text-black hover:bg-cyan-300">
            <Link href="/review/verification">Open review queue</Link>
          </Button>
        </div>
      </header>

      <section className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-transparent p-6">
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <div className="flex items-center gap-3">
              <Fingerprint className="h-8 w-8 text-cyan-300" />
              <div>
                <h2 className="text-xl font-bold text-white">Owned by GEM, operated by GEM</h2>
                <p className="text-xs uppercase tracking-widest text-cyan-300/70">
                  {data?.system.policyVersion ?? "gem-verify-manual-review-v1"}
                </p>
              </div>
            </div>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-300">
              Applicant intake, evidence review, final decision, and service activation remain separate. The system makes no automatic identity decision and does not claim biometric liveness or external certification.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ["External ID vendor", "Not required", "text-green-300"],
              ["Automatic approval", "Disabled", "text-amber-300"],
              ["Biometric decisioning", "Disabled", "text-amber-300"],
              ["Human decision", "Required", "text-green-300"],
            ].map(([label, value, className]) => (
              <div key={label} className="rounded-xl border border-white/10 bg-black/15 p-4">
                <p className="text-xs text-slate-500">{label}</p>
                <p className={`mt-1 font-semibold ${className}`}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-4 text-sm text-amber-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Live operational totals are unavailable</p>
              <p className="mt-1 text-amber-100/70">{error}</p>
              {data?.diagnostic && <p className="mt-1 font-mono text-xs text-amber-100/50">Diagnostic: {data.diagnostic}</p>}
            </div>
          </div>
        </div>
      )}

      {loading && !data ? (
        <div className="flex items-center gap-2 py-16 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" /> Evaluating GEM Verify
        </div>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {metrics.map(({ label, value, icon: Icon }) => (
              <article key={label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <Icon className="h-5 w-5 text-cyan-300" />
                <p className="mt-4 text-3xl font-black text-white">{value}</p>
                <p className="mt-1 text-xs uppercase tracking-widest text-slate-500">{label}</p>
              </article>
            ))}
          </section>

          <section>
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Operational modules</h2>
                <p className="mt-1 text-sm text-slate-400">Direct routes into GEM-owned verification operations.</p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/app/admin/verification-pilot">Reviewer governance</Link>
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {data?.modules.map((module) => (
                <article key={module.id} className="flex min-h-48 flex-col rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-white">{module.name}</h3>
                    <Badge className={statusStyle[module.status]}>{statusLabel[module.status]}</Badge>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{module.description}</p>
                  <div className="mt-auto pt-5">
                    {module.route ? (
                      <Button asChild variant="outline" size="sm" className="w-full"><Link href={module.route}>Open module</Link></Button>
                    ) : (
                      <div className="rounded-lg border border-amber-500/15 bg-amber-500/5 p-3 text-xs leading-5 text-amber-200/70">
                        Activation remains fail closed until all stated safeguards are verified.
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">GEM internal assurance levels</h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-400">
              These are GEM operating levels, not a claim of government certification or equivalence to Persona, Veriff, NIST, or another external assurance scheme.
            </p>
            <div className="mt-4 space-y-4">
              {data?.assuranceLevels.map((level) => (
                <article key={level.id} className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-mono text-xs font-semibold text-cyan-300">{level.id}</p>
                      <h3 className="mt-1 text-lg font-bold text-white">{level.name}</h3>
                      <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">{level.purpose}</p>
                    </div>
                    <Badge className={statusStyle[level.status]}>{statusLabel[level.status]}</Badge>
                  </div>
                  <div className="mt-5 grid gap-4 lg:grid-cols-3">
                    {[
                      ["Evidence", level.requiredEvidence, "border-white/10 bg-black/10 text-slate-300"],
                      ["Controls", level.requiredControls, "border-white/10 bg-black/10 text-slate-300"],
                      ["Limits", level.limitations, "border-amber-500/15 bg-amber-500/5 text-amber-100/70"],
                    ].map(([heading, items, className]) => (
                      <div key={String(heading)} className={`rounded-xl border p-4 ${String(className)}`}>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{String(heading)}</p>
                        <ul className="mt-3 space-y-2 text-sm">
                          {(items as string[]).map((item) => <li key={item}>• {item}</li>)}
                        </ul>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
            <article className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
              <h2 className="text-lg font-bold text-white">Readiness controls</h2>
              <p className="mt-1 text-sm text-slate-400">Read-only verification of staffing, workflow, and safety guards.</p>
              <div className="mt-5 space-y-3">
                {data?.readiness?.checks.map((check) => (
                  <div key={check.id} className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/10 p-4">
                    {check.passed ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-400" /> : <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />}
                    <div><p className="text-sm font-semibold text-white">{check.label}</p><p className="mt-1 text-xs leading-5 text-slate-400">{check.detail}</p></div>
                  </div>
                ))}
                {!data?.readiness && <p className="rounded-xl border border-white/10 bg-black/10 p-4 text-sm text-slate-500">Readiness totals become available when the production database connection is healthy.</p>}
              </div>
            </article>

            <article className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
              <h2 className="text-lg font-bold text-white">Current workflow totals</h2>
              <div className="mt-5 space-y-2">
                {Object.entries(data?.operations?.applicationsByStatus ?? {}).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between rounded-lg border border-white/10 bg-black/10 px-4 py-3">
                    <span className="text-sm text-slate-300">{titleCase(status)}</span>
                    <span className="font-mono text-sm font-semibold text-cyan-300">{count}</span>
                  </div>
                ))}
                {Object.keys(data?.operations?.applicationsByStatus ?? {}).length === 0 && <p className="rounded-xl border border-white/10 bg-black/10 p-4 text-sm text-slate-500">No live case totals are available yet.</p>}
              </div>
            </article>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
            <h2 className="text-lg font-bold text-white">Core operating rules</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {data?.system.principles.map((principle) => (
                <div key={principle} className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/10 p-4">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                  <p className="text-sm leading-6 text-slate-300">{principle}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
