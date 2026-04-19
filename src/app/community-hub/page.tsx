import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Users2, Sparkles, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrustRibbon } from "@/components/hub/TrustRibbon";
import { HubSectionHeader } from "@/components/hub/HubSectionHeader";
import { OpportunityCard } from "@/components/hub/OpportunityCard";
import { EventCard } from "@/components/hub/EventCard";
import { ResourceCard } from "@/components/hub/ResourceCard";
import { AccessRequestCTA } from "@/components/hub/AccessRequestCTA";
import {
  MEMBER_TYPES,
  OPPORTUNITIES,
  EVENTS,
  RESOURCES,
} from "@/lib/hub/mock-data";

export const metadata: Metadata = {
  title: "Community Hub",
  description:
    "The GEM Community Hub is an invitation-only network for qualified partners, operators, investors, clients, and advisors.",
};

const HUB_STATS = [
  { value: "1,100+", label: "Verified members" },
  { value: "64", label: "Partner firms" },
  { value: "38", label: "Jurisdictions" },
  { value: "USD 2.8B+", label: "Mandates in motion" },
];

export default function CommunityHubLandingPage() {
  const featuredOpportunities = OPPORTUNITIES.slice(0, 3);
  const upcomingEvents = EVENTS.slice(0, 3);
  const featuredResources = RESOURCES.slice(0, 3);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(40% 60% at 80% 0%, hsl(var(--electric-cyan) / 0.08), transparent 70%), radial-gradient(40% 60% at 10% 100%, hsl(var(--night-plum) / 0.12), transparent 70%)",
          }}
        />
        <div className="relative z-10 mx-auto max-w-screen-xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            <div className="flex flex-col gap-6">
              <Badge className="w-fit rounded-full border border-primary/25 bg-primary/5 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-primary/85">
                <Users2 className="mr-1.5 h-3 w-3" aria-hidden="true" />
                Verified · Private · Executive
              </Badge>

              <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl text-balance">
                The <span className="text-gradient-primary">GEM Community Hub</span>
                <span className="block text-white/70">
                  A private network for cross-border execution.
                </span>
              </h1>

              <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg text-pretty">
                An invitation-only network for the partners, operators, investors,
                clients, and advisors who move GEM mandates forward — with
                verified identity, compliance-aware controls, and coordinated
                execution across jurisdictions.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  asChild
                  size="lg"
                  className="bg-primary font-semibold text-primary-foreground shadow-[0_0_24px_hsl(var(--electric-cyan)/0.35)] hover:bg-primary/90"
                >
                  <Link href="/client-login">
                    Member Login
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/15 bg-transparent text-white/80 hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                >
                  <Link href="/request-access">Request Access</Link>
                </Button>
              </div>

              {/* Live stats strip */}
              <dl className="mt-4 grid grid-cols-2 gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 sm:grid-cols-4">
                {HUB_STATS.map((s) => (
                  <div key={s.label} className="flex flex-col gap-1">
                    <dt className="text-[11px] uppercase tracking-wider text-white/40">
                      {s.label}
                    </dt>
                    <dd className="font-mono text-lg font-semibold text-primary">
                      {s.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Right — trust pillars */}
            <div className="lg:pl-6">
              <div className="mb-3 flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">
                <span className="h-1 w-6 bg-primary/50" aria-hidden="true" />
                What the Hub guarantees
              </div>
              <TrustRibbon />
              <p className="mt-4 text-xs leading-relaxed text-white/45">
                The Hub operates under GEM&apos;s enterprise controls:
                identity verification, entitlement-based access, and audited
                activity across every workspace action.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why join ─────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <HubSectionHeader
          eyebrow="Why members join"
          title={<>Execution-grade infrastructure for serious operators</>}
          description="The Hub is not a social feed. It is an operating surface — curated, credentialled, and built for the work of deploying capital, running mandates, and moving across jurisdictions."
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Verified identity, by default",
              body: "Every member passes KYC, entitlement review, and compliance screening. No anonymous counterparties. No generic social profiles.",
            },
            {
              title: "Opportunity flow, not noise",
              body: "Qualified opportunities — capital, mandates, partnerships, secondaries — surfaced only to members with the right profile and jurisdiction fit.",
            },
            {
              title: "Cross-border coordination",
              body: "Operators, advisors, and counsel attached on-demand to move work across regulatory regimes without losing the chain of custody.",
            },
            {
              title: "Private working groups",
              body: "Strategic Circles bring together senior principals on focused domains — cross-border capital, regtech, real estate, infrastructure.",
            },
            {
              title: "Audit-ready activity",
              body: "Every introduction, request, and mandate interaction is logged into an auditable trail aligned to SOC 2 and ISO 27001 controls.",
            },
            {
              title: "GEM-directed support",
              body: "Direct access to GEM concierge, legal, and compliance teams — escalation paths that execute, not ticket queues that linger.",
            },
          ].map((w) => (
            <div
              key={w.title}
              className="flex flex-col gap-2 rounded-2xl border border-white/[0.07] bg-[#0e1420] p-6 transition-colors hover:border-primary/20"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
              </div>
              <h3 className="mt-1 text-sm font-semibold text-foreground">{w.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{w.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Member types ─────────────────────────────────────────────────── */}
      <section className="border-y border-white/[0.06] bg-[#0b111c]">
        <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <HubSectionHeader
            eyebrow="Membership composition"
            title={<>Five member tiers, one working network</>}
            description="The Hub is deliberately mixed — capital, operators, counsel, and mandate-holders on the same surface, with every interaction verified."
          />

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {MEMBER_TYPES.map((t) => (
              <div
                key={t.tier}
                className="flex flex-col gap-2 rounded-2xl border border-white/[0.07] bg-[#0e1420] p-5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-primary/80">
                    {t.tier}
                  </span>
                  <span className="font-mono text-[11px] text-white/35">{t.count}</span>
                </div>
                <p className="text-sm font-semibold text-foreground">{t.tagline}</p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {t.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured opportunities preview ───────────────────────────────── */}
      <section className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <HubSectionHeader
          eyebrow="Featured opportunities"
          title={<>Qualified flow, surfaced to the right members</>}
          description="A curated sample of current mandates and allocations. Full listings, filters, and intros require verified membership."
          actions={
            <Button
              asChild
              variant="ghost"
              className="h-9 border border-white/10 bg-transparent text-white/70 hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
            >
              <Link href="/community-hub/opportunities">
                View all
                <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </Button>
          }
        />

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {featuredOpportunities.map((op) => (
            <OpportunityCard key={op.id} opportunity={op} />
          ))}
        </div>
      </section>

      {/* ── Briefings + Knowledge preview ────────────────────────────────── */}
      <section className="border-y border-white/[0.06] bg-[#0b111c]">
        <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-2">
            {/* Events */}
            <div className="flex flex-col gap-6">
              <HubSectionHeader
                eyebrow="Upcoming briefings"
                title={<>Executive sessions, on the record</>}
                description="Closed-door briefings and summits — members-only, curated attendance, Chatham-House posture."
                actions={
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="h-8 border border-white/10 bg-transparent text-xs text-white/70 hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                  >
                    <Link href="/community-hub/events">
                      Calendar
                      <ArrowUpRight className="ml-1 h-3 w-3" aria-hidden="true" />
                    </Link>
                  </Button>
                }
              />
              <div className="flex flex-col gap-3">
                {upcomingEvents.map((e) => (
                  <EventCard key={e.id} event={e} compact />
                ))}
              </div>
            </div>

            {/* Knowledge */}
            <div className="flex flex-col gap-6">
              <HubSectionHeader
                eyebrow="Knowledge Center"
                title={<>Intelligence you can act on</>}
                description="Briefs, playbooks, and regulatory analysis authored by GEM analysts for working principals."
                actions={
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="h-8 border border-white/10 bg-transparent text-xs text-white/70 hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                  >
                    <Link href="/community-hub/knowledge">
                      Library
                      <ArrowUpRight className="ml-1 h-3 w-3" aria-hidden="true" />
                    </Link>
                  </Button>
                }
              />
              <div className="grid gap-3">
                {featuredResources.map((r) => (
                  <ResourceCard key={r.id} resource={r} compact />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Access CTA ───────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <AccessRequestCTA />
      </section>
    </>
  );
}
