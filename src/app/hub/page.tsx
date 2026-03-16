import Link from "next/link";
import { ShieldCheck, FileText, Users, Zap, ArrowRight, Globe, AlertTriangle, Terminal, Phone, Mail, MessageSquare, ClipboardList, BookOpen, Archive, FlaskConical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Hub" };

const commandModules = [
  {
    icon: AlertTriangle,
    title: "Threat Command",
    description:
      "Centralized threat management console. Monitor active incidents, review analyst-assigned threat ratings, manage detection rules, and coordinate response actions across your enterprise environment.",
    badge: "Active",
    badgeColor: "bg-red-500/10 text-red-400 border-red-500/30",
  },
  {
    icon: ClipboardList,
    title: "Compliance Center",
    description:
      "Track your organization's compliance posture against major frameworks — NIST CSF, ISO 27001, SOC 2, PCI-DSS. Automated evidence collection, gap analysis, and audit-ready reporting.",
    badge: "Live",
    badgeColor: "bg-green-500/10 text-green-400 border-green-500/30",
  },
  {
    icon: FlaskConical,
    title: "Research Lab",
    description:
      "Access GEM's full research library — technical deep-dives, malware analyses, adversary profiles, and MITRE ATT&CK mappings. Collaborate with GEM analysts on custom research engagements.",
    badge: "Open",
    badgeColor: "bg-primary/10 text-primary border-primary/30",
  },
  {
    icon: Archive,
    title: "Intelligence Archive",
    description:
      "Searchable archive of all historical threat intelligence reports, IOC feeds, intel briefs, and incident records associated with your account. Full-text search with taxonomy filtering.",
    badge: "Indexed",
    badgeColor: "bg-primary/10 text-primary border-primary/30",
  },
];

const socCapabilities = [
  {
    icon: Globe,
    title: "24/7 Global Coverage",
    description:
      "GEM's Security Operations Center operates around the clock across three regional hubs — North America, EMEA, and Asia-Pacific. No gaps. No handoff delays. Continuous expert oversight of your threat posture.",
  },
  {
    icon: Zap,
    title: "Sub-10 Minute Response",
    description:
      "From alert trigger to analyst engagement in under 10 minutes. Our SOC team maintains a documented mean time to acknowledge (MTTA) of 6 minutes across all severity levels.",
  },
  {
    icon: ShieldCheck,
    title: "Integrated Playbook Execution",
    description:
      "Standardized incident response playbooks — co-developed with your team during onboarding — are executed automatically upon alert confirmation, minimizing analyst decision latency.",
  },
];

const documentTypes = [
  { name: "Incident Response Plans", description: "Customized IR plans aligned to your organization's technology stack and risk profile." },
  { name: "Security Policy Templates", description: "Ready-to-use policy templates covering acceptable use, access control, data handling, and more." },
  { name: "Compliance Evidence Packages", description: "Pre-formatted evidence bundles for SOC 2, ISO 27001, and PCI-DSS audits." },
  { name: "Threat Intelligence Reports", description: "All historical and current threat reports, sector briefings, and intel briefs associated with your subscription." },
  { name: "Asset Protection Agreements", description: "Legal documentation for active asset protection and recovery engagements." },
  { name: "KYC & Onboarding Records", description: "Your verified onboarding documentation, KYC certificates, and membership records." },
  { name: "Training Materials", description: "Security awareness training decks, phishing simulation reports, and tabletop exercise materials." },
  { name: "Audit Logs & Activity Reports", description: "Platform access logs, SOC interaction records, and periodic activity summaries." },
];

const supportChannels = [
  {
    icon: Phone,
    title: "Emergency Hotline",
    description: "24/7 direct line for active incidents and critical security events.",
    detail: "+1 (800) GEM-CTRL",
    badge: "24/7",
  },
  {
    icon: MessageSquare,
    title: "Secure Messaging",
    description: "Encrypted in-platform messaging with your dedicated account manager and SOC team.",
    detail: "Available in Hub Portal",
    badge: "Encrypted",
  },
  {
    icon: Mail,
    title: "Email Support",
    description: "Non-urgent inquiries, documentation requests, and general account management.",
    detail: "support@gem-enterprise.io",
    badge: "< 4hr Response",
  },
];

export default function HubPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section
        id="hero"
        className="relative py-28 cyber-grid overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 to-background pointer-events-none" />
        <div className="relative z-10 container mx-auto px-6 text-center max-w-4xl">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-2xl bg-primary/10 text-primary glow-cyan animate-float">
              <Terminal className="h-12 w-12" />
            </div>
          </div>
          <Badge className="mb-5 bg-primary/10 text-primary border-primary/30 font-mono text-xs tracking-widest uppercase px-4 py-1.5">
            Client Operations
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
            Operational <span className="text-gradient-primary">Hub</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-light mb-6">
            Command, Coordinate, Execute.
          </p>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            The GEM Hub is your authenticated command center — a unified interface for threat management, compliance, intelligence, and support across your entire engagement with GEM Enterprise.
          </p>
        </div>
      </section>

      {/* Command Center */}
      <section id="command" className="py-24 container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Command <span className="text-gradient-primary">Center</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Four integrated modules give your security and compliance teams everything they need — in one authenticated workspace.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {commandModules.map(({ icon: Icon, title, description, badge, badgeColor }) => (
            <Card key={title} className="glass-panel bento-card border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-base font-semibold">{title}</CardTitle>
                  </div>
                  <Badge className={`text-xs shrink-0 ${badgeColor}`}>{badge}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* SOC Capabilities */}
      <section id="soc" className="py-24 bg-card/30 border-y border-border">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              SOC <span className="text-gradient-primary">Capabilities</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              GEM's Security Operations Center is the engine behind the Hub — staffed by certified analysts operating at enterprise scale.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {socCapabilities.map(({ icon: Icon, title, description }) => (
              <Card key={title} className="glass-panel bento-card border-border/50">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-base font-semibold">{title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Documents */}
      <section id="documents" className="py-24 container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Client <span className="text-gradient-primary">Documents</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Authenticated clients have access to a comprehensive library of documents, templates, and records through the Hub portal.
            </p>
          </div>
          <div className="glass-panel rounded-xl overflow-hidden">
            <div className="bg-card/80 px-4 py-2 border-b border-border flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-primary" />
              <span className="font-mono text-xs text-muted-foreground">document-library — authenticated access required</span>
            </div>
            <div className="divide-y divide-border/40">
              {documentTypes.map((doc, i) => (
                <div key={i} className="flex items-start gap-4 px-5 py-4 hover:bg-primary/5 transition-colors">
                  <FileText className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{doc.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{doc.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-4">
            Document access requires authentication.{" "}
            <Link href="/client-login" className="text-primary hover:underline">
              Sign in to the Hub
            </Link>
          </p>
        </div>
      </section>

      {/* Support Access */}
      <section id="support" className="py-24 bg-card/30 border-y border-border">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Support <span className="text-gradient-primary">Access</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Multiple channels available to GEM clients — from real-time emergency response to routine account management.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {supportChannels.map(({ icon: Icon, title, description, detail, badge }) => (
              <Card key={title} className="glass-panel bento-card border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <CardTitle className="text-sm font-semibold">{title}</CardTitle>
                    </div>
                    <Badge className="bg-primary/10 text-primary border-primary/30 text-xs shrink-0">{badge}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-muted-foreground text-xs leading-relaxed">{description}</p>
                  <p className="font-mono text-xs text-primary">{detail}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Service Requests */}
      <section id="requests" className="py-24 container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Service <span className="text-gradient-primary">Requests</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Authenticated clients can submit service requests, scope new engagements, and escalate matters directly through the Hub portal.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="glass-panel border-border/50">
              <CardHeader>
                <CardTitle className="text-base font-semibold">How to Submit a Request</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <ol className="space-y-3 list-none">
                  {[
                    "Sign in to your Hub account using your registered credentials.",
                    "Navigate to the Service Requests module from the main dashboard.",
                    "Select the request category: Incident Response, Intelligence, Compliance, Asset Protection, or General.",
                    "Complete the request form — include affected systems, urgency level, and any relevant context.",
                    "Submit. Your dedicated account manager will acknowledge within 2 hours.",
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="font-mono text-primary font-bold shrink-0 mt-0.5">{`0${i + 1}`}</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
            <Card className="glass-panel border-border/50">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Request Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { label: "Incident Response", desc: "Active security incidents requiring immediate SOC escalation." },
                    { label: "Intelligence Request", desc: "Custom threat intelligence or adversary profiling." },
                    { label: "Compliance Support", desc: "Audit preparation, evidence collection, framework gap analysis." },
                    { label: "Asset Protection", desc: "New asset registration, monitoring configuration, or recovery initiation." },
                    { label: "Account & Billing", desc: "Subscription changes, documentation, and account management." },
                  ].map((cat) => (
                    <div key={cat.label} className="flex items-start gap-2 py-2 border-b border-border/30 last:border-0">
                      <span className="text-sm font-medium text-foreground w-40 shrink-0">{cat.label}</span>
                      <span className="text-xs text-muted-foreground">{cat.desc}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="mt-8 text-center">
            <p className="text-muted-foreground text-sm mb-4">
              Service requests require authentication. Access the Hub to submit requests, track status, and communicate with your GEM team.
            </p>
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan font-semibold px-8">
              <Link href="/client-login">
                Access Hub Portal <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="py-24 bg-card/40 border-t border-border">
        <div className="container mx-auto px-6 text-center max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Not yet a <span className="text-gradient-primary">GEM client</span>?
          </h2>
          <p className="text-muted-foreground mb-10 text-lg">
            Begin your enterprise onboarding to unlock full Hub access — threat command, compliance tools, intelligence archive, and dedicated SOC support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan font-semibold px-8">
              <Link href="/get-started">
                Start Onboarding <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary/40 text-primary hover:bg-primary/10 font-semibold px-8">
              <Link href="/intel">Explore Platform</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
