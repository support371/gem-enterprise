import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  CircleDot,
  ExternalLink,
  LockKeyhole,
  Route,
  ShieldAlert,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getOperationsByDomain,
  operationsRegistry,
  type OperationRoute,
  type OperationsDomain,
} from "@/lib/saasOperationsRegistry";
import { cn } from "@/lib/utils";

const validDomains = new Set<OperationsDomain>(
  operationsRegistry.map((operation) => operation.domain),
);

const relatedWorkspaces: Partial<Record<OperationsDomain, { href: string; label: string }>> = {
  admin: { href: "/app/admin/users", label: "User administration" },
  agent: { href: "/app/command-center/agents", label: "AI agent operations" },
  analytics: { href: "/app/command-center", label: "Enterprise analytics" },
  billing: { href: "/app/admin/allocations", label: "Allocations" },
  enterpriseProjects: { href: "/app/admin/organization-reports", label: "Organization reports" },
  integrations: { href: "/app/command-center/integrations", label: "Integrations" },
  marketing: { href: "/app/admin/campaigns", label: "Campaigns" },
  notifications: { href: "/app/notifications", label: "Notifications" },
  production: { href: "/app/command-center/security", label: "Security operations" },
  sales: { href: "/app/command-center/revenue", label: "Revenue operations" },
  security: { href: "/app/admin/audit", label: "Audit evidence" },
  support: { href: "/app/support", label: "Support workspace" },
};

function formatLabel(value: string) {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

function isOperationsDomain(value: string): value is OperationsDomain {
  return validDomains.has(value as OperationsDomain);
}

function modeStyle(mode: OperationRoute["mode"]) {
  if (mode === "ready") return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
  if (mode === "partial") return "border-amber-400/20 bg-amber-400/10 text-amber-300";
  if (mode === "external") return "border-violet-400/20 bg-violet-400/10 text-violet-300";
  return "border-slate-400/20 bg-slate-400/10 text-slate-300";
}

function riskStyle(risk: OperationRoute["risk"]) {
  if (risk === "safe") return "text-emerald-300";
  if (risk === "destructive") return "text-rose-300";
  return "text-amber-300";
}

export async function generateMetadata({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;
  return { title: `${formatLabel(domain)} API Operations | GEM Enterprise` };
}

export default async function ApiDomainPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  if (!isOperationsDomain(domain)) notFound();

  const operations = getOperationsByDomain(domain);
  const ready = operations.filter((operation) => operation.mode === "ready").length;
  const gated = operations.filter((operation) => operation.risk !== "safe").length;
  const relatedWorkspace = relatedWorkspaces[domain];

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 sm:p-8">
        <Button asChild variant="ghost" size="sm" className="-ml-3 mb-4 text-slate-400 hover:text-white">
          <Link href="/app/admin/api">
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" /> API domains
          </Link>
        </Button>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
              Dedicated operations workspace
            </p>
            <h1 className="mt-2 text-3xl font-bold text-white">{formatLabel(domain)}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
              Review this domain without leaving the administrative workspace. Read-only routes can be inspected;
              approval-gated operations remain protected from accidental execution.
            </p>
          </div>
          <div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                ["Routes", operations.length],
                ["Ready", ready],
                ["Gated", gated],
              ].map(([label, value]) => (
                <div key={label} className="min-w-20 rounded-xl border border-white/10 bg-black/10 px-3 py-3">
                  <p className="text-xl font-bold text-white">{value}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
                </div>
              ))}
            </div>
            {relatedWorkspace ? (
              <Button asChild variant="outline" size="sm" className="mt-3 w-full border-white/10 text-slate-200 hover:bg-white/[0.07]">
                <Link href={relatedWorkspace.href}>
                  {relatedWorkspace.label} <ArrowUpRight className="ml-2 h-3.5 w-3.5" />
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      </header>

      <section aria-labelledby="domain-routes-title">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
            <Route className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 id="domain-routes-title" className="text-lg font-bold text-white">Available routes</h2>
            <p className="text-xs text-slate-500">Each route keeps its current authorization and approval boundary.</p>
          </div>
        </div>

        <div className="grid gap-3 xl:grid-cols-2">
          {operations.map((operation) => {
            const isInspectableGet = operation.method === "GET" && operation.path.startsWith("/api");
            const relatedPath = operation.existingGemRoute?.startsWith("/app")
              ? operation.existingGemRoute
              : null;

            return (
              <article key={`${operation.method}:${operation.path}`} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="border-cyan-400/20 bg-cyan-400/10 font-mono text-cyan-300">
                      {operation.method}
                    </Badge>
                    <Badge variant="outline" className={modeStyle(operation.mode)}>
                      {formatLabel(operation.mode)}
                    </Badge>
                  </div>
                  <span className={cn("flex items-center gap-1.5 text-xs font-semibold", riskStyle(operation.risk))}>
                    {operation.risk === "safe" ? (
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : operation.risk === "destructive" ? (
                      <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    {formatLabel(operation.risk)}
                  </span>
                </div>

                <h3 className="mt-4 text-base font-bold text-white">{operation.label}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{operation.description}</p>
                <code className="mt-4 block overflow-x-auto rounded-xl border border-white/[0.07] bg-black/20 px-3 py-2.5 text-xs text-cyan-200">
                  {operation.path}
                </code>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {relatedPath ? (
                    <Button asChild variant="outline" size="sm" className="border-white/10 text-slate-200 hover:bg-white/[0.07]">
                      <Link href={relatedPath}>Open related page <ArrowUpRight className="ml-2 h-3.5 w-3.5" /></Link>
                    </Button>
                  ) : null}
                  {isInspectableGet ? (
                    <Button asChild variant="outline" size="sm" className="border-white/10 text-slate-200 hover:bg-white/[0.07]">
                      <Link href={operation.path} target="_blank">Inspect response <ExternalLink className="ml-2 h-3.5 w-3.5" /></Link>
                    </Button>
                  ) : null}
                  {!relatedPath && !isInspectableGet ? (
                    <span className="flex items-center gap-1.5 text-xs text-slate-500">
                      <CircleDot className="h-3.5 w-3.5" aria-hidden="true" />
                      Use an approved client or workflow to run this operation.
                    </span>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
