import { Link } from "react-router-dom";
import { ArrowRight, Briefcase, LayoutDashboard, ShieldCheck, Users, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";

const accessCards = [
  {
    title: "Open Secure Portal",
    description:
      "Move directly from the mobile-first front door into the authenticated workspace for services, activity, and secure access.",
    href: "/portal",
    icon: LayoutDashboard,
    accent: "text-primary",
  },
  {
    title: "Explore Service Lanes",
    description:
      "Review the operational service catalog, managed security lanes, and trust-backed service delivery paths.",
    href: "/portal/services",
    icon: Briefcase,
    accent: "text-accent",
  },
  {
    title: "Enter Workspace",
    description:
      "Use the full platform workflow surface for collaboration, secure execution, and enterprise workspace visibility.",
    href: "/portal/workspace",
    icon: Workflow,
    accent: "text-primary",
  },
];

const trustSignals = [
  {
    label: "Secure Access",
    value: "Role-gated",
    icon: ShieldCheck,
  },
  {
    label: "Service Tabs",
    value: "Preserved",
    icon: Briefcase,
  },
  {
    label: "Portal Community",
    value: "Connected",
    icon: Users,
  },
];

export const PlatformAccessSection = () => {
  return (
    <section className="relative py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="glass-panel rounded-3xl border border-border/50 p-6 md:p-8 lg:p-10 overflow-hidden relative">
          <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none" />
          <div className="absolute -top-24 right-0 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Unified Platform Access
              </div>
              <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                Mobile-first preview outside. Full service workspace inside.
              </h2>
              <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl">
                The live website now acts as the front door to the platform. Keep the industrial mobile-style presentation on the public surface, then move users cleanly into the full service tabs, workspace, and secure portal flows.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {accessCards.map((card) => {
                const Icon = card.icon;
                return (
                  <Link
                    key={card.title}
                    to={card.href}
                    className="group rounded-2xl border border-border/50 bg-background/50 p-5 transition-all duration-300 hover:border-primary/30 hover:bg-secondary/20 hover:-translate-y-0.5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
                          <Icon className={`h-5 w-5 ${card.accent}`} />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                            {card.title}
                          </h3>
                          <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            {card.description}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary" />
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr] items-start">
              <div className="rounded-2xl border border-border/50 bg-background/50 p-5 md:p-6">
                <h3 className="text-lg font-semibold text-foreground">Why this version works better</h3>
                <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                  <li>• Keeps the current dark industrial visual system intact.</li>
                  <li>• Preserves the service-tab structure rather than flattening it away.</li>
                  <li>• Makes the public website act like a true platform entry point.</li>
                  <li>• Keeps the portal, workspace, and services connected under one live experience.</li>
                </ul>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button variant="hero" asChild>
                    <Link to="/portal" className="flex items-center gap-2">
                      Open Platform
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="glass" asChild>
                    <Link to="/company">Review Company</Link>
                  </Button>
                </div>
              </div>

              <div className="grid gap-3">
                {trustSignals.map((signal) => {
                  const Icon = signal.icon;
                  return (
                    <div
                      key={signal.label}
                      className="rounded-2xl border border-border/50 bg-background/50 p-4 flex items-center gap-4"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{signal.label}</p>
                        <p className="text-sm font-semibold text-foreground mt-1">{signal.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
