import Link from "next/link";
import {
  Shield,
  Globe,
  Eye,
  AlertTriangle,
  FileText,
  Zap,
  ArrowRight,
  ChevronRight,
  Terminal,
  Search,
  Activity,
  Lock,
  Cpu,
  Radio,
  Map,
  Server,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Threat Intelligence | GEM Enterprise",
  description:
    "GEM Intelligence Command delivers real-time threat data, adversary intelligence, APT tracking, and vulnerability feeds for enterprise security teams.",
};

const threatMetrics = [
  {
    value: "14,200+",
    label: "Active Threats Monitored",
    description: "Concurrent threat indicators and active campaigns under analyst review.",
    icon: AlertTriangle,
    trend: "+8% vs last week",
    color: "text-red-400",
  },
  {
    value: "50M+",
    label: "IOCs Processed Daily",
    description:
      "Indicators of compromise ingested and correlated from 200+ intelligence sources.",
    icon: Cpu,
    trend: "Updated every 15 min",
    color: "text-primary",
  },
  {
    value: "200+",
    label: "Intelligence Sources",
    description:
      "Proprietary sensors, government feeds, commercial providers, and OSINT communities.",
    icon: Radio,
    trend: "Global coverage",
    color: "text-primary",
  },
];

const intelCategories = [
  {
    icon: Map,
    title: "APT Tracking",
    description:
      "Continuous profiling of 40+ active advanced persistent threat groups. GEM analysts maintain up-to-date TTPs, infrastructure mappings, and attribution confidence scores for each tracked actor — updated in real time as new campaigns emerge.",
    badge: "40+ Groups Tracked",
    badgeColor: "bg-red-500/10 text-red-400 border-red-500/30",
  },
  {
    icon: Search,
    title: "Vulnerability Research",
    description:
      "Proactive CVE tracking, zero-day intelligence, and exploit availability monitoring correlated with your registered asset inventory. CVSS-scored and prioritized for immediate remediation action.",
    badge: "CVE-Correlated",
    badgeColor: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  },
  {
    icon: Eye,
    title: "Dark Web Monitoring",
    description:
      "24/7 surveillance of dark web forums, paste sites, ransomware leak portals, and closed-access marketplaces. Instant alerting on brand mentions, credential leaks, and adversary discussions targeting your industry.",
    badge: "Live Surveillance",
    badgeColor: "bg-primary/10 text-primary border-primary/30",
  },
  {
    icon: Globe,
    title: "Geopolitical Risk",
    description:
      "Nation-state threat assessments, critical infrastructure targeting analysis, and sanctions intelligence for multinational enterprise clients. Weekly geo-cyber risk bulletins with regional impact scoring.",
    badge: "Weekly Briefs",
    badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  },
];

const intelReports = [
  {
    title: "Q1 2026 Global Threat Landscape Report",
    date: "March 2026",
    classification: "TLP:WHITE",
    classColor: "bg-green-500/10 text-green-400 border-green-500/30",
    category: "Quarterly Report",
    excerpt:
      "Comprehensive analysis of the evolving threat environment across all major verticals and geographies in Q1 2026. Key findings include a 34% increase in AI-assisted phishing, accelerating ransomware-as-a-service adoption, and expanded nation-state targeting of financial sector critical infrastructure.",
  },
  {
    title: "APT Group Activity: 2026 Profiles — EMEA & APAC",
    date: "February 2026",
    classification: "TLP:AMBER",
    classColor: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    category: "Research Report",
    excerpt:
      "In-depth profiling of 12 active APT groups operating in the EMEA and Asia-Pacific regions. Includes TTP matrices mapped to MITRE ATT&CK, infrastructure analysis, and attribution confidence levels. Distribution restricted to authenticated clients.",
  },
  {
    title: "Financial Sector Cyber Risk Bulletin — March 2026",
    date: "March 2026",
    classification: "TLP:GREEN",
    classColor: "bg-green-500/10 text-green-400 border-green-500/30",
    category: "Sector Brief",
    excerpt:
      "Tactical intelligence for CISO teams in banking, insurance, and capital markets. Covers emerging fraud vectors, insider threat indicators, third-party supply chain risk, and recommended detection signatures for the current threat environment.",
  },
  {
    title: "Dark Web Threat Intelligence Summary — W10 2026",
    date: "March 2026",
    classification: "TLP:WHITE",
    classColor: "bg-green-500/10 text-green-400 border-green-500/30",
    category: "Intel Brief",
    excerpt:
      "Monthly digest of dark web forum activity, credential marketplace listings, and emerging threat actor communications. Notable findings include a 2.4M-record banking credential dump and two active ransomware recruitment campaigns targeting mid-market enterprises.",
  },
];

