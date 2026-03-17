import Link from "next/link";
import {
  TrendingUp,
  Building2,
  DollarSign,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Plus,
  ExternalLink,
  Activity,
  PieChart,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ── Static data ───────────────────────────────────────────────────────────────

const metricCards = [
  {
    title: "Portfolio Value",
    value: "$247,500",
    change: "+12.3%",
    direction: "up" as const,
    sub: "vs. last year",
    icon: BarChart3,
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
  },
  {
    title: "Monthly Income",
    value: "$2,840",
    change: "+4.1%",
    direction: "up" as const,
    sub: "vs. last month",
    icon: DollarSign,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    title: "Total Properties",
    value: "3",
    change: "+1",
    direction: "up" as const,
    sub: "added this quarter",
    icon: Building2,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    title: "YTD Returns",
    value: "18.7%",
    change: "+3.2%",
    direction: "up" as const,
    sub: "above benchmark",
    icon: TrendingUp,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
];

const portfolioSummary = [
  {
    label: "Total Invested",
    value: "$220,000",
    icon: DollarSign,
    iconBg: "bg-slate-100",
    iconColor: "text-slate-600",
  },
  {
    label: "Current Value",
    value: "$247,500",
    icon: TrendingUp,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    label: "Total Return",
    value: "+$27,500",
    icon: PieChart,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    label: "Active Investments",
    value: "3",
    icon: Activity,
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
  },
];

const investments = [
  {
    property: "Riverside Multifamily Complex",
    type: "Residential",
    invested: "$85,000",
    currentValue: "$97,200",
    returnPct: "+14.4%",
    status: "Active",
    statusColor: "bg-emerald-100 text-emerald-700",
    direction: "up" as const,
  },
  {
    property: "Westside Office Portfolio",
    type: "Commercial",
    invested: "$60,000",
    currentValue: "$69,750",
    returnPct: "+16.3%",
    status: "Active",
    statusColor: "bg-emerald-100 text-emerald-700",
    direction: "up" as const,
  },
  {
    property: "Downtown Mixed-Use Development",
    type: "Development",
    invested: "$75,000",
    currentValue: "$80,550",
    returnPct: "+7.4%",
    status: "In Progress",
    statusColor: "bg-amber-100 text-amber-700",
    direction: "up" as const,
  },
];

const transactions = [
  {
    date: "Mar 15, 2026",
    description: "Q1 Distribution — Riverside Multifamily",
    amount: "+$1,105",
    type: "Distribution",
    typeColor: "bg-emerald-100 text-emerald-700",
    direction: "up" as const,
  },
  {
    date: "Mar 01, 2026",
    description: "New Investment — Downtown Mixed-Use",
    amount: "-$75,000",
    type: "Investment",
    typeColor: "bg-blue-100 text-blue-700",
    direction: "down" as const,
  },
  {
    date: "Feb 15, 2026",
    description: "Q1 Distribution — Westside Office",
    amount: "+$872",
    type: "Distribution",
    typeColor: "bg-emerald-100 text-emerald-700",
    direction: "up" as const,
  },
  {
    date: "Feb 01, 2026",
    description: "Management Fee — Portfolio",
    amount: "-$215",
    type: "Fee",
    typeColor: "bg-slate-100 text-slate-600",
    direction: "down" as const,
  },
  {
    date: "Jan 15, 2026",
    description: "Q4 Distribution — Riverside Multifamily",
    amount: "+$863",
    type: "Distribution",
    typeColor: "bg-emerald-100 text-emerald-700",
    direction: "up" as const,
  },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="px-6 py-10" style={{ backgroundColor: "hsl(222,47%,11%)" }}>
        <div className="max-w-7xl mx-auto">
          <p className="text-amber-400 text-xs tracking-widest uppercase font-semibold mb-1">
            INVESTOR PORTAL
          </p>
          <h1
            className="text-3xl font-bold text-white"
            style={{ fontFamily: "var(--font-serif, 'Playfair Display', serif)" }}
          >
            Welcome, Investor
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Portfolio overview · As of March 2026
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">

        {/* Portfolio Summary (Shrill-style) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {portfolioSummary.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.label} className="border border-slate-200 shadow-sm bg-white">
                <CardContent className="pt-5">
                  <div className={`w-10 h-10 rounded-lg ${card.iconBg} flex items-center justify-center mb-3`}>
                    <Icon size={20} className={card.iconColor} />
                  </div>
                  <p className="text-2xl font-bold text-slate-900 mb-0.5">{card.value}</p>
                  <p className="text-xs text-slate-500">{card.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {metricCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.title} className="border border-slate-200 shadow-sm bg-white">
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-lg ${card.iconBg} flex items-center justify-center`}>
                      <Icon size={20} className={card.iconColor} />
                    </div>
                    <span
                      className={`text-xs font-semibold flex items-center gap-0.5 ${
                        card.direction === "up" ? "text-emerald-600" : "text-red-500"
                      }`}
                    >
                      {card.direction === "up" ? (
                        <ArrowUpRight size={13} />
                      ) : (
                        <ArrowDownRight size={13} />
                      )}
                      {card.change}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 mb-0.5">{card.value}</p>
                  <p className="text-xs text-slate-500">{card.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{card.sub}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Active Investments Table */}
          <div className="lg:col-span-2">
            <Card className="border border-slate-200 shadow-sm bg-white">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle
                  className="text-lg text-slate-900"
                  style={{ fontFamily: "var(--font-serif, 'Playfair Display', serif)" }}
                >
                  Active Investments
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left py-3 pr-4 text-xs text-amber-600 tracking-widest uppercase font-semibold">Property</th>
                        <th className="text-left py-3 pr-4 text-xs text-amber-600 tracking-widest uppercase font-semibold">Type</th>
                        <th className="text-right py-3 pr-4 text-xs text-amber-600 tracking-widest uppercase font-semibold">Invested</th>
                        <th className="text-right py-3 pr-4 text-xs text-amber-600 tracking-widest uppercase font-semibold">Current</th>
                        <th className="text-right py-3 pr-4 text-xs text-amber-600 tracking-widest uppercase font-semibold">Return</th>
                        <th className="text-left py-3 text-xs text-amber-600 tracking-widest uppercase font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {investments.map((inv) => (
                        <tr key={inv.property} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                          <td className="py-4 pr-4 font-medium text-slate-900 max-w-[180px]">
                            <p className="truncate">{inv.property}</p>
                          </td>
                          <td className="py-4 pr-4 text-slate-500">{inv.type}</td>
                          <td className="py-4 pr-4 text-right text-slate-700">{inv.invested}</td>
                          <td className="py-4 pr-4 text-right font-medium text-slate-900">{inv.currentValue}</td>
                          <td className="py-4 pr-4 text-right font-semibold text-emerald-600">
                            <span className="flex items-center justify-end gap-0.5">
                              <ArrowUpRight size={13} />
                              {inv.returnPct}
                            </span>
                          </td>
                          <td className="py-4">
                            <Badge className={`${inv.statusColor} text-xs`}>{inv.status}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-slate-200 bg-slate-50">
                        <td colSpan={2} className="py-3 pr-4 text-xs font-bold text-slate-700 uppercase tracking-wide">Total</td>
                        <td className="py-3 pr-4 text-right font-bold text-slate-900 text-sm">$220,000</td>
                        <td className="py-3 pr-4 text-right font-bold text-slate-900 text-sm">$247,500</td>
                        <td className="py-3 pr-4 text-right font-bold text-emerald-600 text-sm">+12.5%</td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="border border-slate-200 shadow-sm bg-white">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-lg text-slate-900" style={{ fontFamily: "var(--font-serif, 'Playfair Display', serif)" }}>
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5 space-y-3">
                <Button
                  className="w-full text-white justify-start"
                  style={{ backgroundColor: "hsl(222,47%,11%)" }}
                  asChild
                >
                  <Link href="/atr/properties">
                    <Building2 size={16} className="mr-2" />
                    Browse Properties
                    <ExternalLink size={13} className="ml-auto" />
                  </Link>
                </Button>
                <Button variant="outline" className="w-full border-slate-200 justify-start">
                  <Plus size={16} className="mr-2" />
                  Add Funds
                </Button>
                <Button variant="outline" className="w-full border-slate-200 justify-start">
                  <Download size={16} className="mr-2" />
                  Download Report
                </Button>
                <Button variant="outline" className="w-full border-slate-200 justify-start border-amber-200 text-amber-700" asChild>
                  <Link href="/atr/demo/dashboard">
                    <BarChart3 size={16} className="mr-2" />
                    Practice (Demo)
                    <ExternalLink size={13} className="ml-auto" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card className="border border-slate-200 shadow-sm bg-white">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-lg text-slate-900" style={{ fontFamily: "var(--font-serif, 'Playfair Display', serif)" }}>
                  Recent Transactions
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-4">
                  {transactions.map((tx, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          tx.direction === "up" ? "bg-emerald-50" : "bg-red-50"
                        }`}
                      >
                        {tx.direction === "up" ? (
                          <ArrowUpRight size={15} className="text-emerald-600" />
                        ) : (
                          <ArrowDownRight size={15} className="text-red-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-800 font-medium leading-snug truncate">{tx.description}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{tx.date}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-sm font-semibold ${tx.direction === "up" ? "text-emerald-600" : "text-red-500"}`}>
                          {tx.amount}
                        </p>
                        <Badge className={`text-xs mt-1 ${tx.typeColor}`}>{tx.type}</Badge>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Performance Note */}
        <div
          className="rounded-2xl p-8 text-white"
          style={{ backgroundColor: "hsl(222,47%,11%)" }}
        >
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { value: "$247.5K", label: "Portfolio Value" },
              { value: "18.7%", label: "YTD Returns" },
              { value: "$2,840", label: "Monthly Income" },
              { value: "3", label: "Active Properties" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-black text-amber-400 mb-1"
                  style={{ fontFamily: "var(--font-serif, 'Playfair Display', serif)" }}>
                  {s.value}
                </div>
                <div className="text-xs uppercase tracking-wider text-slate-400">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
