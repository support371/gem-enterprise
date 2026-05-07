import Link from "next/link";
import {
  ArrowRight,
  Database,
  FileCheck2,
  Fingerprint,
  KeyRound,
  Landmark,
  LockKeyhole,
  MessageSquareWarning,
  Network,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Architecture | GEM Enterprise",
  description:
    "Enterprise architecture overview for GEM Enterprise access, KYC, compliance, entitlement, audit, intelligence, and support operations.",
};

const layers = [
  {
    icon: UserCheck,
    title: "Client Access Layer",
    body: "Invite-only entry points, login routing, protected portal access, and role-aware navigation for qualified clients and internal teams.",
  },
  {
    icon: Fingerprint,
    title: "KYC & Entity Verification",
    body: "Individual, business, trust, and family-office onboarding paths with document collection and review state tracking.",
  },
  {
    icon: ShieldCheck,
    title: "Compliance Review Layer",
    body: "Admin review queues, approval states, rejection reasons, manual review paths, and compliance decision records.",
  },
  {
    icon: KeyRound,
    title: "Entitlement Control",
    body: "Product and portfolio access is granted through explicit entitlement records after verification and approval.",
  },
  {
    icon: Database,
    title: "Operational Data Core",
    body: "PostgreSQL and Prisma coordinate users, profiles, KYC applications, documents, decisions, portfolios, tickets, requests, and notifications.",
  },
  {
    icon: FileCheck2,
    title: "Audit & Evidence",
    body: "Sensitive activity is captured through structured audit events, consent receipts, AI run metadata, document events, and admin actions.",
  },
];

const flows = [
  "Request access",
  "Authenticate session",
  "Complete KYC path",
  "Upload documents",
  "Compliance decision",
  "Activate entitlements",
  "Operate in secure portal",
];

const controls = [
  {
    icon: LockKeyhole,
    title: "Protected Routes",
    body: "Portal, dashboard, KYC, and admin areas are separated from public pages and designed for authenticated access.",
  },
  {
    icon: MessageSquareWarning,
    title: "AI Governance",
    body: "AI support is framed around disclosure, consent capture, run tracking, and escalation readiness instead of uncontrolled chatbot behavior.",
  },
  {
    icon: Landmark,
    title: "Institutional Operations",
    body: "Financial, cybersecurity, and real estate workflows share a single operating model while preserving distinct product surfaces.",
  },
];

export default function ArchitecturePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute left-1/4 top-20 h-96 w-96 rounded-full bg-cyan-500 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-purple-600 blur-3xl" />
        </div>

        <div className="relative z-10 container mx-auto max-w-screen-2xl px-6 py-24">
          <Badge className="mb-6 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs uppercase tracking-widest text-cyan-400">
            Architecture Specs
          </Badge>

          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <h1 className="max-w-4xl text-5xl font-black leading-tight text-white md:text-7xl">
                Institutional control plane for secure client operations.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">
                GEM Enterprise is structured around verified access, compliance review, entitlement gating, audit evidence, and ongoing intelligence operations.
              </p>
              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                <Button asChild size="lg" className="rounded-full bg-cyan-400 px-8 font-semibold text-black hover:bg-cyan-500">
                  <Link href="/get-started">
                    Request Access <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full border-white/20 px-8 font-semibold text-white hover:bg-white/10">
                  <Link href="/">Back to Platform</Link>
                </Button>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <div className="mb-5 flex items-center gap-3">
                <Network className="h-5 w-5 text-cyan-400" />
                <p className="text-sm font-semibold uppercase tracking-wider text-slate-300">Client Lifecycle Flow</p>
              </div>
              <div className="grid gap-3">
                {flows.map((flow, index) => (
                  <div key={flow} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-background/50 p-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cyan-500/20 bg-cyan-500/10 font-mono text-xs text-cyan-400">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <p className="font-medium text-white">{flow}</p>
                    {index < flows.length - 1 && <ArrowRight className="ml-auto hidden h-4 w-4 text-slate-600 sm:block" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-screen-2xl px-6 py-24">
        <div className="mb-14 max-w-3xl">
          <h2 className="text-4xl font-bold text-white md:text-5xl">
            Platform layers that preserve the existing data structure.
          </h2>
          <p className="mt-4 text-slate-400">
            The architecture is additive and operational: it exposes the current application model through clearer trust, workflow, and governance surfaces.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {layers.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur transition hover:border-cyan-500/30">
              <Icon className="mb-5 h-8 w-8 text-cyan-400" />
              <h3 className="mb-3 text-lg font-bold text-white">{title}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/5 py-24">
        <div className="container mx-auto max-w-screen-2xl px-6">
          <div className="mb-14 text-center">
            <h2 className="text-4xl font-bold text-white md:text-5xl">
              Governance controls for enterprise trust.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-400">
              These controls map the public product promise to the application’s existing compliance, support, and access-management surfaces.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {controls.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-background/60 p-7">
                <Icon className="mb-5 h-8 w-8 text-cyan-400" />
                <h3 className="mb-3 text-lg font-bold text-white">{title}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
