import Link from "next/link";
import { ArrowLeft, CheckCircle2, CircleAlert, ExternalLink, Network, ShieldCheck, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  commercialCapabilities,
  commercialGapPriorities,
  commercialLifecycle,
  commercialOperatingPrinciples,
  type CommercialCapabilityStatus,
} from "@/lib/market/commercialOperatingModel";

const statusClass: Record<CommercialCapabilityStatus, string> = {
  READY: "border-emerald-500/25 bg-emerald-500/10 text-emerald-200",
  PARTIAL: "border-amber-500/25 bg-amber-500/10 text-amber-100",
  EXTERNAL: "border-sky-500/25 bg-sky-500/10 text-sky-200",
  GAP: "border-rose-500/25 bg-rose-500/10 text-rose-100",
  HUMAN_GATE: "border-violet-500/25 bg-violet-500/10 text-violet-100",
};

function StatusBadge({ status }: { status: CommercialCapabilityStatus }) {
  return (
    <Badge variant="outline" className={statusClass[status]}>
      {status.replace("_", " ")}
    </Badge>
  );
}

export default function CommercialOperationsPage() {
  const gaps = commercialCapabilities.filter((capability) => capability.status === "GAP").length;
  const ready = commercialCapabilities.filter((capability) => capability.status === "READY").length;
  const partial = commercialCapabilities.filter((capability) => capability.status === "PARTIAL").length;

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="space-y-5">
        <Link
          href="/app/admin/market"
          className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-200"
        >
          <ArrowLeft className="h-4 w-4" /> Market pipeline
        </Link>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-4xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-xs font-mono uppercase tracking-wider text-cyan-300">
              <Network className="h-3.5 w-3.5" /> Commercial operating system
            </div>
            <h1 className="text-2xl font-bold text-white">Market, Sales & Customer Operations</h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              One governed lifecycle from discovery through delivery, customer success, expansion, referral,
              and learning. This surface is an implementation map: it preserves existing GEM systems and exposes
              verified lifecycle gaps before another SaaS product is introduced.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" className="gap-2">
              <Link href="/app/admin/customer-success">
                <Users className="h-4 w-4" /> Customer Success
              </Link>
            </Button>
            <Button asChild variant="outline" className="gap-2">
              <a href="/business-review" target="_blank" rel="noreferrer">
                Public founding offer <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="glass-panel rounded-xl p-5">
          <p className="text-xs uppercase tracking-wide text-slate-400">Ready capabilities</p>
          <p className="mt-4 text-3xl font-bold text-emerald-300">{ready}</p>
        </div>
        <div className="glass-panel rounded-xl p-5">
          <p className="text-xs uppercase tracking-wide text-slate-400">Partial capabilities</p>
          <p className="mt-4 text-3xl font-bold text-amber-200">{partial}</p>
        </div>
        <div className="glass-panel rounded-xl p-5">
          <p className="text-xs uppercase tracking-wide text-slate-400">Verified gaps</p>
          <p className="mt-4 text-3xl font-bold text-rose-200">{gaps}</p>
        </div>
      </div>

      <section className="rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.05] p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" />
          <div>
            <h2 className="font-semibold text-white">No-duplication contract</h2>
            <div className="mt-3 grid gap-2 lg:grid-cols-2">
              {commercialOperatingPrinciples.map((principle) => (
                <div
                  key={principle}
                  className="rounded-xl border border-white/10 bg-black/10 px-4 py-3 text-sm leading-6 text-slate-300"
                >
                  {principle}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-cyan-300">Lifecycle</p>
          <h2 className="mt-1 text-lg font-semibold text-white">One customer journey, one authoritative record</h2>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {commercialLifecycle.map((stage, index) => (
            <Card key={stage.key} className="border-white/10 bg-card">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/10 font-mono text-xs text-cyan-200">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <CardTitle className="text-base text-white">{stage.label}</CardTitle>
                      <p className="mt-1 text-xs leading-5 text-slate-500">{stage.objective}</p>
                    </div>
                  </div>
                  <StatusBadge status={stage.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">System of record</p>
                  <p className="mt-1 text-slate-300">{stage.systemOfRecord}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Existing surface</p>
                  <p className="mt-1 font-mono text-xs leading-5 text-slate-400">{stage.existingSurface}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-cyan-300">Capability register</p>
          <h2 className="mt-1 text-lg font-semibold text-white">Keep, extend, integrate — never duplicate by default</h2>
        </div>
        <div className="space-y-4">
          {commercialCapabilities.map((item) => (
            <Card key={item.capability} className="border-white/10 bg-card">
              <CardContent className="p-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="max-w-4xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-white">{item.capability}</h3>
                      <StatusBadge status={item.status} />
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{item.existingGemImplementation}</p>
                    <div className="mt-3 grid gap-3 lg:grid-cols-2">
                      <div className="rounded-xl border border-white/8 bg-white/[0.025] p-3">
                        <p className="text-xs uppercase tracking-wide text-slate-500">System of record</p>
                        <p className="mt-1 text-sm text-slate-300">{item.systemOfRecord}</p>
                      </div>
                      <div className="rounded-xl border border-white/8 bg-white/[0.025] p-3">
                        <p className="text-xs uppercase tracking-wide text-slate-500">External-tool rule</p>
                        <p className="mt-1 text-sm text-slate-300">{item.externalToolPolicy}</p>
                      </div>
                    </div>
                  </div>
                  <div className="xl:w-80">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Next action</p>
                    <p className="mt-1 text-sm leading-6 text-slate-300">{item.nextAction}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <CircleAlert className="h-5 w-5 text-amber-300" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.16em] text-amber-300">Build order</p>
            <h2 className="mt-1 text-lg font-semibold text-white">Highest-value verified gaps</h2>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {commercialGapPriorities.map((item) => (
            <Card key={item.priority} className="border-amber-500/15 bg-card">
              <CardContent className="flex gap-4 p-5">
                <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-amber-400/20 bg-amber-400/10 font-mono text-sm text-amber-200">
                  {item.priority}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{item.outcome}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.04] p-5">
        <div className="flex gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
          <div>
            <h2 className="font-semibold text-white">Operating rule</h2>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-300">
              A sale is not complete at payment. Commercial completion means the customer is reconciled into the
              approved GEM organization/workspace/project structure, the contracted outcome can be delivered and
              supported, and the relationship can be measured without creating a second customer database.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
