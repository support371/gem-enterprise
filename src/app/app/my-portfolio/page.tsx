"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, Briefcase, FileText, Loader2, PieChart, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Portfolio = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  totalValue: string | null;
  currency: string;
  role: string;
  assignedAt: string;
};

function formatCurrency(value: string | null, currency: string) {
  if (!value) return "—";
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(parsed);
}

export default function MyPortfolioPage() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/portfolios")
      .then((response) => response.json())
      .then((data) => setPortfolios(Array.isArray(data.portfolios) ? data.portfolios : []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const summary = useMemo(() => {
    const totalValue = portfolios.reduce((sum, portfolio) => {
      const parsed = Number(portfolio.totalValue ?? 0);
      return sum + (Number.isFinite(parsed) ? parsed : 0);
    }, 0);

    return {
      count: portfolios.length,
      totalValue,
      categories: new Set(portfolios.map((portfolio) => portfolio.category)).size,
    };
  }, [portfolios]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-xs font-mono uppercase tracking-wider text-cyan-400">
            <Wallet className="h-3.5 w-3.5" /> Client Portfolio
          </div>
          <h1 className="text-2xl font-bold text-white">My Portfolio</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">
            View your assigned portfolio memberships and route reviews through documents, requests, and consultations.
          </p>
        </div>
        <Button asChild className="rounded-xl bg-cyan-400 text-black hover:bg-cyan-300">
          <Link href="/app/requests?type=portfolio_review">Request Review</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Assigned Portfolios", value: loading ? "—" : String(summary.count), icon: Briefcase },
          { label: "Portfolio Value", value: loading ? "—" : summary.totalValue > 0 ? `$${summary.totalValue.toLocaleString()}` : "—", icon: PieChart },
          { label: "Categories", value: loading ? "—" : String(summary.categories), icon: Wallet },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="glass-panel bento-card rounded-xl p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10">
                <Icon className="h-5 w-5 text-cyan-400" />
              </div>
              <p className="text-2xl font-bold text-white">{value}</p>
            </div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading portfolio records…
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm">Unable to load portfolio records.</p>
        </div>
      ) : portfolios.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
          <Briefcase className="mx-auto mb-4 h-10 w-10 text-slate-600" />
          <p className="text-sm font-semibold text-white">No portfolio records assigned</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            Portfolio records appear after compliance approval and entitlement assignment.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild className="rounded-xl bg-cyan-400 text-black hover:bg-cyan-300">
              <Link href="/app/requests?type=portfolio_review">Request Portfolio Review</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl border-white/10 text-slate-300 hover:bg-white/10 hover:text-white">
              <Link href="/app/compliance">Check Compliance</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {portfolios.map((portfolio) => (
            <Card key={portfolio.id} className="border-white/10 bg-card">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-white">{portfolio.name}</CardTitle>
                    <p className="mt-1 font-mono text-[11px] text-slate-600">{portfolio.id.slice(0, 12).toUpperCase()}</p>
                  </div>
                  <Badge className="border-green-500/25 bg-green-500/15 text-green-400">{portfolio.role}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm font-semibold text-cyan-400">{portfolio.category}</p>
                {portfolio.description && <p className="text-sm leading-relaxed text-slate-400">{portfolio.description}</p>}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-white/5 p-3">
                    <p className="text-xs text-slate-500">Value</p>
                    <p className="mt-1 text-sm font-semibold text-white">{formatCurrency(portfolio.totalValue, portfolio.currency)}</p>
                  </div>
                  <div className="rounded-xl bg-white/5 p-3">
                    <p className="text-xs text-slate-500">Assigned</p>
                    <p className="mt-1 text-sm font-semibold text-white">{new Date(portfolio.assignedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Button asChild variant="outline" className="border-white/10 text-slate-300 hover:bg-white/10 hover:text-white">
                    <Link href="/app/documents"><FileText className="mr-2 h-4 w-4" /> Documents</Link>
                  </Button>
                  <Button asChild variant="outline" className="border-white/10 text-slate-300 hover:bg-white/10 hover:text-white">
                    <Link href="/app/requests?type=portfolio_review">Request Review <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
