import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck, Activity, LayoutDashboard, MessageSquare, Bell,
  FileText, Users, ArrowRight, ChevronDown, Shield, Landmark,
  Building2, Eye, Zap, Globe, Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HomeStoreShowcase } from "@/components/store/HomeStoreShowcase";

export const metadata = {
  title: "GEM Enterprise | Defend. Protect. Prevail.",
  description: "GEM Enterprise delivers institutional-grade cybersecurity, financial security, and real estate protection for qualified clients.",
};

const stats = [
  { value: "KYC-Gated", label: "Client Access" },
  { value: "RBAC", label: "Role-Based Controls" },
  { value: "Audit-Ready", label: "Compliance Events" },
  { value: "24/7", label: "Intelligence Monitoring" },
];

const services = [
  { icon: Shield, title: "GEM Cyber Fund", description: "Threat intelligence, dark web monitoring, incident response, and institutional cybersecurity operations.", tags: ["Threat Intel", "Dark Web", "IR"], href: "/products/cyber", color: "cyan", img: "https://media.base44.com/images/public/69d42975b7b1794c3dc01661/5c6e6baaf_generated_image.png" },
  { icon: Landmark, title: "Financial Shield", description: "Asset protection workflows, wealth preservation structures, escrow coordination, and institutional vault operations.", tags: ["Vaults", "Escrow", "Preservation"], href: "/products/financial", color: "purple", featured: true, img: "https://media.base44.com/images/public/69d42975b7b1794c3dc01661/9b9d1f784_generated_image.png" },
  { icon: Building2, title: "ATR Property Trust", description: "Real estate intelligence, trust workflows, REIT-style portfolio visibility, and secured property asset management.", tags: ["REIT", "Property", "Trust"], href: "/products/real-estate", color: "amber", img: "https://media.base44.com/images/public/69d42975b7b1794c3dc01661/1f7e5fb1b_generated_image.png" },
];

const features = [
  { icon: LayoutDashboard, title: "Unified Dashboard", description: "Portfolio, risk, compliance, and operational status in one authenticated view" },
  { icon: ShieldCheck, title: "KYC & Compliance", description: "Applicant verification, review states, approval gates, and status tracking" },
  { icon: MessageSquare, title: "AI Concierge", description: "Consent-aware support workflows with escalation readiness" },
  { icon: Bell, title: "Smart Notifications", description: "Priority alerts across portfolios, documents, requests, and reviews" },
  { icon: FileText, title: "Document Vault", description: "Structured institutional document handling and review support" },
  { icon: Users, title: "Team Management", description: "Role-based access, admin operations, and controlled client workflows" },
];

const operatingModel = [
  "Qualified client request",
  "Identity and entity verification",
  "Compliance review",
  "Entitlement approval",
  "Secure portal access",
  "Ongoing intelligence and audit trail",
];

