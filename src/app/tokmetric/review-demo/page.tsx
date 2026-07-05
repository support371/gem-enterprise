import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  CircleDashed,
  ClipboardCheck,
  DatabaseZap,
  FileCheck2,
  History,
  KeyRound,
  LockKeyhole,
  PlayCircle,
  ShieldCheck,
  UploadCloud,
  UsersRound,
  Video,
} from "lucide-react";

export const metadata: Metadata = {
  title: "TokMetric App Review Demo",
  description:
    "A review-ready TokMetric workspace that demonstrates authorized TikTok content operations without claiming live platform access before OAuth approval.",
  alternates: { canonical: "/tokmetric/review-demo" },
};

const readiness = [
  ["Verified GEM website domain", "READY"],
  ["Public TokMetric landing page", "READY"],
  ["Public Privacy Policy", "READY"],
  ["Public Terms of Service", "READY"],
  ["TikTok OAuth client", "PENDING"],
  ["Production scopes", "PENDING"],
  ["Direct posting approval", "PENDING"],
  ["Sandbox demo recording", "PENDING"],
];

const workflow = [
  {
    icon: KeyRound,
    title: "1. Authorize TikTok account",
    status: "Authorization required",
    text: "Users connect only through official OAuth. TokMetric never asks for TikTok passwords, browser cookies, or session tokens.",
  },
  {
    icon: CalendarDays,
    title: "2. Create campaign and content draft",
    status: "Demo-ready",
    text: "Operators prepare campaign goals, content scripts, media references, captions, hashtags, and publishing settings.",
  },
  {
    icon: FileCheck2,
    title: "3. Run compliance review",
    status: "Demo-ready",
    text: "The workflow checks commercial disclosure, content ownership, policy rules, privacy settings, and required changes.",
  },
  {
    icon: UsersRound,
    title: "4. Request human approval",
    status: "Demo-ready",
    text: "Approval applies to the exact content version and hash. Changes require a fresh approval decision.",
  },
  {
    icon: UploadCloud,
    title: "5. Create publishing job",
    status: "Blocked until OAuth",
    text: "Publishing jobs remain blocked until a connector is authorized, scopes are present, approval is valid, and emergency lock is off.",
  },
  {
    icon: BarChart3,
    title: "6. Review analytics and audit history",
    status: "Source-labeled",
    text: "Analytics must be labeled as live, imported, manual, seeded, calculated, or unknown. Audit events preserve the workflow trail.",
  },
];

const demoContent = [
  {
    title: "Enterprise awareness video",
    type: "Video draft",
    state: "DRAFT",
    owner: "Content Manager",
    compliance: "NOT_REVIEWED",
  },
  {
    title: "Compliance-first content operations",
    type: "Script package",
    state: "APPROVAL_REQUIRED",
    owner: "Reviewer",
    compliance: "PASS_WITH_DISCLOSURE",
  },
  {
    title: "TokMetric product explainer",
    type: "Review video",
    state: "SCHEDULED_INTERNAL",
    owner: "Publisher",
    compliance: "HUMAN_REVIEW_REQUIRED",
  },
];

const auditEvents = [
  "Workspace opened for app review demonstration",
  "Privacy Policy and Terms routes confirmed as public pages",
  "OAuth connector marked authorization required",
  "Publishing controls blocked until platform confirmation is available",
  "Human approval requirement displayed for external write actions",
];

