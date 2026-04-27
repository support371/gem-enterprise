import { Link } from "react-router-dom";
import { Code2, KeyRound, LineChart, Lock, ShieldCheck, Workflow } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";

const developerCards = [
  {
    title: "API Keys",
    description: "Provision publishable client keys, server-side integration keys, and scoped access credentials after account approval.",
    icon: KeyRound,
  },
  {
    title: "Usage Metrics",
    description: "Track calls, service requests, portal activity, workspace events, and integration throughput in one control plane.",
    icon: LineChart,
  },
  {
    title: "Secure Webhooks",
    description: "Connect approved account events, KYC milestones, support requests, and service status changes to external systems.",
    icon: Workflow,
  },
  {
    title: "Access Controls",
    description: "Use role-gated access for admins, managers, analysts, viewers, and qualified client accounts.",
    icon: Lock,
  },
];

const integrationFlow = [
  "Request account access through Get Started or Client Login.",
  "Complete registration and KYC verification for eligibility review.",
  "Receive role and entitlement assignment after compliance approval.",
  "Use the portal, API dashboard, and Docs Hub to connect services safely.",
];

const DeveloperDashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-28 pb-20">
        <section className="container mx-auto px-4">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Developer Dashboard
            </div>
            <h1 className="mt-6 text-4xl md:text-6xl font-bold tracking-tight text-foreground">
              Build secure integrations around the GEM Enterprise workspace.
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
              The developer dashboard is the operational bridge for API keys, usage visibility, webhooks, and integration controls. Access is qualified-client only and depends on successful account, KYC, and entitlement review.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button variant="hero" asChild>
                <Link to="/api-dashboard">Open API Dashboard</Link>
              </Button>
              <Button variant="glass" asChild>
                <Link to="/docs">Read Docs Hub</Link>
              </Button>
            </div>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {developerCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.title} className="glass-panel rounded-3xl border border-border/50 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="mt-5 text-xl font-semibold text-foreground">{card.title}</h2>
                  <p className="mt-3 leading-7 text-muted-foreground">{card.description}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
            <div className="glass-panel rounded-3xl border border-border/50 p-6 md:p-8">
              <div className="flex items-center gap-3">
                <Code2 className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">Integration lifecycle</h2>
              </div>
              <div className="mt-6 space-y-4">
                {integrationFlow.map((item, index) => (
                  <div key={item} className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {index + 1}
                    </div>
                    <p className="pt-1 text-muted-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-primary/20 bg-primary/10 p-6 md:p-8">
              <ShieldCheck className="h-8 w-8 text-primary" />
              <h2 className="mt-5 text-2xl font-bold text-foreground">Security posture</h2>
              <p className="mt-3 leading-7 text-muted-foreground">
                API access is not open self-serve. GEM Enterprise uses verified client status, role-based access, and compliance review before enabling production integrations.
              </p>
              <Button className="mt-6" variant="hero" asChild>
                <Link to="/register">Request Developer Access</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default DeveloperDashboard;