const intelligence = [
  { category: "Cyber", title: "Enterprise VPN Exposure Watch", summary: "Monitoring infrastructure advisories, exploited CVEs, and identity perimeter risk across client environments.", timestamp: "Active watch" },
  { category: "Financial", title: "Account Takeover Pattern Review", summary: "Tracking AI-enabled fraud patterns, wire-risk indicators, and client-side transaction escalation triggers.", timestamp: "Updated today" },
  { category: "Real Estate", title: "Commercial Title Fraud Monitoring", summary: "Reviewing property-record anomalies, ownership transfer risk, and high-value commercial portfolio exposure.", timestamp: "Updated today" },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">

      {/* ── HERO SECTION with background image ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image src="https://media.base44.com/images/public/69d42975b7b1794c3dc01661/b42c69a20_generated_image.png" alt="Global threat intelligence network — glowing cyan nodes and connection lines spanning the globe, representing GEM Enterprise real-time 24/7 cybersecurity monitoring across 180+ countries" fill className="object-cover opacity-20" priority />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background/90" />
        </div>
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
            <Button asChild size="lg" className="bg-cyan-400 text-black hover:bg-cyan-500 font-semibold rounded-full px-8">
              <Link href="/get-started">Request Access <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 font-semibold rounded-full px-8">
              <Link href="/architecture">View Architecture <ChevronDown className="ml-2 h-5 w-5" /></Link>
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
                <div className="text-2xl font-black text-cyan-400 mb-1">{stat.value}</div>
                <div className="text-xs text-slate-500 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── THREE PILLARS with card images ── */}
      <section className="py-24 container mx-auto px-6 max-w-7xl">
        <div className="text-center mb-16">
          <Badge className="mb-4 rounded-full border border-white/10 bg-white/5 text-slate-400 text-xs tracking-widest uppercase px-4 py-1.5">Our Services</Badge>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Three Pillars of Protection</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">Each pillar is independently powerful. Together, they form GEM Enterprise&apos;s complete institutional security framework.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {services.map((svc, i) => {
            const Icon = svc.icon;
            const borderColor = svc.color === "cyan" ? "border-cyan-500/30 hover:border-cyan-400" : svc.color === "purple" ? "border-purple-500/30 hover:border-purple-400" : "border-amber-500/30 hover:border-amber-400";
            const tagColor = svc.color === "cyan" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" : svc.color === "purple" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20";
            const iconColor = svc.color === "cyan" ? "text-cyan-400" : svc.color === "purple" ? "text-purple-400" : "text-amber-400";
            return (
              <Link key={i} href={svc.href} className={`group relative bg-white/[0.02] border ${borderColor} rounded-2xl overflow-hidden transition-all hover:bg-white/[0.04] hover:-translate-y-1`}>
                <div className="relative h-48 overflow-hidden">
                  <Image src={svc.img} alt={`${svc.title} — GEM Enterprise institutional ${svc.color === "cyan" ? "cybersecurity operations center with analysts monitoring global threats in real time" : svc.color === "purple" ? "financial asset protection, wealth preservation meeting room with portfolio screens" : "real estate property trust management, luxury tower at dusk"} `} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <Badge className={`rounded-full border ${tagColor} text-xs`}>
                      <Icon className={`w-3 h-3 mr-1 ${iconColor}`} />
                      {svc.tags[0]}
                    </Badge>
                  </div>
                  {svc.featured && <div className="absolute top-4 right-4"><Badge className="rounded-full bg-purple-500 text-white text-xs border-0">Featured</Badge></div>}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">{svc.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">{svc.description}</p>
                  <div className="flex flex-wrap gap-2 mb-5">
                    {svc.tags.map(tag => <span key={tag} className={`text-xs border rounded px-2 py-0.5 ${tagColor}`}>{tag}</span>)}
                  </div>
                  <div className={`flex items-center text-sm font-semibold ${iconColor} group-hover:gap-2 transition-all`}>
                    Learn More <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <HomeStoreShowcase />

      {/* ── SOC OPERATIONS IMAGE BREAK ── */}
      <section className="relative py-0 overflow-hidden">
        <div className="relative h-[400px] w-full">
          <Image src="https://media.base44.com/images/public/69d42975b7b1794c3dc01661/5c6e6baaf_generated_image.png" alt="GEM Enterprise Security Operations Center — a team of certified analysts at curved multi-monitor workstations monitoring global threat feeds, SIEM dashboards, and live attack maps across client environments 24 hours a day, 7 days a week" fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-background/10" />
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-6 max-w-7xl">
              <div className="max-w-xl">
                <Badge className="mb-4 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs tracking-widest uppercase px-4 py-1.5">Live Operations</Badge>
                <h2 className="text-4xl font-black text-white mb-4">Your Security Never Sleeps</h2>
                <p className="text-slate-300 text-lg leading-relaxed">GEM&apos;s Security Operations Center operates on a follow-the-sun model — certified analysts across North America, EMEA, and Asia-Pacific monitoring threats in real time, every hour of every day.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PLATFORM FEATURES ── */}
      <section className="py-24 bg-white/[0.02] border-y border-white/10">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4">Built for Institutional Operations</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">Every component of the GEM platform is designed for qualified operators managing high-value assets and sensitive compliance requirements.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="bg-background/40 border border-white/10 rounded-xl p-6 hover:border-cyan-500/30 transition-all">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h3 className="font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── TEAM IMAGE SECTION ── */}
      <section className="relative overflow-hidden">
        <div className="relative h-[360px] w-full">
          <Image src="https://media.base44.com/images/public/69d42975b7b1794c3dc01661/1756905aa_generated_image.png" alt="GEM Enterprise leadership team — four senior cybersecurity and financial security professionals in a modern glass-walled conference room reviewing a live threat intelligence briefing on a large wall display" fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-l from-background via-background/40 to-background/10" />
          <div className="absolute inset-0 flex items-center justify-end">
            <div className="container mx-auto px-6 max-w-7xl flex justify-end">
              <div className="max-w-xl text-right">
                <h2 className="text-4xl font-black text-white mb-4">Built by Operators, for Operators</h2>
                <p className="text-slate-300 text-lg leading-relaxed mb-6">Our team carries decades of experience across enterprise security, regulatory compliance, and high-value asset protection. We built GEM because we couldn&apos;t find a platform that met our own institutional standards.</p>
                <Link href="/about" className="inline-flex items-center gap-2 text-cyan-400 font-semibold hover:gap-3 transition-all">Meet the Team <ArrowRight className="w-4 h-4" /></Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── OPERATING MODEL ── */}
      <section className="py-24 container mx-auto px-6 max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-white mb-4">How Clients Gain Access</h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">Every GEM client passes through a structured onboarding path designed for institutional integrity.</p>
        </div>
        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-cyan-500/50 via-cyan-500/20 to-transparent" />
          <div className="space-y-8">
            {operatingModel.map((step, i) => (
              <div key={i} className="flex items-center gap-6 pl-14 relative">
                <div className="absolute left-0 w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-black text-sm">{i + 1}</div>
                <div className="flex-1 bg-white/[0.02] border border-white/10 rounded-xl px-6 py-4">
                  <span className="text-white font-semibold">{step}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE INTELLIGENCE ── */}
      <section className="py-24 bg-white/[0.02] border-t border-white/10">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative rounded-2xl overflow-hidden h-[380px]">
              <Image src="https://media.base44.com/images/public/69d42975b7b1794c3dc01661/fe8b6bcec_generated_image.png" alt="GEM Enterprise live threat intelligence feed room — multiple curved monitors displaying real-time cybersecurity advisories, CVE bulletins, global incident maps, and structured threat timelines. An analyst reviews a tablet in the foreground" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            </div>
            <div>
              <Badge className="mb-4 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs tracking-widest uppercase px-4 py-1.5">Live Intelligence</Badge>
              <h2 className="text-4xl font-black text-white mb-6">What We&apos;re Watching Now</h2>
              <div className="space-y-4">
                {intelligence.map((item, i) => (
                  <div key={i} className="bg-background/60 border border-white/10 rounded-xl p-5 hover:border-cyan-500/20 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="rounded-full border border-cyan-500/20 bg-cyan-500/10 text-cyan-400 text-xs">{item.category}</Badge>
                      <span className="text-xs text-slate-500">{item.timestamp}</span>
                    </div>
                    <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{item.summary}</p>
                  </div>
                ))}
              </div>
              <Link href="/intel" className="inline-flex items-center gap-2 mt-6 text-cyan-400 font-semibold hover:gap-3 transition-all">View Full Intelligence Feed <ArrowRight className="w-4 h-4" /></Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 text-center container mx-auto px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-5xl font-black text-white mb-6">Qualified Clients Only</h2>
          <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto leading-relaxed">GEM Enterprise is an invitation and application-based platform. Access is granted after KYC verification, entity review, and compliance approval.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-cyan-400 text-black hover:bg-cyan-500 font-semibold rounded-full px-10">
              <Link href="/get-started">Begin Application <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 font-semibold rounded-full px-10">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
