import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Bot, LockKeyhole, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Launch TokMetric Application",
  description: "Open the native TokMetric operations workspace inside GEM Enterprise Command Center.",
  alternates: { canonical: "/tokmetric/app" },
};

export default function TokMetricAppGatewayPage() {
  return (
    <div className="min-h-screen bg-[#091019] text-white">
      <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <Link href="/tokmetric" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-cyan-300">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to TokMetric
        </Link>

        <section className="mt-8 overflow-hidden rounded-3xl border border-white/[0.1] bg-white/[0.03]">
          <div className="border-b border-white/[0.08] bg-[radial-gradient(circle_at_top_right,rgba(0,216,230,0.18),transparent_42%)] p-8 sm:p-12">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10">
              <ShieldCheck className="h-6 w-6 text-cyan-300" aria-hidden="true" />
            </div>

            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">
              GEM Enterprise Command Center Module
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              Open TikTok Operations in the Command Center
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-white/60">
              TokMetric is already built into the GEM Enterprise repository. Its account connections,
              content workflows, compliance controls, approvals, publishing preparation, analytics,
              specialized agents, and Custom GPT Actions are now accessed from one controlled Command Center entry point.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/app/command-center/tokmetric" className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-300 px-6 py-3.5 font-semibold text-[#071019] transition hover:bg-cyan-200">
                Open TikTok Operations
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/tokmetric/agents" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-6 py-3.5 font-semibold text-white/80 transition hover:bg-white/[0.06]">
                View Specialized Agents
                <Bot className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="grid gap-4 p-6 sm:grid-cols-2 sm:p-8">
            <div className="rounded-2xl border border-white/[0.08] bg-[#0b121c] p-5">
              <div className="flex items-center gap-2 font-semibold">
                <LockKeyhole className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                Canonical application location
              </div>
              <p className="mt-3 break-all font-mono text-xs leading-6 text-white/50">
                https://gemcybersecurityassist.com/app/command-center/tokmetric
              </p>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-[#0b121c] p-5">
              <div className="flex items-center gap-2 font-semibold">
                <ShieldCheck className="h-4 w-4 text-cyan-300" aria-hidden="true" />
                Authorization control
              </div>
              <p className="mt-3 text-sm leading-6 text-white/50">
                TikTok OAuth, scopes, compliance review, exact-version approval, emergency controls, and platform confirmation remain required before external operations can succeed.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2">
          <Link href="/tokmetric/privacy-policy" className="rounded-2xl border border-white/[0.1] bg-white/[0.03] p-5 font-semibold transition hover:border-cyan-300/30 hover:bg-cyan-300/[0.05]">
            TokMetric Privacy Policy
          </Link>
          <Link href="/tokmetric/terms-of-service" className="rounded-2xl border border-white/[0.1] bg-white/[0.03] p-5 font-semibold transition hover:border-cyan-300/30 hover:bg-cyan-300/[0.05]">
            TokMetric Terms of Service
          </Link>
        </section>
      </main>
    </div>
  );
}
