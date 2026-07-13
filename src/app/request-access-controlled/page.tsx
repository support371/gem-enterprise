import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CircleUserRound,
  PackageSearch,
  ShieldCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Request Access | GEM Enterprise",
  description:
    "Choose the correct GEM Enterprise qualification path for an enterprise application, future Community consideration, or a product request.",
};

const paths = [
  {
    href: "/enterprise/apply",
    icon: Building2,
    title: "Enterprise application",
    description:
      "For organizations seeking a documented cybersecurity, compliance-readiness, financial-risk, real-estate, or advisory scope.",
    action: "Start enterprise application",
  },
  {
    href: "/community/apply",
    icon: CircleUserRound,
    title: "Community application",
    description:
      "For operators, investors, advisors, family offices, and institutions applying for future Community consideration.",
    action: "Start Community application",
  },
  {
    href: "/store",
    icon: PackageSearch,
    title: "Product or service request",
    description:
      "Select a request-only catalogue item first so its product context is preserved through qualification, pricing, and fulfillment review.",
    action: "Browse request-only catalogue",
  },
];

export default function ControlledRequestAccessPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border/60 px-6 py-20 cyber-grid">
        <div className="mx-auto max-w-5xl text-center">
          <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" /> Controlled qualification entry
          </p>
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">
            Choose the request that matches your purpose.
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
            Enterprise, Community, and product enquiries are recorded in separate queues with their
            own validation, consent, product context, review history, and administrator workflow.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-16 lg:grid-cols-3">
        {paths.map(({ href, icon: Icon, title, description, action }) => (
          <article key={href} className="flex flex-col rounded-2xl border border-border/70 bg-card/70 p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <h2 className="mt-5 text-xl font-semibold">{title}</h2>
            <p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">{description}</p>
            <Link href={href} className="mt-6 inline-flex items-center gap-2 font-semibold text-primary">
              {action} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </article>
        ))}
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-6 text-sm leading-6 text-amber-100">
          This page is a non-binding request for information and qualification. Submission does not guarantee acceptance, membership, availability, pricing, response timing, or service activation. It does not create an account, contract, entitlement, or response-time guarantee. Do not submit passwords, identity documents, payment details, private keys, medical records, or confidential client records.
        </div>
      </section>
    </main>
  );
}
