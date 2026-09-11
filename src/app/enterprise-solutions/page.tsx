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
import { PlatformAccessDirectory } from "@/components/home/PlatformAccessDirectory";
import { foundingBusinessReviewOffer } from "@/lib/market/launchOffer";

export const metadata: Metadata = {
  title: "Enterprise Solutions",
  description:
    "Official access to GEM services, the founding Business Security & Operations Review, enterprise discovery, trust information, and controlled client access.",
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
    icon: UserCheck,
    title: foundingBusinessReviewOffer.name,
    description: foundingBusinessReviewOffer.promise,
    href: "/business-review?utm_source=enterprise-solutions&utm_medium=official-path&utm_campaign=founding-review",
    label: `Start ${foundingBusinessReviewOffer.priceLabel}`,
  },
  {
    icon: ShieldCheck,
    title: "Review trust and boundaries",
    description: "Verify security, privacy, compliance alignment, and responsible-disclosure information.",
    href: "/trust-center",
    label: "Open Trust Center",
  },
  {
    icon: LockKeyhole,
    title: "Existing client access",
    description: "Approved users sign in through the canonical GEM authentication route.",
    href: "/client-login",
    label: "Client Login",
  },
];

export default function EnterpriseSolutionsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="relative overflow-hidden border-b border-white/10 px-6 py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.14),transparent_42%)]" />
        <div className="relative mx-auto max-w-6xl">
          <Badge className="mb-6 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-cyan-200">
            GEM services and sales
          </Badge>
          <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <h1 className="max-w-4xl text-5xl font-black leading-tight text-white md:text-7xl">
                Move from discovery to a real GEM engagement.
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
                Start with the founding Business Security & Operations Review, explore the wider
                solutions experience, or continue into controlled enterprise qualification when your
                scope requires it.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Button asChild size="lg" className="rounded-full bg-cyan-400 px-8 font-semibold text-[#071019] hover:bg-cyan-300">
                  <Link href="/business-review?utm_source=enterprise-solutions&utm_medium=hero&utm_campaign=founding-review">
                    Start ${foundingBusinessReviewOffer.priceUsd} Business Review
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full border-white/20 px-8 font-semibold text-white hover:bg-white/10">
                  <a
                    href={platformOrigins.enterpriseSolutions}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Explore Solutions
                    <ExternalLink className="ml-2 h-4 w-4" aria-hidden="true" />
                  </a>
                </Button>
              </div>
              <p className="mt-5 text-sm text-slate-400">
                Need a broader institutional scope?{" "}
                <Link href="/get-started" className="font-semibold text-cyan-300 hover:text-cyan-200">
                  Begin enterprise qualification
                </Link>
                .
              </p>
            </div>

            <aside className="rounded-3xl border border-cyan-400/20 bg-[#101925]/90 p-7 shadow-2xl shadow-cyan-950/20">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
                Clear commercial path
              </p>
              <h2 className="mt-3 text-2xl font-bold text-white">One public route into the right GEM service</h2>
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

      <PlatformAccessDirectory />

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Choose the next action</p>
          <h2 className="mt-3 text-4xl font-black text-white">Sales first, controls where they matter</h2>
          <p className="mt-4 leading-7 text-slate-400">
            Public visitors can begin with a clearly bounded commercial review. Higher-impact services
            still move through qualification, approved scope, contracting, and protected access.
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
