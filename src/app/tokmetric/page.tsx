import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  FileCheck2,
  LockKeyhole,
  ShieldCheck,
  UsersRound,
  Video,
  Workflow,
} from "lucide-react";

export const metadata: Metadata = {
  title: "TokMetric | Authorized TikTok Content Operations",
  description:
    "TokMetric is GEM Enterprise's controlled workspace for planning, reviewing, approving, publishing, and measuring authorized TikTok content.",
  alternates: {
    canonical: "/tokmetric",
  },
  openGraph: {
    title: "TokMetric | GEM Enterprise",
    description:
      "A controlled TikTok content operations workspace with OAuth authorization, compliance review, human approval, publishing controls, analytics, and audit history.",
    url: "/tokmetric",
    type: "website",
  },
};

const capabilities = [
  {
    icon: Workflow,
    title: "Campaign and content workflows",
    description:
      "Organize campaigns, scripts, captions, media versions, publishing schedules, and operational ownership in one controlled workspace.",
  },
  {
    icon: FileCheck2,
    title: "Compliance before publishing",
    description:
      "Review content, commercial disclosures, ownership, claims, privacy settings, and platform requirements before a publishing request is created.",
  },
  {
    icon: UsersRound,
    title: "Human approval controls",
    description:
      "Sensitive actions remain pending until an authorized reviewer approves the exact content version and settings being submitted.",
  },
  {
    icon: LockKeyhole,
    title: "OAuth-only connections",
    description:
      "TikTok accounts are connected through approved authorization flows. TokMetric does not request TikTok passwords, browser cookies, or login sessions.",
  },
  {
    icon: Video,
    title: "Media and publishing operations",
    description:
      "Prepare video and photo submissions, validate publishing settings, create controlled jobs, and track returned platform status.",
  },
  {
    icon: BarChart3,
    title: "Analytics and audit history",
    description:
      "Review authorized analytics, operational events, approvals, connector health, and publishing history without hiding failed or incomplete actions.",
  },
];

const workflow = [
  "Connect an authorized TikTok account through OAuth.",
  "Create a campaign, script, caption, and media version.",
  "Run policy, commercial-content, and compliance checks.",
  "Request human approval for the exact version and settings.",
  "Create a publishing job only after required approval is valid.",
  "Track processing, publication, analytics, and audit events.",
];

export default function TokMetricPage() {
  return (
    <div className="min-h-screen bg-[#0d121b] text-white">
      <section className="relative overflow-hidden border-b border-white/[0.08]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,216,230,0.16),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(143,82,255,0.12),transparent_34%)]" />
        <div className="relative mx-auto max-w-screen-xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="mb-7 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              GEM Enterprise Product
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/60">
              <BadgeCheck className="h-4 w-4 text-emerald-300" aria-hidden="true" />
              Controlled authorization and approval
            </span>
          </div>

          <div className="max-w-4xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">
              TokMetric
            </p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Authorized TikTok content operations, governed from one enterprise workspace.
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-white/65 sm:text-xl">
              TokMetric helps authorized teams plan, review, approve, publish, and measure TikTok content while preserving platform permissions, human oversight, compliance records, and an auditable history of every action.
            </p>
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/tokmetric/workspace"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-300 px-6 py-3.5 font-semibold text-[#071019] transition hover:bg-cyan-200"
            >
              View TokMetric workspace
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/request-access"
              className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.04] px-6 py-3.5 font-semibold text-white transition hover:border-white/30 hover:bg-white/[0.08]"
            >
              Request authorized access
            </Link>
          </div>

          <p className="mt-5 max-w-3xl text-xs leading-5 text-white/40">
            TokMetric is an independent GEM Enterprise product and is not endorsed by or affiliated with TikTok. TikTok account access remains subject to TikTok authorization, product approval, scopes, policies, and availability.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-screen-xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">Core controls</p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Designed for accountable content operations</h2>
          <p className="mt-4 text-base leading-7 text-white/55">
            The platform separates drafting, compliance, approval, connector access, publishing, and analytics so that an assistant or operator cannot silently bypass required controls.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {capabilities.map(({ icon: Icon, title, description }) => (
            <article key={title} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/10">
                <Icon className="h-5 w-5 text-cyan-300" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/50">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-white/[0.08] bg-white/[0.02]">
        <div className="mx-auto grid max-w-screen-xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">Operating flow</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">From authorization to auditable outcome</h2>
            <p className="mt-5 text-base leading-7 text-white/55">
              A successful external action is recorded only when the connected platform returns a confirmed result. Drafts, pending approvals, rejected reviews, failed jobs, and unavailable connectors remain clearly identified.
            </p>
          </div>

          <ol className="space-y-4">
            {workflow.map((item, index) => (
              <li key={item} className="flex gap-4 rounded-2xl border border-white/[0.08] bg-[#0d121b] p-5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-300 text-sm font-bold text-[#071019]">
                  {index + 1}
                </span>
                <p className="pt-1 text-sm leading-6 text-white/65">{item}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-screen-xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-cyan-300/20 bg-[linear-gradient(135deg,rgba(0,216,230,0.12),rgba(255,255,255,0.025))] p-8 sm:p-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="text-3xl font-bold">Public product and legal information</h2>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-white/60">
                TokMetric’s product page, Privacy Policy, and Terms of Service are hosted directly on the verified GEM Cybersecurity & Monitoring Assist domain for public review and platform verification.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link href="/tokmetric/privacy-policy" className="rounded-xl border border-white/15 px-5 py-3 text-center text-sm font-semibold hover:bg-white/[0.06]">
                Privacy Policy
              </Link>
              <Link href="/tokmetric/terms-of-service" className="rounded-xl border border-white/15 px-5 py-3 text-center text-sm font-semibold hover:bg-white/[0.06]">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
