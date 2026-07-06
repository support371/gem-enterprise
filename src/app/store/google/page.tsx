import type { Metadata } from "next";
import Link from "next/link";
import { Activity, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StorefrontPage } from "@/components/store/StorefrontPage";

const GOOGLE_STORE_URL = "https://crystal-kinetic-cart-flow.base44.app/";

export const metadata: Metadata = {
  title: "Live Google Store | GEM Enterprise",
  description:
    "Browse GEM products prepared for Google Merchant Center and continue to the connected live storefront for shopping and checkout.",
};

export default function GoogleStorePage() {
  return (
    <>
      <StorefrontPage
        storefront="google"
        eyebrow="Connected Google commerce storefront"
        title="Shop GEM products through the connected Google Store"
        description="Browse GEM's Merchant-ready catalog, then continue to the connected live storefront for product selection, cart management, and checkout."
        status="Connected"
        externalUrl={GOOGLE_STORE_URL}
        externalLabel="Open Live Google Store"
      />
      <section className="border-t border-white/10 bg-[#07101c] py-14">
        <div className="container mx-auto grid max-w-7xl gap-6 px-6 lg:grid-cols-2">
          <article className="rounded-3xl border border-white/10 bg-white/[0.025] p-7">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-cyan-300">
              <ShieldCheck className="h-5 w-5" /> Phase 3 readiness
            </div>
            <h2 className="mt-3 text-3xl font-black text-white">
              Validate products before submission
            </h2>
            <p className="mt-3 leading-relaxed text-slate-400">
              Review eligible physical products, duplicate identifiers, missing checkout links, image validation, and other catalogue blockers without Google Cloud billing.
            </p>
            <Button asChild size="lg" className="mt-6 rounded-full bg-cyan-400 px-7 font-semibold text-black hover:bg-cyan-300">
              <Link href="/store/google/readiness">
                Open readiness dashboard <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/[0.025] p-7">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-cyan-300">
              <Activity className="h-5 w-5" /> Phase 4 activation
            </div>
            <h2 className="mt-3 text-3xl font-black text-white">
              Verify the hosted feed before handoff
            </h2>
            <p className="mt-3 leading-relaxed text-slate-400">
              Probe the XML endpoint, validate its RSS structure and Google namespace, detect missing required fields and duplicate feed IDs, and block Merchant Center activation until the catalogue and feed are both healthy.
            </p>
            <Button asChild size="lg" variant="outline" className="mt-6 rounded-full border-cyan-400/40 px-7 text-cyan-200 hover:bg-cyan-400/10">
              <Link href="/store/google/operations">
                Open activation dashboard <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </article>
        </div>
      </section>
    </>
  );
}
