import { Link } from "react-router-dom";
import { BookOpen, CheckCircle2, ClipboardList, FileCode2, GitBranch, LockKeyhole, ShieldCheck, UserCheck } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";

const docs = [
  {
    title: "Account request mode",
    description: "Users begin through Get Started, create an account, then move into KYC and compliance review before service access is opened.",
    icon: UserCheck,
  },
  {
    title: "KYC and decisioning",
    description: "Client accounts move through pending, approved, rejected, or manual-review decision states before workspace entitlements are assigned.",
    icon: ClipboardList,
  },
  {
    title: "Portal access",
    description: "Approved clients receive role-aware access to dashboard, services, tasks, incidents, community, workspace, team, activity, and settings lanes.",
    icon: LockKeyhole,
  },
  {
    title: "Service lanes",
    description: "Cybersecurity, financial, real estate, Alliance Trust Realty, and support lanes remain connected through the same authenticated client surface.",
    icon: ShieldCheck,
  },
  {
    title: "API integration",
    description: "Developers use documented routes, signed webhooks, API credentials, and usage controls once account access is approved.",
    icon: FileCode2,
  },
  {
    title: "Deployment governance",
    description: "GitHub Actions Guardian workflow and Vercel deployments validate build health before a release is treated as inspection-ready.",
    icon: GitBranch,
  },
];

const routeFamilies = [
  ["Public shell", "Home, Intel, Services, Community, Hub, Resources, Company"],
  ["Account access", "Client Login, Register, Reset Password, KYC, KYC Status, Handoff"],
  ["Portal", "Dashboard, Services, Tasks, Incidents, Community, Workspace, Team, Activity, Settings"],
  ["Developer", "Developer Dashboard, API Dashboard, Docs Hub"],
  ["Support", "Support Access, Requests, Documents, Contact"],
];

const DocsHub = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-28 pb-20">
        <section className="container mx-auto px-4">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Docs Hub
            </div>
            <h1 className="mt-6 text-4xl md:text-6xl font-bold tracking-tight text-foreground">
              Operating manual for the GEM Enterprise platform.
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
              This hub explains how the mobile-first shell, account request flow, client portal, API dashboard, service lanes, and deployment governance work together as one platform.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button variant="hero" asChild>
                <Link to="/register">Start Account Request</Link>
              </Button>
              <Button variant="glass" asChild>
                <Link to="/api-dashboard">API Dashboard</Link>
              </Button>
            </div>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {docs.map((doc) => {
              const Icon = doc.icon;
              return (
                <div key={doc.title} className="glass-panel rounded-3xl border border-border/50 p-6">
                  <Icon className="h-6 w-6 text-primary" />
                  <h2 className="mt-5 text-xl font-semibold text-foreground">{doc.title}</h2>
                  <p className="mt-3 leading-7 text-muted-foreground">{doc.description}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-3xl border border-primary/20 bg-primary/10 p-6 md:p-8">
              <BookOpen className="h-8 w-8 text-primary" />
              <h2 className="mt-5 text-2xl font-bold text-foreground">Mode of account request</h2>
              <p className="mt-3 leading-7 text-muted-foreground">
                GEM Enterprise is not open-access. The public mobile shell routes interested users into Client Login or Get Started. New users register, complete KYC, enter review, and receive portal/API access only after compliance approval.
              </p>
              <div className="mt-6 space-y-3 text-sm text-muted-foreground">
                <p>1. Public user opens Get Started.</p>
                <p>2. Registration creates an account shell.</p>
                <p>3. KYC captures eligibility context and required documents.</p>
                <p>4. Manual or automated review assigns status.</p>
                <p>5. Approved clients receive role and service entitlements.</p>
              </div>
            </div>

            <div className="glass-panel rounded-3xl border border-border/50 p-6 md:p-8">
              <h2 className="text-2xl font-bold text-foreground">Route families</h2>
              <div className="mt-6 space-y-4">
                {routeFamilies.map(([label, description]) => (
                  <div key={label} className="rounded-2xl border border-border/60 bg-background/60 p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-foreground">{label}</h3>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
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

export default DocsHub;
