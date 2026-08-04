import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  FileCheck2,
  KeyRound,
  LockKeyhole,
  PlayCircle,
  ShieldCheck,
  UploadCloud,
  UserCheck,
  Video,
} from "lucide-react";

export const metadata: Metadata = {
  title: "TikTok App Review | TokMetric | GEM Enterprise",
  description:
    "Controlled reviewer entry point for the real TokMetric TikTok OAuth, approval, sandbox publishing, status, and legal-information flow.",
  alternates: { canonical: "/tokmetric/app-review" },
  robots: { index: false, follow: false, nocache: true },
};

const WORKSPACE_ID = "ws_60488340ded94dcfab3b875ef9ae591c";
const OAUTH_START = `/api/tokmetric/oauth/start?workspaceId=${WORKSPACE_ID}&provider=TIKTOK_CONTENT_POSTING_API`;

const liveSteps = [
  {
    number: "01",
    title: "Open the verified GEM application",
    detail:
      "Begin on the production GEM domain, open this reviewer entry point, and sign in with the supplied review account.",
    href: "/client-login",
    action: "Open sign-in",
    icon: ShieldCheck,
  },
  {
    number: "02",
    title: "Connect the TikTok sandbox account",
    detail:
      "Use the real Content Posting connector. The application redirects to TikTok OAuth and never requests a TikTok password.",
    href: OAUTH_START,
    action: "Start real OAuth",
    icon: KeyRound,
  },
  {
    number: "03",
    title: "Verify the connected creator",
    detail:
      "Return to the Accounts page and confirm the provider, external account identifier, granted scopes, state, and token health.",
    href: "/tokmetric/accounts",
    action: "Open Accounts",
    icon: UserCheck,
  },
  {
    number: "04",
    title: "Select the exact content version",
    detail:
      "Open Content Studio and select the approved video record. The caption, media, disclosures, and publishing settings remain version-bound.",
    href: "/tokmetric/content-studio",
    action: "Open Content Studio",
    icon: Video,
  },
  {
    number: "05",
    title: "Show compliance and human approval",
    detail:
      "Demonstrate the policy review and approval decision for the exact content version and object hash before publishing is allowed.",
    href: "/tokmetric/compliance",
    action: "Open Compliance",
    icon: FileCheck2,
  },
  {
    number: "06",
    title: "Open the governed publishing screen",
    detail:
      "Query TikTok creator settings, choose a returned privacy option, review interaction settings, confirm rights, and select the local video.",
    href: "/tokmetric/publishing",
    action: "Open Publishing",
    icon: UploadCloud,
  },
  {
    number: "07",
    title: "Submit one private sandbox post",
    detail:
      "For review, use SELF_ONLY and explicitly click the final send control. Do not describe an internal queued job as a published TikTok post.",
    href: "/tokmetric/publishing",
    action: "Run sandbox preflight",
    icon: PlayCircle,
  },
  {
    number: "08",
    title: "Verify the external result and audit trail",
    detail:
      "Wait for TikTok processing, show the returned status or publish identifier, then display analytics, audit history, and disconnect controls.",
    href: "/tokmetric/analytics",
    action: "Open Analytics",
    icon: BadgeCheck,
  },
];

const routeChecks = [
  ["Reviewer entry", "/tokmetric/app-review", "Public, no-index, truthful navigation"],
  ["Accounts and OAuth", "/tokmetric/accounts", "Real connector state; no credentials returned"],
  ["Content Studio", "/tokmetric/content-studio", "Exact media and caption version"],
  ["Compliance", "/tokmetric/compliance", "Policy findings and required disclosures"],
  ["Approvals", "/tokmetric/approvals", "Human decision bound to exact version/hash"],
  ["Publishing", "/tokmetric/publishing", "Creator settings, consent, upload, status polling"],
  ["Analytics", "/tokmetric/analytics", "Source-labelled external results"],
  ["Privacy Policy", "/tokmetric/privacy-policy", "Public legal information"],
  ["Terms of Service", "/tokmetric/terms-of-service", "Public legal information"],
];

const conceptMapping = [
  ["Connect Channel", "Accounts page and real TikTok OAuth redirect"],
  ["TikTok consent", "TikTok-hosted authorization screen, not a GEM imitation"],
  ["Connected integration", "Database-backed connector state and granted scopes"],
  ["Select content", "Content Studio exact-version record"],
  ["Post preview", "Publishing page with creator-returned settings and disclosures"],
  ["Published confirmation", "Shown only after TikTok returns a confirmed result"],
];

