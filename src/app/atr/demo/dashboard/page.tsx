"use client";

import { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  DollarSign,
  RotateCcw,
  ArrowRight,
  Building2,
  BookOpen,
  Shield,
  BarChart3,
  Lightbulb,
  AlertCircle,
  CheckCircle,
  Plus,
  Minus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const STARTING_BALANCE = 100_000;

const propertyOptions = [
  {
    id: "riverside",
    name: "Riverside Multifamily Complex",
    type: "Residential",
    expectedReturn: "14%",
  },
  {
    id: "westside",
    name: "Westside Office Portfolio",
    type: "Commercial",
    expectedReturn: "16%",
  },
  {
    id: "downtown",
    name: "Downtown Mixed-Use Development",
    type: "Development",
    expectedReturn: "24%",
  },
];

type Investment = {
  propertyId: string;
  propertyName: string;
  amount: number;
};

type LogEntry = {
  timestamp: string;
  message: string;
  type: "invest" | "distribution" | "reset" | "error";
};

const tips = [
  {
    icon: Shield,
    title: "Diversify Your Portfolio",
    description:
      "Spreading investments across multiple property types reduces concentration risk and can smooth out volatility.",
  },
  {
    icon: BarChart3,
    title: "Compounding Returns",
    description:
      "Reinvesting distributions accelerates portfolio growth through the power of compounding over time.",
  },
  {
    icon: Lightbulb,
    title: "Risk vs. Return",
    description:
      "Development projects typically offer higher returns but come with more risk and longer hold periods than stabilized assets.",
  },
  {
    icon: BookOpen,
    title: "Due Diligence Matters",
    description:
      "Always review the investment memorandum, sponsor track record, and market data before committing capital.",
  },
];

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function now() {
  return new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function DemoDashboardPage() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [cash, setCash] = useState(STARTING_BALANCE);
  const [investPropertyId, setInvestPropertyId] = useState(propertyOptions[0].id);
  const [investAmount, setInvestAmount] = useState("");
  const [distPropertyId, setDistPropertyId] = useState(propertyOptions[0].id);
  const [log, setLog] = useState<LogEntry[]>([
    {
      timestamp: now(),
      message: "Demo session started with $100,000 practice balance.",
      type: "reset",
    },
  ]);

  function addLog(entry: LogEntry) {
    setLog((prev) => [entry, ...prev]);
  }

  function totalInvested() {
    return investments.reduce((sum, inv) => sum + inv.amount, 0);
  }

  function portfolioValue() {
    // Simulate slight appreciation: each investment is worth 102% (demo only)
    return investments.reduce((sum, inv) => sum + inv.amount * 1.02, 0);
  }

  function getInvestmentForProperty(id: string) {
    return investments.find((inv) => inv.propertyId === id);
  }

  function handleInvest() {
    const amount = parseFloat(investAmount.replace(/,/g, ""));
    if (isNaN(amount) || amount <= 0) {
      addLog({
        timestamp: now(),
        message: "Please enter a valid investment amount.",
        type: "error",
      });
      return;
    }
    if (amount < 1000) {
      addLog({
        timestamp: now(),
        message: "Minimum demo investment is $1,000.",
        type: "error",
      });
      return;
    }
    if (amount > cash) {
      addLog({
        timestamp: now(),
        message: `Insufficient cash. Available: ${formatCurrency(cash)}.`,
        type: "error",
      });
      return;
    }

    const property = propertyOptions.find((p) => p.id === investPropertyId)!;
    setCash((prev) => prev - amount);
    setInvestments((prev) => {
      const existing = prev.find((inv) => inv.propertyId === investPropertyId);
      if (existing) {
        return prev.map((inv) =>
          inv.propertyId === investPropertyId
            ? { ...inv, amount: inv.amount + amount }
            : inv
        );
      }
      return [
        ...prev,
        {
          propertyId: property.id,
          propertyName: property.name,
          amount,
        },
      ];
    });
    addLog({
      timestamp: now(),
      message: `Invested ${formatCurrency(amount)} in ${property.name}.`,
      type: "invest",
    });
    setInvestAmount("");
  }

  function handleDistribution() {
    const inv = getInvestmentForProperty(distPropertyId);
    if (!inv) {
      addLog({
        timestamp: now(),
        message: "No investment found in selected property. Invest first.",
        type: "error",
      });
      return;
    }
    const distribution = inv.amount * 0.05;
    setCash((prev) => prev + distribution);
    addLog({
      timestamp: now(),
      message: `Received ${formatCurrency(distribution)} distribution from ${inv.propertyName} (5% of invested).`,
      type: "distribution",
    });
  }

  function handleReset() {
    setInvestments([]);
    setCash(STARTING_BALANCE);
    setInvestAmount("");
    setLog([
      {
        timestamp: now(),
        message: "Portfolio reset. Starting balance of $100,000 restored.",
        type: "reset",
      },
    ]);
  }

  const logColors: Record<LogEntry["type"], string> = {
    invest: "text-blue-600",
    distribution: "text-emerald-600",
    reset: "text-amber-600",
    error: "text-red-500",
  };

  const logIcons: Record<LogEntry["type"], React.ElementType> = {
    invest: Plus,
    distribution: TrendingUp,
    reset: RotateCcw,
    error: AlertCircle,
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-[hsl(222,47%,11%)] px-6 py-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <p className="text-amber-400 text-xs tracking-widest uppercase font-semibold">
                  PRACTICE MODE
                </p>
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs">
                  DEMO
                </Badge>
              </div>
              <h1
                className="text-3xl font-bold text-white"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Demo Trading Dashboard
              </h1>
              <p className="text-slate-400 text-sm mt-2 max-w-xl">
                Practice investing with a $100,000 virtual portfolio. No real
                money is involved. Explore strategies before committing real
                capital.
              </p>
            </div>
            <Button
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
              onClick={handleReset}
            >
              <RotateCcw size={15} className="mr-2" />
              Reset Portfolio
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        {/* Portfolio Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              label: "Starting Balance",
              value: formatCurrency(STARTING_BALANCE),
              icon: DollarSign,
              sub: "Practice capital",
              iconBg: "bg-slate-100",
              iconColor: "text-slate-600",
            },
            {
              label: "Total Invested",
              value: formatCurrency(totalInvested()),
              icon: Building2,
              sub: `${investments.length} propert${investments.length === 1 ? "y" : "ies"}`,
              iconBg: "bg-blue-50",
              iconColor: "text-blue-600",
            },
            {
              label: "Available Cash",
              value: formatCurrency(cash),
              icon: DollarSign,
              sub: "Ready to deploy",
              iconBg: "bg-amber-50",
              iconColor: "text-amber-600",
            },
            {
              label: "Portfolio Value",
              value: formatCurrency(cash + portfolioValue()),
              icon: TrendingUp,
              sub:
                cash + portfolioValue() >= STARTING_BALANCE
                  ? `+${formatCurrency(cash + portfolioValue() - STARTING_BALANCE)} gain`
                  : `${formatCurrency(cash + portfolioValue() - STARTING_BALANCE)} loss`,
              iconBg: "bg-emerald-50",
              iconColor: "text-emerald-600",
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <Card
                key={card.label}
                className="border border-slate-200 shadow-sm bg-white"
              >
                <CardContent className="pt-5">
                  <div
                    className={`w-10 h-10 rounded-lg ${card.iconBg} flex items-center justify-center mb-3`}
                  >
                    <Icon size={20} className={card.iconColor} />
                  </div>
                  <p className="text-2xl font-bold text-slate-900 mb-0.5">
                    {card.value}
                  </p>
                  <p className="text-xs text-slate-500">{card.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{card.sub}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Simulate Investment */}
          <Card className="border border-slate-200 shadow-sm bg-white">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle
                className="text-lg text-slate-900"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Simulate Investment
              </CardTitle>
              <p className="text-slate-500 text-sm mt-1">
                Allocate virtual capital to a property.
              </p>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
              <div>
                <label className="text-amber-600 text-xs tracking-widest uppercase font-semibold block mb-1.5">
                  Select Property
                </label>
                <select
                  value={investPropertyId}
                  onChange={(e) => setInvestPropertyId(e.target.value)}
                  className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  {propertyOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {p.type} ({p.expectedReturn} target)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-amber-600 text-xs tracking-widest uppercase font-semibold block mb-1.5">
                  Investment Amount ($)
                </label>
                <Input
                  type="number"
                  value={investAmount}
                  onChange={(e) => setInvestAmount(e.target.value)}
                  placeholder="e.g. 25000"
                  min={1000}
                  max={cash}
                  className="border-slate-200"
                />
                <p className="text-xs text-slate-400 mt-1.5">
                  Available cash: {formatCurrency(cash)} · Min: $1,000
                </p>
              </div>
              <Button
                className="w-full bg-[hsl(222,47%,11%)] hover:bg-[hsl(222,47%,16%)] text-white"
                onClick={handleInvest}
              >
                <Plus size={16} className="mr-2" />
                Invest
              </Button>
            </CardContent>
          </Card>

          {/* Simulate Distribution */}
          <Card className="border border-slate-200 shadow-sm bg-white">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle
                className="text-lg text-slate-900"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Simulate Distribution
              </CardTitle>
              <p className="text-slate-500 text-sm mt-1">
                Receive a 5% practice distribution from an investment.
              </p>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
              <div>
                <label className="text-amber-600 text-xs tracking-widest uppercase font-semibold block mb-1.5">
                  Select Property
                </label>
                <select
                  value={distPropertyId}
                  onChange={(e) => setDistPropertyId(e.target.value)}
                  className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  {propertyOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              {(() => {
                const inv = getInvestmentForProperty(distPropertyId);
                return inv ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                    <p className="text-sm text-emerald-800 font-medium">
                      Your investment: {formatCurrency(inv.amount)}
                    </p>
                    <p className="text-sm text-emerald-600 mt-0.5">
                      Distribution (5%): {formatCurrency(inv.amount * 0.05)}
                    </p>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <p className="text-sm text-slate-500">
                      No investment in this property yet.
                    </p>
                  </div>
                );
              })()}
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={handleDistribution}
              >
                <Minus size={16} className="mr-2" />
                Receive Distribution
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Current Portfolio Holdings */}
        {investments.length > 0 && (
          <Card className="border border-slate-200 shadow-sm bg-white">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle
                className="text-lg text-slate-900"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Current Holdings
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-3 pr-4 text-xs text-amber-600 tracking-widest uppercase font-semibold">
                      Property
                    </th>
                    <th className="text-right py-3 pr-4 text-xs text-amber-600 tracking-widest uppercase font-semibold">
                      Invested
                    </th>
                    <th className="text-right py-3 text-xs text-amber-600 tracking-widest uppercase font-semibold">
                      Market Value (+2%)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {investments.map((inv) => (
                    <tr
                      key={inv.propertyId}
                      className="border-b border-slate-50 hover:bg-slate-50"
                    >
                      <td className="py-3 pr-4 text-slate-800 font-medium">
                        {inv.propertyName}
                      </td>
                      <td className="py-3 pr-4 text-right text-slate-600">
                        {formatCurrency(inv.amount)}
                      </td>
                      <td className="py-3 text-right font-semibold text-emerald-600">
                        {formatCurrency(inv.amount * 1.02)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {/* Activity Log */}
        <Card className="border border-slate-200 shadow-sm bg-white">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle
              className="text-lg text-slate-900"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Activity Log
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 max-h-60 overflow-y-auto">
            {log.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-4">
                No activity yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {log.map((entry, i) => {
                  const Icon = logIcons[entry.type];
                  return (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <Icon
                        size={15}
                        className={`${logColors[entry.type]} mt-0.5 shrink-0`}
                      />
                      <span className={`${logColors[entry.type]} flex-1`}>
                        {entry.message}
                      </span>
                      <span className="text-slate-400 text-xs shrink-0 font-mono">
                        {entry.timestamp}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Learning Center */}
        <div>
          <div className="mb-6">
            <p className="text-amber-600 text-xs tracking-widest uppercase font-semibold mb-1">
              LEARNING CENTER
            </p>
            <h2
              className="text-2xl font-bold text-slate-900"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Investing Concepts
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {tips.map((tip) => {
              const Icon = tip.icon;
              return (
                <Card
                  key={tip.title}
                  className="border border-slate-200 shadow-sm bg-white"
                >
                  <CardContent className="pt-5">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center mb-3">
                      <Icon size={20} className="text-amber-600" />
                    </div>
                    <h3
                      className="font-semibold text-slate-900 text-sm mb-2"
                      style={{
                        fontFamily: "'Playfair Display', Georgia, serif",
                      }}
                    >
                      {tip.title}
                    </h3>
                    <p className="text-slate-600 text-xs leading-relaxed">
                      {tip.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <Card className="border-0 bg-[hsl(222,47%,11%)] text-white shadow-lg">
          <CardContent className="py-10 text-center">
            <CheckCircle size={36} className="text-amber-400 mx-auto mb-4" />
            <h2
              className="text-2xl font-bold mb-3"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Ready for Real Investing?
            </h2>
            <p className="text-slate-300 text-sm mb-6 max-w-md mx-auto">
              You've explored the demo environment. Take what you've learned and
              start building a real portfolio with Alliance Trust Realty.
            </p>
            <Button
              className="bg-amber-500 hover:bg-amber-600 text-white"
              asChild
            >
              <Link href="/atr/invest">
                Start Real Investing
                <ArrowRight size={16} className="ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
