import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  FileCheck2,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { storefrontProducts } from "@/lib/storefrontCatalog";
import { probeGoogleMerchantFeed } from "@/lib/googleMerchantFeedHealth";
import {
  evaluateGoogleMerchantReadiness,
  GOOGLE_MERCHANT_ACCOUNT_ID,
  GOOGLE_MERCHANT_DATASOURCE_ID,
  resolveGoogleMerchantFeedUrl,
} from "@/lib/googleMerchantReadiness";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Google Merchant Activation | GEM Enterprise",
  description:
    "Phase 4 hosted-feed health verification and Merchant Center activation controls.",
};

export default async function GoogleMerchantOperationsPage() {
  const feedUrl = resolveGoogleMerchantFeedUrl();
  const [feedHealth, readiness] = await Promise.all([
    probeGoogleMerchantFeed(feedUrl),
    Promise.resolve(evaluateGoogleMerchantReadiness(storefrontProducts)),
  ]);
  const activationReady = feedHealth.ok && readiness.readyForSubmission;
  const accountId = process.env.GOOGLE_MERCHANT_ACCOUNT_ID || GOOGLE_MERCHANT_ACCOUNT_ID;
  const dataSourceId =
    process.env.GOOGLE_MERCHANT_DATASOURCE_ID || GOOGLE_MERCHANT_DATASOURCE_ID;

  const checks = [
    {
      label: "Hosted XML feed responds successfully",
      passed: feedHealth.reachable && feedHealth.statusCode === 200,
    },
    {
      label: "Feed returns an XML content type",
      passed: feedHealth.contentType ? /xml/i.test(feedHealth.contentType) : false,
    },
    {
      label: "RSS and Google namespace validation passes",
      passed: feedHealth.validation.valid,
    },
    {
      label: "Catalogue has eligible physical products",
      passed: readiness.eligibleProducts > 0,
    },
    {
      label: "No duplicate catalogue IDs or SKUs",
      passed: readiness.duplicateIds.length === 0 && readiness.duplicateSkus.length === 0,
    },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-white/10 bg-[#07101c]">
        <div className="container mx-auto max-w-7xl px-6 py-6">
          <Link
            href="/store/google"
            className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-200"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Google Merchant Store
          </Link>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#07101c] py-16 md:py-20">
        <div className="container mx-auto max-w-7xl px-6">
          <Badge className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-cyan-300">
            Phase 4 · Activation and feed health
          </Badge>
          <div className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
            <div>
              <h1 className="text-4xl font-black leading-tight text-white md:text-6xl">
                Merchant Center activation gate
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-relaxed text-slate-300">
                Phase 4 verifies that the hosted XML feed is reachable, structurally valid, and backed by a submission-ready physical-product catalogue before the URL is entered into Google Merchant Center.
              </p>
            </div>
            <aside
              className={`rounded-3xl border p-6 ${
                activationReady
                  ? "border-emerald-500/30 bg-emerald-500/10"
                  : "border-amber-500/30 bg-amber-500/10"
              }`}
            >
              <div className="flex items-start gap-4">
                {activationReady ? (
                  <CheckCircle2 className="mt-1 h-7 w-7 shrink-0 text-emerald-300" />
                ) : (
                  <AlertTriangle className="mt-1 h-7 w-7 shrink-0 text-amber-300" />
                )}
                <div>
                  <div className="text-sm font-semibold uppercase tracking-widest text-slate-300">
                    Activation gate
                  </div>
                  <div className="mt-2 text-2xl font-black text-white">
                    {activationReady ? "Ready for Merchant Center handoff" : "Not ready for submission"}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-300">
                    The URL should be added to Merchant Center only when every required check passes.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Feed reachable", value: feedHealth.reachable ? "Yes" : "No", icon: Activity },
            { label: "HTTP status", value: feedHealth.statusCode ?? "—", icon: RefreshCw },
            { label: "Feed items", value: feedHealth.validation.itemCount, icon: FileCheck2 },
            { label: "Eligible products", value: readiness.eligibleProducts, icon: ShieldCheck },
          ].map(({ label, value, icon: Icon }) => (
            <article key={label} className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <Icon className="h-5 w-5 text-cyan-300" />
              <div className="mt-5 text-3xl font-black text-white">{value}</div>
              <div className="mt-2 text-sm text-slate-400">{label}</div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.02] py-14">
        <div className="container mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-2">
          <article className="rounded-3xl border border-white/10 bg-black/10 p-6">
            <h2 className="text-2xl font-black text-white">Activation checklist</h2>
            <div className="mt-6 space-y-3">
              {checks.map((check) => (
                <div key={check.label} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                  {check.passed ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
                  ) : (
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
                  )}
                  <span className="text-sm text-slate-300">{check.label}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-3xl border border-white/10 bg-black/10 p-6">
            <h2 className="text-2xl font-black text-white">Merchant Center handoff</h2>
            <dl className="mt-6 space-y-4 text-sm">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <dt className="text-slate-500">Merchant account ID</dt>
                <dd className="mt-1 font-mono text-white">{accountId}</dd>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <dt className="text-slate-500">Existing API data source ID</dt>
                <dd className="mt-1 font-mono text-white">{dataSourceId}</dd>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <dt className="text-slate-500">Hosted XML source URL</dt>
                <dd className="mt-1 break-all font-mono text-cyan-200">{feedUrl}</dd>
              </div>
            </dl>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="bg-cyan-400 font-semibold text-black hover:bg-cyan-300">
                <a href={feedUrl} target="_blank" rel="noreferrer">
                  Open feed <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <a href="/api/google-merchant/activation-status" target="_blank" rel="noreferrer">
                  Open activation JSON
                </a>
              </Button>
            </div>
          </article>
        </div>
      </section>

      {feedHealth.issues.length > 0 && (
        <section className="container mx-auto max-w-7xl px-6 py-14">
          <div className="rounded-3xl border border-amber-500/20 bg-amber-500/10 p-6">
            <h2 className="text-2xl font-black text-white">Feed blockers</h2>
            <div className="mt-5 space-y-3">
              {feedHealth.issues.map((issue, index) => (
                <div key={`${issue.code}-${index}`} className="rounded-2xl border border-amber-500/20 bg-black/20 p-4 text-sm text-amber-100">
                  <span className="font-mono text-amber-300">{issue.code}</span>: {issue.message}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
