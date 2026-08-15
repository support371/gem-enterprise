"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Database,
  ExternalLink,
  FileJson,
  Layers3,
  Loader2,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type OperationMode = "ready" | "partial" | "planned" | "external";
type OperationRisk = "safe" | "approval_required" | "destructive";

type OperationRoute = {
  domain: string;
  label: string;
  method: string;
  path: string;
  mode: OperationMode;
  risk: OperationRisk;
  existingGemRoute?: string;
  description: string;
};

type RegistryResponse = {
  instructions: string[];
  summary: {
    total: number;
    ready: number;
    approvalRequired: number;
    external: number;
    partial: number;
    planned: number;
  };
  operations: OperationRoute[];
};

function formatLabel(value: string) {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

export default function AdminApiOperationsPage() {
  const [registry, setRegistry] = useState<RegistryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/operations/registry", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => setRegistry(data))
      .finally(() => setLoading(false));
  }, []);

  const domains = useMemo(() => {
    if (!registry) return [];
    const grouped = new Map<string, OperationRoute[]>();
    for (const operation of registry.operations) {
      const rows = grouped.get(operation.domain) ?? [];
      rows.push(operation);
      grouped.set(operation.domain, rows);
    }
    return Array.from(grouped.entries())
      .map(([domain, operations]) => ({
        domain,
        operations,
        ready: operations.filter((operation) => operation.mode === "ready").length,
        approvals: operations.filter((operation) => operation.risk !== "safe").length,
      }))
      .sort((a, b) => a.domain.localeCompare(b.domain));
  }, [registry]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Loading API operations…
      </div>
    );
  }

  if (!registry) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center text-red-300">
        The API registry is unavailable. No operation has been attempted.
      </div>
    );
  }

  const summaryCards = [
    { label: "Operations", value: registry.summary.total, icon: Database, tone: "text-cyan-300 bg-cyan-400/10" },
    { label: "Ready", value: registry.summary.ready, icon: CheckCircle2, tone: "text-emerald-300 bg-emerald-400/10" },
    { label: "Partial", value: registry.summary.partial, icon: Activity, tone: "text-amber-300 bg-amber-400/10" },
    { label: "Approval gated", value: registry.summary.approvalRequired, icon: LockKeyhole, tone: "text-rose-300 bg-rose-400/10" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-col gap-5 rounded-3xl border border-white/10 bg-white/[0.035] p-6 sm:p-8 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
            <Layers3 className="h-3.5 w-3.5" aria-hidden="true" /> API project environment
          </div>
          <h1 className="text-3xl font-bold text-white">API Operations</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
            Select one operational domain to review its routes, readiness, and approval boundaries on a focused sub-page.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="border-white/10 text-slate-200 hover:bg-white/[0.07]">
            <Link href="/api/openapi" target="_blank"><FileJson className="mr-2 h-4 w-4" /> OpenAPI JSON</Link>
          </Button>
          <Button asChild className="bg-cyan-300 text-slate-950 hover:bg-cyan-200">
            <Link href="/api/operations/registry" target="_blank">Raw registry <ExternalLink className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="API readiness summary">
        {summaryCards.map(({ label, value, icon: Icon, tone }) => {
          const [textClass, backgroundClass] = tone.split(" ");
          return (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
              <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${backgroundClass}`}>
                <Icon className={`h-5 w-5 ${textClass}`} aria-hidden="true" />
              </div>
              <p className={`text-3xl font-bold ${textClass}`}>{value}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
            </div>
          );
        })}
      </section>

      <section className="rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.045] p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" aria-hidden="true" />
          <div>
            <h2 className="text-sm font-bold text-white">Operating guardrails stay active on every sub-page</h2>
            <ul className="mt-3 grid gap-2 text-xs leading-6 text-slate-400 md:grid-cols-2">
              {registry.instructions.slice(0, 4).map((instruction) => (
                <li key={instruction} className="rounded-xl border border-white/[0.07] bg-black/10 px-3 py-2.5">{instruction}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section aria-labelledby="api-domain-title">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Dedicated sub-pages</p>
        <h2 id="api-domain-title" className="mt-1 text-xl font-bold text-white">Choose an API domain</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {domains.map(({ domain, operations, ready, approvals }) => (
            <Link
              key={domain}
              href={`/app/admin/api/${domain}`}
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:-translate-y-0.5 hover:border-cyan-400/30 hover:bg-white/[0.055]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                  <Layers3 className="h-5 w-5" aria-hidden="true" />
                </div>
                <Badge className="border-white/10 bg-white/[0.05] text-slate-300">{operations.length} routes</Badge>
              </div>
              <h3 className="mt-5 text-base font-bold text-white">{formatLabel(domain)}</h3>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                <span>{ready} ready</span><span aria-hidden="true">•</span><span>{approvals} approval gated</span>
              </div>
              <span className="mt-5 flex items-center gap-2 text-sm font-semibold text-cyan-300">
                Open domain <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
