import type { Metadata } from "next";
import { Building2, ClipboardCheck, LockKeyhole, ShieldCheck } from "lucide-react";
import { PublicIntakeForm } from "@/components/intake/PublicIntakeForm";

export const metadata: Metadata = {
  title: "Enterprise Application | GEM Enterprise",
  description:
    "Submit a non-binding enterprise qualification request for cybersecurity, compliance readiness, financial-risk, real-estate, or advisory support.",
};

const principles = [
  {
    icon: ClipboardCheck,
    title: "Human qualification",
    text: "A reviewer evaluates scope, eligibility, jurisdiction, staffing, provider dependencies, and next steps.",
  },
  {
    icon: LockKeyhole,
    title: "No sensitive uploads",
    text: "This public form does not accept identity documents, passwords, banking details, private keys, or confidential client records.",
  },
  {
    icon: ShieldCheck,
    title: "No automatic commitment",
    text: "Submission does not create an account, contract, price, SLA, entitlement, approval, or service activation.",
  },
];

export default function EnterpriseApplicationPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border/60 px-6 py-20 cyber-grid">
        <div className="mx-auto max-w-5xl text-center">
          <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
            <Building2 className="h-4 w-4" aria-hidden="true" /> Enterprise qualification
          </p>
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">
            Request a documented enterprise scope.
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
            Describe the organization, operating need, jurisdiction, and desired outcome. The request
            is recorded in the enterprise intake queue for human review.
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
          <PublicIntakeForm kind="ENTERPRISE" />
        </div>
      </section>
    </main>
  );
}
