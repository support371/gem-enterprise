import { Link } from "react-router-dom";
import { ArrowRight, Building2, CheckCircle2, LockKeyhole, ShieldCheck } from "lucide-react";

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const eligibilitySignals = [
  "Regulated financial services, trust, or real-asset operations",
  "Active cybersecurity, compliance, or digital-asset exposure",
  "Need for monitored onboarding, risk review, or secure client access",
];

const steps = [
  {
    icon: ShieldCheck,
    title: "Confirm eligibility",
    description: "Share your operating profile so the GEM team can route you to the right enterprise workflow.",
  },
  {
    icon: LockKeyhole,
    title: "Secure intake",
    description: "Complete onboarding through the platform flow instead of fragmented marketing forms or duplicated menus.",
  },
  {
    icon: Building2,
    title: "Activate the right lane",
    description: "Move into client portal, trust services, or cybersecurity engagement paths with a clean handoff.",
  },
];

const GetStarted = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      <main className="pt-24">
        <section className="relative overflow-hidden border-b border-border/60">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.18),transparent_34%),radial-gradient(circle_at_bottom_right,hsl(var(--accent)/0.12),transparent_30%)]" />
          <div className="container mx-auto px-4 py-20 sm:py-24 lg:py-28">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-6 inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                Enterprise onboarding
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Start with one clean path into GEM Enterprise.
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
                Use the unified GEM Enterprise intake flow to validate fit, protect context, and move into the right service lane without duplicated navigation or disconnected handoffs.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link to="/register">
                    Check Eligibility
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                  <Link to="/auth">Sign In</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16 sm:py-20">
          <div className="grid gap-6 lg:grid-cols-3">
            {steps.map(({ icon: Icon, title, description }) => (
              <article key={title} className="rounded-2xl border border-border/70 bg-card/70 p-6 shadow-sm backdrop-blur">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-semibold">{title}</h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 pb-20">
          <div className="rounded-3xl border border-border/70 bg-card/70 p-6 shadow-sm backdrop-blur sm:p-8 lg:p-10">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Fit criteria</p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Built for serious operating environments.</h2>
                <p className="mt-4 text-muted-foreground">
                  This route now uses the same branded navigation, global theme, and design-system controls as the rest of the enterprise platform.
                </p>
              </div>
              <div className="space-y-4">
                {eligibilitySignals.map((signal) => (
                  <div key={signal} className="flex gap-3 rounded-xl border border-border/60 bg-background/60 p-4">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm leading-6 text-muted-foreground">{signal}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default GetStarted;
