import Link from "next/link";
import { ShieldCheck, TrendingUp, Building2, Globe, AlertTriangle, FileText, ArrowRight, Lock, RefreshCw, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Asset Protection" };

const pillars = [
  {
    icon: Lock,
    title: "Digital Asset Security",
    description:
      "Comprehensive protection for digital assets including intellectual property, proprietary data, cryptographic holdings, and enterprise software systems. We deploy layered controls — access management, encryption, behavioral monitoring, and incident response — to prevent unauthorized access and exfiltration.",
  },
  {
    icon: TrendingUp,
    title: "Financial Asset Recovery",
    description:
      "When financial assets are compromised through fraud, cybercrime, or unauthorized transfers, GEM's recovery specialists engage immediately. We work alongside law enforcement, financial institutions, and legal teams to trace, freeze, and recover misappropriated funds.",
  },
  {
    icon: Building2,
    title: "Real Property Security",
    description:
      "Continuous deed and title monitoring for residential and commercial properties. We detect and respond to fraudulent transfer attempts, unauthorized liens, and title manipulation before they impact ownership. Coverage available for individual properties and enterprise-scale portfolios.",
  },
  {
    icon: BarChart3,
    title: "Portfolio Monitoring",
    description:
      "Real-time surveillance of your full asset portfolio — digital, financial, and physical. Anomaly detection alerts, risk scoring, and quarterly security posture reviews give your executive team complete visibility across your holdings.",
  },
];

const recoverySteps = [
  {
    step: "01",
    title: "Incident Detection",
    description: "Automated monitoring detects anomalous activity — unauthorized transfers, fraudulent deeds, credential misuse, or data exfiltration — and triggers an immediate alert.",
  },
  {
    step: "02",
    title: "Triage & Containment",
    description: "GEM analysts assess scope and severity within minutes. Containment actions are executed in parallel — accounts suspended, access revoked, legal holds placed — to limit further loss.",
  },
  {
    step: "03",
    title: "Forensic Investigation",
    description: "A dedicated forensics team traces the attack vector, identifies the responsible parties, and documents evidence in a format suitable for law enforcement and legal proceedings.",
  },
  {
    step: "04",
    title: "Recovery & Remediation",
    description: "With evidence secured, GEM coordinates with financial institutions, law enforcement, and regulators to initiate asset recovery. Simultaneously, affected systems are remediated and hardened.",
  },
  {
    step: "05",
    title: "Post-Incident Review",
    description: "A comprehensive after-action report is delivered within 30 days, detailing root cause, recovery outcome, and a prioritized roadmap to prevent recurrence.",
  },
];

const metrics = [
  {
    value: "$4.2B",
    label: "Assets Under Protection",
    description: "Total value of enterprise assets actively monitored across all GEM client portfolios.",
  },
  {
    value: "94%",
    label: "Recovery Success Rate",
    description: "Percentage of financial asset recovery engagements resulting in partial or full recovery of client assets.",
  },
  {
    value: "< 8 min",
    label: "Mean Time to Alert",
    description: "Average time from anomaly detection to client notification across all monitoring categories.",
  },
];

export default function AssetsPage() {
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
            <div className="p-4 rounded-2xl bg-primary/10 text-primary glow-cyan">
              <ShieldCheck className="h-12 w-12" />
            </div>
          </div>
          <Badge className="mb-5 bg-primary/10 text-primary border-primary/30 font-mono text-xs tracking-widest uppercase px-4 py-1.5">
            Asset Protection Division
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-5">
            Asset Protection &{" "}
            <span className="text-gradient-primary">Recovery</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Safeguarding your digital, financial, and physical assets with enterprise-grade monitoring, rapid incident response, and proven recovery capabilities.
          </p>
        </div>
      </section>

      {/* Asset Protection Pillars */}
      <section id="pillars" className="py-24 container mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Protection <span className="text-gradient-primary">Pillars</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Four integrated disciplines working in concert to protect the full spectrum of enterprise assets.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {pillars.map(({ icon: Icon, title, description }) => (
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
      </section>

      {/* Recovery Pathways */}
      <section id="recovery" className="py-24 bg-card/30 border-y border-border">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Recovery <span className="text-gradient-primary">Pathway</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              A structured, battle-tested process from incident detection through full asset recovery and remediation.
            </p>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {recoverySteps.map((step, i) => (
              <div key={step.step} className="flex gap-5 group">
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-mono text-sm font-bold group-hover:bg-primary/20 transition-colors">
                    {step.step}
                  </div>
                  {i < recoverySteps.length - 1 && (
                    <div className="w-px flex-1 bg-border/50 min-h-8" />
                  )}
                </div>
                <Card className="glass-panel border-border/50 flex-1 mb-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Security Posture */}
      <section id="posture" className="py-24 container mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Portfolio Security <span className="text-gradient-primary">Posture</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Proven performance metrics across GEM's active asset protection engagements.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {metrics.map((metric) => (
            <Card key={metric.label} className="glass-panel bento-card border-border/50 text-center">
              <CardHeader>
                <p className="text-4xl font-extrabold text-gradient-primary">{metric.value}</p>
                <CardTitle className="text-sm font-semibold text-foreground mt-1">{metric.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-xs leading-relaxed">{metric.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* What We Protect */}
      <section id="coverage" className="py-20 bg-card/30 border-y border-border">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Coverage <span className="text-gradient-primary">Categories</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              "Corporate Bank Accounts",
              "Intellectual Property",
              "Commercial Real Estate",
              "Residential Property Portfolios",
              "Investment Portfolios",
              "Proprietary Datasets",
              "Digital Infrastructure",
              "Cryptocurrency Holdings",
              "Trade Secrets & Contracts",
            ].map((item) => (
              <div key={item} className="glass-panel rounded-lg px-4 py-3 flex items-center gap-3 border-border/50">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                <span className="text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="py-24 bg-card/40 border-t border-border">
        <div className="container mx-auto px-6 text-center max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Protect Your <span className="text-gradient-primary">Assets</span>
          </h2>
          <p className="text-muted-foreground mb-10 text-lg">
            Begin your asset protection engagement today. Our team will conduct an initial risk assessment within 48 hours of onboarding.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan font-semibold px-8">
              <Link href="/get-started">
                Protect Your Assets <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary/40 text-primary hover:bg-primary/10 font-semibold px-8">
              <Link href="/intel">View Threat Intel</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
