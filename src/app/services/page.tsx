import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  Search,
  AlertTriangle,
  FileCheck,
  TrendingUp,
  Scale,
  Home,
  Lock,
  ClipboardList,
  BarChart3,
  Users,
  ArrowRight,
  CheckCircle2,
  Zap,
  Target,
  Eye,
  DollarSign,
  Building2,
  ShieldAlert,
  FileSearch,
  Activity,
  Landmark,
  Key,
  MapPin,
} from "lucide-react";

export const metadata: Metadata = { title: "Enterprise Security Services | GEM Enterprise" };

const cyberServices = [
  {
    icon: Shield,
    title: "Security Operations Center (SOC)",
    description:
      "Our 24/7 Security Operations Center provides continuous monitoring, threat detection, and real-time incident alerting across your enterprise environment. Staffed by certified analysts operating on a follow-the-sun model with zero coverage gaps.",
    features: ["24/7 Continuous Monitoring", "Real-Time Threat Alerting", "SIEM Management", "Log Aggregation & Correlation"],
    badge: "Core Service",
  },
  {
    icon: Eye,
    title: "Threat Hunting",
    description:
      "Proactive, intelligence-led threat hunting to identify adversaries that have evaded automated detection. Our hunters operate from hypothesis-driven workflows informed by current threat actor TTPs and your specific risk profile.",
    features: ["Hypothesis-Driven Methodology", "TTP-Based Detection", "Behavioral Analytics", "Dark Web Monitoring"],
    badge: "Intelligence",
  },
  {
    icon: AlertTriangle,
    title: "Incident Response",
    description:
      "Rapid-deployment incident response with a guaranteed 4-hour activation SLA. Our IR team contains, eradicates, and recovers from security events while preserving forensic evidence for legal and regulatory purposes.",
    features: ["4-Hour Activation SLA", "Digital Forensics", "Evidence Preservation", "Post-Incident Reporting"],
    badge: "Emergency",
  },
  {
    icon: Search,
    title: "Penetration Testing",
    description:
      "Authorized adversarial simulations conducted by certified red team specialists. We expose vulnerabilities across network, application, and physical perimeters before malicious actors can exploit them.",
    features: ["Network Penetration", "Web Application Testing", "Social Engineering", "Physical Security Testing"],
    badge: "Red Team",
  },
  {
    icon: Target,
    title: "Red Team Operations",
    description:
      "Full-scope adversary simulation engagements that test your organization's detection and response capabilities under realistic attack conditions. Scoped, authorized, and designed to produce board-level insight.",
    features: ["Full Kill Chain Simulation", "Assumed Breach Scenarios", "Command & Control Simulation", "Executive Debrief"],
    badge: "Advanced",
  },
  {
    icon: FileCheck,
    title: "Compliance & Regulatory",
    description:
      "Expert guidance navigating complex regulatory obligations. We support compliance programs across SOC 2, ISO 27001, NIST CSF, GDPR, HIPAA, CMMC, and sector-specific financial mandates.",
    features: ["Gap Analysis", "Policy Development", "Audit Readiness", "Ongoing Compliance Monitoring"],
    badge: "Regulatory",
  },
];

const financialServices = [
  {
    icon: Activity,
    title: "Secure Transaction Monitoring",
    description:
      "Real-time surveillance of financial transactions to detect anomalies, unauthorized activity, and indicators of compromise. Our monitoring layer integrates with existing banking and trading infrastructure without operational disruption.",
    features: ["Real-Time Transaction Analysis", "Anomaly Detection", "Threshold Alerting", "Audit Trail Generation"],
  },
  {
    icon: ShieldAlert,
    title: "Fraud Prevention & Detection",
    description:
      "Multi-layer fraud prevention combining behavioral analytics, identity verification, and machine-learning-assisted pattern recognition. We protect against account takeover, wire fraud, and insider threats.",
    features: ["Behavioral Biometrics", "Identity Verification", "Wire Fraud Interception", "Insider Threat Detection"],
  },
  {
    icon: Scale,
    title: "AML Compliance Support",
    description:
      "Anti-money laundering compliance support for financial institutions and qualified entities. We assist with KYC/AML program design, suspicious activity monitoring, and regulatory reporting obligations.",
    features: ["KYC Program Design", "SAR Preparation Support", "Customer Risk Scoring", "Regulatory Filing Guidance"],
  },
  {
    icon: FileSearch,
    title: "Financial Forensics",
    description:
      "Forensic investigation of financial fraud, embezzlement, and asset misappropriation. Our forensic accountants and digital investigators produce legally defensible findings for litigation, arbitration, and regulatory proceedings.",
    features: ["Transaction Reconstruction", "Asset Tracing", "Expert Witness Support", "Litigation-Ready Reports"],
  },
];

