import Link from "next/link";
import {
  Shield,
  TrendingUp,
  Building,
  Globe,
  Eye,
  Lock,
  ArrowRight,
  ChevronRight,
  FileText,
  AlertTriangle,
  BarChart3,
  Cpu,
  CheckCircle,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "GEM Enterprise | Defend. Protect. Prevail.",
  description:
    "GEM Enterprise delivers institutional-grade cybersecurity, financial security, and real estate protection for qualified clients.",
};

const stats = [
  { value: "500+", label: "Enterprise Clients" },
  { value: "99.97%", label: "Uptime SLA" },
  { value: "$2.8B+", label: "Assets Protected" },
  { value: "24/7", label: "SOC Coverage" },
];

const pillars = [
  {
    icon: Shield,
    title: "Cybersecurity",
    description:
      "Advanced threat intelligence, SOC-as-a-service, vulnerability management, and incident response — purpose-built for enterprise environments. Our analysts monitor your perimeter around the clock so your team can focus on mission-critical work.",
    href: "/intel",
    cta: "Explore Threat Intel",
  },
  {
    icon: TrendingUp,
    title: "Financial Security",
    description:
      "Asset recovery, fraud mitigation, regulatory compliance, and portfolio-level financial risk monitoring for institutional clients. GEM's forensic financial specialists work alongside legal and cyber teams to protect what you've built.",
    href: "/assets",
    cta: "Asset Protection",
  },
  {
    icon: Building,
    title: "Real Estate Protection",
    description:
      "Title fraud prevention, deed monitoring, and property-level security intelligence for high-value real estate portfolios. Continuous surveillance across residential, commercial, and industrial asset classes nationwide.",
    href: "/assets",
    cta: "Property Security",
  },
];

const bentoHighlights = [
  {
    icon: Eye,
    title: "Threat Intelligence",
    description:
      "Real-time IOC feeds, APT tracking, and adversary profiling synthesized into actionable briefings. Updated continuously from 200+ sources.",
    href: "/intel",
    span: "md:col-span-2",
  },
  {
    icon: Lock,
    title: "Asset Protection",
    description:
      "Comprehensive monitoring and recovery services for digital, financial, and physical assets.",
    href: "/assets",
    span: "",
  },
  {
    icon: Shield,
    title: "Secure Transactions",
    description:
      "Transaction-level fraud detection and secure custody solutions for high-value financial operations.",
    href: "/assets",
    span: "",
  },
  {
    icon: BarChart3,
    title: "Portfolio Management",
    description:
      "Full-spectrum portfolio security posture: anomaly detection, risk scoring, and quarterly reviews.",
    href: "/assets",
    span: "",
  },
  {
    icon: Cpu,
    title: "Compliance Monitoring",
    description:
      "Automated evidence collection and continuous compliance tracking across NIST, SOC 2, ISO 27001, and PCI-DSS.",
    href: "/hub",
    span: "",
  },
  {
    icon: FileText,
    title: "Intel Briefs",
    description:
      "Curated weekly intelligence briefings delivered to your team — threat digests, sector bulletins, and geopolitical risk assessments.",
    href: "/intel",
    span: "md:col-span-2",
  },
];

const certifications = [
  { name: "SOC 2 Type II", description: "Verified service organization controls" },
  { name: "ISO 27001", description: "International information security management" },
  { name: "NIST CSF", description: "Cybersecurity framework alignment" },
  { name: "PCI-DSS", description: "Payment card industry data security standard" },
];

