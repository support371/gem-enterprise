import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  CircleDashed,
  FileCheck2,
  LockKeyhole,
  Megaphone,
  ShieldCheck,
  UploadCloud,
  UsersRound,
  Video,
} from "lucide-react";

export const metadata: Metadata = {
  title: "TokMetric Workspace",
  description:
    "Public preview of the TokMetric authorized TikTok content operations workspace.",
  alternates: { canonical: "/tokmetric/workspace" },
};

const modules = [
  { icon: Megaphone, label: "Campaigns", value: "0", status: "No active campaign" },
  { icon: Video, label: "Content", value: "0", status: "No approved media" },
  { icon: FileCheck2, label: "Compliance", value: "Pending", status: "Review required before posting" },
  { icon: UsersRound, label: "Approvals", value: "0", status: "No decision recorded" },
];

export default function TokMetricWorkspacePage() {
  return (
    <div className="min-h-screen bg-[#091019] text-white">
      <header className="border-b border-white/[0.08] bg-[#0c141f]">
        <div className="mx-auto flex max-w-screen-xl flex-col gap-5 px-4 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <Link href="/tokmetric" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-cyan-300">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              TokMetric product page
            </Link>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-300/10 ring-1 ring-cyan-300/25">
                <ShieldCheck className="h-5 w-5 text-cyan-300" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-xl font-bold">TokMetric Workspace</h1>
                <p className="text-xs uppercase tracking-[0.2em] text-white/35">GEM Enterprise</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1.5 text-xs font-semibold text-amber-200">
              <CircleDashed className="h-4 w-4" aria-hidden="true" />
              Sandbox preview
            </span>
            <Link href="/request-access" className="rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-[#071019] hover:bg-cyan-200">
              Request access
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-screen-xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="mb-8 rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-5">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" aria-hidden="true" />
            <div>
              <h2 className="font-semibold text-amber-100">No TikTok account is connected in this public preview</h2>
              <p className="mt-1 text-sm leading-6 text-amber-50/60">
                This page demonstrates the TokMetric workspace location and control model. It does not claim account authorization, publication, analytics, or approval until the production TikTok OAuth connection and required scopes are active.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {modules.map(({ icon: Icon, label, value, status }) => (
            <article key={label} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
              <div className="flex items-center justify-between">
                <Icon className="h-5 w-5 text-cyan-300" aria-hidden="true" />
                <span className="text-2xl font-bold">{value}</span>
              </div>
              <h2 className="mt-5 font-semibold">{label}</h2>
              <p className="mt-1 text-xs leading-5 text-white/40">{status}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Connection readiness</p>
                <h2 className="mt-2 text-xl font-bold">TikTok authorization</h2>
              </div>
              <LockKeyhole className="h-6 w-6 text-white/30" aria-hidden="true" />
            </div>

            <div className="mt-6 space-y-3">
              {[
                ["Verified company domain", true],
                ["Public TokMetric product page", true],
                ["Public Privacy Policy", true],
                ["Public Terms of Service", true],
                ["TikTok OAuth client configured", false],
                ["Approved production scopes", false],
                ["End-to-end sandbox demo completed", false],
              ].map(([label, ready]) => (
                <div key={String(label)} className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-[#091019] px-4 py-3">
                  <span className="text-sm text-white/65">{String(label)}</span>
                  {ready ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" aria-label="Ready" />
                  ) : (
                    <CircleDashed className="h-4 w-4 text-amber-300" aria-label="Pending" />
                  )}
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Controlled action</p>
            <h2 className="mt-2 text-xl font-bold">Prepare a publishing workflow</h2>
            <p className="mt-3 text-sm leading-6 text-white/50">
              Real publishing remains unavailable until an authorized account, valid scopes, compliance result, and human approval are present.
            </p>

            <div className="mt-6 space-y-3">
              <button disabled className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white/35">
                <UploadCloud className="h-4 w-4" aria-hidden="true" />
                Upload media
              </button>
              <button disabled className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white/35">
                <FileCheck2 className="h-4 w-4" aria-hidden="true" />
                Run compliance review
              </button>
              <button disabled className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white/35">
                <BarChart3 className="h-4 w-4" aria-hidden="true" />
                View authorized analytics
              </button>
            </div>
          </article>
        </section>

        <section className="mt-8 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
          <h2 className="text-xl font-bold">Public legal and product records</h2>
          <p className="mt-2 text-sm leading-6 text-white/50">
            These pages are hosted under the verified GEM Cybersecurity & Monitoring Assist domain for transparency and platform review.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link href="/tokmetric/privacy-policy" className="rounded-xl border border-white/15 px-4 py-3 text-center text-sm font-semibold hover:bg-white/[0.06]">
              TokMetric Privacy Policy
            </Link>
            <Link href="/tokmetric/terms-of-service" className="rounded-xl border border-white/15 px-4 py-3 text-center text-sm font-semibold hover:bg-white/[0.06]">
              TokMetric Terms of Service
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
