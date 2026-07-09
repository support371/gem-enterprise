import Link from "next/link";
import { ArrowRight, CheckCircle, Clock, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VERIFY_PROHIBITED_DATA_NOTICE } from "@/lib/kyc/policy";

const steps = [
  {
    title: "Prepare a limited application",
    description:
      "Provide your name, country, organization when relevant, contact number when useful, and the service you are requesting.",
  },
  {
    title: "Accept the review notice",
    description:
      "Consent is recorded against the application before it can be submitted.",
  },
  {
    title: "Join the manual review queue",
    description:
      "An authorized reviewer may approve, reject, or request additional non-document information during available operating periods.",
  },
];

export default function VerificationStartPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-xs uppercase tracking-wider text-cyan-400">
          <Clock className="h-3.5 w-3.5" /> Controlled manual workflow
        </div>
        <h1 className="text-3xl font-black text-foreground sm:text-4xl">
          Start a GEM verification application
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
          This first release records a limited application, consent, case status,
          reviewer assignment, information requests, and a human decision. It is
          not an automated identity check and does not activate services by itself.
        </p>
      </section>

      <section className="space-y-3">
        {steps.map((step, index) => (
          <div
            key={step.title}
            className="flex gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-5"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cyan-500/25 bg-cyan-500/10 text-sm font-bold text-cyan-400">
              {index + 1}
            </div>
            <div>
              <h2 className="font-semibold text-foreground">{step.title}</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-5">
        <div className="flex gap-3">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
          <div>
            <h2 className="font-semibold text-amber-200">Sensitive-data restriction</h2>
            <p className="mt-1 text-sm leading-6 text-amber-100/80">
              {VERIFY_PROHIBITED_DATA_NOTICE}
            </p>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CheckCircle className="h-4 w-4 text-cyan-400" /> Submission does not guarantee approval or immediate service.
        </div>
        <Button asChild className="bg-cyan-400 font-semibold text-black hover:bg-cyan-300">
          <Link href="/kyc/individual">
            Begin application <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
