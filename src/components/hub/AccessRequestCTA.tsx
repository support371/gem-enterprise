import Link from "next/link";
import { ArrowRight, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AccessRequestCTAProps {
  title?: string;
  description?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

/**
 * Enterprise-grade access CTA band.
 * Minimal gradient, strong trust cues, two clear next actions.
 */
export function AccessRequestCTA({
  title = "Request access to the GEM Community Hub",
  description = "The Hub is an invitation-only network for qualified members. Request access and our team will review your application within five business days.",
  primaryLabel = "Request Access",
  primaryHref = "/request-access",
  secondaryLabel = "Member Login",
  secondaryHref = "/client-login",
}: AccessRequestCTAProps) {
  return (
    <section
      aria-label="Community Hub access"
      className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0b111c] p-8 md:p-12"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background:
            "radial-gradient(60% 50% at 80% 20%, hsl(var(--electric-cyan) / 0.10), transparent 70%)",
        }}
      />
      <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-primary/85">
            <Lock className="h-3 w-3" aria-hidden="true" />
            Invitation-only
          </div>
          <h3 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl text-balance">
            {title}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base text-pretty">
            {description}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-white/50">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-primary/70" aria-hidden="true" />
              KYC-verified members
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-primary/70" aria-hidden="true" />
              SOC 2 &amp; ISO 27001 aligned
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-primary/70" aria-hidden="true" />
              Cross-border execution
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row md:flex-col md:items-stretch">
          <Button
            asChild
            size="lg"
            className="bg-primary font-semibold text-primary-foreground shadow-[0_0_24px_hsl(var(--electric-cyan)/0.35)] hover:bg-primary/90"
          >
            <Link href={primaryHref}>
              {primaryLabel}
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white/15 bg-transparent text-white/80 hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
          >
            <Link href={secondaryHref}>{secondaryLabel}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
