import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronRight,
  Cpu,
  Database,
  Eye,
  FileText,
  Globe,
  Landmark,
  Network,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  Terminal,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Intelligence Operations | GEM Enterprise",
  description:
    "GEM Enterprise intelligence operations console for cybersecurity, financial-risk, and real-estate monitoring.",
};

const timeFilters = ["1H", "6H", "24H", "7D", "30D"];

const kpis = [
  {
    label: "Signals Monitored",
    value: "14.2K",
    caption: "Cross-domain indicators",
    icon: Activity,
    className: "text-[hsl(var(--svc-cyber))] bg-[hsl(var(--svc-cyber-muted))]",
  },
  {
    label: "Risk Domains",
    value: "3",
    caption: "Cyber · Financial · Real Estate",
    icon: Network,
    className: "text-[hsl(var(--svc-financial))] bg-[hsl(var(--svc-financial-muted))]",
  },
  {
    label: "Open Watches",
    value: "27",
    caption: "Active analyst queues",
    icon: Eye,
    className: "text-[hsl(var(--svc-realty))] bg-[hsl(var(--svc-realty-muted))]",
  },
  {
    label: "Escalations",
    value: "2",
    caption: "Requires manual review",
    icon: AlertTriangle,
    className: "text-red-400 bg-red-500/10",
  },
  {
    label: "Sources",
    value: "42",
    caption: "RSS, OSINT, client watchlists",
    icon: Database,
    className: "text-green-400 bg-green-500/10",
  },
];

const signalTrend = [42, 58, 51, 67, 74, 63, 88, 93, 86, 101, 98, 117];

const recentSignals = [
  {
    domain: "Cyber",
    title: "Infrastructure exposure review",
    severity: "Critical",
    source: "Advisory monitor",
    received: "4 min ago",
    color: "text-red-400",
    dot: "bg-red-400",
  },
  {
    domain: "Financial",
    title: "Account risk pattern review",
    severity: "Elevated",
    source: "Fraud-intel feed",
    received: "18 min ago",
    color: "text-yellow-400",
    dot: "bg-yellow-400",
  },
  {
    domain: "Real Estate",
    title: "Commercial title-record anomaly cluster",
    severity: "Watch",
    source: "Property-risk monitor",
    received: "41 min ago",
    color: "text-[hsl(var(--svc-realty))]",
    dot: "bg-[hsl(var(--svc-realty))]",
  },
  {
    domain: "Cyber",
    title: "Identity perimeter review",
    severity: "Medium",
    source: "Security operations",
    received: "1h ago",
    color: "text-[hsl(var(--svc-cyber))]",
    dot: "bg-[hsl(var(--svc-cyber))]",
  },
  {
    domain: "Financial",
    title: "Wire-risk trigger correlation update",
    severity: "Medium",
    source: "Transaction-risk model",
    received: "2h ago",
    color: "text-[hsl(var(--svc-financial))]",
    dot: "bg-[hsl(var(--svc-financial))]",
  },
];

const distributions = [
  { label: "Cybersecurity", value: 46, className: "bg-[hsl(var(--svc-cyber))]" },
  { label: "Financial Risk", value: 34, className: "bg-[hsl(var(--svc-financial))]" },
  { label: "Real Estate", value: 20, className: "bg-[hsl(var(--svc-realty))]" },
];

const topEventTypes = [
  { label: "Identity Risk", value: 86 },
  { label: "Infrastructure Advisory", value: 73 },
  { label: "Fraud Pattern", value: 61 },
  { label: "Title Risk", value: 44 },
  { label: "Escalation Trigger", value: 32 },
];

const modules = [
  {
    icon: Shield,
    title: "Cyber Operations",
    description: "Security intelligence, exposure review, endpoint visibility, and infrastructure advisory watchlists.",
    metric: "Active Watch",
  },
  {
    icon: Landmark,
    title: "Financial Shield",
    description: "Fraud pattern review, transaction-risk escalation, account-risk indicators, and protected asset workflows.",
    metric: "Risk Review",
  },
  {
    icon: Building2,
    title: "Property Trust Intel",
    description: "Title-risk monitoring, commercial property exposure, ownership anomaly review, and portfolio signals.",
    metric: "Portfolio Watch",
  },
];