const monitoringModules = [
  {
    icon: Shield,
    title: "24/7 SOC Coverage",
    description:
      "GEM's Security Operations Center operates across three regional hubs — North America, EMEA, and Asia-Pacific — ensuring continuous analyst coverage with no shift gaps. Mean time to acknowledge: 6 minutes.",
    metric: "MTTA: 6 min",
  },
  {
    icon: Server,
    title: "SIEM Integration",
    description:
      "Native integrations with Splunk, Microsoft Sentinel, IBM QRadar, and Elastic SIEM. Push IOC feeds directly to your security stack via REST API or STIX/TAXII 2.1 transport layer. Custom webhook support for all tiers.",
    metric: "STIX/TAXII 2.1",
  },
  {
    icon: Terminal,
    title: "Endpoint Telemetry",
    description:
      "EDR telemetry analysis from CrowdStrike Falcon, Microsoft Defender for Endpoint, and SentinelOne. GEM analysts correlate endpoint signals with global threat intelligence for enhanced detection fidelity.",
    metric: "3 EDR Platforms",
  },
];

const architectureSpecs = [
  {
    label: "Zero Trust",
    detail: "Identity-verified, least-privilege access enforcement across all platform surfaces. No implicit trust — every request authenticated and logged.",
  },
  {
    label: "SASE",
    detail: "Secure Access Service Edge architecture converging network security and wide-area networking for distributed enterprise environments.",
  },
  {
    label: "XDR",
    detail: "Extended Detection and Response correlating signals across endpoint, network, cloud, and identity layers for unified threat visibility.",
  },
  {
    label: "SOAR",
    detail: "Security Orchestration, Automation, and Response reducing mean time to respond through pre-approved playbook automation and analyst-assisted triage.",
  },
];

