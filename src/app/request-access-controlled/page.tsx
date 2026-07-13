import type { Metadata } from "next";
import {
  ClipboardCheck,
  FileWarning,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { RequestAccessForm } from "@/components/hub/RequestAccessForm";

export const metadata: Metadata = {
  title: "Request Access | GEM Enterprise",
  description:
    "Submit a non-binding GEM Enterprise access request for qualification and human review.",
};

const controls = [
  {
    icon: ClipboardCheck,
    title: "Human review",
    description:
      "A submission creates a request for review. It does not create membership, a client account, a contract, an entitlement, or an approval.",
  },
  {
    icon: LockKeyhole,
    title: "Limited public intake",
    description:
      "Do not submit passwords, payment details, identity documents, private keys, medical records, or other highly sensitive information through this public form.",
  },
  {
    icon: FileWarning,
    title: "No fixed decision promise",
    description:
      "Review timing depends on request type, evidence, jurisdiction, staffing, and required checks. Any service target is confirmed separately in writing.",
  },
];

export default function ControlledRequestAccessPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border/60 px-6 py-20 cyber-grid">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Controlled qualification request
          </p>
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">
            Tell us what you need. A qualified reviewer will assess the next step.
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
            This is a non-binding request for information and qualification. Submitting the form
            does not guarantee acceptance, availability, pricing, response time, membership,
            regulatory eligibility, or service activation.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-5 md:grid-cols-3">
          {controls.map(({ icon: Icon, title, description }) => (
            <article key={title} className="rounded-2xl border border-border/70 bg-card/70 p-5">
              <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
              <h2 className="mt-4 font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-24">
        <div className="rounded-2xl border border-border/70 bg-card/70 p-6 sm:p-8">
          <RequestAccessForm />
        </div>
      </section>
    </main>
  );
}