const realEstateServices = [
  {
    icon: Key,
    title: "Title Security & Verification",
    description:
      "Comprehensive title chain verification and ongoing integrity monitoring for residential and commercial properties. We detect unauthorized modifications, fraudulent liens, and title manipulation before they cause financial loss.",
    features: ["Chain of Title Analysis", "Lien Monitoring", "Encumbrance Detection", "Title History Verification"],
  },
  {
    icon: Home,
    title: "Property Fraud Prevention",
    description:
      "Active monitoring for indicators of deed fraud, identity theft targeting property owners, and unauthorized transfer attempts. GEM maintains continuous surveillance on all properties under coverage.",
    features: ["Deed Change Alerts", "Owner Identity Verification", "Unauthorized Transfer Detection", "Fraud Pattern Monitoring"],
  },
  {
    icon: MapPin,
    title: "Deed Monitoring",
    description:
      "Automated monitoring of county recorder databases and public land records for any filings associated with covered properties. Instant notifications on new recordings, reconveyances, and court filings.",
    features: ["County Recorder Integration", "24/7 Alert System", "Portfolio-Wide Coverage", "Historical Recording Access"],
  },
  {
    icon: Lock,
    title: "Escrow & Closing Protection",
    description:
      "Security protocols protecting real estate closing processes from wire fraud, business email compromise, and identity impersonation. Includes pre-closing verification of all parties and wire instruction authentication.",
    features: ["Wire Instruction Verification", "BEC Protection Protocols", "Party Identity Confirmation", "Closing Documentation Security"],
  },
];

const assessmentTypes = [
  {
    title: "Security Posture Assessment",
    description: "Holistic evaluation of your current security program against industry frameworks — identifying gaps, strengths, and prioritized improvement opportunities.",
    duration: "2–4 Weeks",
    deliverable: "Security Posture Report",
  },
  {
    title: "Risk Scoring & Quantification",
    description: "Quantified cyber risk assessment that translates technical vulnerabilities into financial exposure figures for executive and board reporting.",
    duration: "2–3 Weeks",
    deliverable: "Risk Quantification Model",
  },
  {
    title: "Compliance Gap Analysis",
    description: "Structured mapping of your current controls against target compliance frameworks to identify specific gaps and define a prioritized remediation path.",
    duration: "1–3 Weeks",
    deliverable: "Gap Analysis & Roadmap",
  },
  {
    title: "Vulnerability Assessment",
    description: "Systematic identification and classification of technical security weaknesses across your environment, with severity ratings and remediation guidance.",
    duration: "1–2 Weeks",
    deliverable: "Remediation Report",
  },
  {
    title: "Cloud Security Assessment",
    description: "Evaluation of cloud configurations, IAM policies, workload security, and data protection controls across AWS, Azure, and GCP environments.",
    duration: "1–2 Weeks",
    deliverable: "Cloud Security Report",
  },
  {
    title: "Third-Party Risk Assessment",
    description: "Security evaluation of vendors, partners, and supply chain participants to identify third-party risk exposure and inform vendor governance decisions.",
    duration: "1–3 Weeks",
    deliverable: "Vendor Risk Register",
  },
];

