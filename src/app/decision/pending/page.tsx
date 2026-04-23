import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Clock, Mail, CheckCircle2, ArrowRight, HeadphonesIcon } from "lucide-react";

const WHAT_TO_EXPECT = [
  "Our compliance team will review your submitted information and documents.",
  "You may be contacted for additional clarification or supplementary documentation.",
  "A decision will be communicated to your registered email address.",
  "No action is required on your part unless you are contacted.",
];

export default function DecisionPendingPage() {
  return (
    <div className="min-h-screen bg-background cyber-grid flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl">
        {/* Status icon */}
        <div className="flex justify-center mb-8">
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-2 border-amber-500/40 bg-amber-500/10">
            <Clock className="h-12 w-12 text-amber-400" aria-hidden="true" />
            <span className="absolute -top-1 -right-1 flex h-5 w-5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-50" />
              <span className="relative inline-flex rounded-full h-5 w-5 bg-amber-500" />
            </span>
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <p className="font-mono text-xs tracking-widest text-amber-400 uppercase mb-3">
            Status: Under Review
          </p>
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Application Under Review
          </h1>
          <p className="text-muted-foreground leading-relaxed max-w-md mx-auto">
            Your KYC application is currently being reviewed by our compliance team. This
            process typically takes{" "}
            <span className="text-foreground font-medium">3–5 business days</span>.
          </p>
        </div>

        {/* Timeline card */}
        <div className="glass-panel rounded-2xl border border-[hsl(var(--border))] p-6 mb-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
              <Clock className="h-4 w-4 text-amber-400" />
            </div>
            <h2 className="font-semibold text-foreground">Expected Timeline</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-[hsl(var(--border))]">
              <span className="text-sm text-muted-foreground">Standard Review</span>
              <span className="text-sm font-medium text-foreground">3–5 business days</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">Complex / Manual Review</span>
              <span className="text-sm font-medium text-foreground">7–14 business days</span>
            </div>
          </div>
        </div>

        {/* What to expect */}
        <div className="glass-panel rounded-2xl border border-[hsl(var(--border))] p-6 mb-5">
          <h2 className="font-semibold text-foreground mb-4">What to Expect</h2>
          <ul className="space-y-3">
            {WHAT_TO_EXPECT.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-[hsl(var(--electric-cyan))] flex-shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Email notice */}
        <div className="glass-panel rounded-2xl border border-[hsl(var(--border))] p-5 mb-8 flex items-start gap-3">
          <Mail className="h-5 w-5 text-[hsl(var(--electric-cyan))] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground">Email Notification: </span>
            You will be notified by email when a decision is made on your application.
            Please ensure your registered email address is active and check your spam folder.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            asChild
            className="flex-1 bg-[hsl(var(--electric-cyan))] text-[hsl(var(--primary-foreground))] font-semibold hover:opacity-90"
          >
            <Link href="/kyc/status">
              <span className="flex items-center gap-2">
                Check Application Status
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href="/app/support">
              <span className="flex items-center gap-2">
                <HeadphonesIcon className="h-4 w-4" />
                Contact Support
              </span>
            </Link>
          </Button>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground/60">
          Application reference is included in your confirmation email.
        </p>
      </div>
    </div>
  );
}
