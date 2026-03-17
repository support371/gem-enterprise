"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Shield,
  Scale,
  Building2,
  ClipboardCheck,
  CheckCircle,
  TrendingUp,
  Award,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Linkedin,
  Twitter,
  Mail,
  ArrowRight,
  Star,
  Users,
  Globe,
  Lock,
  Leaf,
  Zap,
  Home,
  DollarSign,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ── Data ──────────────────────────────────────────────────────────────────────

const PILLARS = [
  {
    icon: Shield,
    title: "Security Excellence",
    color: "cyan",
    description:
      "Advanced threat detection, 24/7 monitoring, and comprehensive cybersecurity solutions that protect your digital assets and maintain operational continuity.",
  },
  {
    icon: Scale,
    title: "Regulatory Mastery",
    color: "amber",
    description:
      "Comprehensive compliance management across all industries, ensuring your organization meets and exceeds regulatory requirements while minimizing risk exposure.",
  },
  {
    icon: Building2,
    title: "Strategic Real Estate",
    color: "emerald",
    description:
      "Professional real estate management and investment strategies that maximize portfolio value and create sustainable long-term growth opportunities.",
  },
];

const SERVICES = [
  {
    icon: Shield,
    title: "GEM Cybersecurity & Monitoring",
    subtitle: "Advanced Security Operations",
    color: "cyan",
    description:
      "Comprehensive cybersecurity solutions including 24/7 threat monitoring, incident response, vulnerability assessments, and security compliance management.",
    features: [
      "24/7 Security Operations Center",
      "Advanced Threat Detection",
      "Incident Response & Recovery",
      "Vulnerability Management",
      "SOC 2 / ISO 27001 Compliance",
    ],
    link: "/intel",
    cta: "Explore Intel",
  },
  {
    icon: ClipboardCheck,
    title: "Core Compliance Division",
    subtitle: "Regulatory Excellence",
    color: "emerald",
    description:
      "Streamlined regulatory compliance across healthcare, finance, real estate, and manufacturing sectors — achieving 100% audit success rates for enterprise clients.",
    features: [
      "Multi-Industry Compliance",
      "Audit Preparation & Support",
      "Regulatory Change Monitoring",
      "Policy Framework Design",
      "Risk Assessment & Mitigation",
    ],
    link: "/services",
    cta: "View Services",
  },
  {
    icon: Building2,
    title: "Alliance Trust Realty",
    subtitle: "Real Estate Investment Platform",
    color: "amber",
    description:
      "Institutional-grade real estate investment strategies delivering consistent returns through strategic acquisitions, portfolio optimization, and title security.",
    features: [
      "Fractional & Full Ownership",
      "Title Fraud Prevention",
      "Portfolio Analytics",
      "Property Management",
      "Investor Dashboard",
    ],
    link: "/atr/properties",
    cta: "View Properties",
  },
];

const GALLERY = [
  {
    emoji: "🏢",
    title: "Alliance Trust Realty HQ",
    category: "Corporate Real Estate",
    badge: "LEED Certified",
    description: "Main headquarters showcasing sustainable architecture and modern business practices",
    features: ["Smart building technology", "Energy-efficient systems", "Eco-friendly materials"],
  },
  {
    emoji: "🏬",
    title: "Commercial Portfolio",
    category: "Investment Properties",
    badge: "Green Building",
    description: "Strategic commercial investments with integrated security and compliance systems",
    features: ["Advanced security integration", "Compliance monitoring", "Sustainable operations"],
  },
  {
    emoji: "🏘️",
    title: "Mixed-Use Development",
    category: "Development Projects",
    badge: "Carbon Neutral",
    description: "Innovative mixed-use spaces combining business, residential, and community areas",
    features: ["Community integration", "Environmental stewardship", "Smart city planning"],
  },
  {
    emoji: "🏭",
    title: "Technology Integration Hub",
    category: "Tech Infrastructure",
    badge: "Renewable Energy",
    description: "State-of-the-art facility demonstrating our cybersecurity and compliance integration",
    features: ["24/7 monitoring center", "Compliance testing lab", "Sustainable operations"],
  },
  {
    emoji: "🏢",
    title: "Sustainable Office Spaces",
    category: "Office Real Estate",
    badge: "Zero Waste",
    description: "Modern office environments designed for productivity and environmental responsibility",
    features: ["Biophilic design", "Energy optimization", "Employee wellness focus"],
  },
  {
    emoji: "🏘️",
    title: "Community Development",
    category: "Community Projects",
    badge: "Social Impact",
    description: "Real estate projects that strengthen communities while maintaining profitability",
    features: ["Affordable housing", "Local economic growth", "Sustainable impact"],
  },
];

