import type { Metadata } from "next";
import Link from "next/link";
import {
  Inbox,
  UserPlus,
  Handshake,
  Target,
  Building2,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HubSectionHeader } from "@/components/hub/HubSectionHeader";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Requests",
  description:
    "Submit high-value network requests — introductions, mandates, services, and strategic matchmaking.",
};

const REQUEST_TYPES = [
  {
    id: "introduction",
    icon: UserPlus,
    title: "Introduction Request",
    description:
      "Request a warm introduction to a verified member. GEM reviews, confirms appetite, and brokers the connection on-record.",
    lead: "Typical turnaround: 3–5 business days",
    href: "/community-hub/requests?type=introduction",
  },
  {
    id: "service",
    icon: Building2,
    title: "Service Request",
    description:
      "Engage GEM services — logistics, real estate, legal/compliance, or payments — for a specific mandate or engagement.",
    lead: "Acknowledged within 2 hours",
    href: "/community-hub/requests?type=service",
  },
  {
    id: "mandate",
    icon: Target,
    title: "Mandate / Matchmaking",
    description:
      "Surface a mandate to qualified network members, or request matchmaking against an existing thesis, jurisdiction, or sector.",
    lead: "Scoped in 5 business days",
    href: "/community-hub/requests?type=mandate",
  },
  {
    id: "partnership",
    icon: Handshake,
    title: "Partnership / Co-invest",
    description:
      "Register interest in specific co-investment opportunities or propose a strategic partnership to GEM principals.",
    lead: "Matched within 7 business days",
    href: "/community-hub/requests?type=partnership",
  },
];

const STATUS_TONE: Record<string, string> = {
  Submitted: "border-white/15 bg-white/5 text-white/70",
  "Under review": "border-amber-400/30 bg-amber-400/10 text-amber-300",
  Matched: "border-primary/30 bg-primary/10 text-primary",
  Completed: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  Declined: "border-red-500/25 bg-red-500/10 text-red-300",
};

const REQUEST_LOG = [
  {
    id: "REQ-8821",
    type: "Introduction",
    subject: "Introduction to anchor operator — Logistics · GCC corridor",
    status: "Under review",
    updated: "2 hours ago",
  },
  {
    id: "REQ-8814",
    type: "Mandate",
    subject: "Multi-family acquirer mandate — Northeast US",
    status: "Matched",
    updated: "Yesterday",
  },
  {
    id: "REQ-8803",
    type: "Service",
    subject: "Cross-border compliance engagement — EMEA payments rails",
    status: "Completed",
    updated: "3 days ago",
  },
  {
    id: "REQ-8790",
    type: "Partnership",
    subject: "Co-invest registration — Critical infrastructure SE Asia",
    status: "Submitted",
    updated: "5 days ago",
  },
];

export default function RequestsPage() {
  return (
    <>
      <section className="border-b border-white/[0.06]">
        <div className="mx-auto max-w-screen-xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-md border border-primary/25 bg-primary/10 text-primary">
            <Inbox className="h-4.5 w-4.5" aria-hidden="true" />
          </div>
          <HubSectionHeader
            eyebrow="High-value member actions"
            title={<>What would you like the network to do?</>}
            description="Requests are how members deploy the Hub — on-record actions reviewed by GEM before they reach counterparties."
          />
        </div>
      </section>

      {/* Request types */}
      <section className="mx-auto max-w-screen-xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-sm font-semibold uppercase tracking-widest text-white/50">
          Request types
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {REQUEST_TYPES.map((r) => {
            const Icon = r.icon;
            return (
              <Link
                key={r.id}
                href={r.href}
                className="group relative flex flex-col gap-3 rounded-2xl border border-white/[0.07] bg-[#0e1420] p-6 transition-colors hover:border-primary/25 hover:bg-[#101826]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-white/30 transition-colors group-hover:text-primary" aria-hidden="true" />
                </div>
                <h3 className="text-base font-semibold text-foreground">
                  {r.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {r.description}
                </p>
                <p className="mt-auto font-mono text-[11px] uppercase tracking-wider text-primary/70">
                  {r.lead}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Request log */}
      <section className="mx-auto max-w-screen-xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-white/50">
            Your submitted requests
          </h2>
          <Button
            asChild
            size="sm"
            variant="ghost"
            className="h-8 border border-white/10 bg-transparent text-xs text-white/70 hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
          >
            <Link href="/app/requests">Full history</Link>
          </Button>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0e1420]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.05] text-left font-mono text-[10px] uppercase tracking-widest text-white/40">
                <th className="px-5 py-3 font-semibold">Ref</th>
                <th className="px-5 py-3 font-semibold">Type</th>
                <th className="px-5 py-3 font-semibold">Subject</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {REQUEST_LOG.map((r) => {
                const StatusIcon =
                  r.status === "Completed"
                    ? CheckCircle2
                    : r.status === "Matched"
                    ? Target
                    : r.status === "Under review"
                    ? Clock
                    : r.status === "Declined"
                    ? AlertCircle
                    : Inbox;
                return (
                  <tr key={r.id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="px-5 py-4 font-mono text-xs text-white/60">
                      {r.id}
                    </td>
                    <td className="px-5 py-4 text-xs text-white/75">{r.type}</td>
                    <td className="px-5 py-4 text-sm text-foreground">
                      {r.subject}
                    </td>
                    <td className="px-5 py-4">
                      <Badge
                        className={cn(
                          "rounded-full border font-mono text-[10px] uppercase tracking-wider",
                          STATUS_TONE[r.status]
                        )}
                      >
                        <StatusIcon className="mr-1 h-3 w-3" aria-hidden="true" />
                        {r.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-xs text-white/45">
                      {r.updated}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