function StatusBadge({ value }: { value: string }) {
  const ready = value === "READY" || value === "Demo-ready" || value === "PASS_WITH_DISCLOSURE";
  const blocked = value.includes("Blocked") || value === "PENDING" || value === "AUTHORIZATION_REQUIRED";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${
        ready
          ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-200"
          : blocked
            ? "border-amber-300/25 bg-amber-300/10 text-amber-200"
            : "border-white/10 bg-white/[0.04] text-white/50"
      }`}
    >
      {ready ? <CheckCircle2 className="h-3.5 w-3.5" /> : <CircleDashed className="h-3.5 w-3.5" />}
      {value}
    </span>
  );
}

export default function TokMetricReviewDemoPage() {
  return (
    <div className="min-h-screen bg-[#091019] text-white">
      <header className="border-b border-white/[0.08] bg-[#0b121d]">
        <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8">
          <Link href="/tokmetric" className="inline-flex items-center gap-2 text-sm text-white/45 hover:text-cyan-300">
            <ArrowLeft className="h-4 w-4" />
            Back to TokMetric
          </Link>
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                <PlayCircle className="h-4 w-4" />
                TikTok App Review Demo Workspace
              </div>
              <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl">
                Review-ready TokMetric workflow for authorized TikTok operations.
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-white/55">
                This page is built for screen recording. It demonstrates the product flow truthfully while showing which external TikTok capabilities remain pending until OAuth authorization, approved scopes, and platform review are complete.
              </p>
            </div>
            <div className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-4 text-sm text-amber-50/70">
              <div className="mb-2 flex items-center gap-2 font-semibold text-amber-100">
                <AlertTriangle className="h-4 w-4" />
                Review disclosure
              </div>
              No live TikTok account is shown on this public demo page.
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-screen-xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {readiness.map(([label, status]) => (
            <article key={label} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
              <p className="text-sm text-white/65">{label}</p>
              <div className="mt-4"><StatusBadge value={status} /></div>
            </article>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Connector state</p>
                <h2 className="mt-2 text-2xl font-bold">TikTok account connection</h2>
              </div>
              <LockKeyhole className="h-7 w-7 text-white/30" />
            </div>
            <div className="mt-6 rounded-2xl border border-white/[0.08] bg-[#091019] p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-semibold">TikTok Organic Connector</p>
                  <p className="mt-1 text-sm text-white/45">OAuth authorization and scopes required before account actions.</p>
                </div>
                <StatusBadge value="AUTHORIZATION_REQUIRED" />
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Link href="/tokmetric/privacy-policy" className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold hover:bg-white/[0.06]">Privacy Policy</Link>
              <Link href="/tokmetric/terms-of-service" className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold hover:bg-white/[0.06]">Terms of Service</Link>
            </div>
          </article>

          <article className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Content records</p>
            <h2 className="mt-2 text-2xl font-bold">Demo content library</h2>
            <div className="mt-6 overflow-hidden rounded-2xl border border-white/[0.08]">
              {demoContent.map((item) => (
                <div key={item.title} className="grid gap-3 border-b border-white/[0.06] bg-[#091019] p-4 last:border-b-0 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="mt-1 text-xs text-white/40">{item.type} • Owner: {item.owner}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge value={item.state} />
                    <StatusBadge value={item.compliance} />
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="mt-8 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">End-to-end review story</p>
          <h2 className="mt-2 text-2xl font-bold">Record this workflow for the TikTok review video</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {workflow.map(({ icon: Icon, title, status, text }) => (
              <article key={title} className="rounded-2xl border border-white/[0.08] bg-[#091019] p-5">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/10">
                  <Icon className="h-5 w-5 text-cyan-300" />
                </div>
                <h3 className="font-semibold">{title}</h3>
                <div className="mt-3"><StatusBadge value={status} /></div>
                <p className="mt-3 text-sm leading-6 text-white/50">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
            <div className="mb-5 flex items-center gap-3">
              <History className="h-5 w-5 text-cyan-300" />
              <h2 className="text-xl font-bold">Audit history</h2>
            </div>
            <div className="space-y-3">
              {auditEvents.map((event, index) => (
                <div key={event} className="flex gap-3 rounded-xl border border-white/[0.07] bg-[#091019] p-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-xs text-white/60">{index + 1}</span>
                  <p className="text-sm leading-6 text-white/55">{event}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
            <div className="mb-5 flex items-center gap-3">
              <ClipboardCheck className="h-5 w-5 text-cyan-300" />
              <h2 className="text-xl font-bold">Recording checklist</h2>
            </div>
            <ul className="space-y-3 text-sm leading-6 text-white/55">
              <li>1. Open the TokMetric landing page on the verified domain.</li>
              <li>2. Open this app review demo workspace.</li>
              <li>3. Show legal pages and explain they are public.</li>
              <li>4. Show connector state and OAuth requirement.</li>
              <li>5. Show draft, compliance, approval, and blocked publishing controls.</li>
              <li>6. State that live posting requires approved scopes and TikTok confirmation.</li>
            </ul>
            <div className="mt-6 rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.06] p-4">
              <div className="mb-2 flex items-center gap-2 font-semibold text-cyan-100">
                <DatabaseZap className="h-4 w-4" />
                Safe review language
              </div>
              <p className="text-sm leading-6 text-white/60">
                “TokMetric demonstrates the controlled workflow. Live TikTok posting is enabled only after OAuth authorization, scope approval, compliance review, human approval, and platform confirmation.”
              </p>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
