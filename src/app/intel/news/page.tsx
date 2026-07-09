"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, ExternalLink, Rss } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CuratedNewsFeed,
  type CuratedCategory,
} from "@/components/intel/CuratedNewsFeed";

const CATEGORIES: CuratedCategory[] = [
  { label: "Crypto & Digital Assets", slug: "crypto" },
  { label: "Cybersecurity", slug: "cybersecurity" },
  { label: "Markets & Capital", slug: "markets" },
  { label: "Geopolitics", slug: "geopolitics" },
  { label: "Policy & Regulation", slug: "policy" },
  { label: "Real Estate", slug: "real-estate" },
];

export default function IntelNewsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-amber-400/30 bg-amber-400/10 px-4 py-4 text-amber-100">
        <div className="container mx-auto flex max-w-6xl items-start gap-3 px-2 text-sm leading-6">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" aria-hidden="true" />
          <p>
            <strong>News aggregation preview:</strong> articles may be imported from external
            sources and can be delayed, incomplete, duplicated, or unavailable. Publication on
            this page does not mean GEM independently verified, endorsed, or authored a story.
            Always open the original publisher before relying on the information.
          </p>
        </div>
      </section>

      <section className="border-b border-border cyber-grid">
        <div className="container mx-auto max-w-6xl px-6 py-16 md:py-20">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <Badge className="mb-4 border-primary/30 bg-primary/10 font-mono text-xs tracking-widest text-primary">
                <Rss className="mr-1.5 h-3 w-3" /> SOURCED NEWS PREVIEW
              </Badge>
              <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
                GEM Intel <span className="text-gradient-primary">News</span>
              </h1>
              <p className="text-lg leading-relaxed text-muted-foreground">
                A category view of externally sourced articles. Feed status, source coverage,
                retrieval time, and editorial review must be confirmed before this service is
                described as continuous or analyst-curated.
              </p>
            </div>
            <Button asChild variant="outline" className="shrink-0 border-border/60">
              <Link href="/contact?subject=intelligence">
                Ask about intelligence services <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-6xl px-6 py-10">
        <CuratedNewsFeed categories={CATEGORIES} initialCategory="crypto" />
      </section>

      <section className="border-t border-border py-12">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-xl font-semibold text-foreground">Reliance notice</h2>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-muted-foreground">
              News content is informational and may become stale. It is not a security alert,
              investment recommendation, legal opinion, incident notification, or substitute
              for an authoritative advisory. Source links should open the original publisher in
              a separate context before any operational decision is made.
            </p>
            <Link
              href="/intel"
              className="mt-5 inline-flex items-center font-semibold text-primary hover:underline"
            >
              Return to the intelligence preview <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
