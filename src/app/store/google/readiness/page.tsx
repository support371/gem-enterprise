import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Database,
  ExternalLink,
  FileCode2,
  PackageCheck,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { storefrontProducts } from "@/lib/storefrontCatalog";
import {
  evaluateGoogleMerchantReadiness,
  GOOGLE_MERCHANT_ACCOUNT_ID,
  GOOGLE_MERCHANT_DATASOURCE_ID,
  resolveGoogleMerchantFeedUrl,
  type GoogleMerchantExclusionReason,
} from "@/lib/googleMerchantReadiness";

export const metadata: Metadata = {
  title: "Google Merchant Readiness | GEM Enterprise",
  description:
    "Phase 3 operational readiness dashboard for the GEM Google Merchant Center product feed.",
};

const reasonLabels: Record<GoogleMerchantExclusionReason, string> = {
  not_google_candidate: "Not assigned to Google storefront",
  not_physical_product: "Not a physical retail product",
  duplicate_id: "Duplicate product ID",
  duplicate_sku: "Duplicate SKU",
  missing_id: "Missing product ID",
  missing_sku: "Missing SKU",
  missing_title: "Missing title",
  missing_description: "Missing description",
  invalid_price: "Invalid price",
  missing_image: "Missing image",
  unsafe_image_url: "Image URL is not public HTTPS",
  missing_checkout: "Missing direct checkout",
  unsafe_checkout_url: "Checkout URL is not public HTTPS",
  unsupported_stock_status: "Unsupported stock status",
};

export default function GoogleMerchantReadinessPage() {
  const report = evaluateGoogleMerchantReadiness(storefrontProducts);
  const feedUrl = resolveGoogleMerchantFeedUrl();
  const merchantAccountId =
    process.env.GOOGLE_MERCHANT_ACCOUNT_ID || GOOGLE_MERCHANT_ACCOUNT_ID;
  const dataSourceId =
    process.env.GOOGLE_MERCHANT_DATASOURCE_ID || GOOGLE_MERCHANT_DATASOURCE_ID;
  const candidateProducts = report.products.filter(
    (product) => !product.reasons.includes("not_google_candidate"),
  );
  const exclusionRows = Object.entries(report.exclusionSummary)
    .filter(([reason, count]) => reason !== "not_google_candidate" && count > 0)
    .sort((a, b) => b[1] - a[1]) as [GoogleMerchantExclusionReason, number][];

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
            Phase 3 · Operational readiness
          </Badge>
          <div className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
            <div>
              <h1 className="text-4xl font-black leading-tight text-white md:text-6xl">
                Google Merchant readiness control plane
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-relaxed text-slate-300">
                This dashboard validates the current GEM catalogue before Google Merchant Center fetches the hosted XML feed. It does not use Google Cloud billing, OAuth, or a service account.
              </p>
            </div>
            <aside
              className={`rounded-3xl border p-6 ${
                report.readyForSubmission
                  ? "border-emerald-500/30 bg-emerald-500/10"
                  : "border-amber-500/30 bg-amber-500/10"
              }`}
            >
              <div className="flex items-start gap-4">
                {report.readyForSubmission ? (
                  <CheckCircle2 className="mt-1 h-7 w-7 shrink-0 text-emerald-300" />
                ) : (
                  <AlertTriangle className="mt-1 h-7 w-7 shrink-0 text-amber-300" />
                )}
                <div>
                  <div className="text-sm font-semibold uppercase tracking-widest text-slate-300">
                    Submission status
                  </div>
                  <div className="mt-2 text-2xl font-black text-white">
                    {report.readyForSubmission ? "Ready after phase 2 deployment" : "Blocked by catalogue validation"}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-300">
                    Phase 2 must deploy the hosted XML endpoint. Phase 3 prevents unsupported or incomplete products from being treated as ready.
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
            { label: "Complete catalogue", value: report.totalCatalogProducts, icon: Database },
            { label: "Google candidates", value: report.googleCandidateProducts, icon: FileCode2 },
            { label: "Eligible physical products", value: report.eligibleProducts, icon: PackageCheck },
            { label: "Excluded candidates", value: report.excludedProducts, icon: ShieldCheck },
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
            <h2 className="text-2xl font-black text-white">Merchant connection</h2>
            <dl className="mt-6 space-y-4 text-sm">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <dt className="text-slate-500">Merchant Center account ID</dt>
                <dd className="mt-1 break-all font-mono text-white">{merchantAccountId}</dd>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <dt className="text-slate-500">Existing API data source ID</dt>
                <dd className="mt-1 break-all font-mono text-white">{dataSourceId}</dd>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <dt className="text-slate-500">Hosted XML feed expected from phase 2</dt>
                <dd className="mt-1 break-all font-mono text-cyan-200">{feedUrl}</dd>
              </div>
            </dl>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="bg-cyan-400 font-semibold text-black hover:bg-cyan-300">
                <a href={feedUrl} target="_blank" rel="noreferrer">
                  Open expected feed <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <a href="/api/google-merchant/readiness" target="_blank" rel="noreferrer">
                  Open readiness JSON
                </a>
              </Button>
            </div>
          </article>

          <article className="rounded-3xl border border-white/10 bg-black/10 p-6">
            <h2 className="text-2xl font-black text-white">Exclusion breakdown</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              A product can have more than one blocking reason, so these counts may be higher than the number of excluded products.
            </p>
            <div className="mt-6 space-y-3">
              {exclusionRows.length === 0 ? (
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-100">
                  No catalogue exclusions detected.
                </div>
              ) : (
                exclusionRows.map(([reason, count]) => (
                  <div key={reason} className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                    <span className="text-sm text-slate-300">{reasonLabels[reason]}</span>
                    <Badge className="border border-white/10 bg-white/5 text-white">{count}</Badge>
                  </div>
                ))
              )}
            </div>
          </article>
        </div>
      </section>

      <section className="container mx-auto max-w-7xl px-6 py-14">
        <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
          <h2 className="text-2xl font-black text-white">Candidate product audit</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-400">
            Only products assigned to the Google storefront are listed below. Services and digital products remain visible on the GEM website but are not eligible for this physical-product Shopping feed.
          </p>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-slate-500">
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">SKU</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Blocking reasons</th>
                </tr>
              </thead>
              <tbody>
                {candidateProducts.map((product) => (
                  <tr key={`${product.id}:${product.sku}`} className="border-b border-white/5 align-top">
                    <td className="px-4 py-4 font-semibold text-white">{product.name || product.id || "Unnamed product"}</td>
                    <td className="px-4 py-4 font-mono text-slate-300">{product.sku || "—"}</td>
                    <td className="px-4 py-4">
                      <Badge className={product.eligible ? "bg-emerald-500/20 text-emerald-100" : "bg-amber-500/20 text-amber-100"}>
                        {product.eligible ? "Eligible" : "Excluded"}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-slate-400">
                      {product.reasons.length === 0
                        ? "None"
                        : product.reasons.map((reason) => reasonLabels[reason]).join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