const PROOF = [
  {
    icon: TrendingUp,
    title: "Enterprise Security Overhaul",
    description:
      "Complete cybersecurity transformation for a Fortune 500 company, reducing security incidents by 95% and achieving full compliance certification.",
    client: "Fortune 500 Enterprise",
    metric: "95% Incident Reduction",
    color: "cyan",
  },
  {
    icon: Award,
    title: "Multi-Industry Compliance",
    description:
      "Streamlined regulatory compliance across healthcare, finance, and manufacturing sectors, achieving 100% audit success rate.",
    client: "Multi-Sector Project",
    metric: "100% Audit Success",
    color: "emerald",
  },
  {
    icon: BarChart3,
    title: "Strategic Portfolio Growth",
    description:
      "Real estate investment strategy delivering 23% annual returns through strategic acquisitions and portfolio optimization.",
    client: "Institutional Portfolio",
    metric: "23% Annual Returns",
    color: "amber",
  },
];

const PARTNERS = [
  "CyberTech Pro", "Compliance Plus", "RealtyMax", "SecureFrame", "AuditSafe", "PropertyPro",
];

const STATS = [
  { value: "$2.8B+", label: "Assets Under Management" },
  { value: "500+", label: "Enterprise Clients" },
  { value: "99.97%", label: "Compliance Rate" },
  { value: "23%", label: "Avg. Annual Returns" },
];

