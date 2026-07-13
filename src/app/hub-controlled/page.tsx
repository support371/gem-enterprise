import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  FileCheck2,
  Headphones,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Operations Hub | GEM Enterprise",
  description:
    "Controlled overview of GEM Enterprise client operations, support, documentation, and service-request capabilities.",
};

const capabilities = [
  {
    icon: ShieldCheck,
    title: "Security coordination",
    status: "Approved scope required",
    description:
      "Monitoring, triage, escalation, and incident-response coordination are configured only after coverage, staffing, tooling, and response targets are documented in a signed engagement.",
  },
  {
    icon: BookOpenCheck,
    title: "Compliance readiness",
    status: "Readiness support",
    description:
      "Control mapping, policy support, evidence planning, and remediation tracking may be provided under an approved scope. Readiness support is not certification or legal advice.",
  },
  {
    icon: FileCheck2,
    title: "Client documents",
    status: "Authentication required",
    description:
      "Approved client records, reports, and deliverables are made available only through authorized access controls for the relevant engagement.",
  },
  {
    icon: Headphones,
    title: "Support and escalation",
    status: "Service-specific",
    description:
      "Support channels, operating hours, acknowledgement targets, and escalation procedures are defined in the applicable service agreement.",
  },
];

export default function ControlledHubPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border/60 px-6 py-24 cyber-grid">
        <div className="mx-auto max-w-5xl text-center">
          <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
            <LockKeyhole className="h-4 w-4" aria-hidden="true" />
            Controlled operations entry point
          </p>
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">
            Client operations begin with verified access and an approved scope.
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
            This page describes the operating model without representing unverified staffing,
            availability, response-time, certification, encryption, or provider claims as active.
            Exact capabilities are confirmed in writing for each engagement.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/client-login"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Client sign in <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/get-started"
              className="inline-flex items-center justify-center rounded-md border border-border px-6 py-3 font-semibold hover:bg-card"
            >
              Request a documented scope
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-6 md:grid-cols-2">
          {capabilities.map(({ icon: Icon, title, status, description }) => (
            <article key={title} className="rounded-2xl border border-border/70 bg-card/70 p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <span className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {status}
                </span>
              </div>
              <h2 className="mt-5 text-xl font-semibold">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="rounded-2xl border border-amber-400/25 bg-amber-400/10 p-6 text-sm leading-6 text-amber-50/90">
          <strong>Public-claims control:</strong> capability labels on this page do not create an
          SLA, activate a service, confirm round-the-clock coverage, guarantee a response time, or
          establish a certification, partnership, or regulated status.
        </div>
      </section>
    </main>
  );
}