const resourceHighlights = [
  {
    icon: Globe,
    title: "Market Intelligence",
    description:
      "Quarterly threat landscape reports and geopolitical risk briefings covering key financial markets and emerging attack vectors.",
    href: "/resources",
    tag: "Reports",
  },
  {
    icon: FileText,
    title: "Security Templates",
    description:
      "Enterprise-grade policy templates, incident response playbooks, and compliance frameworks — audit-ready and immediately deployable.",
    href: "/resources",
    tag: "Templates",
  },
  {
    icon: AlertTriangle,
    title: "Intel Briefs",
    description:
      "Curated threat intelligence briefs delivered on a weekly cadence — written by GEM analysts for enterprise security teams.",
    href: "/intel",
    tag: "Intelligence",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* ── Hero ── */}
      <section
        id="hero"
        className="relative min-h-screen flex items-center justify-center cyber-grid overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/75 to-background pointer-events-none" />
        {/* ambient glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 container mx-auto px-6 py-24 text-center max-w-5xl">
          <Badge className="mb-7 bg-primary/10 text-primary border-primary/30 font-mono text-xs tracking-widest uppercase px-4 py-1.5 inline-flex items-center gap-2">
            <Activity className="h-3 w-3 animate-pulse" />
            GEM Enterprise Platform — 2026
          </Badge>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-6 leading-none">
            <span className="text-gradient-primary">Defend.</span>{" "}
            <span className="text-foreground">Protect.</span>{" "}
            <span className="text-foreground">Prevail.</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            GEM Enterprise delivers institutional-grade cybersecurity, financial security, and real
            estate protection for qualified clients. Threat intelligence. Asset recovery. Compliance.
            All from a single command platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              asChild
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan font-semibold px-8 text-base"
            >
              <Link href="/get-started">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary/40 text-primary hover:bg-primary/10 font-semibold px-8 text-base"
            >
              <Link href="/intel">
                View Intel <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Live status indicator strip */}
          <div className="max-w-xl mx-auto glass-panel rounded-xl px-6 py-4 flex flex-wrap items-center justify-center gap-6 glow-cyan">
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              SOC Active — 3 Regions
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              3,847 IOCs Loaded
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              14 Threats Under Analysis
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section id="stats" className="bg-card/60 border-y border-border py-10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label} className="space-y-1">
                <p className="text-4xl font-extrabold text-gradient-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground font-medium tracking-wide">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Service Pillars ── */}
      <section id="pillars" className="py-28 container mx-auto px-6">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/30 font-mono text-xs tracking-widest uppercase px-3 py-1">
            Core Services
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
            Three Pillars of{" "}
            <span className="text-gradient-primary">Enterprise Protection</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
            Integrated security across your digital, financial, and physical assets — managed from a
            single authenticated command platform staffed by certified analysts.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-7">
          {pillars.map(({ icon: Icon, title, description, href, cta }) => (
            <Card key={title} className="glass-panel bento-card border-border/50 flex flex-col group">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl font-bold">{title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 gap-5">
                <p className="text-muted-foreground text-sm leading-relaxed flex-1">{description}</p>
                <Link
                  href={href}
                  className="inline-flex items-center gap-1 text-primary text-sm font-semibold hover:underline underline-offset-4"
                >
                  {cta} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Platform Highlights Bento Grid ── */}
      <section id="platform" className="py-20 bg-card/30 border-y border-border">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/30 font-mono text-xs tracking-widest uppercase px-3 py-1">
              Platform Capabilities
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Everything Your Enterprise{" "}
              <span className="text-gradient-primary">Needs</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Six integrated capability domains — unified in the GEM command platform, accessible
              through a single authenticated portal.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5 max-w-6xl mx-auto">
            {bentoHighlights.map(({ icon: Icon, title, description, href, span }) => (
              <Card
                key={title}
                className={`glass-panel bento-card border-border/50 group ${span}`}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-base font-semibold">{title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
                  <Link
                    href={href}
                    className="inline-flex items-center gap-1 text-primary text-xs font-medium hover:underline underline-offset-4"
                  >
                    Learn more <ChevronRight className="h-3 w-3" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust / Certifications ── */}
      <section id="trust" className="py-24 container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/30 font-mono text-xs tracking-widest uppercase px-3 py-1">
              Compliance & Standards
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Built on a Foundation of{" "}
              <span className="text-gradient-primary">Trust</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              GEM's platform and processes are independently audited and aligned with the most
              demanding international security and compliance standards.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {certifications.map((cert) => (
              <div
                key={cert.name}
                className="glass-panel bento-card rounded-xl p-5 text-center border-border/50 flex flex-col items-center gap-2"
              >
                <CheckCircle className="h-6 w-6 text-primary" />
                <p className="font-bold text-base text-foreground">{cert.name}</p>
                <p className="text-xs text-muted-foreground leading-snug">{cert.description}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-8 max-w-xl mx-auto">
            GEM Enterprise is independently audited by third-party certification bodies. All
            compliance documentation is available to verified clients through the Hub portal.
          </p>
        </div>
      </section>

      {/* ── Resource Highlights ── */}
      <section id="resources" className="py-20 bg-card/30 border-y border-border">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/30 font-mono text-xs tracking-widest uppercase px-3 py-1">
              Resources
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Intelligence &{" "}
              <span className="text-gradient-primary">Research Library</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Actionable intelligence, policy templates, and threat research to strengthen your
              security posture — available to all GEM clients.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {resourceHighlights.map(({ icon: Icon, title, description, href, tag }) => (
              <Card key={title} className="glass-panel bento-card border-border/50 flex flex-col group">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                        <Icon className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-base font-semibold">{title}</CardTitle>
                    </div>
                    <Badge className="bg-primary/10 text-primary border-primary/30 text-xs shrink-0">
                      {tag}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col flex-1 gap-4">
                  <p className="text-muted-foreground text-sm leading-relaxed flex-1">{description}</p>
                  <Link
                    href={href}
                    className="inline-flex items-center gap-1 text-primary text-sm font-medium hover:underline underline-offset-4"
                  >
                    Browse Resources <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button asChild variant="outline" className="border-primary/40 text-primary hover:bg-primary/10">
              <Link href="/resources">
                View Full Resource Library <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Qualified Client Access CTA ── */}
      <section id="client-access" className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-primary/8 blur-3xl pointer-events-none" />

        <div className="relative z-10 container mx-auto px-6 text-center max-w-3xl">
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/30 font-mono text-xs tracking-widest uppercase px-4 py-1.5 inline-flex items-center gap-2">
            <Lock className="h-3 w-3" />
            Qualified Client Access
          </Badge>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-5 leading-tight">
            Secure Your{" "}
            <span className="text-gradient-primary">Enterprise Today</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-4 leading-relaxed">
            GEM Enterprise services are available to qualified organizations. Begin your KYC
            onboarding to access the full platform, or sign in to your existing client account.
          </p>
          <p className="text-sm text-muted-foreground/70 mb-10 font-mono">
            Eligibility: Enterprise organizations with 100+ employees or $50M+ in annual revenue.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan font-semibold px-10 text-base"
            >
              <Link href="/get-started">
                Start KYC <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary/40 text-primary hover:bg-primary/10 font-semibold px-10 text-base"
            >
              <Link href="/client-login">Client Login</Link>
            </Button>
          </div>
          <p className="mt-8 text-xs text-muted-foreground">
            By proceeding, you agree to GEM's{" "}
            <Link href="/terms" className="text-primary hover:underline underline-offset-4">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-primary hover:underline underline-offset-4">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
