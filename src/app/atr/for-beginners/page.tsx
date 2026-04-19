"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Search,
  Shield,
  PieChart,
  TrendingUp,
  CheckSquare,
  Square,
  Play,
  Calendar,
  Map,
  ArrowRight,
  CheckCircle,
  Star,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const pillars = [
  {
    icon: BookOpen,
    title: "Understanding REITs",
    description:
      "Real Estate Investment Trusts allow you to invest in income-generating real estate without directly owning property. Learn how REITs work, their tax advantages, and how to evaluate their performance.",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    icon: Search,
    title: "Due Diligence",
    description:
      "Successful investing starts with rigorous research. Understand how to analyze properties, review financial statements, assess market conditions, and evaluate sponsor track records.",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: Shield,
    title: "Risk Management",
    description:
      "Every investment carries risk. Learn to identify, quantify, and mitigate common real estate risks including market risk, liquidity risk, leverage risk, and concentration risk.",
    color: "text-red-600",
    bg: "bg-red-50",
  },
  {
    icon: PieChart,
    title: "Portfolio Diversification",
    description:
      "Don't put all your eggs in one basket. Discover how to balance your real estate portfolio across asset classes, geographies, and investment stages to optimize returns.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: TrendingUp,
    title: "Exit Strategies",
    description:
      "Understanding how and when you can exit an investment is critical. Explore common exit strategies: property sale, refinancing, 1031 exchanges, and secondary market liquidity.",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
];

const checklistItems = [
  "I understand the difference between equity and debt real estate investments",
  "I have reviewed my financial situation and determined an appropriate investment amount",
  "I understand that real estate investments are generally illiquid",
  "I have read and understand the risk factors associated with real estate investing",
  "I know my investment timeline (short, medium, or long-term)",
  "I understand the tax implications of real estate investment income",
  "I have consulted with a financial advisor or am prepared to do so",
  "I understand that past performance does not guarantee future results",
  "I have reviewed ATR's track record and fund performance history",
  "I am comfortable with the minimum investment requirements",
];

const resources = [
  {
    icon: Play,
    title: "Video Library",
    description:
      "Access 40+ educational videos covering every aspect of real estate investing, from beginner basics to advanced strategies.",
    badge: "40+ Videos",
    badgeColor: "bg-blue-100 text-blue-700",
    link: "#",
    linkText: "Browse Videos",
  },
  {
    icon: Map,
    title: "Strategy Framework",
    description:
      "Take our interactive 3-step questionnaire to discover the investment track that best matches your goals and risk tolerance.",
    badge: "Interactive",
    badgeColor: "bg-amber-100 text-amber-700",
    link: "/atr/for-beginners/strategy-framework",
    linkText: "Find My Strategy",
  },
  {
    icon: Calendar,
    title: "Webinar Schedule",
    description:
      "Join live monthly webinars with ATR investment professionals. Ask questions, explore case studies, and network with fellow investors.",
    badge: "Live Sessions",
    badgeColor: "bg-emerald-100 text-emerald-700",
    link: "#",
    linkText: "View Schedule",
  },
];

export default function ForBeginnersPage() {
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  function toggleCheck(i: number) {
    setChecked((prev) => ({ ...prev, [i]: !prev[i] }));
  }

  const checkedCount = Object.values(checked).filter(Boolean).length;
  const allChecked = checkedCount === checklistItems.length;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-[hsl(222,47%,11%)] text-white py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-amber-400 text-xs tracking-widest uppercase font-semibold mb-4">
            FOR BEGINNERS
          </p>
          <h1
            className="text-5xl font-bold mb-6"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Start Your Investment Journey
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed">
            Real estate investing doesn't have to be complicated. We've broken
            down everything you need to know into clear, actionable steps so you
            can invest with confidence from day one.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 px-4 py-1.5">
              No Experience Required
            </Badge>
            <Badge className="bg-white/10 text-white border-white/20 px-4 py-1.5">
              Start from $25K
            </Badge>
            <Badge className="bg-white/10 text-white border-white/20 px-4 py-1.5">
              Expert Guidance Included
            </Badge>
          </div>
        </div>
      </section>

      {/* 5 Investment Pillars */}
      <section className="py-20 px-6 bg-[#f8fafc]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-amber-600 text-xs tracking-widest uppercase font-semibold mb-3">
              FOUNDATIONAL KNOWLEDGE
            </p>
            <h2
              className="text-3xl font-bold text-slate-900"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              The 5 Investment Pillars
            </h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto text-sm">
              Master these five areas and you'll have the foundation to make
              sound real estate investment decisions.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <Card
                  key={pillar.title}
                  className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div
                      className={`w-11 h-11 rounded-lg ${pillar.bg} flex items-center justify-center mb-3`}
                    >
                      <Icon size={22} className={pillar.color} />
                    </div>
                    <CardTitle
                      className="text-lg text-slate-900"
                      style={{
                        fontFamily: "'Playfair Display', Georgia, serif",
                      }}
                    >
                      {pillar.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {pillar.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
            {/* Sixth card: CTA placeholder to balance grid */}
            <Card className="border-2 border-dashed border-amber-300 bg-amber-50 flex items-center justify-center">
              <CardContent className="text-center py-10">
                <Star size={28} className="text-amber-500 mx-auto mb-3" />
                <p
                  className="text-slate-800 font-semibold text-lg mb-2"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Ready to Apply?
                </p>
                <p className="text-slate-600 text-sm mb-4">
                  Take the strategy questionnaire to find your ideal investment
                  track.
                </p>
                <Button
                  size="sm"
                  className="bg-amber-500 hover:bg-amber-600 text-white"
                  asChild
                >
                  <Link href="/atr/for-beginners/strategy-framework">
                    Get Started
                    <ArrowRight size={14} className="ml-1.5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Risk Readiness Checklist */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-amber-600 text-xs tracking-widest uppercase font-semibold mb-3">
              SELF-ASSESSMENT
            </p>
            <h2
              className="text-3xl font-bold text-slate-900"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Investor Readiness Checklist
            </h2>
            <p className="text-slate-500 mt-3 text-sm">
              Complete this checklist to confirm you're prepared to begin
              investing with ATR.
            </p>
          </div>

          <Card className="shadow-md border border-slate-200">
            <CardHeader className="border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle
                  className="text-lg text-slate-900"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Pre-Investment Checklist
                </CardTitle>
                <span className="text-sm font-medium text-slate-600">
                  {checkedCount}/{checklistItems.length} completed
                </span>
              </div>
              <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-300"
                  style={{
                    width: `${(checkedCount / checklistItems.length) * 100}%`,
                  }}
                />
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-3">
                {checklistItems.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 cursor-pointer group"
                    onClick={() => toggleCheck(i)}
                  >
                    {checked[i] ? (
                      <CheckSquare
                        size={20}
                        className="text-amber-500 shrink-0 mt-0.5"
                      />
                    ) : (
                      <Square
                        size={20}
                        className="text-slate-300 group-hover:text-slate-400 shrink-0 mt-0.5 transition-colors"
                      />
                    )}
                    <span
                      className={`text-sm leading-relaxed transition-colors ${
                        checked[i]
                          ? "text-slate-400 line-through"
                          : "text-slate-700"
                      }`}
                    >
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
              {allChecked && (
                <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-3">
                  <CheckCircle size={20} className="text-emerald-500 shrink-0" />
                  <div>
                    <p className="text-emerald-800 font-semibold text-sm">
                      You're ready to invest!
                    </p>
                    <p className="text-emerald-600 text-xs mt-0.5">
                      All items checked. View our investment plan to get started.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="ml-auto bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
                    asChild
                  >
                    <Link href="/atr/investment-plan">
                      View Plans
                      <ArrowRight size={13} className="ml-1" />
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Resource Cards */}
      <section className="py-20 px-6 bg-[#f8fafc]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-amber-600 text-xs tracking-widest uppercase font-semibold mb-3">
              LEARNING RESOURCES
            </p>
            <h2
              className="text-3xl font-bold text-slate-900"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Tools to Accelerate Your Learning
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {resources.map((res) => {
              const Icon = res.icon;
              return (
                <Card
                  key={res.title}
                  className="border border-slate-200 shadow-sm flex flex-col"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                        <Icon size={20} className="text-slate-600" />
                      </div>
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full ${res.badgeColor}`}
                      >
                        {res.badge}
                      </span>
                    </div>
                    <CardTitle
                      className="text-lg text-slate-900"
                      style={{
                        fontFamily: "'Playfair Display', Georgia, serif",
                      }}
                    >
                      {res.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1">
                    <p className="text-slate-600 text-sm leading-relaxed flex-1">
                      {res.description}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-5 w-full border-slate-200 hover:bg-slate-50"
                      asChild
                    >
                      <Link href={res.link}>
                        {res.linkText}
                        <ArrowRight size={14} className="ml-1.5" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA to Investment Plan */}
      <section className="py-20 px-6 bg-[hsl(222,47%,11%)] text-white text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-amber-400 text-xs tracking-widest uppercase font-semibold mb-4">
            NEXT STEP
          </p>
          <h2
            className="text-4xl font-bold mb-5"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Ready to Build Your Investment Plan?
          </h2>
          <p className="text-slate-300 mb-8 leading-relaxed">
            Our advisors will work with you to create a personalized investment
            strategy aligned with your goals, timeline, and risk tolerance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              className="bg-amber-500 hover:bg-amber-600 text-white"
              asChild
            >
              <Link href="/atr/investment-plan">
                View Investment Plans
                <ArrowRight size={16} className="ml-2" />
              </Link>
            </Button>
            <Button
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-slate-900"
              asChild
            >
              <Link href="/atr/for-beginners/strategy-framework">
                Take Strategy Quiz
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
