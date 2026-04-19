"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Shield,
  Eye,
  Building,
  Users,
  Cpu,
  Globe,
  FileText,
  Lock,
  LayoutDashboard,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  Activity,
  Zap,
  Terminal,
  TrendingUp,
  Settings,
  Bell,
  Layers,
  Palette,
  Type,
  Box,
  Code2,
  ArrowRight,
  Home,
  BookOpen,
  Briefcase,
  MessageSquare,
  HelpCircle,
  Scale,
  UserCheck,
  Server,
  Bot,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// ── Route manifest ────────────────────────────────────────────────────────────

const PUBLIC_ROUTES = [
  {
    path: "/",
    label: "Home",
    icon: Home,
    color: "cyan",
    description: "Hero, stats bar, service pillars, bento grid, trust section, CTA",
    tags: ["Marketing", "Landing"],
    status: "live",
  },
  {
    path: "/intel",
    label: "Intel",
    icon: Eye,
    color: "purple",
    description: "Threat intelligence command — live metrics, IOC feeds, briefs, monitoring",
    tags: ["Intelligence", "SOC"],
    status: "live",
  },
  {
    path: "/assets",
    label: "Assets",
    icon: TrendingUp,
    color: "green",
    description: "Asset protection, portfolio security posture, and recovery services",
    tags: ["Financial", "Security"],
    status: "live",
  },
  {
    path: "/community",
    label: "Community",
    icon: Users,
    color: "amber",
    description: "Membership tiers, newsletters, events, testimonials, partner network",
    tags: ["Community", "Marketing"],
    status: "live",
  },
  {
    path: "/hub",
    label: "Hub",
    icon: Layers,
    color: "blue",
    description: "Operational gateway — command center, SOC, support, documents, portal",
    tags: ["Operations", "Gateway"],
    status: "live",
  },
  {
    path: "/personnel",
    label: "Personnel",
    icon: Bot,
    color: "rose",
    description: "GEM & ATR team directory with AI Overseer — Notion-synced roster",
    tags: ["Team", "AI", "New"],
    status: "live",
  },
  {
    path: "/services",
    label: "Services",
    icon: Briefcase,
    color: "indigo",
    description: "Enterprise service offerings — Cybersecurity, Financial, Real Estate",
    tags: ["Sales", "Services"],
    status: "live",
  },
  {
    path: "/company",
    label: "Company",
    icon: Building,
    color: "cyan",
    description: "Company overview, executive board, teams, partners, and trustees",
    tags: ["Corporate", "About"],
    status: "live",
  },
  {
    path: "/about",
    label: "About",
    icon: Globe,
    color: "purple",
    description: "About GEM Enterprise — leadership, vision, and mission",
    tags: ["Corporate"],
    status: "live",
  },
  {
    path: "/resources",
    label: "Resources",
    icon: BookOpen,
    color: "green",
    description: "Market insights, templates, bots, news feed, and FAQ",
    tags: ["Content", "Resources"],
    status: "live",
  },
  {
    path: "/contact",
    label: "Contact",
    icon: MessageSquare,
    color: "amber",
    description: "Enterprise inquiry and support contact form",
    tags: ["Utility"],
    status: "live",
  },
  {
    path: "/get-started",
    label: "Get Started",
    icon: ArrowRight,
    color: "cyan",
    description: "Onboarding entry — eligibility check and KYC initiation",
    tags: ["Onboarding"],
    status: "live",
  },
  {
    path: "/eligibility",
    label: "Eligibility",
    icon: CheckCircle2,
    color: "green",
    description: "Pre-KYC eligibility check — investor type and qualification",
    tags: ["Onboarding"],
    status: "live",
  },
  {
    path: "/compliance-notice",
    label: "Compliance Notice",
    icon: Scale,
    color: "blue",
    description: "Regulatory disclosures, compliance boundaries, and legal notices",
    tags: ["Legal", "Compliance"],
    status: "live",
  },
  {
    path: "/privacy",
    label: "Privacy Policy",
    icon: Lock,
    color: "muted",
    description: "Data handling practices and privacy policy documentation",
    tags: ["Legal"],
    status: "live",
  },
  {
    path: "/terms",
    label: "Terms of Service",
    icon: FileText,
    color: "muted",
    description: "Terms governing use of the GEM Enterprise platform",
    tags: ["Legal"],
    status: "live",
  },
];

