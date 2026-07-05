import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Video } from "lucide-react";
import { TokMetricVideoPublisher } from "@/components/tokmetric/TokMetricVideoPublisher";

export const metadata: Metadata = {
  title: "TokMetric Video Publishing",
  description:
    "Governed TikTok video publishing with creator settings, explicit consent, direct file transfer, status polling, and platform confirmation.",
  alternates: { canonical: "/tokmetric/publishing" },
};

export default function Page() {
  return (
    <main className="min-h-screen bg-[#091019] text-white">
      <header className="border-b border-white/[0.08] bg-[#0b121d]">
        <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/tokmetric/dashboard"
            className="inline-flex items-center gap-2 text-sm text-white/45 transition hover:text-cyan-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to TokMetric dashboard
          </Link>

          <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/[0.08] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                <Video className="h-4 w-4" />
                TikTok Content Posting API
              </div>
              <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl">
                Governed TikTok video publishing
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-white/55">
                This operational page queries the connected creator, displays TikTok-provided privacy and interaction settings, requires explicit consent and rights confirmation, uploads the selected video, and tracks TikTok processing to a final status.
              </p>
            </div>

            <aside className="max-w-sm rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.06] p-4 text-sm text-emerald-50/75">
              <div className="mb-2 flex items-center gap-2 font-semibold text-emerald-100">
                <ShieldCheck className="h-4 w-4" />
                Review-safe operation
              </div>
              No TikTok password is collected. External posting remains blocked unless OAuth, the required scope, an approved content version, workspace permissions, and the explicit publishing gate are all active.
            </aside>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-screen-xl px-4 py-10 sm:px-6 lg:px-8">
        <TokMetricVideoPublisher />
      </section>
    </main>
  );
}
