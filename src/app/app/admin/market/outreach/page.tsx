"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Copy, ExternalLink, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { foundingBusinessReviewOffer } from "@/lib/market/launchOffer";
import { foundingMarketTarget } from "@/lib/market/launchTarget";

const campaignPath =
  `/business-review?lead=outbound&campaign=${foundingMarketTarget.campaignCode}&utm_source=direct-outreach&utm_medium=one-to-one&utm_campaign=first-20-businesses`;

const outreachTemplates = [
  {
    key: "professional-services",
    label: "Professional services",
    message:
      "Hi [Name] — I’m reaching out from GEM Enterprise. We’re opening a small founding cohort for a $199 Business Security & Operations Review for small and growing teams. The review covers access and identity risk, public internet exposure, operational weak points, incident readiness, and a prioritized 30-day action plan. It is bounded, non-destructive, and does not create any account or access automatically. If that would be useful for [Business], you can review the scope here: [LINK]",
  },
  {
    key: "property",
    label: "Real estate / property",
    message:
      "Hi [Name] — GEM Enterprise is opening a small founding cohort for a $199 Business Security & Operations Review. For property and real-estate teams, we focus on account access, shared systems, public-facing exposure, operational dependencies, incident readiness, and the highest-priority fixes for the next 30 days. The review is bounded and non-destructive. If it fits [Business], the scope and request form are here: [LINK]",
  },
  {
    key: "logistics",
    label: "Logistics / field service",
    message:
      "Hi [Name] — I’m contacting a small number of operating businesses for GEM Enterprise’s founding $199 Business Security & Operations Review. For logistics and field-service teams, the review looks at account access, cloud/shared tools, operational single points of failure, internet exposure, incident readiness, and practical next fixes. No destructive testing or automatic system access is involved. Details are here if useful for [Business]: [LINK]",
  },
  {
    key: "general",
    label: "General small business",
    message:
      "Hi [Name] — GEM Enterprise is opening a controlled first cohort for a $199 Business Security & Operations Review. It is designed to help a small or growing business identify what to fix first across security, access, operations, incident readiness, and data-handling controls, then leave with a prioritized 30-day action plan. If you think that could help [Business], the full bounded scope is here: [LINK]",
  },
] as const;

export default function First20OutreachPage() {
  const [copied, setCopied] = useState<string | null>(null);
  const [campaignUrl, setCampaignUrl] = useState(campaignPath);

  useEffect(() => {
    setCampaignUrl(`${window.location.origin}${campaignPath}`);
  }, []);

  async function copy(key: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      window.setTimeout(() => setCopied(null), 2_000);
    } catch {
      setCopied(null);
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-xs font-mono uppercase tracking-wider text-cyan-300">
            <Users className="h-3.5 w-3.5" /> First-20 launch
          </div>
          <h1 className="text-2xl font-bold text-white">Founding Review Outreach Workbench</h1>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-400">
            Use these scripts for deliberate one-to-one outreach to businesses that fit the founding review. Personalize every message before sending. This page never sends outreach automatically and never creates an intake record for a prospect.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/app/admin/market">Back to Market Pipeline</Link>
        </Button>
      </div>

      <section className="rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.06] p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.16em] text-cyan-300">Tracked campaign</p>
            <h2 className="mt-1 text-lg font-semibold text-white">{foundingMarketTarget.campaignCode}</h2>
            <p className="mt-2 break-all font-mono text-xs leading-5 text-slate-400">{campaignUrl}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => void copy("campaign", campaignUrl)} className="gap-2">
              {copied === "campaign" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied === "campaign" ? "Copied" : "Copy link"}
            </Button>
            <Button asChild variant="outline" className="gap-2">
              <a href={campaignPath} target="_blank" rel="noreferrer">
                Open offer <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="glass-panel rounded-xl p-5">
          <p className="text-xs uppercase tracking-wide text-slate-400">Cohort size</p>
          <p className="mt-4 text-3xl font-bold text-white">{foundingMarketTarget.batchSize}</p>
        </div>
        <div className="glass-panel rounded-xl p-5">
          <p className="text-xs uppercase tracking-wide text-slate-400">Founding price</p>
          <p className="mt-4 text-3xl font-bold text-white">${foundingBusinessReviewOffer.priceUsd}</p>
        </div>
        <div className="glass-panel rounded-xl p-5">
          <p className="text-xs uppercase tracking-wide text-slate-400">Send mode</p>
          <p className="mt-4 text-xl font-bold text-emerald-300">One-to-one only</p>
        </div>
      </div>

      <section className="grid gap-4 xl:grid-cols-2">
        {outreachTemplates.map((template) => {
          const message = template.message.replace("[LINK]", campaignUrl);
          return (
            <Card key={template.key} className="border-white/10 bg-card">
              <CardHeader>
                <CardTitle className="text-base text-white">{template.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap rounded-xl border border-white/10 bg-black/10 p-4 text-sm leading-6 text-slate-300">
                  {message}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4 gap-2"
                  onClick={() => void copy(template.key, message)}
                >
                  {copied === template.key ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied === template.key ? "Copied" : "Copy draft"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card className="border-white/10 bg-card">
          <CardHeader>
            <CardTitle className="text-base text-white">Minimum fit before contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {foundingMarketTarget.fitSignals.map((signal) => (
              <div key={signal} className="flex gap-3 rounded-xl border border-white/8 bg-white/[0.025] px-4 py-3 text-sm leading-6 text-slate-300">
                <Check className="mt-1 h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" />
                <span>{signal}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-white">
              <ShieldCheck className="h-4 w-4 text-cyan-300" /> Boundaries
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {foundingMarketTarget.outreachPrinciples.map((principle) => (
              <div key={principle} className="rounded-xl border border-white/8 bg-white/[0.025] px-4 py-3 text-sm leading-6 text-slate-300">
                {principle}
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
