import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardList,
  FileText,
  Landmark,
  LockKeyhole,
  MapPinned,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const opportunities = [
  {
    title: "Commercial Trust Portfolio",
    location: "Northeast Corridor",
    status: "Document Review",
    risk: "Moderate",
    readiness: "82%",
    description:
      "Institutional commercial real estate trust opportunity with document readiness and compliance routing.",
  },
  {
    title: "Secured Property Income Structure",
    location: "Southeast Region",
    status: "Eligible Review",
    risk: "Low",
    readiness: "91%",
    description:
      "Income-oriented property structure designed for qualified client trust and portfolio workflows.",
  },
  {
    title: "Private Real Estate Mandate",
    location: "Multi-market",
    status: "Advisor Review",
    risk: "Controlled",
    readiness: "76%",
    description:
      "Private mandate requiring advisor consultation, eligibility review, and document verification.",
  },
];

const trustControls = [
  "KYC-gated access",
  "Document readiness review",
  "Compliance decision path",
  "Advisor consultation routing",
  "Portfolio visibility alignment",
];

const workflow = [
  {
    label: "Qualified Client Access",
    description: "Client must pass verification and entitlement checks before trust opportunities unlock.",
  },
  {
    label: "Property Intelligence Review",
    description: "Opportunity, ownership, risk, readiness, and documentation are reviewed in one workflow.",
  },
  {
    label: "Compliance & Document Routing",
    description: "Documents, disclosures, and KYC evidence are routed into compliance review surfaces.",
  },
  {
    label: "Advisor Consultation",
    description: "A trust consultation is routed through meetings and request-center workflows.",
  },
];

export default function RealEstateProductPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1 text-xs font-mono uppercase tracking-wider text-amber-400">
              <Landmark className="h-3.5 w-3.5" />
              ATR Property Trust
            </div>

            <h1 className="text-3xl font-bold text-white md:text-5xl">
              Property Trust Intelligence
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-400 md:text-base">
              Institutional real estate intelligence for qualified clients. Review property trust opportunities, readiness, document state, risk rating, and advisor consultation paths without turning GEM into a public listing marketplace.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="rounded-full bg-amber-400 text-black hover:bg-amber-300">
                <Link href="/app/meetings">
                  Request Trust Consultation <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <Button asChild variant="outline" className="rounded-full border-white/10 text-white hover:bg-white/10">
                <Link href="/app/documents">Review Documents</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-6">
            <div className="mb-5 flex items-center gap-3">
              <LockKeyhole className="h-5 w-5 text-amber-400" />
              <p className="text-sm font-semibold text-amber-400">Qualified Client Access</p>
            </div>

            <div className="grid gap-3">
              {trustControls.map((control) => (
                <div key={control} className="flex items-center gap-3 rounded-xl border border-white/10 bg-background/60 p-3">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-slate-300">{control}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {opportunities.map((item) => (
          <div key={item.title} className="glass-panel bento-card rounded-2xl p-6 svc-realty-card">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[hsl(var(--svc-realty-muted))]">
                <Building2 className="h-5 w-5 text-[hsl(var(--svc-realty))]" />
              </div>

              <Badge className="border-amber-500/25 bg-amber-500/10 text-amber-400">
                {item.status}
              </Badge>
            </div>

            <h2 className="text-lg font-bold text-white">{item.title}</h2>

            <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
              <MapPinned className="h-3.5 w-3.5" />
              {item.location}
            </p>

            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              {item.description}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/5 p-3">
                <p className="text-xs text-slate-500">Risk Rating</p>
                <p className="mt-1 text-sm font-semibold text-white">{item.risk}</p>
              </div>

              <div className="rounded-xl bg-white/5 p-3">
                <p className="text-xs text-slate-500">Readiness</p>
                <p className="mt-1 text-sm font-semibold text-amber-400">{item.readiness}</p>
              </div>
            </div>

            <Button asChild variant="outline" className="mt-5 w-full border-white/10 text-slate-300 hover:bg-white/10 hover:text-white">
              <Link href="/app/requests?type=real_estate_trust">
                Request Review <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
        <div className="mb-6 flex items-center gap-3">
          <ClipboardList className="h-5 w-5 text-amber-400" />
          <div>
            <h2 className="text-xl font-bold text-white">ATR Operating Workflow</h2>
            <p className="mt-1 text-sm text-slate-400">How real estate trust opportunities move through GEM Enterprise.</p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          {workflow.map((step, index) => (
            <div key={step.label} className="rounded-2xl border border-white/10 bg-background/60 p-4">
              <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-full border border-amber-500/25 bg-amber-500/10 font-mono text-xs text-amber-400">
                {String(index + 1).padStart(2, "0")}
              </div>
              <p className="text-sm font-semibold text-white">{step.label}</p>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        {[
          {
            icon: FileText,
            title: "Document Readiness",
            body: "Surface agreement, compliance, property, and identity files required before review.",
            href: "/app/documents",
          },
          {
            icon: ShieldCheck,
            title: "Compliance Routing",
            body: "Route trust opportunities through approval, KYC, and entitlement workflows.",
            href: "/app/compliance",
          },
          {
            icon: TrendingUp,
            title: "Portfolio Intelligence",
            body: "Tie real estate exposure back into the broader GEM portfolio operations layer.",
            href: "/app/portfolios",
          },
        ].map(({ icon: Icon, title, body, href }) => (
          <Link key={title} href={href} className="rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-amber-500/30">
            <Icon className="mb-4 h-6 w-6 text-amber-400" />
            <h3 className="text-base font-bold text-white">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{body}</p>
            <p className="mt-5 flex items-center gap-2 text-sm font-semibold text-amber-400">
              Open workflow <ArrowRight className="h-4 w-4" />
            </p>
          </Link>
        ))}
      </section>
    </div>
  );
}
