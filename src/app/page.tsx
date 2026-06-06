import Link from "next/link";
import {
  ShieldCheck,
  Activity,
  LayoutDashboard,
  MessageSquare,
  Bell,
  FileText,
  Users,
  ArrowRight,
  ChevronDown,
  Shield,
  Landmark,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "GEM Enterprise | Defend. Protect. Prevail.",
  description:
    "GEM Enterprise delivers institutional-grade cybersecurity, financial security, and real estate protection for qualified clients.",
};

const stats = [
  { value: "KYC-Gated", label: "Client Access" },
  { value: "RBAC", label: "Role-Based Controls" },
  { value: "Audit-Ready", label: "Compliance Events" },
  { value: "24/7", label: "Intelligence Monitoring" },
];

const services = [
  {
    icon: Shield,
    title: "GEM Cyber Fund",
    description:
      "Threat intelligence, dark web monitoring, incident response, and institutional cybersecurity operations.",
    tags: ["Threat Intel", "Dark Web", "IR"],
    href: "/products/cyber",
    color: "cyan",
  },
  {
    icon: Landmark,
    title: "Financial Shield",
    description:
      "Asset protection workflows, wealth preservation structures, escrow coordination, and institutional vault operations.",
    tags: ["Vaults", "Escrow", "Preservation"],
    href: "/products/financial",
    color: "purple",
    featured: true,
  },
  {
    icon: Building2,
    title: "ATR Property Trust",
    description:
      "Real estate intelligence, trust workflows, REIT-style portfolio visibility, and secured property asset management.",
    tags: ["REIT", "Property", "Trust"],
    href: "/products/real-estate",
    color: "amber",
  },
];

const features = [
  {
    icon: LayoutDashboard,
    title: "Unified Dashboard",
    description: "Portfolio, risk, compliance, and operational status in one view",
  },
  {
    icon: ShieldCheck,
    title: "KYC & Compliance",
    description: "Applicant verification, review states, approval gates, and status tracking",
  },
  {
    icon: MessageSquare,
    title: "AI Concierge",
    description: "Consent-aware support workflows with escalation readiness",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Priority alerts across portfolios, documents, requests, and reviews",
  },
  {
    icon: FileText,
    title: "Document Vault",
    description: "Structured institutional document handling and review support",
  },
  {
    icon: Users,
    title: "Team Management",
    description: "Role-based access, admin operations, and controlled client workflows",
  },
];

const operatingModel = [
  "Qualified client request",
  "Identity and entity verification",
  "Compliance review",
  "Entitlement approval",
  "Secure portal access",
  "Ongoing intelligence and audit trail",
];

const governanceControls = [
  {
    title: "Access Governance",
    description: "Invite-only onboarding, role-based access, protected portal routing, and admin-only review surfaces.",
  },
  {
    title: "Compliance Evidence",
    description: "KYC submissions, document records, decision states, consent receipts, and immutable audit events.",
  },
  {
    title: "Operational Oversight",
    description: "Support escalation, service requests, meeting workflows, notifications, and intelligence ingestion visibility.",
  },
];

