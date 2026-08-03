import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  LockKeyhole,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { platformOrigins } from "@/lib/platform-origins";

export const metadata: Metadata = {
  title: "Enterprise Solutions",
  description:
    "Official access to the GEM-operated enterprise solutions discovery experience, with eligibility, trust, and client access retained on the canonical GEM platform.",
  alternates: {
    canonical: "/enterprise-solutions",
  },
};

const boundaries = [
  "Capability and campaign information is presented for discovery and evaluation.",
  "Service availability, staffing, coverage, fees, and response targets require a verified scope.",
  "Applications, eligibility decisions, trust information, and client sign-in remain on this canonical domain.",
  "The external experience does not create accounts, approve access, or replace GEM's system of record.",
];

const officialPaths = [
  {
    icon: ShieldCheck,
    title: "Review trust and boundaries",
    description: "Verify security, privacy, compliance alignment, and responsible-disclosure information.",
    href: "/trust-center",
    label: "Open Trust Center",
  },
  {
    icon: UserCheck,
    title: "Request access",
    description: "Start the controlled eligibility and application process for an individual, family, or organization.",
    href: "/get-started",
    label: "Begin an enquiry",
  },
  {
    icon: LockKeyhole,
    title: "Existing client access",
    description: "Approved users sign in through the canonical GEM authentication route.",
    href: "/client-login",
    label: "Client Login",
  },
];

function approvedPlatformVideoUrl() {
  if (process.env.ENTERPRISE_SOLUTIONS_VIDEO_APPROVED !== "true") return null;
  const candidate = process.env.ENTERPRISE_SOLUTIONS_VIDEO_URL?.trim();
  if (!candidate) return null;
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== "https:" || parsed.username || parsed.password) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

export default function EnterpriseSolutionsPage() {
  const platformVideoUrl = approvedPlatformVideoUrl();
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="relative overflow-hidden border-b border-white/10 px-6 py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.14),transparent_42%)]" />
        <div className="relative mx-auto max-w-6xl">
          <Badge className="mb-6 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-cyan-200">
            Official GEM access path
          </Badge>
          <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <h1 className="max-w-4xl text-5xl font-black leading-tight text-white md:text-7xl">
                GEM Enterprise Solutions
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
                Explore the GEM capability and campaign experience through this verified gateway.
                The experience is operated as a discovery layer; this canonical platform remains
                the authority for trust information, eligibility, applications, and client access.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Button asChild size="lg" className="rounded-full bg-cyan-400 px-8 font-semibold text-[#071019] hover:bg-cyan-300">
                  <a
                    href={platformOrigins.enterpriseSolutions}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open Solutions Experience
                    <ExternalLink className="ml-2 h-4 w-4" aria-hidden="true" />
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full border-white/20 px-8 font-semibold text-white hover:bg-white/10">
                  <Link href="/get-started">
                    Request Access <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
              <p className="mt-4 text-sm text-slate-500">
                External destination: gem-assist-enterprise.vercel.app
              </p>
            </div>

            <aside className="rounded-3xl border border-cyan-400/20 bg-[#101925]/90 p-7 shadow-2xl shadow-cyan-950/20">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
                Identification and authority
              </p>
              <h2 className="mt-3 text-2xl font-bold text-white">One GEM ecosystem, clear responsibilities</h2>
              <ul className="mt-6 space-y-4">
                {boundaries.map((boundary) => (
                  <li key={boundary} className="flex gap-3 text-sm leading-6 text-slate-300">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" aria-hidden="true" />
                    <span>{boundary}</span>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#071019] px-6 py-16">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Platform briefing</p>
            <h2 className="mt-3 text-3xl font-black text-white">See the approved GEM operating model</h2>
            <p className="mt-4 leading-7 text-slate-400">
              Public media is released separately from private client and social-workspace assets. A real briefing appears here only after rights, factual accuracy, accessibility, and owner approval are recorded.
            </p>
          </div>
          {platformVideoUrl ? (
            <div className="overflow-hidden rounded-2xl border border-cyan-400/20 bg-black shadow-2xl shadow-cyan-950/20">
              <video className="aspect-video w-full bg-black object-contain" controls playsInline preload="metadata" aria-label="Approved GEM Enterprise platform briefing">
                <source src={platformVideoUrl} />
                Your browser cannot play the approved platform briefing.
              </video>
            </div>
          ) : (
            <div className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-6">
              <p className="font-semibold text-amber-100">Public video awaiting approval</p>
              <p className="mt-2 text-sm leading-6 text-amber-100/70">
                No demo or private workspace media is substituted while the final rights-cleared platform briefing is under review.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Continue through GEM</p>
          <h2 className="mt-3 text-4xl font-black text-white">Use the official path for your next step</h2>
          <p className="mt-4 leading-7 text-slate-400">
            Exploring capabilities does not enroll a user or activate a service. Choose the
            appropriate canonical route when you are ready to verify scope or access an approved account.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {officialPaths.map((path) => {
            const Icon = path.icon;
            return (
              <article key={path.href} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-xl font-bold text-white">{path.title}</h3>
                <p className="mt-3 min-h-24 text-sm leading-6 text-slate-400">{path.description}</p>
                <Link href={path.href} className="mt-5 inline-flex items-center gap-2 font-semibold text-cyan-300 hover:text-cyan-200">
                  {path.label} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