export default function TokMetricAppReviewPage() {
  return (
    <div className="min-h-screen bg-[#081019] text-white">
      <header className="border-b border-white/[0.08] bg-[#0b131e]">
        <div className="mx-auto max-w-screen-xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/tokmetric"
              className="text-sm font-semibold text-white/55 transition hover:text-cyan-300"
            >
              TokMetric product page
            </Link>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/[0.08] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200">
              <CheckCircle2 className="h-4 w-4" />
              Production reviewer route
            </div>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
                TikTok Login Kit + Content Posting API
              </p>
              <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl">
                Real reviewer navigation from OAuth consent to verified sandbox outcome.
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-white/60">
                The supplied animation is used as a visual storyboard. This page routes the reviewer through the actual GEM application, official TikTok OAuth, exact-version approval controls, the governed publishing screen, and externally confirmed status.
              </p>
            </div>

            <aside className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-5 text-sm leading-6 text-amber-50/75">
              <div className="mb-2 flex items-center gap-2 font-semibold text-amber-100">
                <LockKeyhole className="h-4 w-4" />
                Truthful review boundary
              </div>
              This page does not simulate a connected account or successful publication. Those states appear only after real OAuth and TikTok platform confirmation.
            </aside>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/client-login"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 font-bold text-[#06111b] transition hover:bg-cyan-200"
            >
              Start reviewer sign-in <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/tokmetric/dashboard"
              className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.04] px-5 py-3 font-semibold text-white/80 transition hover:bg-white/[0.08]"
            >
              Open operations dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-screen-xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-cyan-300/20 bg-cyan-300/[0.05] p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                Review configuration
              </p>
              <h2 className="mt-2 text-2xl font-bold">One controlled production workspace</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-white/55">
                The reviewer flow uses the existing TokMetric production workspace while TikTok authorization and the test post remain sandbox-scoped. Secrets and provider tokens stay in managed server-side storage.
              </p>
            </div>
            <dl className="grid gap-2 text-sm sm:min-w-[360px]">
              <div className="flex justify-between gap-5 rounded-xl border border-white/10 bg-black/15 px-4 py-3">
                <dt className="text-white/45">Workspace ID</dt>
                <dd className="font-mono text-xs text-white/80">{WORKSPACE_ID}</dd>
              </div>
              <div className="flex justify-between gap-5 rounded-xl border border-white/10 bg-black/15 px-4 py-3">
                <dt className="text-white/45">Required scopes</dt>
                <dd className="text-right text-white/80">user.info.basic, video.publish</dd>
              </div>
              <div className="flex justify-between gap-5 rounded-xl border border-white/10 bg-black/15 px-4 py-3">
                <dt className="text-white/45">Review privacy</dt>
                <dd className="text-white/80">SELF_ONLY</dd>
              </div>
            </dl>
          </div>
        </section>

        <section>
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
              End-to-end reviewer path
            </p>
            <h2 className="mt-2 text-3xl font-bold">Follow these real application steps in order</h2>
            <p className="mt-3 text-sm leading-7 text-white/55">
              The recording should capture real clicks, the production domain, TikTok-hosted OAuth, the authorized account, the exact content version, and the final platform status.
            </p>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-2">
            {liveSteps.map(({ number, title, detail, href, action, icon: Icon }) => (
              <article
                key={number}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/10">
                    <Icon className="h-5 w-5 text-cyan-300" />
                  </div>
                  <span className="font-mono text-sm text-white/25">{number}</span>
                </div>
                <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/50">{detail}</p>
                <Link
                  href={href}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-200"
                >
                  {action} <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
            <div className="mb-5 flex items-center gap-3">
              <Video className="h-5 w-5 text-cyan-300" />
              <h2 className="text-xl font-bold">Animation-to-live-flow mapping</h2>
            </div>
            <div className="space-y-3">
              {conceptMapping.map(([scene, live]) => (
                <div
                  key={scene}
                  className="grid gap-2 rounded-xl border border-white/[0.07] bg-black/15 p-4 sm:grid-cols-[150px_1fr]"
                >
                  <strong className="text-sm text-white/80">{scene}</strong>
                  <span className="text-sm leading-6 text-white/50">{live}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
            <div className="mb-5 flex items-center gap-3">
              <ClipboardCheck className="h-5 w-5 text-cyan-300" />
              <h2 className="text-xl font-bold">Reviewer evidence checklist</h2>
            </div>
            <ul className="space-y-3 text-sm leading-6 text-white/55">
              <li>• The browser address bar shows the verified GEM HTTPS domain.</li>
              <li>• TikTok hosts the OAuth consent screen.</li>
              <li>• The connected account shows the approved provider and scopes.</li>
              <li>• Compliance and approval apply to the exact selected version.</li>
              <li>• The publishing form uses settings returned for the connected creator.</li>
              <li>• The sandbox post uses SELF_ONLY visibility.</li>
              <li>• Success is shown only after a TikTok status or publish identifier is returned.</li>
              <li>• Privacy Policy, Terms of Service, audit history, and disconnect are visible.</li>
            </ul>
          </article>
        </section>

        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
          <div className="mb-5 flex items-center gap-3">
            <ExternalLink className="h-5 w-5 text-cyan-300" />
            <h2 className="text-xl font-bold">Verified route map</h2>
          </div>
          <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-white/[0.04] text-xs uppercase tracking-[0.14em] text-white/35">
                <tr>
                  <th className="px-4 py-3">Area</th>
                  <th className="px-4 py-3">Route</th>
                  <th className="px-4 py-3">Reviewer purpose</th>
                </tr>
              </thead>
              <tbody>
                {routeChecks.map(([area, route, purpose]) => (
                  <tr key={route} className="border-t border-white/[0.06]">
                    <td className="px-4 py-4 font-semibold text-white/80">{area}</td>
                    <td className="px-4 py-4">
                      <Link href={route} className="font-mono text-xs text-cyan-300 hover:text-cyan-200">
                        {route}
                      </Link>
                    </td>
                    <td className="px-4 py-4 text-white/50">{purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.05] p-6">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="flex items-center gap-2 font-semibold text-emerald-100">
                <BadgeCheck className="h-5 w-5" />
                Review-safe completion rule
              </div>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-white/60">
                The flow is complete only when real OAuth succeeds, the account and scopes are visible, the approved version passes preflight, and TikTok confirms the private sandbox result. Until then, the interface must remain visibly blocked rather than display simulated success.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link
                href="/tokmetric/privacy-policy"
                className="rounded-xl border border-white/15 px-4 py-3 text-center text-sm font-semibold hover:bg-white/[0.06]"
              >
                Privacy Policy
              </Link>
              <Link
                href="/tokmetric/terms-of-service"
                className="rounded-xl border border-white/15 px-4 py-3 text-center text-sm font-semibold hover:bg-white/[0.06]"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