const quickActions = [
  { label: "Client Dashboard", href: "/app/dashboard", icon: BarChart3 },
  { label: "Admin Review", href: "/app/admin", icon: ShieldCheck },
  { label: "Architecture", href: "/architecture", icon: Cpu },
  { label: "Compliance Notice", href: "/compliance-notice", icon: FileText },
  { label: "Request Access", href: "/get-started", icon: Zap },
];

function widthClass(value: number) {
  if (value >= 80) return "w-[86%]";
  if (value >= 70) return "w-[76%]";
  if (value >= 60) return "w-[66%]";
  if (value >= 50) return "w-[56%]";
  if (value >= 40) return "w-[46%]";
  return "w-[34%]";
}

export default function IntelPage() {
  const maxTrend = Math.max(...signalTrend);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="relative overflow-hidden border-b border-white/10 py-16">
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background pointer-events-none" />
        <div className="absolute left-1/4 top-1/3 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-purple-600/10 blur-3xl" />

        <div className="relative z-10 container mx-auto max-w-screen-2xl px-6">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <Badge className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs uppercase tracking-widest text-cyan-400">
                <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                Live Intelligence Operations
              </Badge>
              <h1 className="max-w-4xl text-5xl font-black leading-tight text-white md:text-7xl">
                Operations Overview
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-400">
                Bentley-style live operations logic adapted for GEM: signal monitoring, risk distribution, event feeds, health state, and quick operational routing across cyber, financial, and real estate domains.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex rounded-full border border-white/10 bg-white/5 p-1">
                {timeFilters.map((filter) => (
                  <button
                    key={filter}
                    className={`rounded-full px-3 py-1.5 text-xs font-mono transition ${
                      filter === "24H"
                        ? "bg-cyan-400 text-black"
                        : "text-slate-400 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
              <Button asChild variant="outline" className="rounded-full border-white/20 text-white hover:bg-white/10">
                <Link href="/app/dashboard">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh View
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-screen-2xl px-6 py-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {kpis.map(({ label, value, caption, icon: Icon, className }) => {
            const [textClass, bgClass] = className.split(" ");

            return (
              <div key={label} className="glass-panel bento-card rounded-xl p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${bgClass}`}>
                    <Icon className={`h-5 w-5 ${textClass}`} />
                  </div>
                  <span className="font-mono text-2xl font-bold text-white">{value}</span>
                </div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
                <p className="mt-1 text-xs text-slate-500">{caption}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="container mx-auto max-w-screen-2xl px-6 pb-20">
        <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="space-y-6">
            <Card className="border-white/10 bg-card">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="flex items-center gap-2 text-sm text-white">
                  <Activity className="h-4 w-4 text-[hsl(var(--svc-cyber))]" />
                  Signal Volume Trend
                </CardTitle>
                <span className="text-xs text-slate-500">Last 24 hours · 936 signals</span>
              </CardHeader>
              <CardContent>
                <div className="flex h-56 items-end gap-3 rounded-2xl border border-white/10 bg-background/50 p-5">
                  {signalTrend.map((value, index) => (
                    <div key={index} className="flex h-full flex-1 flex-col justify-end gap-2">
                      <div
                        className="rounded-t-lg bg-cyan-400/80 shadow-[0_0_22px_rgba(34,211,238,0.22)]"
                        style={{ height: `${Math.max(18, (value / maxTrend) * 100)}%` }}
                      />
                      <span className="text-center font-mono text-[10px] text-slate-600">{index + 1}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-card">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="flex items-center gap-2 text-sm text-white">
                  <Terminal className="h-4 w-4 text-[hsl(var(--svc-cyber))]" />
                  Recent Event Feed
                </CardTitle>
                <Badge className="border-green-500/25 bg-green-500/15 text-xs text-green-400">Auto-refresh enabled</Badge>
              </CardHeader>
              <CardContent>
                <div className="overflow-hidden rounded-2xl border border-white/10">
                  <div className="grid grid-cols-[0.85fr_1.65fr_0.75fr_0.8fr] border-b border-white/10 bg-white/5 px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                    <span>Domain</span>
                    <span>Signal</span>
                    <span>Severity</span>
                    <span className="text-right">Received</span>
                  </div>
                  {recentSignals.map(({ domain, title, severity, source, received, color, dot }) => (
                    <div key={`${domain}-${title}`} className="grid grid-cols-[0.85fr_1.65fr_0.75fr_0.8fr] items-center border-b border-white/5 px-4 py-4 last:border-b-0">
                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <span className={`h-2 w-2 rounded-full ${dot}`} />
                        {domain}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{title}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{source}</p>
                      </div>
                      <span className={`text-xs font-semibold ${color}`}>{severity}</span>
                      <span className="text-right font-mono text-xs text-slate-500">{received}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-white/10 bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm text-white">
                  <ShieldCheck className="h-4 w-4 text-green-400" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <p className="text-sm font-semibold text-green-400">Operational</p>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-400">
                    Ingestion, scoring, escalation routing, and portal intelligence surfaces are online.
                  </p>
                </div>
                {["Source ingestion", "Signal correlation", "Alert routing", "Client portal sync"].map((item) => (
                  <div key={item} className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">{item}</span>
                    <Badge className="border-green-500/25 bg-green-500/15 text-xs text-green-400">Ready</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm text-white">
                  <Globe className="h-4 w-4 text-[hsl(var(--svc-cyber))]" />
                  Domain Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {distributions.map(({ label, value, className }) => (
                  <div key={label}>
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="text-slate-400">{label}</span>
                      <span className="font-mono text-white">{value}%</span>
                    </div>
                    <div className="progress-track">
                      <div className={`h-full rounded-full ${className}`} style={{ width: `${value}%` }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm text-white">
                  <Search className="h-4 w-4 text-[hsl(var(--svc-realty))]" />
                  Top Signal Types
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {topEventTypes.map(({ label, value }) => (
                  <div key={label} className="grid grid-cols-[1fr_0.9fr_auto] items-center gap-3">
                    <span className="truncate text-xs text-slate-400">{label}</span>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div className={`h-full rounded-full bg-cyan-400 ${widthClass(value)}`} />
                    </div>
                    <span className="font-mono text-xs text-slate-500">{value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/5 py-20">
        <div className="container mx-auto max-w-screen-2xl px-6">
          <div className="mb-12 text-center">
            <Badge className="mb-4 border-cyan-500/30 bg-cyan-500/10 text-cyan-400">Operational Modules</Badge>
            <h2 className="text-4xl font-bold text-white">Aligned intelligence domains</h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-400">
              The Bentley dashboard pattern becomes GEM’s cross-domain operating model: live status, domain cards, event intelligence, and quick routing.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {modules.map(({ icon: Icon, title, description, metric }) => (
              <Card key={title} className="glass-panel bento-card border-white/10">
                <CardHeader>
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10">
                    <Icon className="h-5 w-5 text-cyan-400" />
                  </div>
                  <CardTitle className="text-base text-white">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-sm leading-relaxed text-slate-400">{description}</p>
                  <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 font-mono text-xs text-cyan-400">
                    {metric}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-screen-2xl px-6 py-20">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Quick Actions</h2>
              <p className="mt-1 text-sm text-slate-400">Operational routing shortcuts aligned to the existing GEM app surfaces.</p>
            </div>
            <Button asChild className="rounded-full bg-cyan-400 text-black hover:bg-cyan-500">
              <Link href="/get-started">
                Request Access <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {quickActions.map(({ label, href, icon: Icon }) => (
              <Link key={label} href={href} className="rounded-2xl border border-white/10 bg-background/60 p-4 transition hover:border-cyan-500/30 hover:bg-white/10">
                <Icon className="mb-3 h-5 w-5 text-cyan-400" />
                <p className="text-sm font-semibold text-white">{label}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                  Open surface <ChevronRight className="h-3 w-3" />
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
