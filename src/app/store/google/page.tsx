import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StorefrontPage } from "@/components/store/StorefrontPage";

export const metadata: Metadata = {
  title: "Google Merchant Store | GEM Enterprise",
  description:
    "Browse GEM products prepared for Google Merchant Center and product-feed distribution.",
};

export default function GoogleStorePage() {
  return (
    <>
      <StorefrontPage storefront="google" />
      <section className="border-t border-white/10 bg-[#07101c] py-14">
        <div className="container mx-auto flex max-w-7xl flex-col gap-6 px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-cyan-300">
              <ShieldCheck className="h-5 w-5" /> Phase 3 readiness
            </div>
            <h2 className="mt-3 text-3xl font-black text-white">
              Validate products before Merchant Center submission
            </h2>
            <p className="mt-3 leading-relaxed text-slate-400">
              Review eligible physical products, duplicate identifiers, missing checkout links, image validation, and other feed blockers without using Google Cloud billing.
            </p>
          </div>
          <Button asChild size="lg" className="rounded-full bg-cyan-400 px-7 font-semibold text-black hover:bg-cyan-300">
            <Link href="/store/google/readiness">
              Open readiness dashboard <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
