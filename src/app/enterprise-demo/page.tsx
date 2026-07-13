import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Globe2,
  Home,
  LayoutDashboard,
  Library,
  LockKeyhole,
  MessageSquareText,
  PlayCircle,
  Radar,
  Shield,
  ShoppingBag,
  UsersRound,
  Video,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Enterprise Website & TikTok Demo Flow | GEM Enterprise",
  description:
    "A screen-recording-ready walkthrough that connects the GEM Enterprise public website, authenticated Hub, and TokMetric TikTok review demonstration into one clear narrative.",
  alternates: { canonical: "/enterprise-demo" },
};

const publicPages = [
  {
    step: "01",
    icon: Home,
    title: "Home",
    href: "/",
    url: "gemcybersecurityassist.com",
    purpose: "Introduce GEM Enterprise and establish the controlled-production model.",
    show:
      "Show Defend. Protect. Prevail., the access-controlled platform description, role-based controls, service areas, request-only catalogue, fail-closed activation, and the final access call to action.",
    narration:
      "GEM Enterprise brings cybersecurity, compliance, financial-security coordination, and property-risk services into one controlled platform. Sensitive capabilities activate only after eligibility, scope, provider, jurisdiction, and contractual checks are complete.",
  },
  {
    step: "02",
    icon: Radar,
    title: "Threat Intelligence",
    href: "/intel",
    url: "gemcybersecurityassist.com/intel",
    purpose: "Explain how intelligence is organized and presented.",
    show:
      "Show the threat-intelligence overview, CVE and dark-web categories, exposure-monitoring explanation, advisory cards, affected sectors, and the authenticated-feed boundary.",
    narration:
      "The intelligence page explains how cyber, financial, property, dark-web, vulnerability, and geopolitical information can be organized for review. Public examples must remain clearly identified as illustrative unless they are verified live data.",
  },
  {
    step: "03",
    icon: Shield,
    title: "Services",
    href: "/services",
    url: "gemcybersecurityassist.com/services",
    purpose: "Describe the enterprise service suite and its operating disciplines.",
    show:
      "Show threat monitoring, incident response, dark-web monitoring, red-team testing, asset and physical security, and compliance support. Explain that final coverage and service levels are confirmed in writing.",
    narration:
      "The service suite presents the major disciplines available for qualified engagements. Each service is scoped before activation so staffing, response targets, provider coverage, deliverables, limitations, and fees are not overstated.",
  },
  {
    step: "04",
    icon: ShoppingBag,
    title: "Store & Channel Catalogue",
    href: "/store",
    url: "gemcybersecurityassist.com/store",
    purpose: "Show products and service packages without implying automatic purchase or activation.",
    show:
      "Show the main catalogue, campaign hub, TikTok, Shopify, Google, Wix, and Facebook channel references, category filtering, product cards, indicative prices, and the request-for-review workflow.",
    narration:
      "The store is a request-only catalogue. Items, prices, and channel links do not create an order, reserve inventory, activate monitoring, start a subscription, or guarantee fulfillment. GEM confirms the final provider, scope, price, taxes, refund terms, and delivery before acceptance.",
  },
  {
    step: "05",
    icon: UsersRound,
    title: "Community & Team",
    href: "/community",
    url: "gemcybersecurityassist.com/community",
    purpose: "Explain the people, collaboration, and membership context behind the platform.",
    show:
      "Show the leadership and security-operations sections, specialist roles, qualifications, collaboration areas, and the pathway for verified professionals or members.",
    narration:
      "The community area should help visitors understand who participates in the platform, how specialists collaborate, and which roles support security, compliance, property, financial-risk, and client operations. Any names, biographies, certifications, or affiliations shown publicly must be verified.",
  },
  {
    step: "06",
    icon: LayoutDashboard,
    title: "Operational Hub",
    href: "/hub",
    url: "gemcybersecurityassist.com/hub",
    purpose: "Present the authenticated command center and client workflow.",
    show:
      "Show Threat Command, Compliance Center, Research Lab, Intelligence Archive, document categories, support channels, and the five-step service-request process.",
    narration:
      "The Operational Hub is the authenticated workspace for managing threats, compliance activity, intelligence, documents, service requests, support, audit history, and account operations. Public pages explain the structure; protected records remain behind authentication and entitlement controls.",
  },
  {
    step: "07",
    icon: Library,
    title: "Resources",
    href: "/resources",
    url: "gemcybersecurityassist.com/resources",
    purpose: "Show educational material, templates, automation tools, news, and FAQs.",
    show:
      "Show market insights, downloadable templates, ThreatWatch, ComplianceTracker, vulnerability-orchestration concepts, industry news, and frequently asked questions.",
    narration:
      "The resources page explains how GEM shares research, operational templates, automation concepts, and curated updates. Client-only materials should remain access controlled, versioned, source-labeled, and reviewed before distribution.",
  },
  {
    step: "08",
    icon: Building2,
    title: "Company",
    href: "/company",
    url: "gemcybersecurityassist.com/company",
    purpose: "Explain GEM's mission, operating model, divisions, leadership, and partnerships.",
    show:
      "Show the mission and vision, values, executive-board section, six specialist divisions, capabilities, and partner or trustee areas.",
    narration:
      "The company page establishes why GEM exists and how its divisions work together across cybersecurity, intelligence, financial security, real estate, operations, and compliance. Public claims about personnel, headcount, credentials, partnerships, and memberships must be accurate and verifiable.",
  },
  {
    step: "09",
    icon: MessageSquareText,
    title: "Contact & Escalation",
    href: "/contact",
    url: "gemcybersecurityassist.com/contact",
    purpose: "Show how visitors, clients, and partners reach the correct team.",
    show:
      "Show the enquiry form, contact categories, general and security addresses, support hours, emergency-escalation path, and expected response-time descriptions.",
    narration:
      "The contact page routes qualified enquiries, support requests, partnership discussions, and active-client incident escalations. Emergency language, telephone numbers, addresses, availability, and response-time claims should match the verified operating setup.",
  },
  {
    step: "10",
    icon: LockKeyhole,
    title: "Access, Login & Onboarding",
    href: "/get-started",
    url: "gemcybersecurityassist.com/get-started",
    purpose: "Show the movement from public information into a controlled client relationship.",
    show:
      "Show Request Access, eligibility review, onboarding status, Client Login, role-based access, document restrictions, approval gates, and the point where protected workspace access begins.",
    narration:
      "The onboarding flow separates public interest from approved service access. Applicants submit an enquiry, complete the required review, receive the correct entitlement, and enter only the workspace and capabilities authorized for their role.",
  },
  {
    step: "11",
    icon: Video,
    title: "TokMetric & TikTok Integration",
    href: "/tokmetric",
    url: "gemcybersecurityassist.com/tokmetric",
    purpose: "Connect the enterprise website to the TikTok content-operations demonstration.",
    show:
      "Show the public TokMetric page, privacy policy, terms, review-demo workspace, connector state, content draft, compliance review, human approval, publishing controls, status tracking, analytics labels, and audit history.",
    narration:
      "TokMetric is the controlled content-operations area. TikTok accounts connect only through official OAuth. Content moves through drafting, compliance review, human approval, publishing checks, status tracking, and audit history. Live posting remains blocked until the required authorization, scopes, platform approval, and safeguards are present.",
  },
];

