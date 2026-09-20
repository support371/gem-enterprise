import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { foundingBusinessReviewOffer } from "@/lib/market/launchOffer";
import { readinessChecklist } from "@/lib/market/gtmActivation";

const canonicalPath = "/resources/business-readiness-checklist";

export const metadata: Metadata = {
  title: "Business Security & Operations Readiness Checklist | GEM Enterprise",
  description: "Ten practical questions for small and growing businesses to review identity, access, fraud-prevention, vendor, backup, data, and operational-readiness basics.",
  alternates: { canonical: canonicalPath },
  openGraph: {
    title: "10-Question Business Security & Operations Readiness Checklist",
    description: "A practical, non-invasive readiness checklist for small and growing businesses.",
    url: canonicalPath,
    type: "article",
  },
};

export default function BusinessReadinessChecklistPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-cyan-400/20 bg-cyan-400/[0.05] p-6 sm:p-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[.16em] text-cyan-300"><ShieldCheck className="h-4 w-4" /> GEM readiness resource</div>
        <h1 className="mt-5 max-w-4xl text-3xl font-black tracking-tight text-white sm:text-5xl">10 questions every small and growing business should answer before a security or operational problem becomes an incident</h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300">This checklist is a practical self-review, not a finding that your organization is vulnerable or compromised. Use it to identify areas that deserve a clearer owner, documented process, or deeper review.</p>
      </section>

      <section className="mt-8 space-y-4">
        {readinessChecklist.map((item, index) => (
          <Card key={item.key} className="border-white/10 bg-card">
            <CardContent className="flex gap-4 p-5 sm:p-6">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/10 font-mono text-sm text-cyan-200">{index + 1}</span>
              <div><h2 className="font-semibold leading-6 text-white">{item.question}</h2><p className="mt-2 text-sm leading-6 text-slate-400">Why it matters: {item.why}</p></div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mt-10 rounded-3xl border border-emerald-500/20 bg-emerald-500/[0.05] p-6 sm:p-8">
        <div className="flex gap-3"><CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-300" /><div><h2 className="text-xl font-bold text-white">Need help deciding what to fix first?</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">The {foundingBusinessReviewOffer.name} is a bounded {foundingBusinessReviewOffer.priceLabel} for qualified small and growing businesses. It reviews access, public exposure, operational dependencies, incident readiness, and immediate priorities, then produces prioritized written findings and a 30-day action plan. It does not include destructive testing, unlimited remediation, legal advice, or automatic service activation.</p><Button asChild className="mt-5"><Link href="/business-review">Review the founding scope <ArrowRight className="h-4 w-4" /></Link></Button></div></div>
      </section>
    </main>
  );
}
