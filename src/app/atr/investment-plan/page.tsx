import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  TrendingUp,
  Zap,
  CheckCircle,
  ArrowRight,
  DollarSign,
  Calendar,
  BarChart3,
} from "lucide-react";

const tracks = [
  {
    icon: <Shield className="w-10 h-10 text-blue-400" />,
    label: "Conservative",
    title: "Conservative Income Track",
    target: "8–12%",
    minInvestment: "$25,000",
    risk: "Low",
    riskColor: "bg-green-100 text-green-800 border-green-200",
    hold: "5-year hold",
    distributions: "Monthly distributions",
    allocation: [
      { label: "REITs", pct: 60, color: "bg-blue-500" },
      { label: "Core Residential", pct: 30, color: "bg-blue-300" },
      { label: "Cash", pct: 10, color: "bg-blue-100" },
    ],
    highlights: [
      "Monthly distributions",
      "5-year hold period",
      "Title protected assets",
      "Capital preservation focus",
      "SEC-registered vehicles",
    ],
    headerBg: "from-blue-900 to-blue-700",
    accentColor: "text-blue-300",
  },
  {
    icon: <TrendingUp className="w-10 h-10 text-amber-400" />,
    label: "Balanced",
    title: "Balanced Growth Track",
    target: "15–20%",
    minInvestment: "$100,000",
    risk: "Moderate",
    riskColor: "bg-amber-100 text-amber-800 border-amber-200",
    hold: "3–7 year hold",
    distributions: "Quarterly distributions",
    allocation: [
      { label: "Commercial", pct: 40, color: "bg-amber-500" },
      { label: "Multifamily", pct: 35, color: "bg-amber-300" },
      { label: "Value-Add", pct: 25, color: "bg-amber-100" },
    ],
    highlights: [
      "Quarterly distributions",
      "3–7 year hold period",
      "Diversified asset mix",
      "Active value-add strategy",
      "Institutional-grade assets",
    ],
    headerBg: "from-amber-900 to-amber-600",
    accentColor: "text-amber-300",
    featured: true,
  },
  {
    icon: <Zap className="w-10 h-10 text-red-400" />,
    label: "Aggressive",
    title: "Aggressive Growth Track",
    target: "23–30%",
    minInvestment: "$250,000",
    risk: "High",
    riskColor: "bg-red-100 text-red-800 border-red-200",
    hold: "2–5 year hold",
    distributions: "Annual distributions",
    allocation: [
      { label: "Development", pct: 50, color: "bg-red-500" },
      { label: "Opportunistic", pct: 30, color: "bg-red-300" },
      { label: "Core-Plus", pct: 20, color: "bg-red-100" },
    ],
    highlights: [
      "Annual distributions",
      "2–5 year hold period",
      "Maximum appreciation potential",
      "Ground-up development",
      "Opportunistic acquisitions",
    ],
    headerBg: "from-red-900 to-red-700",
    accentColor: "text-red-300",
  },
];

const comparisonRows = [
  { label: "Target Annual Return", values: ["8–12%", "15–20%", "23–30%"] },
  { label: "Minimum Investment", values: ["$25,000", "$100,000", "$250,000"] },
  { label: "Risk Level", values: ["Low", "Moderate", "High"] },
  { label: "Hold Period", values: ["5 years", "3–7 years", "2–5 years"] },
  { label: "Distribution Frequency", values: ["Monthly", "Quarterly", "Annual"] },
  { label: "Primary Strategy", values: ["REITs / Core", "Commercial / MF", "Development"] },
  { label: "Title Protection", values: ["Yes", "Yes", "Partial"] },
  { label: "SEC Registration", values: ["Yes", "Yes", "Yes"] },
];