const consultationOfferings = [
  {
    icon: Zap,
    title: "Strategic Security Advisory",
    description:
      "Senior advisor engagements providing strategic direction on security program development, technology investment, and organizational risk management. Designed for CISOs, CTOs, and security leadership.",
  },
  {
    icon: Landmark,
    title: "Board & Executive Briefings",
    description:
      "Tailored executive briefings that translate complex security and risk intelligence into actionable board-level insight. We communicate technical realities in language calibrated for C-suite and board audiences.",
  },
  {
    icon: Users,
    title: "CISO-as-a-Service",
    description:
      "Fractional CISO services for organizations that require experienced security leadership without the overhead of a full-time hire. Our virtual CISOs integrate directly with your team and leadership structure.",
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-24 md:py-32 cyber-grid overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background pointer-events-none" />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-6 border border-primary/30 bg-primary/10 text-primary font-mono text-xs tracking-widest uppercase">
            Enterprise Service Portfolio
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Enterprise Security{" "}
            <span className="text-gradient-primary">Services</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Institutional-grade protection across cybersecurity, financial security, and real estate.
            Every service is purpose-built for the scale, complexity, and risk profile of enterprise clients.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {[
              { label: "Cybersecurity", href: "#cyber" },
              { label: "Financial", href: "#financial" },
              { label: "Real Estate", href: "#real-estate" },
              { label: "Assessments", href: "#assessments" },
              { label: "Consultations", href: "#consultations" },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-mono text-muted-foreground hover:text-primary transition-colors border border-border/50 hover:border-primary/50 px-3 py-1 rounded-full"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Cybersecurity */}
      <section id="cyber" className="py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
              <Shield className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Cybersecurity Services</h2>
              <p className="text-muted-foreground text-sm mt-0.5">Core threat defense, detection, and security operations</p>
            </div>
          </div>
          <Separator className="mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cyberServices.map((service) => {
              const Icon = service.icon;
              return (
                <Card key={service.title} className="glass-panel bento-card border-border/50 flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <Badge variant="secondary" className="text-xs font-mono">
                        {service.badge}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ul className="space-y-2">
                      {service.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Financial */}
      <section id="financial" className="py-20 md:py-28 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
              <TrendingUp className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Financial Security Services</h2>
              <p className="text-muted-foreground text-sm mt-0.5">Protecting financial institutions, transactions, and assets</p>
            </div>
          </div>
          <Separator className="mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {financialServices.map((service) => {
              const Icon = service.icon;
              return (
                <Card key={service.title} className="glass-panel bento-card border-border/50">
                  <CardHeader>
                    <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 w-fit mb-3">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                    <CardDescription className="leading-relaxed">{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {service.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Real Estate */}
      <section id="real-estate" className="py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
              <Building2 className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Real Estate Security</h2>
              <p className="text-muted-foreground text-sm mt-0.5">Title security, property fraud prevention, and escrow protection</p>
            </div>
          </div>
          <Separator className="mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {realEstateServices.map((service) => {
              const Icon = service.icon;
              return (
                <Card key={service.title} className="glass-panel bento-card border-border/50">
                  <CardHeader>
                    <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 w-fit mb-3">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                    <CardDescription className="leading-relaxed">{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {service.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Assessments */}
      <section id="assessments" className="py-20 md:py-28 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
              <BarChart3 className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Security Assessments</h2>
              <p className="text-muted-foreground text-sm mt-0.5">Structured evaluations to understand and quantify your risk exposure</p>
            </div>
          </div>
          <Separator className="mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assessmentTypes.map((assessment) => (
              <Card key={assessment.title} className="glass-panel bento-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-base">{assessment.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">{assessment.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between pt-3 border-t border-border/30">
                    <div>
                      <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Duration</p>
                      <p className="text-sm font-semibold text-primary mt-0.5">{assessment.duration}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Deliverable</p>
                      <p className="text-sm font-medium mt-0.5">{assessment.deliverable}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Consultations */}
      <section id="consultations" className="py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
              <Users className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Strategic Consultations</h2>
              <p className="text-muted-foreground text-sm mt-0.5">Advisory engagements with GEM's senior specialists</p>
            </div>
          </div>
          <Separator className="mb-12" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
            {consultationOfferings.map((offering) => {
              const Icon = offering.icon;
              return (
                <Card key={offering.title} className="glass-panel bento-card border-primary/20">
                  <CardHeader>
                    <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 w-fit mb-3">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{offering.title}</CardTitle>
                    <CardDescription className="leading-relaxed">{offering.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-6">
              <h3 className="text-xl font-bold">How Engagements Work</h3>
              <div className="space-y-5">
                {[
                  {
                    step: "01",
                    title: "Initial Discovery",
                    desc: "A structured intake session to understand your environment, objectives, risk profile, and key concerns.",
                  },
                  {
                    step: "02",
                    title: "Advisor Assignment",
                    desc: "You are matched with a named senior advisor whose expertise aligns with your engagement scope — not a rotating team.",
                  },
                  {
                    step: "03",
                    title: "Engagement Delivery",
                    desc: "Scheduled working sessions, analysis, and deliverable production per agreed scope with clear milestones.",
                  },
                  {
                    step: "04",
                    title: "Ongoing Support",
                    desc: "Optional retainer relationships provide continued advisory access, priority escalation, and board-level reporting.",
                  },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <span className="font-mono text-primary text-sm font-bold mt-1 flex-shrink-0 w-6">{item.step}</span>
                    <div>
                      <p className="font-semibold text-sm">{item.title}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Card className="glass-panel border-primary/20 p-8">
              <div className="space-y-5">
                <Zap className="h-8 w-8 text-primary" />
                <h3 className="text-lg font-bold">What to Expect</h3>
                <ul className="space-y-3">
                  {[
                    "Confidential engagement — no information shared without explicit consent",
                    "Named senior advisor, not a rotating junior analyst pool",
                    "Deliverables in plain language with executive-ready summaries",
                    "Flexible engagement models: project-based or ongoing retainer",
                    "Secure, encrypted communication channels for all sensitive discussions",
                    "Optional board briefing preparation and presentation support",
                  ].map((item) => (
                    <li key={item} className="flex gap-3 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto glass-panel rounded-2xl p-12 border-primary/20 glow-cyan">
            <Badge className="mb-5 border border-primary/30 bg-primary/10 text-primary font-mono text-xs tracking-widest uppercase">
              Begin Today
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Secure Your{" "}
              <span className="text-gradient-primary">Enterprise</span>?
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Schedule a consultation with a GEM Enterprise specialist. Our team will guide you from
              eligibility through full platform access and service delivery.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" className="gap-2 glow-cyan bg-primary text-primary-foreground hover:bg-primary/90">
                  Schedule a Consultation <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/get-started">
                <Button size="lg" variant="outline" className="gap-2 border-primary/40 text-primary hover:bg-primary/10">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
