import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import {
  BusinessReviewIntakeForm,
  type BusinessReviewAttribution,
} from "@/components/market/BusinessReviewIntakeForm";
import { foundingBusinessReviewOffer } from "@/lib/market/launchOffer";

export const metadata: Metadata = {
  title: "Business Security & Operations Review | GEM Enterprise",
  description:
    "Request the founding GEM Business Security & Operations Review: a structured assessment of security, access, operational risk, and immediate priorities.",
};

const reviewAreas = [
  {
    title: "Identity and access",
    text: "Review administrator exposure, MFA posture, account separation, and obvious privilege risks.",
  },
  {
    title: "Internet exposure",
    text: "Review the primary domain, public-facing systems, and visible configuration risks without destructive testing.",
  },
  {
    title: "Business operations",
    text: "Identify fragile processes, single-person dependencies, and operational control gaps.",
  },
  {
    title: "Incident readiness",
    text: "Check whether the organization has a practical response path when security or operational events occur.",
  },
  {
    title: "Data and compliance readiness",
    text: "Identify basic handling and governance gaps that may require deeper specialist work.",
  },
  {
    title: "AI and automation opportunities",
    text: "Identify useful automation opportunities while keeping approval, access, and accountability boundaries intact.",
  },
];

const leadSources = new Set<NonNullable<BusinessReviewAttribution["leadSource"]>>([
  "direct",
  "campaign",
  "referral",
  "social",
  "search",
  "partner",
  "event",
  "outbound",
  "other",
]);

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined, max: number) {
  const source = typeof value === "string" ? value.trim() : "";
  return source ? source.slice(0, max) : undefined;
}

export default async function BusinessReviewPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const requestedLeadSource = first(params.lead ?? params.source, 40);
  const utmSource = first(params.utm_source, 120);
  const utmMedium = first(params.utm_medium, 120);
  const utmCampaign = first(params.utm_campaign, 160);
  const campaignCode = first(params.campaign, 120);
  const leadSource = requestedLeadSource && leadSources.has(requestedLeadSource as NonNullable<BusinessReviewAttribution["leadSource"]>)
    ? (requestedLeadSource as NonNullable<BusinessReviewAttribution["leadSource"]>)
    : campaignCode || utmSource || utmCampaign
      ? "campaign"
      : "direct";
  const attribution: BusinessReviewAttribution = {
    leadSource,
    campaignCode,
    utmSource,
    utmMedium,
    utmCampaign,
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border/60 px-6 py-20 cyber-grid">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-start gap-10 lg:grid-cols-[1.25fr_0.75fr]">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                <Building2 className="h-4 w-4" aria-hidden="true" /> Founding market offer
              </p>
              <h1 className="mt-6 max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl">
                Know what your business should fix first.
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
                {foundingBusinessReviewOffer.promise}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#request-review"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground"
                >
                  Request the review <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
                <Link
                  href="/enterprise/apply"
                  className="inline-flex items-center rounded-xl border border-border px-6 py-3 font-semibold"
                >
                  General enterprise request
                </Link>
              </div>
            </div>

            <aside className="rounded-2xl border border-primary/25 bg-card/80 p-6 shadow-sm">
              <p className="text-sm font-medium text-muted-foreground">Founding review</p>
              <p className="mt-2 text-4xl font-bold">${foundingBusinessReviewOffer.priceUsd}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Controlled initial offer for qualified small and growing businesses. Final acceptance
                remains subject to scope and human review.
              </p>
              <div className="mt-6 space-y-3">
                {foundingBusinessReviewOffer.includes.slice(0, 5).map((item) => (
                  <div key={item} className="flex gap-3 text-sm leading-6">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="mb-8 max-w-3xl">
          <h2 className="text-3xl font-bold">What GEM reviews</h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            The first review is intentionally bounded. It is designed to identify priorities and the
            correct next action, not to disguise unlimited consulting inside a low entry price.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reviewAreas.map((area) => (
            <article key={area.title} className="rounded-2xl border border-border/70 bg-card/70 p-5">
              <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
              <h3 className="mt-4 font-semibold">{area.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{area.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-border/60 bg-card/30">
        <div className="mx-auto grid max-w-6xl gap-5 px-6 py-12 md:grid-cols-3">
          <article className="rounded-2xl border border-border/70 bg-background/70 p-5">
            <ClipboardCheck className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="mt-4 font-semibold">1. Qualify</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              GEM reviews the request for fit, jurisdiction, urgency, and whether this founding scope is appropriate.
            </p>
          </article>
          <article className="rounded-2xl border border-border/70 bg-background/70 p-5">
            <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="mt-4 font-semibold">2. Review</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Accepted businesses move through the structured review and receive prioritized findings and a 30-day action plan.
            </p>
          </article>
          <article className="rounded-2xl border border-border/70 bg-background/70 p-5">
            <LockKeyhole className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="mt-4 font-semibold">3. Decide</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              The customer can fix items internally or request a separate GEM remediation, monitoring, or managed-service scope.
            </p>
          </article>
        </div>
      </section>

      <section id="request-review" className="mx-auto max-w-4xl scroll-mt-24 px-6 py-16">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Start here</p>
          <h2 className="mt-2 text-3xl font-bold">Request your business review</h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            Tell GEM what is happening. The request is automatically attributed to the founding Business Security & Operations Review and enters the governed enterprise qualification queue.
          </p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-card/70 p-6 sm:p-8">
          <BusinessReviewIntakeForm attribution={attribution} />
        </div>
      </section>
    </main>
  );
}