export default function InvestmentPlanPage() {
  return (
    <div className="min-h-screen bg-white text-[hsl(222,47%,11%)]">
      {/* Hero */}
      <section className="relative bg-[hsl(222,47%,11%)] py-24 px-6 overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
        <div className="relative max-w-6xl mx-auto text-center">
          <p className="text-amber-600 text-xs tracking-widest uppercase mb-4 font-semibold">Investment Plan</p>
          <h1
            className="text-5xl md:text-6xl font-bold text-white mb-6"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Choose Your Investment Track
          </h1>
          <p className="text-slate-300 text-xl max-w-2xl mx-auto">
            Three purpose-built strategies to align your capital with your goals — from income stability to aggressive appreciation.
          </p>
        </div>
      </section>

      {/* Track Cards */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {tracks.map((track, idx) => (
              <div key={idx} className={`relative ${track.featured ? "lg:-mt-4 lg:mb-4" : ""}`}>
                {track.featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <span className="bg-amber-500 text-white text-xs font-bold px-4 py-1.5 rounded-full tracking-wide uppercase shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}
                <Card
                  className={`border-2 overflow-hidden h-full flex flex-col ${
                    track.featured ? "border-amber-400 shadow-xl shadow-amber-100" : "border-slate-200 shadow-sm"
                  }`}
                >
                  {/* Card Header */}
                  <div className={`bg-gradient-to-br ${track.headerBg} p-8 text-white`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-white/10 rounded-xl">{track.icon}</div>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${track.riskColor}`}
                      >
                        {track.risk} Risk
                      </span>
                    </div>
                    <p className={`text-xs tracking-widest uppercase font-semibold mb-2 ${track.accentColor}`}>
                      {track.label} Track
                    </p>
                    <h2
                      className="text-2xl font-bold text-white mb-4 leading-tight"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                      {track.title}
                    </h2>
                    <div className="flex items-end gap-1 mb-1">
                      <span className={`text-5xl font-bold ${track.accentColor}`} style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                        {track.target}
                      </span>
                    </div>
                    <p className="text-white/60 text-sm">Target Annual Returns</p>
                  </div>

                  <CardContent className="p-8 flex-1 flex flex-col gap-6">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#f8fafc] rounded-lg p-4 text-center">
                        <DollarSign className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                        <p className="text-xs text-slate-500 mb-1">Min. Investment</p>
                        <p className="font-bold text-[hsl(222,47%,11%)] text-sm">{track.minInvestment}</p>
                      </div>
                      <div className="bg-[#f8fafc] rounded-lg p-4 text-center">
                        <Calendar className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                        <p className="text-xs text-slate-500 mb-1">Hold Period</p>
                        <p className="font-bold text-[hsl(222,47%,11%)] text-sm">{track.hold}</p>
                      </div>
                    </div>

                    {/* Allocation */}
                    <div>
                      <p className="text-amber-600 text-xs tracking-widest uppercase font-semibold mb-3">
                        Portfolio Allocation
                      </p>
                      <div className="flex rounded-full overflow-hidden h-3 mb-3">
                        {track.allocation.map((a, i) => (
                          <div
                            key={i}
                            className={`${a.color} h-full`}
                            style={{ width: `${a.pct}%` }}
                          />
                        ))}
                      </div>
                      <div className="space-y-1.5">
                        {track.allocation.map((a, i) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-sm ${a.color}`} />
                              <span className="text-slate-600">{a.label}</span>
                            </div>
                            <span className="font-semibold text-[hsl(222,47%,11%)]">{a.pct}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Highlights */}
                    <div>
                      <p className="text-amber-600 text-xs tracking-widest uppercase font-semibold mb-3">Highlights</p>
                      <ul className="space-y-2">
                        {track.highlights.map((h, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                            <CheckCircle className="w-4 h-4 text-amber-500 shrink-0" />
                            {h}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-auto pt-4">
                      <Link href="/atr/invest">
                        <Button
                          className={`w-full h-11 font-semibold ${
                            track.featured
                              ? "bg-amber-600 hover:bg-amber-700 text-white"
                              : "bg-[hsl(222,47%,11%)] hover:bg-[hsl(222,47%,18%)] text-white"
                          }`}
                        >
                          Select This Track <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="bg-[#f8fafc] py-20 px-6 border-t border-slate-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-amber-600 text-xs tracking-widest uppercase font-semibold mb-3">Side by Side</p>
            <h2
              className="text-4xl font-bold text-[hsl(222,47%,11%)]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Track Comparison
            </h2>
          </div>
          <Card className="border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[hsl(222,47%,11%)] text-white">
                    <th className="text-left px-6 py-4 text-sm font-semibold">Metric</th>
                    <th className="text-center px-6 py-4 text-sm font-semibold text-blue-300">Conservative</th>
                    <th className="text-center px-6 py-4 text-sm font-semibold text-amber-300">Balanced</th>
                    <th className="text-center px-6 py-4 text-sm font-semibold text-red-300">Aggressive</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, idx) => (
                    <tr
                      key={idx}
                      className={`border-b border-slate-100 ${idx % 2 === 0 ? "bg-white" : "bg-[#f8fafc]"}`}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-slate-700">{row.label}</td>
                      {row.values.map((val, vi) => (
                        <td key={vi} className="px-6 py-4 text-center text-sm font-semibold text-[hsl(222,47%,11%)]">
                          {val}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[hsl(222,47%,11%)] py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <BarChart3 className="w-12 h-12 text-amber-400 mx-auto mb-6" />
          <h2
            className="text-3xl font-bold text-white mb-4"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Not Sure Which Track Is Right?
          </h2>
          <p className="text-slate-300 mb-8">
            Book a complimentary consultation with an ATR investment strategist. We'll analyze your goals and recommend the optimal allocation.
          </p>
          <Link href="/atr/invest">
            <Button className="bg-amber-600 hover:bg-amber-700 text-white px-10 h-12 text-base">
              Book a Consultation <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