export default function IntelPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* ── Hero ── */}
      <section id="hero" className="relative py-28 cyber-grid overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 container mx-auto px-6 text-center max-w-4xl">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-2xl bg-primary/10 text-primary glow-cyan animate-float border border-primary/20">
              <Shield className="h-12 w-12" />
            </div>
          </div>
          <Badge className="mb-5 bg-primary/10 text-primary border-primary/30 font-mono text-xs tracking-widest uppercase px-4 py-1.5 inline-flex items-center gap-2">
            <Activity className="h-3 w-3 animate-pulse" />
            Intelligence Command — LIVE
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-5 leading-tight">
            <span className="text-gradient-primary">GEM Intelligence</span> Command
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            Real-time threat data, adversary intelligence, and vulnerability feeds — synthesized into
            actionable briefings for enterprise security teams. Our analysts operate 24/7 so your
            defenses are never standing still.
          </p>
          {/* Live status bar */}
          <div className="inline-flex items-center gap-3 glass-panel rounded-full px-5 py-2.5 border-primary/20 glow-cyan">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <span className="font-mono text-xs text-muted-foreground">
              LIVE FEED ACTIVE — Last updated: 2 min ago
            </span>
            <Badge className="bg-red-500/10 text-red-400 border-red-500/30 font-mono text-xs">
              LIVE
            </Badge>
          </div>
        </div>
      </section>

      {/* ── Threat Landscape Metrics ── */}
      <section id="metrics" className="py-20 container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Threat Landscape{" "}
            <span className="text-gradient-primary">Summary</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Live metrics from the GEM threat intelligence pipeline — updated continuously across
            all monitored environments.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {threatMetrics.map(({ value, label, description, icon: Icon, trend, color }) => (
            <Card key={label} className="glass-panel bento-card border-border/50 text-center">
              <CardHeader>
                <div className="flex justify-center mb-3">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
                <p className={`text-4xl font-extrabold ${color}`}>{value}</p>
                <CardTitle className="text-sm font-semibold mt-1">{label}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-muted-foreground text-xs leading-relaxed">{description}</p>
                <p className="font-mono text-xs text-primary/80">{trend}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Intelligence Categories ── */}
      <section id="categories" className="py-20 bg-card/30 border-y border-border">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/30 font-mono text-xs tracking-widest uppercase px-3 py-1">
              Intelligence Domains
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Intelligence{" "}
              <span className="text-gradient-primary">Categories</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Four specialized intelligence domains — each staffed by dedicated analysts and
              automated data pipelines operating in parallel.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {intelCategories.map(({ icon: Icon, title, description, badge, badgeColor }) => (
              <Card key={title} className="glass-panel bento-card border-border/50 group">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
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
        </div>
      </section>

      {/* ── Intel Reports ── */}
      <section id="reports" className="py-20 container mx-auto px-6">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/30 font-mono text-xs tracking-widest uppercase px-3 py-1">
            Publications
          </Badge>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Intelligence{" "}
            <span className="text-gradient-primary">Reports</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            In-depth research reports, sector briefings, and threat landscape analyses produced by
            the GEM Intelligence team and distributed to authenticated clients.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-5 max-w-5xl mx-auto">
          {intelReports.map((report, i) => (
            <Card key={i} className="glass-panel bento-card border-border/50 flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <Badge className="bg-primary/10 text-primary border-primary/30 text-xs">
                    {report.category}
                  </Badge>
                  <Badge className={`text-xs ${report.classColor}`}>
                    {report.classification}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-mono ml-auto">
                    {report.date}
                  </span>
                </div>
                <CardTitle className="text-sm font-semibold leading-snug">
                  {report.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 gap-4">
                <p className="text-muted-foreground text-xs leading-relaxed flex-1">
                  {report.excerpt}
                </p>
                <div className="flex gap-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-primary/40 text-primary hover:bg-primary/10 text-xs"
                  >
                    <FileText className="mr-1.5 h-3 w-3" />
                    View Report
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground text-xs"
                  >
                    Download PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground mt-6">
          TLP:AMBER and TLP:RED reports require authenticated client access.{" "}
          <Link href="/client-login" className="text-primary hover:underline underline-offset-4">
            Sign in to the Hub
          </Link>
        </p>
      </section>

      {/* ── Monitoring Modules ── */}
      <section id="monitoring" className="py-20 bg-card/30 border-y border-border">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/30 font-mono text-xs tracking-widest uppercase px-3 py-1">
              Operations
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Monitoring{" "}
              <span className="text-gradient-primary">Modules</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Three operational layers provide continuous visibility across your security perimeter —
              from SOC coverage to endpoint telemetry integration.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {monitoringModules.map(({ icon: Icon, title, description, metric }) => (
              <Card key={title} className="glass-panel bento-card border-border/50 group">
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
                  <p className="font-mono text-xs text-primary/80 bg-primary/5 rounded px-2 py-1 inline-block">
                    {metric}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Architecture Specs ── */}
      <section id="architecture" className="py-20 container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/30 font-mono text-xs tracking-widest uppercase px-3 py-1">
              Technical Foundation
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              GEM Security{" "}
              <span className="text-gradient-primary">Architecture</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Our platform is purpose-built on a modern security architecture — designed for
              enterprise resilience, operational visibility, and zero implicit trust.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5 mb-10">
            {architectureSpecs.map((spec) => (
              <div key={spec.label} className="glass-panel rounded-xl p-5 border-border/50 bento-card flex gap-4">
                <div className="p-2 rounded-lg bg-primary/10 text-primary h-fit">
                  <Cpu className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-bold text-sm text-primary mb-1">{spec.label}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{spec.detail}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="glass-panel border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Zap className="h-4 w-4 text-primary" />
                  Ingestion & Correlation Engine
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm leading-relaxed space-y-3">
                <p>
                  GEM ingests over 50 million threat signals daily from proprietary sensors,
                  government feeds, commercial threat intel providers, and open-source intelligence
                  communities. Our AI-powered correlation engine identifies relationships between
                  indicators, clusters threat actor activity, and surfaces actionable intelligence —
                  reducing mean-time-to-detect by 73%.
                </p>
              </CardContent>
            </Card>
            <Card className="glass-panel border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Lock className="h-4 w-4 text-primary" />
                  Delivery & Integration Layer
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm leading-relaxed space-y-3">
                <p>
                  Intelligence is delivered through the GEM Hub portal, REST API, STIX/TAXII 2.1
                  feeds, and SIEM integrations. All data is encrypted in transit and at rest with
                  role-based access controls and full audit logging — satisfying SOC 2 Type II,
                  ISO 27001, and PCI-DSS requirements.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="cta" className="py-24 bg-card/40 border-t border-border">
        <div className="container mx-auto px-6 text-center max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Need a{" "}
            <span className="text-gradient-primary">dedicated briefing</span>?
          </h2>
          <p className="text-muted-foreground mb-10 text-base leading-relaxed">
            Request a tailored threat intelligence consultation for your organization. Our analysts
            will prepare a bespoke threat assessment and architectural recommendations within 48
            hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan font-semibold px-8"
            >
              <Link href="/get-started">
                Request Consultation <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary/40 text-primary hover:bg-primary/10 font-semibold px-8"
            >
              <Link href="/client-login">Client Login <ChevronRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
