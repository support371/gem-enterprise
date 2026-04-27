import { Link } from "react-router-dom";
import { Activity, Braces, CheckCircle2, Clock, Globe2, KeyRound, ServerCog, ShieldAlert } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";

const metrics = [
  { label: "API Status", value: "Operational", icon: CheckCircle2 },
  { label: "Auth Mode", value: "KYC gated", icon: ShieldAlert },
  { label: "Response SLA", value: "2.0 min", icon: Clock },
  { label: "Service Scope", value: "Cyber + ATR", icon: Globe2 },
];

const endpoints = [
  { method: "GET", path: "/api/routes", description: "Return canonical routes, menu groups, and redirect map." },
  { method: "POST", path: "/api/access/request", description: "Submit qualified-client access request and account context." },
  { method: "GET", path: "/api/kyc/status", description: "Read KYC status for an authenticated client account." },
  { method: "POST", path: "/api/support/tickets", description: "Create support, document, or service request tickets." },
  { method: "POST", path: "/api/webhooks/events", description: "Receive signed GEM account, service, and workflow events." },
];

const ApiDashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-28 pb-20">
        <section className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr] items-start">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                API Dashboard
              </div>
              <h1 className="mt-6 text-4xl md:text-6xl font-bold tracking-tight text-foreground">
                Monitor and govern GEM Enterprise API operations.
              </h1>
              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                This surface defines the API control model for account requests, KYC status, service tickets, route discovery, webhook delivery, and client portal automation.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Button variant="hero" asChild>
                  <Link to="/docs">View API Docs</Link>
                </Button>
                <Button variant="glass" asChild>
                  <Link to="/developers">Developer Dashboard</Link>
                </Button>
              </div>
            </div>

            <div className="glass-panel rounded-3xl border border-border/50 p-6">
              <div className="flex items-center gap-3">
                <ServerCog className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-bold text-foreground">Operational contract</h2>
              </div>
              <p className="mt-4 leading-7 text-muted-foreground">
                API production access requires a registered account, approved KYC profile, assigned entitlement, and issued credentials. Public pages may describe endpoints, but execution remains gated.
              </p>
            </div>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.label} className="rounded-3xl border border-border/50 bg-secondary/20 p-5">
                  <Icon className="h-5 w-5 text-primary" />
                  <p className="mt-4 text-sm uppercase tracking-[0.18em] text-muted-foreground">{metric.label}</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">{metric.value}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-12 glass-panel rounded-3xl border border-border/50 p-6 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Endpoint map</h2>
                <p className="mt-2 text-muted-foreground">A production-facing summary of the API lanes expected by the platform.</p>
              </div>
              <KeyRound className="h-8 w-8 text-primary" />
            </div>
            <div className="mt-6 divide-y divide-border/70 rounded-2xl border border-border/70 overflow-hidden">
              {endpoints.map((endpoint) => (
                <div key={endpoint.path} className="grid gap-3 p-4 md:grid-cols-[90px_1fr_1.4fr] md:items-center">
                  <span className="inline-flex w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{endpoint.method}</span>
                  <code className="text-sm text-foreground">{endpoint.path}</code>
                  <p className="text-sm text-muted-foreground">{endpoint.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              [Activity, "Telemetry", "Request volume, health, latency, and audit signals should roll into the command surface."],
              [Braces, "Schemas", "Payload contracts are versioned and documented before production API use."],
              [ShieldAlert, "Compliance", "Sensitive operations stay entitlement-gated and audit-ready."],
            ].map(([Icon, title, description]) => {
              const IconCmp = Icon as typeof Activity;
              return (
                <div key={title as string} className="rounded-3xl border border-border/50 bg-background/60 p-5">
                  <IconCmp className="h-5 w-5 text-primary" />
                  <h3 className="mt-4 text-lg font-semibold text-foreground">{title as string}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{description as string}</p>
                </div>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ApiDashboard;
