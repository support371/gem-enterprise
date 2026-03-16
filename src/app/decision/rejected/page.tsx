import Link from "next/link";
import { Button } from "@/components/ui/button";
import { XCircle, AlertTriangle, Mail, FileText, ArrowRight } from "lucide-react";

const POSSIBLE_REASONS = [
  "The information provided could not be independently verified.",
  "Submitted documents did not meet our verification standards.",
  "Incomplete application or missing required information.",
  "The applicant does not meet our current eligibility criteria.",
  "Regulatory or compliance considerations specific to your jurisdiction.",
  "Discrepancies identified between provided information and verification results.",
];

export default function DecisionRejectedPage() {
  return (
    <div className="min-h-screen bg-background cyber-grid flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl">
        {/* Status icon */}
        <div className="flex justify-center mb-8">
          <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-destructive/40 bg-destructive/10">
            <XCircle className="h-12 w-12 text-destructive" aria-hidden="true" />
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <p className="font-mono text-xs tracking-widest text-destructive/80 uppercase mb-3">
            Status: Not Approved
          </p>
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Application Not Approved
          </h1>
          <p className="text-muted-foreground leading-relaxed max-w-md mx-auto">
            After careful review by our compliance team, we are unable to approve your
            application at this time. We understand this outcome may be disappointing and
            we appreciate your interest in GEM Enterprise.
          </p>
        </div>

        {/* Possible reasons */}
        <div className="glass-panel rounded-2xl border border-[hsl(var(--border))] p-6 mb-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
            </div>
            <h2 className="font-semibold text-foreground">Common Reasons for Non-Approval</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            Applications may not be approved for a variety of reasons, which may include but
            are not limited to:
          </p>
          <ul className="space-y-2.5">
            {POSSIBLE_REASONS.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[hsl(var(--muted-foreground))] flex-shrink-0" />
                <span className="text-sm text-muted-foreground leading-relaxed">{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact / appeal */}
        <div className="glass-panel rounded-2xl border border-[hsl(var(--border))] p-6 mb-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--electric-cyan)/0.1)]">
              <Mail className="h-4 w-4 text-[hsl(var(--electric-cyan))]" />
            </div>
            <h2 className="font-semibold text-foreground">Questions or Appeals</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            If you believe this decision was made in error, or if you would like to discuss
            your application in more detail, our compliance team is available to assist you.
            Please reference your application ID (included in the notification email) when
            contacting us.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Please note that reapplications may be submitted after a waiting period of{" "}
            <span className="text-foreground font-medium">90 days</span>, provided any
            underlying issues have been resolved.
          </p>
        </div>

        {/* Appeal info */}
        <div className="glass-panel rounded-2xl border border-[hsl(var(--border))] p-5 mb-8 flex items-start gap-3">
          <FileText className="h-5 w-5 text-[hsl(var(--electric-cyan))] flex-shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground">Appeal Process: </span>
            You have the right to request a formal review of this decision. Appeals must be
            submitted in writing within 30 days of receiving your decision notification.
            Our compliance team will review your appeal and respond within 10 business days.
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            asChild
            className="flex-1 bg-[hsl(var(--electric-cyan))] text-[hsl(var(--primary-foreground))] font-semibold hover:opacity-90"
          >
            <Link href="/contact">
              <span className="flex items-center gap-2">
                Contact Compliance Team
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href="/">Return to Homepage</Link>
          </Button>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground/60">
          All decisions are final unless successfully appealed within 30 days.
        </p>
      </div>
    </div>
  );
}