const AUTH_ROUTES = [
  { path: "/client-login", label: "Client Login", icon: Lock, description: "Authenticated client sign-in portal" },
  { path: "/portal", label: "Portal Bridge", icon: ArrowRight, description: "Session validator → /access/continue" },
  { path: "/access/continue", label: "Access Bridge", icon: Server, description: "Auth + KYC + entitlement check" },
];

const KYC_ROUTES = [
  { path: "/kyc/start", label: "Start KYC", icon: UserCheck, description: "Choose entity type to begin" },
  { path: "/kyc/individual", label: "Individual KYC", icon: Users, description: "KYC form — individual clients" },
  { path: "/kyc/business", label: "Business KYC", icon: Building, description: "KYC form — business entities" },
  { path: "/kyc/trust", label: "Trust KYC", icon: Shield, description: "KYC form — trust structures" },
  { path: "/kyc/family-office", label: "Family Office KYC", icon: Briefcase, description: "KYC form — family offices" },
  { path: "/kyc/upload", label: "Document Upload", icon: FileText, description: "Upload verification documents" },
  { path: "/kyc/review", label: "Review", icon: Eye, description: "Confirm submitted KYC data" },
  { path: "/kyc/status", label: "KYC Status", icon: Activity, description: "Check application status" },
];

const APP_ROUTES = [
  { path: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/app/products", label: "Products", icon: Box },
  { path: "/app/products/cyber", label: "Cyber Products", icon: Shield },
  { path: "/app/products/financial", label: "Financial Products", icon: TrendingUp },
  { path: "/app/products/real-estate", label: "Real Estate Products", icon: Building },
  { path: "/app/portfolios", label: "Portfolios", icon: Layers },
  { path: "/app/documents", label: "Documents", icon: FileText },
  { path: "/app/requests", label: "Requests", icon: MessageSquare },
  { path: "/app/support", label: "Support", icon: HelpCircle },
  { path: "/app/compliance", label: "Compliance", icon: Scale },
  { path: "/app/messages", label: "Messages", icon: MessageSquare },
  { path: "/app/notifications", label: "Notifications", icon: Bell },
  { path: "/app/profile", label: "Profile", icon: Users },
  { path: "/app/settings", label: "Settings", icon: Settings },
  { path: "/app/security", label: "Security", icon: Lock },
];

const ADMIN_ROUTES = [
  { path: "/app/admin", label: "Admin Center", icon: Terminal },
  { path: "/app/admin/kyc", label: "KYC Queue", icon: UserCheck },
  { path: "/app/admin/approvals", label: "Approvals", icon: CheckCircle2 },
  { path: "/app/admin/users", label: "Users", icon: Users },
  { path: "/app/admin/allocations", label: "Allocations", icon: Layers },
];

// ── Design tokens ─────────────────────────────────────────────────────────────

const COLOR_TOKENS = [
  { name: "Electric Cyan", var: "--electric-cyan", cls: "bg-[hsl(185_100%_45%)]", hex: "hsl(185 100% 45%)", role: "Primary / Brand" },
  { name: "True Charcoal", var: "--true-charcoal", cls: "bg-[hsl(220_15%_12%)]", hex: "hsl(220 15% 12%)", role: "Background" },
  { name: "Night Plum", var: "--night-plum", cls: "bg-[hsl(280_40%_25%)]", hex: "hsl(280 40% 25%)", role: "Accent" },
  { name: "Cloud Dancer", var: "--cloud-dancer", cls: "bg-[hsl(40_20%_98%)]", hex: "hsl(40 20% 98%)", role: "Foreground" },
  { name: "Neon Lime", var: "--neon-lime", cls: "bg-[hsl(80_100%_50%)]", hex: "hsl(80 100% 50%)", role: "Success" },
  { name: "Card", var: "--card", cls: "bg-[hsl(220_15%_15%)]", hex: "hsl(220 15% 15%)", role: "Card Surface" },
  { name: "Border", var: "--border", cls: "bg-[hsl(220_12%_20%)]", hex: "hsl(220 12% 20%)", role: "Dividers" },
  { name: "Muted", var: "--muted", cls: "bg-[hsl(220_12%_22%)]", hex: "hsl(220 12% 22%)", role: "Subtle surfaces" },
];

const TYPOGRAPHY = [
  { label: "Display / H1", cls: "text-4xl font-bold tracking-tight", sample: "Defend. Protect. Prevail." },
  { label: "H2 Section", cls: "text-2xl font-semibold", sample: "Threat Intelligence Command" },
  { label: "H3 Card", cls: "text-lg font-semibold", sample: "Security Operations" },
  { label: "Body", cls: "text-base text-muted-foreground", sample: "Institutional-grade cybersecurity for qualified clients." },
  { label: "Small / Caption", cls: "text-sm text-muted-foreground", sample: "Last updated: 2026-03-17 · SOC-2 Certified" },
  { label: "Mono Label", cls: "text-xs font-mono font-semibold tracking-wider uppercase", sample: "INITIALIZING THREAT INTELLIGENCE" },
  { label: "Mono Code", cls: "text-sm font-mono text-cyan-400", sample: "◈ Agent-0X1A Online · Standby" },
];

const UTILITY_CLASSES = [
  { cls: "glass-panel", desc: "Frosted glass card — backdrop blur + semi-transparent bg" },
  { cls: "cyber-grid", desc: "1px grid background for hero/section backdrops" },
  { cls: "text-gradient-primary", desc: "Electric cyan → deep cyan gradient text" },
  { cls: "glow-cyan", desc: "Soft cyan box-shadow glow (40px spread)" },
  { cls: "glow-cyan-intense", desc: "Strong cyan box-shadow glow (60px spread)" },
  { cls: "bento-card", desc: "Hover lift + glow transition for grid cards" },
  { cls: "animate-float", desc: "Gentle vertical float animation (6s loop)" },
  { cls: "animate-glow", desc: "Pulsing glow animation (2s alternate)" },
];

const NODE_COLOR: Record<string, string> = {
  cyan: "border-cyan-400/50 bg-cyan-400/10 text-cyan-400",
  purple: "border-purple-400/50 bg-purple-400/10 text-purple-400",
  green: "border-emerald-400/50 bg-emerald-400/10 text-emerald-400",
  amber: "border-amber-400/50 bg-amber-400/10 text-amber-400",
  blue: "border-blue-400/50 bg-blue-400/10 text-blue-400",
  indigo: "border-indigo-400/50 bg-indigo-400/10 text-indigo-400",
  rose: "border-rose-400/50 bg-rose-400/10 text-rose-400",
  muted: "border-border bg-muted/30 text-muted-foreground",
};

const TAG_COLORS: Record<string, string> = {
  New: "bg-rose-400/20 text-rose-400 border-rose-400/40",
  AI: "bg-amber-400/20 text-amber-400 border-amber-400/40",
  Marketing: "bg-cyan-400/20 text-cyan-400 border-cyan-400/40",
  Intelligence: "bg-purple-400/20 text-purple-400 border-purple-400/40",
  Financial: "bg-green-400/20 text-green-400 border-green-400/40",
  Security: "bg-blue-400/20 text-blue-400 border-blue-400/40",
  Operations: "bg-orange-400/20 text-orange-400 border-orange-400/40",
  Team: "bg-pink-400/20 text-pink-400 border-pink-400/40",
};

// ── Component ─────────────────────────────────────────────────────────────────

type Tab = "pages" | "design" | "routes";

export default function PreviewPage() {
  const [tab, setTab] = useState<Tab>("pages");

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-border/40 cyber-grid">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--night-plum)/0.2)] via-transparent to-[hsl(var(--electric-cyan)/0.07)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-16">
          <div className="mb-4 flex flex-wrap gap-2">
            <Badge variant="outline" className="font-mono text-[10px] border-primary/40 text-primary">
              PLATFORM PREVIEW
            </Badge>
            <Badge variant="outline" className="font-mono text-[10px]">
              v2026 · NEXT.JS 15 APP ROUTER
            </Badge>
            <Badge className="font-mono text-[10px] bg-emerald-400/20 text-emerald-400 border border-emerald-400/30">
              {PUBLIC_ROUTES.length + AUTH_ROUTES.length + KYC_ROUTES.length + APP_ROUTES.length + ADMIN_ROUTES.length} ROUTES MAPPED
            </Badge>
          </div>
          <h1 className="mb-3 text-4xl font-bold tracking-tight lg:text-5xl">
            <span className="text-gradient-primary">GEM Enterprise</span>
            <span className="text-foreground/60"> — Preview Showcase</span>
          </h1>
          <p className="mb-8 max-w-2xl text-muted-foreground">
            Complete route map, design system tokens, and live links for every page across the
            GEM & ATR platform. Built on Next.js 15 App Router with TypeScript, Tailwind CSS,
            and shadcn/ui.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 max-w-2xl">
            {[
              { label: "Public Pages", value: PUBLIC_ROUTES.length, color: "text-cyan-400" },
              { label: "Auth / KYC", value: AUTH_ROUTES.length + KYC_ROUTES.length, color: "text-purple-400" },
              { label: "App Routes", value: APP_ROUTES.length, color: "text-emerald-400" },
              { label: "Admin Routes", value: ADMIN_ROUTES.length, color: "text-amber-400" },
            ].map((s) => (
              <div key={s.label} className="glass-panel rounded-xl border border-border/40 p-4 text-center">
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tabs ── */}
      <div className="sticky top-0 z-20 border-b border-border/40 bg-background/90 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex gap-0">
            {(["pages", "design", "routes"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-4 text-sm font-semibold capitalize border-b-2 transition-colors ${
                  tab === t
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "pages" ? "Page Showcase" : t === "design" ? "Design System" : "Route Map"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12">

        {/* ════════════════════ PAGES TAB ════════════════════ */}
        {tab === "pages" && (
          <div className="space-y-12">
            {/* Public pages grid */}
            <section>
              <SectionHead icon={Globe} label="Public Pages" count={PUBLIC_ROUTES.length} color="text-cyan-400" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {PUBLIC_ROUTES.map((route) => (
                  <PageCard key={route.path} route={route} />
                ))}
              </div>
            </section>

            <Separator className="border-border/40" />

            {/* Auth + KYC */}
            <section>
              <SectionHead icon={Lock} label="Auth & KYC Flow" count={AUTH_ROUTES.length + KYC_ROUTES.length} color="text-purple-400" />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[...AUTH_ROUTES, ...KYC_ROUTES].map((r) => (
                  <FlowCard key={r.path} {...r} accent="purple" />
                ))}
              </div>
            </section>

            <Separator className="border-border/40" />

            {/* App routes */}
            <section>
              <SectionHead icon={LayoutDashboard} label="Client App (Protected)" count={APP_ROUTES.length} color="text-emerald-400" />
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                {APP_ROUTES.map((r) => (
                  <MiniCard key={r.path} {...r} accent="emerald" />
                ))}
              </div>
            </section>

            <Separator className="border-border/40" />

            {/* Admin */}
            <section>
              <SectionHead icon={Terminal} label="Admin Panel" count={ADMIN_ROUTES.length} color="text-amber-400" />
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                {ADMIN_ROUTES.map((r) => (
                  <MiniCard key={r.path} {...r} accent="amber" />
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ════════════════════ DESIGN TAB ════════════════════ */}
        {tab === "design" && (
          <div className="space-y-14">

            {/* Color palette */}
            <section>
              <SectionHead icon={Palette} label="Color Tokens" color="text-primary" />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {COLOR_TOKENS.map((c) => (
                  <div key={c.name} className="glass-panel rounded-xl border border-border/40 overflow-hidden">
                    <div className={`h-16 w-full ${c.cls}`} />
                    <div className="p-3">
                      <p className="text-xs font-semibold text-foreground">{c.name}</p>
                      <p className="text-[10px] font-mono text-muted-foreground">{c.role}</p>
                      <p className="text-[10px] font-mono text-muted-foreground/60 mt-1 truncate">{c.hex}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <Separator className="border-border/40" />

            {/* Typography */}
            <section>
              <SectionHead icon={Type} label="Typography Scale" color="text-purple-400" />
              <div className="space-y-4">
                {TYPOGRAPHY.map((t) => (
                  <div key={t.label} className="glass-panel rounded-xl border border-border/40 p-5 flex flex-wrap items-baseline gap-4">
                    <span className="w-36 shrink-0 font-mono text-[10px] text-muted-foreground uppercase tracking-wider">{t.label}</span>
                    <span className={t.cls}>{t.sample}</span>
                  </div>
                ))}
              </div>
            </section>

            <Separator className="border-border/40" />

            {/* Utility classes */}
            <section>
              <SectionHead icon={Code2} label="Utility Classes" color="text-emerald-400" />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {UTILITY_CLASSES.map((u) => (
                  <div key={u.cls} className="glass-panel rounded-xl border border-border/40 p-4 flex gap-4 items-start">
                    <code className="shrink-0 rounded bg-muted/50 px-2 py-0.5 font-mono text-xs text-cyan-400">.{u.cls}</code>
                    <p className="text-sm text-muted-foreground">{u.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            <Separator className="border-border/40" />

            {/* Components live preview */}
            <section>
              <SectionHead icon={Box} label="Component Samples" color="text-amber-400" />
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Buttons */}
                <Card className="glass-panel border-border/40">
                  <CardHeader className="pb-3"><CardTitle className="text-sm font-mono text-muted-foreground uppercase tracking-wider">Buttons</CardTitle></CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    <Button size="sm">Primary</Button>
                    <Button size="sm" variant="outline">Outline</Button>
                    <Button size="sm" variant="secondary">Secondary</Button>
                    <Button size="sm" variant="ghost">Ghost</Button>
                    <Button size="sm" variant="destructive">Destructive</Button>
                  </CardContent>
                </Card>
                {/* Badges */}
                <Card className="glass-panel border-border/40">
                  <CardHeader className="pb-3"><CardTitle className="text-sm font-mono text-muted-foreground uppercase tracking-wider">Badges</CardTitle></CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    <Badge>Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="outline">Outline</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                    <Badge className="bg-emerald-400/20 text-emerald-400 border border-emerald-400/30">Live</Badge>
                    <Badge className="bg-amber-400/20 text-amber-400 border border-amber-400/30">Warning</Badge>
                  </CardContent>
                </Card>
                {/* Glass card */}
                <Card className="glass-panel border-border/40 glow-cyan">
                  <CardHeader className="pb-3"><CardTitle className="text-sm font-mono text-muted-foreground uppercase tracking-wider">Glass + Glow</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">glass-panel + glow-cyan combined for hero cards and featured content blocks.</p>
                  </CardContent>
                </Card>
                {/* Status indicators */}
                <Card className="glass-panel border-border/40">
                  <CardHeader className="pb-3"><CardTitle className="text-sm font-mono text-muted-foreground uppercase tracking-wider">Status Indicators</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    {[
                      { label: "LIVE", color: "bg-emerald-400", text: "text-emerald-400", border: "border-emerald-400/40 bg-emerald-400/10" },
                      { label: "WARNING", color: "bg-amber-400", text: "text-amber-400", border: "border-amber-400/40 bg-amber-400/10" },
                      { label: "CRITICAL", color: "bg-rose-400", text: "text-rose-400", border: "border-rose-400/40 bg-rose-400/10" },
                      { label: "STANDBY", color: "bg-blue-400", text: "text-blue-400", border: "border-blue-400/40 bg-blue-400/10" },
                    ].map((s) => (
                      <span key={s.label} className={`flex items-center gap-2 w-fit rounded-full border px-3 py-1 text-xs font-mono font-semibold ${s.text} ${s.border}`}>
                        <span className={`relative flex h-2 w-2`}>
                          <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${s.color} opacity-75`} />
                          <span className={`relative inline-flex h-2 w-2 rounded-full ${s.color}`} />
                        </span>
                        {s.label}
                      </span>
                    ))}
                  </CardContent>
                </Card>
                {/* Gradient text */}
                <Card className="glass-panel border-border/40">
                  <CardHeader className="pb-3"><CardTitle className="text-sm font-mono text-muted-foreground uppercase tracking-wider">Gradient Text</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-2xl font-bold text-gradient-primary">text-gradient-primary</p>
                    <p className="text-sm text-muted-foreground font-mono">bg-clip-text · Electric Cyan → Deep Cyan</p>
                  </CardContent>
                </Card>
                {/* Cyber grid */}
                <Card className="glass-panel border-border/40 overflow-hidden">
                  <CardHeader className="pb-3"><CardTitle className="text-sm font-mono text-muted-foreground uppercase tracking-wider">Cyber Grid</CardTitle></CardHeader>
                  <CardContent className="p-0">
                    <div className="cyber-grid h-24 w-full rounded-b-lg flex items-center justify-center">
                      <span className="font-mono text-xs text-primary/60 tracking-widest">GRID PATTERN</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>
          </div>
        )}

        {/* ════════════════════ ROUTES TAB ════════════════════ */}
        {tab === "routes" && (
          <div className="space-y-10">
            <RouteTable
              label="Public Routes"
              color="cyan"
              routes={PUBLIC_ROUTES.map((r) => ({ path: r.path, label: r.label, description: r.description, public: true }))}
            />
            <RouteTable
              label="Auth Routes"
              color="purple"
              routes={AUTH_ROUTES.map((r) => ({ path: r.path, label: r.label, description: r.description, public: false }))}
            />
            <RouteTable
              label="KYC Flow"
              color="blue"
              routes={KYC_ROUTES.map((r) => ({ path: r.path, label: r.label, description: r.description, public: false }))}
            />
            <RouteTable
              label="Client App (Protected)"
              color="emerald"
              routes={APP_ROUTES.map((r) => ({ path: r.path, label: r.label, description: "", public: false }))}
            />
            <RouteTable
              label="Admin Panel"
              color="amber"
              routes={ADMIN_ROUTES.map((r) => ({ path: r.path, label: r.label, description: "", public: false }))}
            />
          </div>
        )}

      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHead({ icon: Icon, label, count, color }: { icon: React.FC<{ className?: string }>; label: string; count?: number; color: string }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <Icon className={`h-5 w-5 ${color}`} />
      <h2 className="text-lg font-semibold">{label}</h2>
      {count !== undefined && (
        <Badge variant="secondary" className="font-mono text-[10px]">{count}</Badge>
      )}
    </div>
  );
}

function PageCard({ route }: { route: typeof PUBLIC_ROUTES[number] }) {
  const Icon = route.icon;
  const colors = NODE_COLOR[route.color] ?? NODE_COLOR.muted;
  return (
    <Card className="bento-card glass-panel border-border/40 flex flex-col">
      <CardContent className="p-4 flex flex-col gap-3 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 ${colors}`}>
            <Icon className="h-4 w-4" />
          </div>
          <Link
            href={route.path}
            className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground hover:text-primary transition-colors"
          >
            <span>{route.path}</span>
            <ExternalLink className="h-2.5 w-2.5" />
          </Link>
        </div>
        {/* Title + desc */}
        <div>
          <p className="font-semibold text-sm text-foreground">{route.label}</p>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{route.description}</p>
        </div>
        {/* Tags */}
        <div className="mt-auto flex flex-wrap gap-1">
          {route.tags.map((tag) => (
            <span
              key={tag}
              className={`rounded-full border px-2 py-0.5 text-[9px] font-mono font-semibold ${TAG_COLORS[tag] ?? "border-border text-muted-foreground bg-muted/30"}`}
            >
              {tag}
            </span>
          ))}
        </div>
        {/* CTA */}
        <Link href={route.path}>
          <Button size="sm" variant="outline" className="w-full text-xs font-mono mt-1">
            View Page <ChevronRight className="ml-1 h-3 w-3" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

function FlowCard({ path, label, icon: Icon, description, accent }: { path: string; label: string; icon: React.FC<{ className?: string }>; description: string; accent: string }) {
  const colorMap: Record<string, string> = {
    purple: "border-purple-400/40 bg-purple-400/10 text-purple-400",
    blue: "border-blue-400/40 bg-blue-400/10 text-blue-400",
  };
  const c = colorMap[accent] ?? colorMap.purple;
  return (
    <div className="glass-panel rounded-xl border border-border/40 p-4 flex gap-3 items-start">
      <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${c}`}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground truncate">{label}</p>
        </div>
        <p className="text-[10px] font-mono text-muted-foreground/70 mt-0.5">{path}</p>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  );
}

function MiniCard({ path, label, icon: Icon, accent }: { path: string; label: string; icon: React.FC<{ className?: string }>; accent: string }) {
  const colorMap: Record<string, string> = {
    emerald: "text-emerald-400",
    amber: "text-amber-400",
  };
  const c = colorMap[accent] ?? "text-primary";
  return (
    <div className="glass-panel rounded-lg border border-border/40 p-3 flex flex-col gap-1.5">
      <Icon className={`h-4 w-4 ${c}`} />
      <p className="text-xs font-semibold text-foreground leading-tight">{label}</p>
      <p className="text-[9px] font-mono text-muted-foreground/60 truncate">{path}</p>
    </div>
  );
}

function RouteTable({ label, color, routes }: {
  label: string;
  color: string;
  routes: { path: string; label: string; description: string; public: boolean }[];
}) {
  const borderMap: Record<string, string> = {
    cyan: "border-cyan-400/30 text-cyan-400",
    purple: "border-purple-400/30 text-purple-400",
    blue: "border-blue-400/30 text-blue-400",
    emerald: "border-emerald-400/30 text-emerald-400",
    amber: "border-amber-400/30 text-amber-400",
  };
  const c = borderMap[color] ?? borderMap.cyan;
  return (
    <section>
      <div className="mb-3 flex items-center gap-3">
        <h3 className={`font-mono text-xs font-bold uppercase tracking-widest ${c.split(" ")[1]}`}>{label}</h3>
        <Badge variant="secondary" className="font-mono text-[10px]">{routes.length}</Badge>
      </div>
      <div className="glass-panel rounded-xl border border-border/40 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/40 bg-muted/20">
              <th className="px-4 py-2.5 text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Path</th>
              <th className="px-4 py-2.5 text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Label</th>
              <th className="hidden sm:table-cell px-4 py-2.5 text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Description</th>
              <th className="px-4 py-2.5 text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Access</th>
            </tr>
          </thead>
          <tbody>
            {routes.map((r, i) => (
              <tr key={r.path} className={`border-b border-border/20 last:border-0 ${i % 2 === 0 ? "" : "bg-muted/5"} hover:bg-muted/20 transition-colors`}>
                <td className="px-4 py-2.5">
                  <code className={`font-mono text-xs ${c.split(" ")[1]}`}>{r.path}</code>
                </td>
                <td className="px-4 py-2.5 text-xs font-semibold text-foreground whitespace-nowrap">{r.label}</td>
                <td className="hidden sm:table-cell px-4 py-2.5 text-xs text-muted-foreground">{r.description}</td>
                <td className="px-4 py-2.5">
                  <Badge
                    variant="outline"
                    className={`font-mono text-[9px] ${r.public ? "border-emerald-400/40 text-emerald-400" : "border-muted-foreground/30 text-muted-foreground"}`}
                  >
                    {r.public ? "public" : "protected"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
