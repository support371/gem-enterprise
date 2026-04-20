import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, ArrowUpRight, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HubSectionHeader } from "@/components/hub/HubSectionHeader";
import { AccessRequestCTA } from "@/components/hub/AccessRequestCTA";
import { EVENTS } from "@/lib/hub/mock-data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Events & Briefings",
  description:
    "Executive briefings, in-person summits, and closed sessions for GEM Community Hub members.",
};

const FORMAT_TONE: Record<string, string> = {
  "Private Briefing": "border-primary/30 bg-primary/10 text-primary",
  "In-Person": "border-amber-400/30 bg-amber-400/10 text-amber-300",
  Virtual: "border-white/15 bg-white/5 text-white/80",
  "Closed Summit": "border-[hsl(280,40%,60%)]/30 bg-[hsl(280,40%,60%)]/10 text-[hsl(280,60%,75%)]",
};

export default function EventsPage() {
  return (
    <>
      <section className="border-b border-white/[0.06]">
        <div className="mx-auto max-w-screen-xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-md border border-primary/25 bg-primary/10 text-primary">
            <CalendarDays className="h-4.5 w-4.5" aria-hidden="true" />
          </div>
          <HubSectionHeader
            eyebrow="Events & Briefings"
            title={<>Executive sessions, curated attendance</>}
            description="The Hub calendar: private briefings, in-person summits, and closed working sessions. Registration is reviewed by the Chair or host."
          />
        </div>
      </section>

      {/* Featured event */}
      {EVENTS[0] && <FeaturedEvent event={EVENTS[0]} />}

      {/* Calendar list */}
      <section className="mx-auto max-w-screen-xl px-4 pb-12 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-sm font-semibold uppercase tracking-widest text-white/50">
          Upcoming sessions
        </h2>
        <div className="flex flex-col gap-3">
          {EVENTS.slice(1).map((e) => (
            <div
              key={e.id}
              className="flex flex-col gap-4 rounded-2xl border border-white/[0.07] bg-[#0e1420] p-5 transition-colors hover:border-primary/20 md:flex-row md:items-center"
            >
              <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl border border-primary/20 bg-primary/5">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-primary/80">
                  {e.month}
                </span>
                <span className="font-mono text-xl font-bold leading-none text-primary">
                  {e.day}
                </span>
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    className={cn(
                      "rounded-full border font-mono text-[10px] uppercase tracking-wider",
                      FORMAT_TONE[e.format]
                    )}
                  >
                    {e.format}
                  </Badge>
                  {e.location && (
                    <span className="inline-flex items-center gap-1 text-xs text-white/45">
                      <MapPin className="h-3 w-3" aria-hidden="true" />
                      {e.location}
                    </span>
                  )}
                  {e.seats && (
                    <span className="inline-flex items-center gap-1 text-xs text-white/45">
                      <Users className="h-3 w-3" aria-hidden="true" />
                      {e.seats}
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-foreground text-pretty">
                  {e.title}
                </h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {e.abstract}
                </p>
              </div>

              <Button
                asChild
                size="sm"
                className="h-9 shrink-0 bg-primary/10 text-primary hover:bg-primary/15"
              >
                <Link href="/request-access">
                  Register interest
                  <ArrowUpRight className="ml-1 h-3 w-3" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-screen-xl px-4 pb-16 sm:px-6 lg:px-8">
        <AccessRequestCTA
          title="Reserve a seat at the table"
          description="Members receive early-access invitations, priority seating at summits, and full access to briefing recordings and materials."
        />
      </section>
    </>
  );
}

function FeaturedEvent({ event }: { event: (typeof EVENTS)[number] }) {
  return (
    <section className="mx-auto max-w-screen-xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0b111c]">
        <div className="grid gap-6 p-6 md:grid-cols-[auto_1fr_auto] md:items-center md:gap-8 md:p-8">
          <div className="flex h-28 w-28 shrink-0 flex-col items-center justify-center rounded-2xl border border-primary/25 bg-primary/5">
            <span className="font-mono text-xs font-semibold uppercase tracking-widest text-primary/80">
              {event.month}
            </span>
            <span className="font-mono text-4xl font-bold leading-none text-primary">
              {event.day}
            </span>
          </div>
          <div className="flex flex-col gap-3">
            <Badge
              className={cn(
                "w-fit rounded-full border font-mono text-[10px] uppercase tracking-wider",
                FORMAT_TONE[event.format]
              )}
            >
              {event.format}
            </Badge>
            <h2 className="text-xl font-semibold text-foreground text-pretty sm:text-2xl">
              {event.title}
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {event.abstract}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-white/45">
              {event.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                  {event.location}
                </span>
              )}
              {event.seats && (
                <span className="inline-flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" aria-hidden="true" />
                  {event.seats}
                </span>
              )}
            </div>
          </div>
          <Button
            asChild
            className="bg-primary font-semibold text-primary-foreground hover:bg-primary/90 md:h-11"
          >
            <Link href="/request-access">Register interest</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