const intelligence = [
  {
    category: "Cyber",
    title: "Enterprise VPN Exposure Watch",
    summary: "Monitoring infrastructure advisories, exploited CVEs, and identity perimeter risk across client environments.",
    timestamp: "Active watch",
  },
  {
    category: "Financial",
    title: "Account Takeover Pattern Review",
    summary: "Tracking AI-enabled fraud patterns, wire-risk indicators, and client-side transaction escalation triggers.",
    timestamp: "Updated today",
  },
  {
    category: "Real Estate",
    title: "Commercial Title Fraud Monitoring",
    summary: "Reviewing property-record anomalies, ownership transfer risk, and high-value commercial portfolio exposure.",
    timestamp: "Updated today",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* ── HERO SECTION ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-cyan-500 blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full bg-purple-600 blur-3xl" />
        </div>

        <div className="relative z-10 container mx-auto px-6 py-24 text-center max-w-4xl">
          <Badge className="mb-8 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs tracking-widest uppercase px-4 py-1.5 inline-flex items-center gap-2">
            <Activity className="h-3 w-3 animate-pulse" />
            GEM ENTERPRISE PLATFORM — 2026
          </Badge>

          <h1 className="text-6xl md:text-8xl font-black leading-none mb-6">
            <div className="text-cyan-400">Defend.</div>
            <div className="text-white">Protect.</div>
            <div className="text-white">Prevail.</div>
          </h1>

          <p className="text-slate-400 text-lg max-w-2xl mx-auto text-center mb-10 leading-relaxed">
            GEM Enterprise delivers institutional-grade cybersecurity, financial security, and real estate protection for qualified clients. Built around KYC-gated access, compliance review, entitlement control, and audit-ready operations.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              asChild
              size="lg"
              className="bg-cyan-400 text-black hover:bg-cyan-500 font-semibold rounded-full px-8"
            >
              <Link href="/get-started">
                Request Access <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 font-semibold rounded-full px-8"
            >
              <Link href="/architecture">
                View Architecture <ChevronDown className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <ChevronDown className="w-6 h-6 text-cyan-400" />
          </div>
        </div>
      </section>

      {/* ── CREDIBILITY BAR ── */}
      <section className="w-full bg-background/40 border-y border-white/10 py-12">
        <div className="container mx-auto px-6 max-w-screen-2xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, i) => (
              <div key={i} className={`${i < 3 ? "border-r border-cyan-500/20" : ""}`}>
                <p className="text-2xl md:text-4xl font-bold text-white mb-2">{stat.value}</p>
                <p className="text-slate-400 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST & CERTIFICATIONS ── */}
      <section className="py-20 container mx-auto px-6 max-w-screen-2xl">
        <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-white/10 rounded-2xl p-12">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">Enterprise-Grade Security & Compliance</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-400 mb-2">SOC 2 Type II</div>
              <p className="text-slate-400 text-sm">Security, availability, processing integrity, confidentiality, privacy</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-400 mb-2">Audit-Ready</div>
              <p className="text-slate-400 text-sm">Complete audit trails, immutable compliance events, regulatory reporting</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-400 mb-2">24/7 Monitoring</div>
              <p className="text-slate-400 text-sm">Continuous threat detection, incident response, intelligence ingestion</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES SECTION ── */}
      <section className="py-24 container mx-auto px-6 max-w-screen-2xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Three Pillars of <span className="text-cyan-400">Enterprise Security</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Comprehensive protection across cybersecurity, financial operations, and real estate portfolio intelligence.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {services.map((service, i) => {
            const IconComponent = service.icon;

            return (
              <div
                key={i}
                className={`rounded-2xl p-8 backdrop-blur border transition-all duration-300 hover:-translate-y-1 ${
                  service.featured
                    ? "border-cyan-500/30 bg-cyan-500/5 glow-cyan"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    service.color === "cyan"
                      ? "bg-cyan-500/10"
                      : service.color === "purple"
                      ? "bg-purple-500/10"
                      : "bg-amber-500/10"
                  }`}>
                    <IconComponent className={`w-6 h-6 ${
                      service.color === "cyan"
                        ? "text-cyan-400"
                        : service.color === "purple"
                        ? "text-purple-400"
                        : "text-amber-400"
                    }`} />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">{service.description}</p>
                <div className="flex gap-2 mb-6 flex-wrap">
                  {service.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2 py-1 rounded-full bg-white/10 text-slate-300">
                      {tag}
                    </span>
                  ))}
                </div>
                <Link href={service.href} className="text-cyan-400 text-sm font-semibold hover:text-cyan-300 flex items-center gap-1">
                  Learn More <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── OPERATING MODEL SECTION ── */}
      <section className="py-24 bg-white/5 border-y border-white/10">
        <div className="container mx-auto px-6 max-w-screen-2xl">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12 items-start">
            <div>
              <Badge className="mb-5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs tracking-widest uppercase px-4 py-1.5">
                Operating Model
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-5">
                Built for gated, <span className="text-cyan-400">regulated access</span>.
              </h2>
              <p className="text-slate-400 leading-relaxed mb-8">
                The platform moves clients from access request to verification, compliance review, entitlement approval, and protected portal operations without changing the current application data model.
              </p>
              <Button asChild className="bg-cyan-400 text-black hover:bg-cyan-500 font-semibold rounded-full px-7">
                <Link href="/get-started">
                  Start Access Request <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid gap-3">
              {operatingModel.map((step, i) => (
                <div key={step} className="rounded-2xl border border-white/10 bg-background/50 p-5 flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-mono text-sm">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold">{step}</p>
                    <p className="text-slate-500 text-sm mt-1">Controlled workflow stage with traceable operational state.</p>
                  </div>
                  {i < operatingModel.length - 1 && <ArrowRight className="w-4 h-4 text-slate-600 hidden md:block" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── GOVERNANCE SECTION ── */}
      <section className="py-24 container mx-auto px-6 max-w-screen-2xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Governance <span className="text-cyan-400">By Design</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Access, compliance, AI support, and operations are presented as one institutional control plane.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {governanceControls.map((control) => (
            <div key={control.title} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-7">
              <ShieldCheck className="w-8 h-8 text-cyan-400 mb-5" />
              <h3 className="text-white text-lg font-bold mb-3">{control.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{control.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PLATFORM PREVIEW SECTION ── */}
      <section className="py-24 bg-white/5 border-y border-white/10">
        <div className="container mx-auto px-6 max-w-screen-2xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Enterprise <span className="text-cyan-400">Grade Operations</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Everything your institution needs in one secure platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="grid grid-cols-1 gap-6">
              {features.map((feature, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
                    <p className="text-slate-400 text-sm">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-8 font-mono text-sm">
              <div className="space-y-3">
                <div className="text-cyan-400">
                  <span className="text-slate-400">&gt;</span> controls_status --portfolio
                </div>
                <div className="text-green-400">
                  <span className="text-slate-400">✓</span> access gate: kyc_required
                </div>
                <div className="text-green-400">
                  <span className="text-slate-400">✓</span> role policy: active
                </div>
                <div className="text-green-400">
                  <span className="text-slate-400">✓</span> audit stream: enabled
                </div>
                <div className="text-cyan-400 mt-4">
                  <span className="text-slate-400">&gt;</span> intelligence_watch --live
                </div>
                <div className="text-slate-400">
                  cyber · financial · real_estate · compliance
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── INTELLIGENCE FEED SECTION ── */}
      <section className="py-24 container mx-auto px-6 max-w-screen-2xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Live <span className="text-cyan-400">Intelligence</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Institutional-grade market, threat, and portfolio intelligence.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {intelligence.map((item, i) => {
            const categoryColors = {
              Cyber: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
              Financial: "bg-purple-500/10 text-purple-400 border-purple-500/20",
              "Real Estate": "bg-amber-500/10 text-amber-400 border-amber-500/20",
            };
            const color = categoryColors[item.category as keyof typeof categoryColors];

            return (
              <div key={i} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 hover:border-white/20 transition-all duration-300">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${color} mb-3 inline-block`}>
                  {item.category}
                </span>
                <h3 className="text-white font-bold mb-2 text-sm leading-tight">{item.title}</h3>
                <p className="text-slate-400 text-xs mb-4 leading-relaxed">{item.summary}</p>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{item.timestamp}</span>
                  <ArrowRight className="w-3 h-3 text-cyan-400" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <Link href="/intel" className="text-cyan-400 hover:text-cyan-300 font-semibold text-sm inline-flex items-center gap-1">
            View All Intelligence <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── ACCESS SECTION (CTA) ── */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 rounded-full bg-cyan-500 blur-3xl w-96 h-96 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>

        <div className="relative z-10 container mx-auto px-6 text-center max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Ready to secure your <span className="text-cyan-400">institution?</span>
          </h2>
          <p className="text-slate-400 text-lg mb-10">
            Qualified-client access only. Verification and compliance approval are required before portal entitlements are activated.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-cyan-400 text-black hover:bg-cyan-500 font-semibold rounded-full px-8"
            >
              <Link href="/get-started">Apply for Access</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 font-semibold rounded-full px-8"
            >
              <Link href="/client-login">Already a client? Sign in</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
