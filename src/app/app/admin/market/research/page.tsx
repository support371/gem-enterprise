import Link from "next/link";
import { ArrowLeft, ExternalLink, Search, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { foundingResearchSeedGeneratedAt, foundingResearchSeeds } from "@/lib/market/foundingResearchSeeds";

const segmentLabel = {
  PROFESSIONAL_SERVICES: "Professional services",
  PROPERTY: "Property / real estate",
  LOGISTICS: "Logistics / field operations",
} as const;

export default function MarketResearchPage() {
  const counts = foundingResearchSeeds.reduce<Record<string, number>>((acc, seed) => {
    acc[seed.segment] = (acc[seed.segment] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <Link href="/app/admin/market" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-200">
          <ArrowLeft className="h-4 w-4" /> Market pipeline
        </Link>
        <div className="mt-5 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-4xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-xs font-mono uppercase tracking-wider text-cyan-300">
              <Search className="h-3.5 w-3.5" /> Research only · {foundingResearchSeedGeneratedAt}
            </div>
            <h1 className="text-2xl font-bold text-white">Founding First-20 Research Queue</h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Evidence-safe company research for the $199 Business Security & Operations Review. These records are not customers, intake submissions, vulnerabilities, or authorization to contact. An operator must verify current fit and public evidence before using the one-to-one outreach workbench.
            </p>
          </div>
          <Button asChild variant="outline"><Link href="/app/admin/market/outreach">Open outreach workbench</Link></Button>
        </div>
      </header>

      <section className="rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.05] p-5">
        <div className="flex gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" />
          <div>
            <h2 className="font-semibold text-white">Research boundary</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Public company information may support fit research and personalization. Do not infer a breach, weakness, compromise, private contact detail, or service need from these records. Research does not create an intake record and this page cannot send messages.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="glass-panel rounded-xl p-5"><p className="text-xs uppercase tracking-wide text-slate-400">Research seeds</p><p className="mt-4 text-3xl font-bold text-white">{foundingResearchSeeds.length}</p></div>
        <div className="glass-panel rounded-xl p-5"><p className="text-xs uppercase tracking-wide text-slate-400">Professional</p><p className="mt-4 text-3xl font-bold text-white">{counts.PROFESSIONAL_SERVICES ?? 0}</p></div>
        <div className="glass-panel rounded-xl p-5"><p className="text-xs uppercase tracking-wide text-slate-400">Property</p><p className="mt-4 text-3xl font-bold text-white">{counts.PROPERTY ?? 0}</p></div>
        <div className="glass-panel rounded-xl p-5"><p className="text-xs uppercase tracking-wide text-slate-400">Logistics</p><p className="mt-4 text-3xl font-bold text-white">{counts.LOGISTICS ?? 0}</p></div>
      </div>

      <section className="grid gap-4 xl:grid-cols-2">
        {foundingResearchSeeds.map((seed, index) => (
          <Card key={`${seed.company}-${seed.website}`} className="border-white/10 bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-mono text-slate-500">#{String(index + 1).padStart(2, "0")}</p>
                  <CardTitle className="mt-1 text-base text-white">{seed.company}</CardTitle>
                  <p className="mt-1 text-xs text-slate-500">{seed.location} · approx. {seed.estimatedEmployees} employees</p>
                </div>
                <Badge variant="outline">{segmentLabel[seed.segment]}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div><p className="text-xs uppercase tracking-wide text-slate-500">Why it may fit</p><p className="mt-1 text-sm leading-6 text-slate-300">{seed.fitReason}</p></div>
              <div><p className="text-xs uppercase tracking-wide text-slate-500">Evidence-safe personalization</p><p className="mt-1 text-sm leading-6 text-slate-300">{seed.personalizationAngle}</p></div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3">
                <div><Badge variant="outline" className="border-amber-500/25 bg-amber-500/10 text-amber-100">{seed.status.replace("_", " ")}</Badge><p className="mt-2 text-[11px] text-slate-600">{seed.sourceLabel}</p></div>
                <Button asChild size="sm" variant="outline" className="gap-2"><a href={seed.website} target="_blank" rel="noreferrer">Verify public site <ExternalLink className="h-3.5 w-3.5" /></a></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
