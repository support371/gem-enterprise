import type { Metadata } from "next";
import { Compass } from "lucide-react";
import { HubSectionHeader } from "@/components/hub/HubSectionHeader";
import { CircleCard } from "@/components/hub/CircleCard";
import { AccessRequestCTA } from "@/components/hub/AccessRequestCTA";
import { CIRCLES } from "@/lib/hub/mock-data";

export const metadata: Metadata = {
  title: "Strategic Circles",
  description:
    "GEM Strategic Circles — focused, private working groups of senior principals coordinating across domains and jurisdictions.",
};

const PRINCIPLES = [
  {
    title: "Invitation-based participation",
    body: "Each Circle maintains a curated roster. Membership is extended by the Chair in consultation with GEM.",
  },
  {
    title: "Chatham-House posture",
    body: "Discussions are on-record inside the Circle, off-record outside. All activity is logged; nothing is published.",
  },
  {
    title: "Working group cadence",
    body: "Circles operate on a working cadence — briefings, huddles, and summits — not casual chat.",
  },
];

export default function CirclesPage() {
  return (
    <>
      <section className="border-b border-white/[0.06]">
        <div className="mx-auto max-w-screen-xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-md border border-primary/25 bg-primary/10 text-primary">
            <Compass className="h-4.5 w-4.5" aria-hidden="true" />
          </div>
          <HubSectionHeader
            eyebrow="Strategic Circles"
            title={<>Private working groups for serious principals</>}
            description="Strategic Circles replace generic groups. Each is a focused, credentialled working group of senior members advancing a specific domain — with a Chair, a working cadence, and an on-record posture."
          />
        </div>
      </section>

      {/* Circles grid */}
      <section className="mx-auto max-w-screen-xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {CIRCLES.map((c) => (
            <CircleCard key={c.id} circle={c} />
          ))}
        </div>
      </section>

      {/* Operating principles */}
      <section className="border-y border-white/[0.06] bg-[#0b111c]">
        <div className="mx-auto max-w-screen-xl px-4 py-14 sm:px-6 lg:px-8">
          <HubSectionHeader
            eyebrow="How Circles operate"
            title={<>Curation, cadence, and record</>}
            description="Every Circle runs under the same three operating principles."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {PRINCIPLES.map((p) => (
              <div
                key={p.title}
                className="rounded-2xl border border-white/[0.07] bg-[#0e1420] p-6"
              >
                <h3 className="text-sm font-semibold text-foreground">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-screen-xl px-4 py-14 sm:px-6 lg:px-8">
        <AccessRequestCTA
          title="Join a Strategic Circle"
          description="Circle participation is extended to members in good standing whose profile and activity fit the group. Request access to begin the review."
        />
      </section>
    </>
  );
}
