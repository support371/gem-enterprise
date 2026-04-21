import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileSearch, Clock, FileText, Mail, Phone, ArrowRight } from "lucide-react";

const WHAT_THIS_MEANS = [
  "Your application has been escalated to a senior compliance officer for detailed review.",
  "Additional documentation or clarification may be requested via email.",
  "This process is confidential — your information is handled with the highest level of security.",
  "Manual review does not indicate that your application will be denied.",
];

export default function ManualReviewPage() {
  return (
    <div className="min-h-screen bg-background cyber-grid flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl">
        {/* Status icon */}
        <div className="flex justify-center mb-8">
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-2 border-[hsl(var(--electric-cyan)/0.4)] bg-[hsl(var(--electric-cyan)/0.08)]">
            <FileSearch className="h-12 w-12 text-[hsl(var(--electric-cyan))]" aria-hidden="true" />
            <span className="absolute -top-1 -right-1 flex h-5 w-5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[hsl(var(--electric-cyan))] opacity-40" />
              <span className="relative inline-flex rounded-full h-5 w-5 bg-[hsl(var(--electric-cyan)/0.7)]" />
            </span>
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <p className="font-mono text-xs tracking-widest text-[hsl(var(--electric-cyan))] uppercase mb-3">
            Status: Manual Review
          </p>
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Manual Review Required
          </h1>
          <p className="text-muted-foreground leading-relaxed max-w-md mx-auto">
            Your application has been flagged for additional compliance review by our team.
            A member of our compliance team will contact you within{" "}
            <span className="text-foreground font-medium">2 business days</span>.
          </p>
        </div>

        {/* Timeline */}
        <div className="glass-panel rounded-2xl border border-[hsl(var(--border))] p-6 mb-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--electric-cyan)/0.1)]">
              <Clock className="h-4 w-4 text-[hsl(var(--electric-cyan))]" />
            </div>
            <h2 className="font-semibold text-foreground">Review Timeline</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-[hsl(var(--border))]">
              <span className="text-sm text-muted-foreground">Initial contact</span>
              <span className="text-sm font-medium text-foreground">Within 2 business days</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[hsl(var(--border))]">
              <span className="text-sm text-muted-foreground">Document request (if needed)</span>
              <span className="text-sm font-medium text-foreground">Via email</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">Final decision</span>
              <span className="text-sm font-medium text-foreground">7–14 business days</span>
            </div>
          </div>
        </div>

        {/* What this means */}
        <div className="glass-panel rounded-2xl border border-[hsl(var(--border))] p-6 mb-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--electric-cyan)/0.1)]">
              <FileText className="h-4 w-4 text-[hsl(var(--electric-cyan))]" />
            </div>
            <h2 className="font-semibold text-foreground">What This Means</h2>
          </div>
          <ul className="space-y-3">
            {WHAT_THIS_MEANS.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[hsl(var(--electric-cyan))] flex-shrink-0" />
                <span className="text-sm text-muted-foreground leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact info */}
        <div className="glass-panel rounded-2xl border border-[hsl(var(--border))] p-6 mb-8">
          <h2 className="font-semibold text-foreground mb-4">Need Immediate Assistance?</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--muted))]">
                <Mail className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <a
                  href="mailto:compliance@gemcybersecurityassist.com"
                  className="text-sm font-medium text-[hsl(var(--electric-cyan))] hover:underline"
                >
                  compliance@gemcybersecurityassist.com
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--muted))]">
                <Phone className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone (Business Hours)</p>
                <a
                  href="tel:+14017022460"
                  className="text-sm font-medium text-foreground hover:text-[hsl(var(--electric-cyan))] transition-colors"
                >
                  +1 (401) 702-2460
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            asChild
            className="flex-1 bg-[hsl(var(--electric-cyan))] text-[hsl(var(--primary-foreground))] font-semibold hover:opacity-90"
          >
            <Link href="/kyc/status">
              <span className="flex items-center gap-2">
                View Application Status
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href="/contact">Contact Support</Link>
          </Button>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground/60">
          Reference your application ID in all correspondence.
        </p>
      </div>
    </div>
  );
}
