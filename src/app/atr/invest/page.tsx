"use client";

import { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Building2,
  Layers,
  BarChart3,
  Shield,
  CheckCircle,
  ArrowRight,
  DollarSign,
  Percent,
  Calendar,
  Users,
  Lock,
  FileText,
  ChevronRight,
  Star,
  Zap,
  Globe,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

// ── Investment Types (from DEVELOPER.md schema) ────────────────────────────────

const INVESTMENT_TYPES = [
  {
    id: "fractional",
    label: "Fractional Ownership",
    icon: Layers,
    color: "amber",
    minInvestment: 25000,
    targetReturn: "8–12%",
    term: "3–7 years",
    description:
      "Own a percentage stake in a specific property. Receive proportional rental income and appreciation. Ideal for portfolio diversification across multiple assets.",
    features: [
      "5%–49% ownership stakes",
      "Monthly rental income distributions",
      "Proportional appreciation on sale",
      "Title deed protection included",
      "Quarterly portfolio reporting",
    ],
    badge: "Most Popular",
  },
  {
    id: "full_ownership",
    label: "Full Ownership",
    icon: Building2,
    color: "cyan",
    minInvestment: 500000,
    targetReturn: "7–10%",
    term: "Indefinite",
    description:
      "Direct, 100% ownership of a property managed by Alliance Trust Realty. Includes full property management, compliance monitoring, and title security services.",
    features: [
      "100% property ownership",
      "Full property management",
      "GEM security integration",
      "Compliance & title monitoring",
      "Direct sale rights",
    ],
    badge: "Full Control",
  },
  {
    id: "fund",
    label: "ATR Real Estate Fund",
    icon: BarChart3,
    color: "emerald",
    minInvestment: 100000,
    targetReturn: "9–14%",
    term: "5–10 years",
    description:
      "Pooled investment fund across a curated portfolio of ATR-managed properties. Professional fund management with quarterly distributions and annual audits.",
    features: [
      "Diversified property portfolio",
      "Professional fund management",
      "Quarterly cash distributions",
      "Annual independent audits",
      "SEC-compliant structure",
    ],
    badge: "Best Returns",
  },
  {
    id: "reit",
    label: "ATR REIT",
    icon: Globe,
    color: "purple",
    minInvestment: 10000,
    targetReturn: "6–9%",
    term: "Liquid",
    description:
      "Publicly structured Real Estate Investment Trust with quarterly redemption windows. Lowest minimum investment — ideal for first-time real estate investors.",
    features: [
      "Lowest entry point ($10K min)",
      "Quarterly redemption windows",
      "Pass-through tax treatment",
      "Diversified 50+ property portfolio",
      "Monthly distribution checks",
    ],
    badge: "Low Entry",
  },
];

const PROCESS_STEPS = [
  { step: "01", title: "KYC Verification", icon: Shield, desc: "Complete identity and accreditation verification. Our compliance team reviews within 24 hours." },
  { step: "02", title: "Select Investment Type", icon: Layers, desc: "Choose from fractional, full ownership, fund, or REIT based on your goals and minimum requirements." },
  { step: "03", title: "Property Selection", icon: Building2, desc: "Browse our curated portfolio or request custom deal flow. Review cap rates, title reports, and due diligence packages." },
  { step: "04", title: "Investment Agreement", icon: FileText, desc: "Sign digital investment agreements with e-signature. All documents are compliance-audited and title-protected." },
  { step: "05", title: "Fund & Close", icon: DollarSign, desc: "Wire funds or ACH transfer. Escrow managed by licensed title company. Close in as little as 5 business days." },
  { step: "06", title: "Active Management", icon: TrendingUp, desc: "Receive monthly statements, distribution checks, and real-time dashboard access to your portfolio." },
];

const STATS = [
  { value: "$2.8B+", label: "Total AUM", icon: DollarSign, color: "text-amber-400" },
  { value: "23%", label: "Avg Annual Return", icon: TrendingUp, color: "text-emerald-400" },
  { value: "500+", label: "Active Investors", icon: Users, color: "text-cyan-400" },
  { value: "99.97%", label: "Distribution Rate", icon: Percent, color: "text-purple-400" },
];

const COLOR_MAP: Record<string, { ring: string; bg: string; text: string; badge: string }> = {
  amber:  { ring: "border-amber-400/50",   bg: "bg-amber-400/10",   text: "text-amber-400",   badge: "bg-amber-400/20 text-amber-400 border-amber-400/30" },
  cyan:   { ring: "border-cyan-400/50",    bg: "bg-cyan-400/10",    text: "text-cyan-400",    badge: "bg-cyan-400/20 text-cyan-400 border-cyan-400/30" },
  emerald:{ ring: "border-emerald-400/50", bg: "bg-emerald-400/10", text: "text-emerald-400", badge: "bg-emerald-400/20 text-emerald-400 border-emerald-400/30" },
  purple: { ring: "border-purple-400/50",  bg: "bg-purple-400/10",  text: "text-purple-400",  badge: "bg-purple-400/20 text-purple-400 border-purple-400/30" },
};

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

// ── Calculator ────────────────────────────────────────────────────────────────

function Calculator() {
  const [amount, setAmount] = useState("100000");
  const [rate, setRate] = useState("9");
  const [years, setYears] = useState("5");

  const principal = parseFloat(amount.replace(/,/g, "")) || 0;
  const annualRate = parseFloat(rate) / 100 || 0;
  const termYears = parseFloat(years) || 0;

  const totalReturn = principal * Math.pow(1 + annualRate, termYears) - principal;
  const totalValue = principal + totalReturn;
  const monthlyIncome = (principal * annualRate) / 12;

  return (
    <div className="glass-panel rounded-2xl border border-border/40 p-6 lg:p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/40 bg-amber-400/10">
          <BarChart3 className="h-5 w-5 text-amber-400" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Investment Calculator</h3>
          <p className="text-xs text-muted-foreground">Estimate your returns</p>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="text-[10px] font-mono text-muted-foreground mb-1.5 block">INVESTMENT AMOUNT</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-8 bg-card border-border/40 font-mono"
              placeholder="100000"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-mono text-muted-foreground mb-1.5 block">ANNUAL RETURN %</label>
            <div className="relative">
              <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <Input
                type="number"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="pl-7 bg-card border-border/40 font-mono"
                min="1" max="30"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-mono text-muted-foreground mb-1.5 block">TERM (YEARS)</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <Input
                type="number"
                value={years}
                onChange={(e) => setYears(e.target.value)}
                className="pl-7 bg-card border-border/40 font-mono"
                min="1" max="30"
              />
            </div>
          </div>
        </div>
      </div>

      <Separator className="mb-6 border-border/40" />

      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-lg font-bold text-amber-400">{fmt(Math.round(totalValue))}</p>
          <p className="text-[10px] font-mono text-muted-foreground mt-0.5">Total Value</p>
        </div>
        <div className="text-center border-x border-border/30">
          <p className="text-lg font-bold text-emerald-400">{fmt(Math.round(totalReturn))}</p>
          <p className="text-[10px] font-mono text-muted-foreground mt-0.5">Total Gain</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-cyan-400">{fmt(Math.round(monthlyIncome))}/mo</p>
          <p className="text-[10px] font-mono text-muted-foreground mt-0.5">Monthly Income</p>
        </div>
      </div>

      <p className="mt-4 text-center text-[9px] font-mono text-muted-foreground/50">
        *Illustrative projections only. Past performance does not guarantee future results.
      </p>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function InvestPage() {
  const [selectedType, setSelectedType] = useState("fractional");

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-border/40 cyber-grid">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-400/8 via-transparent to-emerald-400/5" />
        <div className="relative mx-auto max-w-7xl px-6 py-16 lg:py-20">
          <div className="mb-4 flex flex-wrap gap-2">
            <Badge className="font-mono text-[10px] bg-amber-400/20 text-amber-400 border border-amber-400/30">
              INVESTMENT PLATFORM
            </Badge>
            <Badge variant="outline" className="font-mono text-[10px]">
              ACCREDITED INVESTORS · SEC COMPLIANT
            </Badge>
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight lg:text-5xl">
            <span className="text-foreground">Alliance Trust</span>
            <span className="text-amber-400"> Investment Platform</span>
          </h1>
          <p className="mb-8 max-w-2xl text-muted-foreground">
            Institutional-grade real estate investment vehicles — from fractional stakes to full ownership
            and SEC-compliant REITs. Backed by GEM-grade cybersecurity and compliance oversight.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 max-w-2xl">
            {STATS.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="glass-panel rounded-xl border border-border/40 p-4 text-center">
                  <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{s.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-12 space-y-16">

        {/* ── Investment Types ── */}
        <section>
          <div className="mb-8 text-center">
            <Badge variant="outline" className="mb-3 font-mono text-[10px] border-amber-400/40 text-amber-400">INVESTMENT VEHICLES</Badge>
            <h2 className="text-3xl font-bold text-foreground mb-3">Choose Your Investment Type</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Four distinct structures to match your capital goals, liquidity needs, and risk tolerance.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {INVESTMENT_TYPES.map((t) => {
              const Icon = t.icon;
              const c = COLOR_MAP[t.color];
              const isSelected = selectedType === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedType(t.id)}
                  className={`text-left rounded-2xl border-2 p-6 transition-all duration-200 ${
                    isSelected ? `${c.ring} ${c.bg}` : "border-border/40 glass-panel hover:border-border"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${isSelected ? `${c.ring} bg-background/60` : "border-border/40 bg-muted/30"}`}>
                      <Icon className={`h-5 w-5 ${isSelected ? c.text : "text-muted-foreground"}`} />
                    </div>
                    <Badge className={`font-mono text-[9px] border ${isSelected ? c.badge : "bg-muted/30 text-muted-foreground border-border"}`}>
                      {t.badge}
                    </Badge>
                  </div>
                  <p className={`font-bold text-sm mb-1 ${isSelected ? "text-foreground" : "text-foreground/80"}`}>{t.label}</p>
                  <div className="flex flex-col gap-1 text-[10px] font-mono text-muted-foreground">
                    <span>Min: <span className={isSelected ? c.text : ""}>{fmt(t.minInvestment)}</span></span>
                    <span>Return: <span className={isSelected ? c.text : ""}>{t.targetReturn}</span></span>
                    <span>Term: <span className={isSelected ? c.text : ""}>{t.term}</span></span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected type detail */}
          {(() => {
            const t = INVESTMENT_TYPES.find((t) => t.id === selectedType)!;
            const Icon = t.icon;
            const c = COLOR_MAP[t.color];
            return (
              <div className={`mt-6 glass-panel rounded-2xl border-2 ${c.ring} p-8`}>
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl border-2 ${c.ring} ${c.bg}`}>
                        <Icon className={`h-6 w-6 ${c.text}`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-foreground">{t.label}</h3>
                        <p className={`text-xs font-mono ${c.text}`}>{t.targetReturn} target · {t.term}</p>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-6 leading-relaxed">{t.description}</p>
                    <div className="flex gap-3">
                      <Link href="/get-started">
                        <Button className={`bg-amber-500 hover:bg-amber-400 text-black font-semibold gap-2`}>
                          Get Started <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href="/atr/properties">
                        <Button variant="outline" className="border-border/60">Browse Properties</Button>
                      </Link>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-mono text-muted-foreground mb-3 uppercase tracking-wider">What's Included</p>
                    <ul className="space-y-2.5">
                      {t.features.map((f) => (
                        <li key={f} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                          <CheckCircle className={`h-4 w-4 shrink-0 ${c.text}`} />{f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })()}
        </section>

        {/* ── Calculator + Process ── */}
        <section className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <Calculator />

          <div>
            <Badge variant="outline" className="mb-4 font-mono text-[10px]">HOW IT WORKS</Badge>
            <h2 className="text-2xl font-bold text-foreground mb-6">Your Path to Investment</h2>
            <div className="space-y-4">
              {PROCESS_STEPS.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={s.step} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-amber-400/40 bg-amber-400/10 text-xs font-mono font-bold text-amber-400">
                        {s.step}
                      </div>
                      {i < PROCESS_STEPS.length - 1 && (
                        <div className="mt-1 w-px flex-1 bg-border/40 min-h-4" />
                      )}
                    </div>
                    <div className="pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="h-3.5 w-3.5 text-amber-400" />
                        <p className="font-semibold text-sm text-foreground">{s.title}</p>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Trust / Compliance ── */}
        <section className="glass-panel rounded-2xl border border-border/40 p-8 lg:p-12">
          <div className="text-center mb-10">
            <Badge variant="outline" className="mb-3 font-mono text-[10px] border-emerald-400/40 text-emerald-400">COMPLIANCE & SECURITY</Badge>
            <h2 className="text-2xl font-bold text-foreground mb-3">Institutional-Grade Protection</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Every investment on the ATR platform is backed by GEM Enterprise cybersecurity, title protection, and regulatory compliance monitoring.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { icon: Shield, label: "GEM SOC Integration", color: "text-cyan-400", border: "border-cyan-400/30 bg-cyan-400/5" },
              { icon: Lock, label: "Title Deed Protection", color: "text-amber-400", border: "border-amber-400/30 bg-amber-400/5" },
              { icon: FileText, label: "SEC Compliant Structure", color: "text-emerald-400", border: "border-emerald-400/30 bg-emerald-400/5" },
              { icon: Users, label: "Licensed Fund Manager", color: "text-purple-400", border: "border-purple-400/30 bg-purple-400/5" },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <div key={t.label} className={`rounded-xl border p-5 text-center ${t.border}`}>
                  <Icon className={`mx-auto mb-3 h-7 w-7 ${t.color}`} />
                  <p className="text-xs font-semibold text-foreground">{t.label}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="text-center pb-8">
          <div className="glass-panel rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-400/5 to-transparent p-10 lg:p-14">
            <Badge className="mb-4 font-mono text-[10px] bg-amber-400/20 text-amber-400 border border-amber-400/30">
              QUALIFIED INVESTORS
            </Badge>
            <h2 className="text-3xl font-bold text-foreground mb-4">Start Building Your Portfolio</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Complete KYC verification to unlock full access to property listings, investment agreements, and your dedicated investor dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/kyc/start">
                <Button size="lg" className="bg-amber-500 hover:bg-amber-400 text-black font-semibold gap-2">
                  <CheckCircle className="h-4 w-4" /> Start KYC Verification
                </Button>
              </Link>
              <Link href="/atr/properties">
                <Button size="lg" variant="outline" className="border-border/60 gap-2">
                  <Building2 className="h-4 w-4" /> Browse Properties
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="ghost" className="text-muted-foreground gap-2">
                  Speak to an Advisor <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