const COLOR_MAP: Record<string, { ring: string; bg: string; text: string; badge: string }> = {
  cyan:    { ring: "border-cyan-400/50",    bg: "bg-cyan-400/10",    text: "text-cyan-400",    badge: "bg-cyan-400/20 text-cyan-400 border-cyan-400/40" },
  amber:   { ring: "border-amber-400/50",   bg: "bg-amber-400/10",   text: "text-amber-400",   badge: "bg-amber-400/20 text-amber-400 border-amber-400/40" },
  emerald: { ring: "border-emerald-400/50", bg: "bg-emerald-400/10", text: "text-emerald-400", badge: "bg-emerald-400/20 text-emerald-400 border-emerald-400/40" },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function ATRPage() {
  const [galleryIdx, setGalleryIdx] = useState(0);
  const [videoPlaying, setVideoPlaying] = useState(true);
  const [form, setForm] = useState({ firstName: "", email: "", company: "" });
  const [submitted, setSubmitted] = useState(false);

  const prev = () => setGalleryIdx((i) => (i === 0 ? GALLERY.length - 1 : i - 1));
  const next = () => setGalleryIdx((i) => (i === GALLERY.length - 1 ? 0 : i + 1));
  const item = GALLERY[galleryIdx];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.firstName && form.email && form.company) setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background">

      {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden cyber-grid">
        {/* Layered background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(220_40%_8%)] via-[hsl(220_30%_10%)] to-[hsl(280_40%_8%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-400/8 rounded-full blur-3xl" />

        {/* Video toggle */}
        <div className="absolute bottom-8 right-8 z-20">
          <button
            onClick={() => setVideoPlaying((v) => !v)}
            className="flex items-center gap-2 glass-panel border border-border/40 text-muted-foreground px-4 py-2 rounded-lg hover:text-foreground transition-colors text-xs font-mono"
          >
            {videoPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            {videoPlaying ? "PAUSE" : "PLAY"}
          </button>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center max-w-5xl mx-auto px-6">
          <div className="mb-6 flex flex-wrap gap-2 justify-center">
            <Badge variant="outline" className="font-mono text-[10px] border-amber-400/40 text-amber-400">
              ALLIANCE TRUST REALTY
            </Badge>
            <Badge variant="outline" className="font-mono text-[10px] border-primary/40 text-primary">
              GEM ENTERPRISE DIVISION
            </Badge>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold mb-6 leading-[1.05] tracking-tight">
            <span className="block text-foreground">Secure.</span>
            <span className="block text-amber-400">Compliant.</span>
            <span className="block text-foreground">Profitable.</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto">
            Integrating cybersecurity excellence, regulatory compliance, and strategic real estate
            management for enterprise-level success.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/atr/properties">
              <Button size="lg" className="font-semibold gap-2 bg-amber-500 hover:bg-amber-400 text-black">
                <Building2 className="h-4 w-4" />
                Browse Properties
              </Button>
            </Link>
            <Link href="/atr/invest">
              <Button size="lg" variant="outline" className="font-semibold gap-2 border-border/60">
                <TrendingUp className="h-4 w-4" />
                Investment Platform
              </Button>
            </Link>
            <Link href="#about">
              <Button size="lg" variant="ghost" className="font-semibold gap-2 text-muted-foreground">
                Learn More
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground/40 animate-float">
          <span className="text-[9px] font-mono tracking-widest">SCROLL</span>
          <div className="w-px h-8 bg-gradient-to-b from-muted-foreground/30 to-transparent" />
        </div>
      </section>

      {/* ══ STATS BAR ══════════════════════════════════════════════════════════ */}
      <div className="border-y border-border/40 bg-muted/10">
        <div className="mx-auto max-w-7xl px-6 py-6 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-bold text-amber-400">{s.value}</p>
              <p className="text-xs font-mono text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ══ ABOUT / VISION ════════════════════════════════════════════════════ */}
      <section id="about" className="py-20 mx-auto max-w-7xl px-6">
        {/* Mission */}
        <div className="mb-16 rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-400/5 via-transparent to-cyan-400/5 p-10 lg:p-14 text-center glow-cyan">
          <Badge className="mb-4 font-mono text-[10px] bg-amber-400/20 text-amber-400 border border-amber-400/30">OUR MISSION</Badge>
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-foreground">
            Revolutionizing Enterprise Operations
          </h2>
          <p className="text-lg text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            To revolutionize enterprise operations by seamlessly integrating cybersecurity excellence,
            regulatory compliance mastery, and strategic real estate management into a unified platform
            of success.
          </p>
        </div>

        {/* Pillars */}
        <div className="grid md:grid-cols-3 gap-6">
          {PILLARS.map((p) => {
            const Icon = p.icon;
            const c = COLOR_MAP[p.color];
            return (
              <Card key={p.title} className="bento-card glass-panel border-border/40">
                <CardContent className="p-8">
                  <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border-2 ${c.ring} ${c.bg}`}>
                    <Icon className={`h-6 w-6 ${c.text}`} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-foreground">{p.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{p.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ══ SERVICES ══════════════════════════════════════════════════════════ */}
      <section id="services" className="py-20 bg-muted/5 border-y border-border/30">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-3 font-mono text-[10px] border-primary/40 text-primary">SERVICE DIVISIONS</Badge>
            <h2 className="text-4xl font-bold text-foreground mb-4">Three Divisions. One Platform.</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Specialized divisions working in perfect harmony to deliver comprehensive enterprise solutions.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {SERVICES.map((svc) => {
              const Icon = svc.icon;
              const c = COLOR_MAP[svc.color];
              return (
                <Card key={svc.title} className="bento-card glass-panel border-border/40 overflow-hidden flex flex-col">
                  {/* Header band */}
                  <div className={`h-44 flex flex-col items-center justify-center gap-2 border-b border-border/40 ${c.bg}`}>
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border-2 ${c.ring} bg-background/60`}>
                      <Icon className={`h-7 w-7 ${c.text}`} />
                    </div>
                    <span className={`font-mono text-[10px] font-semibold tracking-widest uppercase ${c.text}`}>{svc.subtitle}</span>
                  </div>
                  <CardContent className="p-8 flex flex-col flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-3">{svc.title}</h3>
                    <p className="text-muted-foreground text-sm mb-6 leading-relaxed">{svc.description}</p>
                    <ul className="space-y-2 mb-8 flex-1">
                      {svc.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle className={`h-3.5 w-3.5 shrink-0 ${c.text}`} />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Link href={svc.link}>
                      <Button variant="outline" className={`w-full font-mono text-xs border ${c.ring} ${c.text} hover:${c.bg}`}>
                        {svc.cta} <ArrowRight className="ml-1.5 h-3 w-3" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ INDUSTRY GALLERY ══════════════════════════════════════════════════ */}
      <section id="gallery" className="py-20 mx-auto max-w-7xl px-6">
        <div className="text-center mb-14">
          <Badge variant="outline" className="mb-3 font-mono text-[10px] border-amber-400/40 text-amber-400">PROPERTY GALLERY</Badge>
          <h2 className="text-4xl font-bold text-foreground mb-4">Our Portfolio</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Strategic real estate investments combining security, compliance, and sustainable value creation.
          </p>
        </div>

        <div className="glass-panel rounded-2xl border border-border/40 overflow-hidden">
          <div className="grid lg:grid-cols-2">
            {/* Emoji display */}
            <div className="flex items-center justify-center bg-gradient-to-br from-amber-400/5 to-cyan-400/5 min-h-[320px] text-8xl lg:text-[140px] select-none border-b lg:border-b-0 lg:border-r border-border/30">
              {item.emoji}
            </div>
            {/* Info */}
            <div className="p-8 lg:p-12 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Badge className="font-mono text-[10px] bg-amber-400/20 text-amber-400 border border-amber-400/30">
                    {item.category}
                  </Badge>
                  <Badge variant="outline" className="font-mono text-[10px] border-emerald-400/40 text-emerald-400">
                    <Leaf className="h-2.5 w-2.5 mr-1" />{item.badge}
                  </Badge>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">{item.title}</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">{item.description}</p>
                <ul className="space-y-2">
                  {item.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-3.5 w-3.5 text-amber-400 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Controls */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/40">
                <div className="flex gap-2">
                  <button onClick={prev} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/40 hover:border-amber-400/40 text-muted-foreground hover:text-amber-400 transition-colors">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button onClick={next} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/40 hover:border-amber-400/40 text-muted-foreground hover:text-amber-400 transition-colors">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex gap-1.5">
                  {GALLERY.map((_, i) => (
                    <button key={i} onClick={() => setGalleryIdx(i)} className={`h-1.5 rounded-full transition-all duration-300 ${i === galleryIdx ? "w-6 bg-amber-400" : "w-1.5 bg-border"}`} />
                  ))}
                </div>
                <span className="font-mono text-xs text-muted-foreground">{galleryIdx + 1} / {GALLERY.length}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ PROOF OF CONCEPT ══════════════════════════════════════════════════ */}
      <section className="py-20 bg-muted/5 border-y border-border/30">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-3 font-mono text-[10px]">PROVEN RESULTS</Badge>
            <h2 className="text-4xl font-bold text-foreground mb-4">Real-World Impact</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Implementations demonstrating the power of our integrated cybersecurity, compliance, and real estate approach.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {PROOF.map((p) => {
              const Icon = p.icon;
              const c = COLOR_MAP[p.color];
              return (
                <Card key={p.title} className="bento-card glass-panel border-border/40 overflow-hidden">
                  <div className={`h-44 flex flex-col items-center justify-center gap-3 border-b border-border/40 ${c.bg}`}>
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border-2 ${c.ring} bg-background/60`}>
                      <Icon className={`h-7 w-7 ${c.text}`} />
                    </div>
                    <span className={`font-mono text-[10px] font-bold tracking-widest ${c.text}`}>{p.metric}</span>
                  </div>
                  <CardContent className="p-6">
                    <h4 className="font-bold text-foreground mb-2">{p.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{p.description}</p>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-muted-foreground/60">{p.client}</span>
                      <span className={`font-bold ${c.text}`}>{p.metric}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ PARTNERS ══════════════════════════════════════════════════════════ */}
      <section className="py-20 mx-auto max-w-7xl px-6">
        <div className="text-center mb-14">
          <Badge variant="outline" className="mb-3 font-mono text-[10px] border-primary/40 text-primary">PROFESSIONAL NETWORK</Badge>
          <h2 className="text-4xl font-bold text-foreground mb-4">Our Partners</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Collaborating with industry leaders to deliver comprehensive solutions.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          {PARTNERS.map((p) => (
            <div key={p} className="bento-card glass-panel rounded-xl border border-border/40 h-20 flex items-center justify-center text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors text-center px-3">
              {p}
            </div>
          ))}
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">Interested in becoming a partner?</p>
          <Link href="/contact">
            <Button variant="outline" className="border-amber-400/40 text-amber-400 hover:bg-amber-400/10 font-mono">
              Explore Partnership Opportunities
            </Button>
          </Link>
        </div>
      </section>

      {/* ══ COMMUNITY / NEWSLETTER ════════════════════════════════════════════ */}
      <section id="community" className="py-20 bg-muted/5 border-y border-border/30">
        <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Newsletter form */}
          <div>
            <Badge variant="outline" className="mb-4 font-mono text-[10px] border-amber-400/40 text-amber-400">JOIN THE NETWORK</Badge>
            <h2 className="text-3xl font-bold text-foreground mb-3">The Alliance Enterprise</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Join our professional network of investors, compliance experts, and real estate specialists.
              Get exclusive access to market intelligence, property listings, and investment opportunities.
            </p>

            {submitted ? (
              <div className="glass-panel rounded-xl border border-emerald-400/30 bg-emerald-400/5 p-8 text-center">
                <CheckCircle className="mx-auto mb-3 h-10 w-10 text-emerald-400" />
                <p className="font-semibold text-foreground">Welcome to The Alliance Enterprise!</p>
                <p className="text-sm text-muted-foreground mt-1">You've been added to our professional network.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-mono text-muted-foreground mb-1.5 block">FIRST NAME</label>
                  <Input
                    placeholder="John"
                    value={form.firstName}
                    onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                    className="bg-card border-border/40"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-muted-foreground mb-1.5 block">EMAIL ADDRESS</label>
                  <Input
                    type="email"
                    placeholder="john@company.com"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="bg-card border-border/40"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-muted-foreground mb-1.5 block">COMPANY</label>
                  <Input
                    placeholder="Alliance Corp"
                    value={form.company}
                    onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                    className="bg-card border-border/40"
                  />
                </div>
                <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold">
                  Join the Network
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            )}
          </div>

          {/* Community highlights */}
          <div className="space-y-4">
            <Badge variant="outline" className="mb-4 font-mono text-[10px]">MEMBER BENEFITS</Badge>
            {[
              { icon: Globe, title: "Market Intelligence", desc: "Exclusive real estate market reports, cap rate analyses, and investment opportunity briefs delivered weekly." },
              { icon: Lock, title: "Security Briefings", desc: "Monthly cybersecurity threat landscape reports curated by GEM's SOC analysts for enterprise clients." },
              { icon: TrendingUp, title: "Investment Access", desc: "First-access to pre-market property listings, fractional investment opportunities, and fund allocations." },
              { icon: Users, title: "Expert Network", desc: "Direct access to compliance specialists, real estate attorneys, and cybersecurity professionals." },
            ].map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.title} className="glass-panel rounded-xl border border-border/40 p-5 flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-amber-400/30 bg-amber-400/10">
                    <Icon className="h-4 w-4 text-amber-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{b.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{b.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ CONTACT CTA ════════════════════════════════════════════════════════ */}
      <section id="contact" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-400/8 via-transparent to-cyan-400/8" />
        <div className="absolute inset-0 cyber-grid opacity-40" />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <Badge className="mb-6 font-mono text-[10px] bg-amber-400/20 text-amber-400 border border-amber-400/30">GET STARTED</Badge>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">Ready to Secure Your Future?</h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Experience the power of integrated cybersecurity, compliance, and real estate management.
            Let's build something extraordinary together.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/contact">
              <Button size="lg" className="bg-amber-500 hover:bg-amber-400 text-black font-semibold gap-2">
                <Mail className="h-4 w-4" />
                Schedule Consultation
              </Button>
            </Link>
            <Link href="/atr/properties">
              <Button size="lg" variant="outline" className="border-border/60 font-semibold gap-2">
                <Building2 className="h-4 w-4" />
                View Properties
              </Button>
            </Link>
          </div>

          <div className="pt-8 border-t border-border/30 flex flex-col items-center gap-4">
            <div className="flex gap-6">
              {[
                { icon: Linkedin, label: "LinkedIn" },
                { icon: Twitter, label: "Twitter" },
                { icon: Mail, label: "Email" },
              ].map(({ icon: Icon, label }) => (
                <button key={label} aria-label={label} className="text-muted-foreground hover:text-amber-400 transition-colors">
                  <Icon className="h-6 w-6" />
                </button>
              ))}
            </div>
            <p className="text-xs font-mono text-muted-foreground/50">
              © 2026 Alliance Trust Realty · A GEM Enterprise Division · All rights reserved.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
