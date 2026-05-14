"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Code2,
  Database,
  ExternalLink,
  FileJson,
  Loader2,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

function modeClass(mode: OperationMode) {
  if (mode === "ready") return "border-green-500/25 bg-green-500/15 text-green-400";
  if (mode === "partial") return "border-yellow-500/25 bg-yellow-500/15 text-yellow-400";
  if (mode === "external") return "border-cyan-500/25 bg-cyan-500/15 text-cyan-400";
  return "border-white/10 bg-white/10 text-slate-300";
}

function riskClass(risk: OperationRisk) {
  if (risk === "destructive") return "border-red-500/25 bg-red-500/15 text-red-400";
  if (risk === "approval_required") return "border-yellow-500/25 bg-yellow-500/15 text-yellow-400";
  return "border-green-500/25 bg-green-500/15 text-green-400";
}

function formatLabel(value: string) {
  return value.replace(/([A-Z])/g, " $1").replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()).trim();
}

export default function AdminApiOperationsPage() {
  const [registry, setRegistry] = useState<RegistryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [domain, setDomain] = useState("all");

  useEffect(() => {
    fetch("/api/operations/registry")
      .then((response) => response.json())
      .then((data) => setRegistry(data))
      .finally(() => setLoading(false));
  }, []);

  const domains = useMemo(() => {
    const values = new Set(registry?.operations.map((operation) => operation.domain) ?? []);
    return ["all", ...Array.from(values).sort()];
  }, [registry]);

  const operations = useMemo(() => {
    if (!registry) return [];
    if (domain === "all") return registry.operations;
    return registry.operations.filter((operation) => operation.domain === domain);
  }, [registry, domain]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-xs font-mono uppercase tracking-wider text-cyan-400">
            <Code2 className="h-3.5 w-3.5" />
            API Project Environment
          </div>
          <h1 className="text-2xl font-bold text-white">API Operations Center</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">
            Operational map for the SaaS API layer, showing implemented GEM routes, external connectors, approval-gated actions, and planned capabilities.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="border-white/10 text-slate-300 hover:bg-white/10 hover:text-white">
            <Link href="/api/openapi" target="_blank">
              <FileJson className="mr-2 h-4 w-4" /> OpenAPI JSON
            </Link>
          </Button>
          <Button asChild className="bg-cyan-400 text-black hover:bg-cyan-300">
            <Link href="/api/operations/registry" target="_blank">
              Registry <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading API operations…
        </div>
      ) : registry ? (
        <>
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-6">
            {[
              ["Total", registry.summary.total, Database, "text-cyan-400", "bg-cyan-500/10"],
              ["Ready", registry.summary.ready, CheckCircle2, "text-green-400", "bg-green-500/10"],
              ["Partial", registry.summary.partial, Activity, "text-yellow-400", "bg-yellow-500/10"],
              ["External", registry.summary.external, ExternalLink, "text-cyan-400", "bg-cyan-500/10"],
              ["Approval", registry.summary.approvalRequired, LockKeyhole, "text-yellow-400", "bg-yellow-500/10"],
              ["Planned", registry.summary.planned, AlertTriangle, "text-slate-400", "bg-white/10"],
            ].map(([label, value, Icon, color, bg]) => (
              <div key={String(label)} className="glass-panel bento-card rounded-xl p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${bg}`}>
                    {/* @ts-expect-error icon union */}
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <p className={`text-2xl font-bold ${color}`}>{String(value)}</p>
                </div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{String(label)}</p>
              </div>
            ))}
          </div>

          <Card className="border-white/10 bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <ShieldCheck className="h-5 w-5 text-cyan-400" /> Agent Guardrails
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {registry.instructions.slice(0, 8).map((instruction) => (
                  <div key={instruction} className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm leading-relaxed text-slate-300">
                    {instruction}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-2">
            {domains.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setDomain(item)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                  domain === item ? "bg-cyan-400 text-black" : "border border-white/10 bg-white/5 text-slate-400 hover:text-white"
                }`}
              >
                {formatLabel(item)}
              </button>
            ))}
          </div>

          <Card className="border-white/10 bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Database className="h-5 w-5 text-cyan-400" /> Operations Registry
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-2xl border border-white/10">
                <div className="grid grid-cols-[0.65fr_1.2fr_0.7fr_0.8fr_1fr] border-b border-white/10 bg-white/5 px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                  <span>Method</span>
                  <span>Operation</span>
                  <span>Mode</span>
                  <span>Risk</span>
                  <span>Path</span>
                </div>

                {operations.map((operation) => (
                  <div key={`${operation.method}-${operation.path}-${operation.label}`} className="grid grid-cols-[0.65fr_1.2fr_0.7fr_0.8fr_1fr] items-center border-b border-white/5 px-4 py-4 last:border-b-0">
                    <span className="font-mono text-xs text-cyan-400">{operation.method}</span>
                    <div>
                      <p className="text-sm font-semibold text-white">{operation.label}</p>
                      <p className="mt-1 line-clamp-2 text-xs text-slate-500">{operation.description}</p>
                    </div>
                    <Badge className={modeClass(operation.mode)}>{operation.mode}</Badge>
                    <Badge className={riskClass(operation.risk)}>{operation.risk.replace(/_/g, " ")}</Badge>
                    <div className="flex items-center gap-2 truncate font-mono text-xs text-slate-500">
                      {operation.path.startsWith("/api") ? (
                        <Link href={operation.path} target="_blank" className="truncate hover:text-cyan-400">
                          {operation.path}
                        </Link>
                      ) : (
                        <span className="truncate">{operation.path}</span>
                      )}
                      <ChevronRight className="h-3 w-3 shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center text-red-400">
          Unable to load API registry.
        </div>
      )}
    </div>
  );
}
