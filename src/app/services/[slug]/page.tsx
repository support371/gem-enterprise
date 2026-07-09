import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  Eye,
  Globe,
  Lock,
  Shield,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const services = {
  "threat-monitoring": {
    icon: Shield,
    title: "Managed Threat Monitoring",
    summary:
      "Monitoring, triage, and escalation support for eligible client environments under a documented statement of work.",
    capabilities: [
      "Approved telemetry and alert-source onboarding",
      "Triage criteria and escalation routing",
      "Periodic reporting and control review",
      "Named operational contacts and support windows",
    ],
    requirements: [
      "Verified authority over the monitored environment",
      "Approved data sources and retention terms",
      "Confirmed staffing or provider coverage",
      "Signed scope, exclusions, and response targets",
    ],
  },
  "incident-response": {
    icon: Zap,
    title: "Incident Response Coordination",
    summary:
      "Structured triage, containment planning, evidence-preservation guidance, and recovery coordination according to contracted coverage.",
    capabilities: [
      "Initial incident intake and severity assessment",
      "Containment and recovery coordination",
      "Evidence-handling and decision documentation",
      "Post-incident review and remediation planning",
    ],
    requirements: [
      "Authorized incident contact and decision-maker",
      "Defined systems and jurisdictions in scope",
      "Available technical access and evidence sources",
      "Contracted activation and escalation terms",
    ],
  },
  "dark-web": {
    icon: Eye,
    title: "Exposure & Dark-Web Monitoring",
    summary:
      "Authorized exposure monitoring using approved providers and sources, with documented limitations and escalation routes.",
    capabilities: [
      "Domain and credential-exposure monitoring",
      "Source confidence and evidence review",
      "Alert validation and recommended next steps",
      "Periodic exposure summaries",
    ],
    requirements: [
      "Confirmed ownership or authority for monitored identifiers",
      "Approved provider and lawful data source",
      "Documented alert recipients",
      "Defined false-positive and escalation process",
    ],
  },
  "red-team": {
    icon: Lock,
    title: "Security Assessment & Testing",
    summary:
      "Authorized assessment of applications, infrastructure, configuration, and selected business processes within explicit rules of engagement.",
    capabilities: [
      "Scope and attack-surface review",
      "Application and infrastructure testing",
      "Control validation and evidence collection",
      "Prioritized remediation reporting",
    ],
    requirements: [
      "Written authorization from the asset owner",
      "Approved targets, timing, and exclusions",
      "Emergency contact and stop conditions",
      "Data-handling and evidence-retention plan",
    ],
  },
  "asset-recovery": {
    icon: Building2,
    title: "Asset & Property Risk Coordination",
    summary:
      "Risk review, documentation support, and specialist coordination where ownership, authority, jurisdiction, and provider capability are verified.",
    capabilities: [
      "Ownership and documentation review",
      "Risk and fraud-indicator assessment",
      "Qualified specialist and provider referrals",
      "Case coordination and evidence tracking",
    ],
    requirements: [
      "Verified identity and legal authority",
      "Supporting ownership and transaction records",
      "Jurisdiction and legal-scope review",
      "Signed engagement and provider acceptance",
    ],
  },
  "federal-compliance": {
    icon: Globe,
    title: "Compliance Readiness Support",
    summary:
      "Gap assessment, control mapping, policy support, and remediation planning for selected frameworks. Readiness support is not certification.",
    capabilities: [
      "Current-state gap assessment",
      "Control and evidence mapping",
      "Policy and procedure support",
      "Remediation tracking and audit preparation",
    ],
    requirements: [
      "Confirmed framework and organizational scope",
      "Access to relevant policies and evidence",
      "Named control owners",
      "Independent legal or accredited audit advice where required",
    ],
  },
} as const;

type ServiceSlug = keyof typeof services;

export function generateStaticParams() {
  return Object.keys(services).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = services[slug as ServiceSlug];
  if (!service) return {};

  return {
    title: service.title,
    description: service.summary,
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = services[slug as ServiceSlug];
  if (!service) notFound();

  const Icon = service.icon;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-white/10 bg-[#07101c] py-20 md:py-28">
        <div className="container mx-auto max-w-5xl px-6">
          <Badge className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-cyan-300">
            Service scope
          </Badge>
          <div className="mt-8 flex items-start gap-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10">
              <Icon className="h-7 w-7 text-cyan-300" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white md:text-6xl">{service.title}</h1>
              <p className="mt-5 max-w-3xl text-lg leading-relaxed text-slate-300">
                {service.summary}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto grid max-w-5xl gap-8 px-6 py-16 md:grid-cols-2">
        <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-7">
          <h2 className="text-2xl font-bold text-white">Potential capabilities</h2>
          <ul className="mt-6 space-y-4 text-slate-300">
            {service.capabilities.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-7">
          <h2 className="text-2xl font-bold text-white">Activation requirements</h2>
          <ul className="mt-6 space-y-4 text-slate-300">
            {service.requirements.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="container mx-auto max-w-5xl px-6 pb-16">
        <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-6 text-amber-100">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" aria-hidden="true" />
            <div>
              <h2 className="font-bold">Public description, not a service-level agreement</h2>
              <p className="mt-2 text-sm leading-6">
                Availability, coverage hours, personnel, providers, response times, deliverables,
                exclusions, data handling, and fees are established only by an approved proposal
                and signed agreement. This page does not promise continuous monitoring, a fixed
                activation time, certification, recovery success, or a particular outcome.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-white/[0.02] py-16">
        <div className="container mx-auto flex max-w-5xl flex-col items-start justify-between gap-6 px-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-3xl font-black text-white">Request a scoped assessment</h2>
            <p className="mt-3 max-w-2xl text-slate-400">
              Tell us the environment, objective, jurisdiction, timeline, and current constraints.
              The team will confirm whether the service can be offered and under what conditions.
            </p>
          </div>
          <Button asChild size="lg" className="shrink-0 rounded-full bg-cyan-400 px-8 font-semibold text-black hover:bg-cyan-300">
            <Link href={`/contact?service=${encodeURIComponent(service.title)}`}>
              Contact GEM <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
