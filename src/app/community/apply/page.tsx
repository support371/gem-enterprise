import type { Metadata } from "next";
import { CircleUserRound, ClipboardCheck, Eye, ShieldCheck } from "lucide-react";
import { PublicIntakeForm } from "@/components/intake/PublicIntakeForm";

export const metadata: Metadata = {
  title: "Community Application | GEM Enterprise",
  description:
    "Submit a non-binding application for future GEM Community qualification and human review.",
};

const principles = [
  {
    icon: Eye,
    title: "Preview remains separate",
    text: "The public Community Hub is a fictional interface preview. This form does not represent an active member network or directory.",
  },
  {
    icon: ClipboardCheck,
    title: "Individual review",
    text: "Each application is recorded in a dedicated Community queue for human qualification and a reasoned next-step decision.",
  },
  {
    icon: ShieldCheck,
    title: "No automatic membership",
    text: "Submission does not create membership, access, an investment opportunity, a professional relationship, or a contractual commitment.",
  },
];

export default function CommunityApplicationPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border/60 px-6 py-20 cyber-grid">
        <div className="mx-auto max-w-5xl text-center">
          <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
            <CircleUserRound className="h-4 w-4" aria-hidden="true" /> Community qualification
          </p>
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">
            Apply for future Community consideration.
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
            Share your professional role, relevant interests, jurisdiction, and reason for applying.
            The application is recorded separately from enterprise and product enquiries.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-6 py-12 md:grid-cols-3">
        {principles.map(({ icon: Icon, title, text }) => (
          <article key={title} className="rounded-2xl border border-border/70 bg-card/70 p-5">
            <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="mt-4 font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
          </article>
        ))}
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-24">
        <div className="rounded-2xl border border-border/70 bg-card/70 p-6 sm:p-8">
          <PublicIntakeForm kind="COMMUNITY" />
        </div>
      </section>
    </main>
  );
}
