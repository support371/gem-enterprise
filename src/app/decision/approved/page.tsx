import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, LayoutDashboard, ShieldCheck, UserCheck, ArrowRight } from "lucide-react";

const NEXT_STEPS = [
  {
    icon: LayoutDashboard,
    title: "Access Your Dashboard",
    description:
      "View your portfolio, investment opportunities, and account activity from your secure client dashboard.",
    href: "/app/dashboard",
    cta: "Go to Dashboard",
    primary: true,
  },
  {
    icon: ShieldCheck,
    title: "Explore Products",
    description:
      "Discover GEM Enterprise's institutional-grade cybersecurity, financial security, and real estate protection solutions.",
    href: "/services",
    cta: "View Products",
    primary: false,
  },
  {
    icon: UserCheck,
    title: "Speak with an Advisor",
    description:
      "Schedule a consultation with a dedicated client advisor to discuss your objectives and tailored investment strategy.",
    href: "/contact",
    cta: "Contact Advisor",
    primary: false,
  },
];

export default function DecisionApprovedPage() {
  return (
    <div className="min-h-screen bg-background cyber-grid flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl">
        {/* Success icon */}
        <div className="flex justify-center mb-8">
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-2 border-[hsl(var(--electric-cyan)/0.5)] bg-[hsl(var(--electric-cyan)/0.08)] glow-cyan">
            <CheckCircle2 className="h-12 w-12 text-[hsl(var(--electric-cyan))]" aria-hidden="true" />
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-10">
          <p className="font-mono text-xs tracking-widest text-[hsl(var(--electric-cyan))] uppercase mb-3">
            Status: Approved
          </p>
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Congratulations — Application Approved
          </h1>
          <p className="text-muted-foreground leading-relaxed max-w-lg mx-auto">
            Your identity has been successfully verified and your GEM Enterprise client account
            is now active. You have full access to our institutional-grade services.
          </p>
        </div>

        {/* Divider with label */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-[hsl(var(--border))]" />
          <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
            Your Next Steps
          </span>
          <div className="flex-1 h-px bg-[hsl(var(--border))]" />
        </div>

        {/* Action cards */}
        <div className="grid gap-4 mb-8">
          {NEXT_STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className={`glass-panel rounded-2xl p-6 border transition-all duration-200 ${
                  step.primary
                    ? "border-[hsl(var(--electric-cyan)/0.4)] hover:border-[hsl(var(--electric-cyan)/0.7)] hover:shadow-[0_0_24px_hsl(var(--electric-cyan)/0.15)]"
                    : "border-[hsl(var(--border))] hover:border-[hsl(var(--electric-cyan)/0.3)]"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${
                      step.primary
                        ? "bg-[hsl(var(--electric-cyan)/0.15)]"
                        : "bg-[hsl(var(--muted))]"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        step.primary
                          ? "text-[hsl(var(--electric-cyan))]"
                          : "text-muted-foreground"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground mb-1">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                      {step.description}
                    </p>
                    <Button
                      asChild
                      size="sm"
                      className={
                        step.primary
                          ? "bg-[hsl(var(--electric-cyan))] text-[hsl(var(--primary-foreground))] font-semibold hover:opacity-90"
                          : "variant-outline"
                      }
                      variant={step.primary ? "default" : "outline"}
                    >
                      <Link href={step.href}>
                        <span className="flex items-center gap-1.5">
                          {step.cta}
                          <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick access bar */}
        <div className="glass-panel rounded-2xl border border-[hsl(var(--border))] p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-medium text-foreground text-sm">Ready to get started?</p>
            <p className="text-xs text-muted-foreground">
              Access your secure client portal now.
            </p>
          </div>
          <Button
            asChild
            className="bg-[hsl(var(--electric-cyan))] text-[hsl(var(--primary-foreground))] font-semibold hover:opacity-90 whitespace-nowrap"
          >
            <Link href="/access/continue">
              <span className="flex items-center gap-2">
                Enter Portal
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </Button>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground/60">
          A confirmation email has been sent to your registered address.
        </p>
      </div>
    </div>
  );
}
