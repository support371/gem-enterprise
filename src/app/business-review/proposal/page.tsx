import Link from "next/link";
import { CheckCircle2, LockKeyhole, ShieldCheck } from "lucide-react";
import { ProposalCheckoutButton } from "@/components/market/ProposalCheckoutButton";
import { getIntakeSubmission } from "@/lib/intake/repository";
import { foundingBusinessReviewOffer } from "@/lib/market/launchOffer";
import { verifyProposalToken } from "@/lib/market/proposal";

export const metadata = {
  title: "Business Review Proposal | GEM Enterprise",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{ token?: string }>;
};

function unavailable(message: string) {
  return (
    <main className="min-h-screen bg-background px-6 py-20 text-foreground">
      <div className="mx-auto max-w-2xl rounded-3xl border border-border bg-card/70 p-8">
        <LockKeyhole className="h-8 w-8 text-primary" aria-hidden="true" />
        <h1 className="mt-5 text-3xl font-bold">Proposal unavailable</h1>
        <p className="mt-4 leading-7 text-muted-foreground">{message}</p>
        <Link href="/business-review" className="mt-8 inline-flex font-semibold text-primary">
          Return to the Business Review
        </Link>
      </div>
    </main>
  );
}

export default async function BusinessReviewProposalPage({ searchParams }: PageProps) {
  const { token = "" } = await searchParams;
  const payload = verifyProposalToken(token);
  if (!payload) {
    return unavailable("This proposal link is invalid, expired, or no longer verifiable. Contact GEM for a new secure link.");
  }

  const result = await getIntakeSubmission(payload.intakeId).catch(() => null);
  if (!result || result.submission.publicId !== payload.publicId || result.submission.kind !== "ENTERPRISE") {
    return unavailable("The proposal could not be matched to an active GEM enterprise opportunity.");
  }

  const submission = result.submission;
  const approved = submission.status === "APPROVED";
  const converted = submission.status === "CONVERTED";

  return (
    <main className="min-h-screen bg-background px-6 py-16 text-foreground">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="rounded-3xl border border-primary/20 bg-card/70 p-7 sm:p-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" /> GEM Enterprise proposal
            </span>
            <span className="font-mono text-xs text-muted-foreground">{submission.publicId}</span>
          </div>
          <h1 className="mt-6 text-3xl font-bold sm:text-5xl">{foundingBusinessReviewOffer.name}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">
            Prepared for {submission.organization || submission.name}. {foundingBusinessReviewOffer.promise}
          </p>
          <div className="mt-7 flex flex-wrap items-end justify-between gap-5 rounded-2xl border border-border bg-background/60 p-5">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Founding scope</p>
              <p className="mt-1 text-3xl font-bold">${foundingBusinessReviewOffer.priceUsd}</p>
              <p className="mt-1 text-xs text-muted-foreground">One-time review. Further remediation is separately scoped.</p>
            </div>
            <div className="text-right text-sm">
              <p className="text-muted-foreground">Opportunity status</p>
              <p className="mt-1 font-semibold">{converted ? "Paid / onboarding" : approved ? "Approved for checkout" : "Proposal review"}</p>
            </div>
          </div>
        </header>

        <section className="grid gap-5 md:grid-cols-2">
          <article className="rounded-2xl border border-border bg-card/60 p-6">
            <h2 className="font-semibold">Included</h2>
            <div className="mt-4 space-y-3">
              {foundingBusinessReviewOffer.includes.map((item) => (
                <div key={item} className="flex gap-3 text-sm leading-6">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </article>
          <article className="rounded-2xl border border-border bg-card/60 p-6">
            <h2 className="font-semibold">Scope boundaries</h2>
            <div className="mt-4 space-y-3">
              {foundingBusinessReviewOffer.notIncluded.map((item) => (
                <div key={item} className="flex gap-3 text-sm leading-6 text-muted-foreground">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="rounded-2xl border border-border bg-card/60 p-6 sm:p-8">
          <h2 className="text-xl font-semibold">Acceptance and payment</h2>
          {converted ? (
            <div className="mt-4 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4 text-sm leading-6">
              Payment has been verified and this opportunity has entered GEM onboarding. Workspace access is still provisioned through the controlled client-access process.
            </div>
          ) : approved ? (
            <>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                Continuing means you accept this bounded review scope and proceed to the configured GEM payment provider. Payment never grants administrator or workspace privileges by itself.
              </p>
              <div className="mt-6">
                <ProposalCheckoutButton token={token} />
              </div>
            </>
          ) : (
            <div className="mt-4 rounded-xl border border-amber-500/25 bg-amber-500/10 p-4 text-sm leading-6 text-amber-100">
              GEM is still completing the human scope review. Payment remains unavailable until the opportunity is formally approved.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
