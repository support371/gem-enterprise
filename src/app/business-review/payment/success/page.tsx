import Link from "next/link";
import { CheckCircle2, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Payment Received | GEM Enterprise",
  robots: { index: false, follow: false },
};

export default function BusinessReviewPaymentSuccessPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-20 text-foreground">
      <div className="mx-auto max-w-2xl rounded-3xl border border-emerald-500/25 bg-card/70 p-8 sm:p-10">
        <CheckCircle2 className="h-10 w-10 text-emerald-400" aria-hidden="true" />
        <h1 className="mt-5 text-3xl font-bold">Payment submitted</h1>
        <p className="mt-4 leading-7 text-muted-foreground">
          GEM verifies payment through the payment provider before converting the opportunity into onboarding. This page alone does not activate service, create an account, or grant workspace access.
        </p>
        <div className="mt-6 rounded-2xl border border-border bg-background/60 p-5 text-sm leading-6">
          <div className="flex items-center gap-2 font-semibold">
            <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" /> Controlled onboarding
          </div>
          <p className="mt-2 text-muted-foreground">
            After verified payment, GEM continues through the approved client-access and Workspace OS provisioning process. Role boundaries remain unchanged.
          </p>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className="rounded-xl border border-border px-5 py-3 font-semibold">Return home</Link>
          <Link href="/contact" className="rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground">Contact GEM</Link>
        </div>
      </div>
    </main>
  );
}
