import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getStoreProduct, storeProducts } from "@/lib/storeCatalog";

const publicDescriptions = {
  Monitoring:
    "Proposed monitoring engagement. Coverage hours, telemetry, staffing, alert delivery, escalation, response targets, providers, and reporting are confirmed only through a signed service scope.",
  Assessments:
    "Proposed assessment engagement. Authorization, systems in scope, testing limits, evidence handling, deliverables, timing, and final price require written confirmation.",
  Compliance:
    "Proposed readiness-support engagement. Framework scope, evidence access, deliverables, limitations, and qualified legal or accredited audit support are confirmed before acceptance.",
  Consultations:
    "Proposed advisory engagement. Advisor availability, subject matter, duration, deliverables, limitations, and final price require written confirmation.",
} as const;

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return storeProducts.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getStoreProduct(slug);

  if (!product) return { title: "Catalogue Item Not Found" };

  return {
    title: product.name,
    description: publicDescriptions[product.category],
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getStoreProduct(slug);
  if (!product) notFound();

  const requestHref = `/store/products/${encodeURIComponent(product.slug)}/request`;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-amber-400/30 bg-amber-400/10 px-4 py-4 text-amber-100">
        <div className="container mx-auto flex max-w-7xl items-start gap-3 px-2 text-sm leading-6">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" aria-hidden="true" />
          <p>
            <strong>Request-only catalogue item:</strong> this page does not confirm current
            availability, provider coverage, licensing, checkout readiness, price, fulfillment,
            subscription activation, inventory, SLA, refund terms, or a guaranteed outcome.
          </p>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#07101c]">
        <div className="container mx-auto max-w-7xl px-6 py-8">
          <Link href="/store" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-200">
            <ArrowLeft className="h-4 w-4" /> Back to GEM catalogue
          </Link>
        </div>
      </section>

      <section className="container mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-24">
        <div>
          <div className="mb-5 flex flex-wrap gap-2">
            <Badge className="rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
              {product.category}
            </Badge>
            <Badge className="rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-200">
              Scope required
            </Badge>
          </div>
          <h1 className="text-5xl font-black leading-tight text-white md:text-6xl">{product.name}</h1>
          <p className="mt-6 text-xl leading-relaxed text-slate-300">
            {publicDescriptions[product.category]}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-center gap-2 text-sm uppercase tracking-widest text-slate-500">
                <ShieldCheck className="h-4 w-4 text-cyan-400" /> Delivery
              </div>
              <div className="mt-3 font-semibold text-white">Confirmed after operational review</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-center gap-2 text-sm uppercase tracking-widest text-slate-500">
                <Clock3 className="h-4 w-4 text-cyan-400" /> Timing
              </div>
              <div className="mt-3 font-semibold text-white">Confirmed in the approved scope</div>
            </div>
          </div>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <Button asChild size="lg" className="rounded-full bg-cyan-400 px-8 font-semibold text-black hover:bg-cyan-300">
              <Link href={requestHref}>
                Request Availability Review <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full border-white/20 px-8 text-white hover:bg-white/10">
              <Link href="/services">Review Service Limitations</Link>
            </Button>
          </div>

          <p className="mt-5 flex items-start gap-2 text-sm leading-relaxed text-slate-500">
            <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
            No payment or external checkout should be used until GEM confirms the seller,
            provider, final price, scope, terms, and fulfillment path in writing.
          </p>
        </div>

        <div className="relative min-h-[420px] overflow-hidden rounded-3xl border border-cyan-500/20 bg-white/[0.03] shadow-2xl shadow-cyan-950/30">
          <Image
            src={product.image}
            alt={`Illustrative catalogue image for ${product.name}`}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07101c] via-[#07101c]/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-7">
            <div className="rounded-2xl border border-white/10 bg-[#07101c]/80 p-5 backdrop-blur-xl">
              <div className="text-xs uppercase tracking-[0.2em] text-cyan-300">Catalogue status</div>
              <div className="mt-2 text-lg font-bold text-white">Enquiry and verification required</div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.02] py-20">
        <div className="container mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-black text-white">What GEM must confirm</h2>
            <div className="mt-7 grid gap-4">
              {[
                "Operational provider and accountable service owner",
                "Exact scope, deliverables, exclusions, and dependencies",
                "Final price, taxes, billing, cancellation, and refund terms",
                "Data handling, security, retention, and access requirements",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-xl border border-white/10 bg-background/50 p-4 text-slate-300">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-cyan-400" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-black text-white">What the customer must provide</h2>
            <div className="mt-7 grid gap-4">
              {[
                "Contact details and the intended business outcome",
                "Evidence of authority over systems, accounts, or assets in scope",
                "Relevant jurisdiction, timing, environment, and current constraints",
                "Acceptance of the final written proposal and service terms",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-xl border border-white/10 bg-background/50 p-4 text-slate-300">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-cyan-400" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-4xl px-6 py-24 text-center">
        <h2 className="text-4xl font-black text-white">Request a written scope</h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-400">
          GEM will confirm whether the requested offering can be delivered and provide the
          applicable terms before any payment, sensitive-data transfer, or activation.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Button asChild size="lg" className="rounded-full bg-cyan-400 px-8 font-semibold text-black hover:bg-cyan-300">
            <Link href={requestHref}>Submit Product Request</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full border-white/20 px-8 text-white hover:bg-white/10">
            <Link href="/store">Browse Other Catalogue Items</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
