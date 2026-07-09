import Image from "next/image";
import Link from "next/link";
import {
  Shield,
  AlertTriangle,
  Globe,
  Eye,
  ArrowRight,
  BookOpenCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Threat Intelligence Preview",
  description:
    "A clearly labelled preview of GEM Enterprise threat-intelligence reporting and advisory presentation.",
};

const categories = [
  { icon: Shield, label: "Cyber examples", color: "cyan", count: 14 },
  { icon: AlertTriangle, label: "CVE examples", color: "red", count: 3 },
  { icon: Eye, label: "Exposure examples", color: "purple", count: 7 },
  { icon: Globe, label: "Risk examples", color: "amber", count: 5 },
];

const exampleBriefs = [
  {
    severity: "CRITICAL",
    title: "Example advisory: PAN-OS authentication bypass",
    summary:
      "Demonstration of how a verified vendor advisory and exploited-vulnerability notice could be summarized for an authorized client. This card is not a current alert and must not be used for security decisions.",
    category: "Infrastructure",
    referenceDate: "Reference advisory: February 2025",
    affected: "Network perimeter",
  },
  {
    severity: "HIGH",
    title: "Example scenario: credential-stuffing activity",
    summary:
      "Demonstration content showing how account-takeover indicators, affected services, recommended controls, and escalation guidance may be presented after source verification.",
    category: "Financial",
    referenceDate: "Demonstration scenario",
    affected: "Identity and access",
  },
  {
    severity: "HIGH",
    title: "Example scenario: real-estate payment diversion",
    summary:
      "Demonstration content showing a business-email-compromise pattern and the verification steps that may be included in a client briefing. No active campaign is asserted by this page.",
    category: "Real Estate",
    referenceDate: "Demonstration scenario",
    affected: "Property transactions",
  },
  {
    severity: "MEDIUM",
    title: "Example scenario: malware command-and-control changes",
    summary:
      "Demonstration content showing how malware infrastructure changes, detection guidance, and source confidence may be communicated in a future verified feed.",
    category: "Malware",
    referenceDate: "Demonstration scenario",
    affected: "Enterprise endpoints",
  },
];

const severityColors = {
  CRITICAL: "text-red-400 border-red-500/30 bg-red-500/10",
  HIGH: "text-orange-400 border-orange-500/30 bg-orange-500/10",
  MEDIUM: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  LOW: "text-green-400 border-green-500/30 bg-green-500/10",
};

export default function IntelPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="border-b border-amber-400/30 bg-amber-400/10 px-4 py-4 text-amber-100">
        <div className="container mx-auto flex max-w-7xl items-start gap-3 px-2 text-sm leading-6">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" aria-hidden="true" />
          <p>
            <strong>Intelligence preview:</strong> this page contains static demonstration
            material that illustrates a planned reporting format. It is not a live threat
            feed, monitoring console, emergency notification channel, or substitute for
            authoritative vendor and government advisories.
          </p>
        </div>
      </section>

      <section className="relative overflow-hidden pb-0 pt-32">
        <div className="relative h-[460px]">
          <Image
            src="https://media.base44.com/images/public/69d42975b7b1794c3dc01661/fe8b6bcec_generated_image.png"
            alt="Illustrative threat-intelligence interface concept"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />
          <div className="absolute inset-0 flex items-end pb-12">
            <div className="container mx-auto max-w-7xl px-6">
              <div className="mb-4 flex items-center gap-3">
                <BookOpenCheck className="h-4 w-4 text-cyan-400" aria-hidden="true" />
                <span className="text-xs font-semibold uppercase tracking-widest text-cyan-300">
                  Demonstration reporting format
                </span>
              </div>
              <h1 className="mb-3 text-5xl font-black text-white md:text-6xl">
                Threat Intelligence Preview
              </h1>
              <p className="max-w-2xl text-lg text-slate-400">
                A transparent preview of how sourced advisories, exposure findings, and
                risk briefings may be presented after a verified data pipeline is activated.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.02] py-8">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const classes =
                cat.color === "cyan"
                  ? "text-cyan-400 border-cyan-500/20 bg-cyan-500/5"
                  : cat.color === "red"
                    ? "text-red-400 border-red-500/20 bg-red-500/5"
                    : cat.color === "purple"
                      ? "text-purple-400 border-purple-500/20 bg-purple-500/5"
                      : "text-amber-400 border-amber-500/20 bg-amber-500/5";

              return (
                <div key={cat.label} className={`flex items-center gap-4 rounded-xl border p-4 ${classes}`}>
                  <Icon className="h-6 w-6" aria-hidden="true" />
                  <div>
                    <div className="text-2xl font-black">{cat.count}</div>
                    <div className="text-xs opacity-70">{cat.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-7xl px-6 py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="relative h-[380px] overflow-hidden rounded-2xl">
            <Image
              src="https://media.base44.com/images/public/69d42975b7b1794c3dc01661/86e283cd8_generated_image.png"
              alt="Illustrative exposure-monitoring interface concept"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/40" />
            <div className="absolute left-4 top-4">
              <Badge className="rounded-full border border-purple-500/30 bg-black/60 text-purple-300">
                Illustrative image
              </Badge>
            </div>
          </div>
          <div>
            <Badge className="mb-4 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-xs uppercase tracking-widest text-purple-400">
              Planned exposure reporting
            </Badge>
            <h2 className="mb-6 text-4xl font-black text-white">
              Source verification before publication
            </h2>
            <p className="mb-5 leading-relaxed text-slate-400">
              Production intelligence must identify its source, publication time, retrieval
              time, confidence, affected products, and expiry or review state. Stale data must
              be visibly marked and must never receive automatically changing relative-time labels.
            </p>
            <p className="mb-6 leading-relaxed text-slate-400">
              Client-specific exposure monitoring will be described as active only after an
              authorized monitoring provider, alert-delivery path, escalation process, and
              service agreement have been verified.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 font-semibold text-purple-400 transition-all hover:gap-3"
            >
              Discuss intelligence services <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-white/[0.02] py-24">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="mb-12">
            <h2 className="mb-2 text-4xl font-black text-white">Example advisory cards</h2>
            <p className="text-slate-400">
              Static examples only. Each card is deliberately labelled and uses an absolute
              reference date or demonstration status.
            </p>
          </div>
          <div className="space-y-4">
            {exampleBriefs.map((brief) => (
              <article
                key={brief.title}
                className="rounded-xl border border-white/10 bg-background/40 p-6 transition-all hover:border-white/20"
              >
                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <Badge
                    className={`rounded-full border text-xs font-bold ${severityColors[brief.severity as keyof typeof severityColors]}`}
                  >
                    Example {brief.severity}
                  </Badge>
                  <Badge className="rounded-full border border-white/10 bg-white/5 text-xs text-slate-400">
                    {brief.category}
                  </Badge>
                  <span className="ml-auto text-xs text-slate-500">{brief.referenceDate}</span>
                </div>
                <h3 className="mb-2 text-lg font-bold text-white">{brief.title}</h3>
                <p className="mb-3 text-sm leading-relaxed text-slate-400">{brief.summary}</p>
                <div className="text-xs text-slate-500">Example affected area: {brief.affected}</div>
              </article>
            ))}
          </div>
          <div className="mt-12 text-center">
            <p className="mb-4 text-sm text-slate-500">
              No public page should be treated as an emergency security-alert channel.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 font-semibold text-cyan-400 transition-all hover:gap-3"
            >
              Contact the security team <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