const recordingStages = [
  "Begin on the verified GEM domain with the browser address visible.",
  "Tour the public pages in the numbered order below and explain each page's purpose.",
  "Move from public information into Get Started, Client Login, and the authenticated Hub boundary.",
  "Open TokMetric, its public legal pages, and the TikTok app-review demonstration workspace.",
  "For the final TikTok submission, record the real Sandbox OAuth, requested scopes, account return, content selection, user approval, upload or publish action, final status, and disconnect control.",
  "Keep secrets, passwords, access tokens, private client records, and unverified claims out of the recording.",
];

export default function EnterpriseDemoPage() {
  const videoGuideUrl = process.env.NEXT_PUBLIC_ENTERPRISE_DEMO_VIDEO_URL?.trim();

  return (
    <div className="min-h-screen bg-[#071019] text-white">
      <header className="border-b border-white/[0.08] bg-[#09131f]">
        <div className="mx-auto max-w-screen-xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
            <PlayCircle className="h-4 w-4" />
            Full website demonstration flow
          </div>
          <h1 className="mt-5 max-w-5xl text-4xl font-bold tracking-tight sm:text-6xl">
            Connect every GEM Enterprise page to one clear video walkthrough.
          </h1>
          <p className="mt-5 max-w-4xl text-base leading-8 text-white/60">
            This page provides the exact order, page purpose, screen actions, and narration needed to explain the public website, controlled client-access model, Operational Hub, and TokMetric TikTok integration as one complete story.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/" className="inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 text-sm font-bold text-[#06111b] hover:bg-cyan-200">
              Start live website tour <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/tokmetric/review-demo" className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white hover:bg-white/[0.08]">
              Open TikTok review workspace <Video className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-screen-xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="overflow-hidden rounded-3xl border border-white/[0.08] bg-black/30">
            {videoGuideUrl ? (
              <video className="aspect-video w-full bg-black" controls playsInline preload="metadata">
                <source src={videoGuideUrl} type="video/mp4" />
                Your browser does not support embedded video.
              </video>
            ) : (
              <div className="flex aspect-video items-center justify-center bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.18),transparent_55%)] p-8 text-center">
                <div className="max-w-xl">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-300/10">
                    <Video className="h-8 w-8 text-cyan-300" />
                  </div>
                  <h2 className="mt-5 text-2xl font-bold">Video player is integration-ready</h2>
                  <p className="mt-3 text-sm leading-7 text-white/55">
                    Upload the approved walkthrough video to controlled storage and set <code className="rounded bg-black/40 px-1.5 py-0.5 text-cyan-200">NEXT_PUBLIC_ENTERPRISE_DEMO_VIDEO_URL</code>. This page will display it automatically without changing the page code.
                  </p>
                </div>
              </div>
            )}
          </article>

          <article className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6">
            <div className="flex items-center gap-3">
              <ClipboardCheck className="h-5 w-5 text-cyan-300" />
              <h2 className="text-xl font-bold">Recording structure</h2>
            </div>
            <ol className="mt-5 space-y-3">
              {recordingStages.map((stage, index) => (
                <li key={stage} className="flex gap-3 rounded-2xl border border-white/[0.07] bg-[#071019] p-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-300 text-xs font-bold text-[#06111b]">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-6 text-white/60">{stage}</p>
                </li>
              ))}
            </ol>
          </article>
        </section>

        <section className="mt-10 rounded-3xl border border-amber-300/20 bg-amber-300/[0.06] p-6">
          <div className="flex items-start gap-4">
            <Globe2 className="mt-1 h-6 w-6 shrink-0 text-amber-200" />
            <div>
              <h2 className="text-xl font-bold text-amber-50">Use two connected chapters in the final recording</h2>
              <p className="mt-2 max-w-5xl text-sm leading-7 text-amber-50/70">
                Chapter one should provide a concise website overview so the reviewer understands GEM Enterprise and where TokMetric fits. Chapter two must show the real TikTok integration end to end. The public website tour provides context; it does not replace the required Sandbox authorization and publishing demonstration.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Page-by-page production script</p>
            <h2 className="mt-2 text-3xl font-bold">Follow this exact order during the walkthrough</h2>
          </div>

          <div className="space-y-5">
            {publicPages.map(({ step, icon: Icon, title, href, url, purpose, show, narration }) => (
              <article key={href} className="grid gap-5 rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6 lg:grid-cols-[auto_1fr_auto] lg:items-start">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10">
                  <Icon className="h-6 w-6 text-cyan-300" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-cyan-300 px-2.5 py-1 text-xs font-black text-[#06111b]">{step}</span>
                    <h3 className="text-2xl font-bold">{title}</h3>
                  </div>
                  <p className="mt-2 font-mono text-xs text-cyan-100/60">{url}</p>
                  <p className="mt-4 text-sm font-semibold text-white/80">Purpose: {purpose}</p>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/[0.07] bg-[#071019] p-4">
                      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-cyan-200">
                        <FileText className="h-4 w-4" /> What to show
                      </div>
                      <p className="text-sm leading-7 text-white/55">{show}</p>
                    </div>
                    <div className="rounded-2xl border border-white/[0.07] bg-[#071019] p-4">
                      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-200">
                        <CheckCircle2 className="h-4 w-4" /> Suggested narration
                      </div>
                      <p className="text-sm leading-7 text-white/55">{narration}</p>
                    </div>
                  </div>
                </div>
                <Link href={href} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm font-semibold hover:border-cyan-300/35 hover:bg-cyan-300/10">
                  Open page <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-2">
          <article className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6">
            <div className="flex items-center gap-3">
              <Video className="h-5 w-5 text-cyan-300" />
              <h2 className="text-xl font-bold">Recommended final video chapters</h2>
            </div>
            <div className="mt-5 space-y-3 text-sm leading-7 text-white/60">
              <p><strong className="text-white">00:00–00:20</strong> — Title, verified domain, purpose, and disclosure.</p>
              <p><strong className="text-white">00:20–01:40</strong> — Home, Intel, Services, Store, Community, Hub, Resources, Company, Contact, and Access overview.</p>
              <p><strong className="text-white">01:40–02:10</strong> — Explain where TokMetric fits within GEM Enterprise.</p>
              <p><strong className="text-white">02:10 onward</strong> — Record the real TikTok Sandbox OAuth, scopes, content preparation, approval, upload or publishing, status, audit, and disconnect flow.</p>
            </div>
          </article>

          <article className="rounded-3xl border border-cyan-300/20 bg-cyan-300/[0.06] p-6">
            <div className="flex items-center gap-3">
              <LockKeyhole className="h-5 w-5 text-cyan-200" />
              <h2 className="text-xl font-bold">Final review safeguards</h2>
            </div>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-white/60">
              <li>• Use the exact production or approved Sandbox domain shown in the application.</li>
              <li>• Show only products and scopes that are selected in TikTok Developer Portal.</li>
              <li>• Remove any product or scope that is not implemented and demonstrated.</li>
              <li>• Do not reveal credentials, secrets, tokens, private customer data, or internal identifiers.</li>
              <li>• Clearly label illustrative, seeded, imported, manual, and live data.</li>
              <li>• Keep user approval visible before every external publishing action.</li>
            </ul>
          </article>
        </section>
      </main>
    </div>
  );
}
