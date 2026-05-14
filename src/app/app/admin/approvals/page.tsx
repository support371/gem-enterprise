"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle, ChevronLeft, Clock, Loader2, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface KycApplication {
  id: string;
  status: string;
  createdAt: string;
  reviewNotes: string | null;
  user: {
    email: string;
    profile: { firstName: string | null; lastName: string | null } | null;
  };
}

const pendingStatuses = new Set(["in_progress", "under_review", "manual_review", "documents_uploaded"]);

function daysSince(date: string) {
  return Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
}

function clientName(app: KycApplication) {
  return [app.user.profile?.firstName, app.user.profile?.lastName].filter(Boolean).join(" ") || app.user.email;
}

export default function ApprovalsPage() {
  const [applications, setApplications] = useState<KycApplication[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/kyc");
      if (!response.ok) return;
      const data = await response.json();
      setApplications((data.applications as KycApplication[]).filter((app) => pendingStatuses.has(app.status)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const urgent = applications.filter((app) => daysSince(app.createdAt) >= 3 || app.status === "manual_review");

  const stats = [
    { label: "Total Pending", value: applications.length, color: "text-white" },
    { label: "Manual Review", value: applications.filter((app) => app.status === "manual_review").length, color: "text-red-400" },
    { label: "Under Review", value: applications.filter((app) => app.status === "under_review").length, color: "text-yellow-400" },
    { label: "In Progress", value: applications.filter((app) => app.status === "in_progress").length, color: "text-blue-400" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-start gap-3">
        <Link href="/app/admin">
          <Button variant="ghost" size="icon" className="mt-1 h-8 w-8 text-slate-400 hover:text-white">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-xs font-mono uppercase tracking-wider text-cyan-400">
            <Shield className="h-3.5 w-3.5" /> Human Review Gate
          </div>
          <h1 className="text-2xl font-bold text-white">Approvals</h1>
          <p className="mt-1 text-sm text-slate-400">Review KYC submissions requiring operational approval or escalation.</p>
        </div>
      </div>

      {!loading && urgent.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
          <div>
            <p className="text-sm font-semibold text-red-300">
              {urgent.length} application{urgent.length > 1 ? "s" : ""} require immediate review
            </p>
            <p className="mt-0.5 text-xs text-red-400">Applications pending at least 3 days or flagged for manual review.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, color }) => (
          <div key={label} className="glass-panel bento-card rounded-xl p-4 text-center">
            <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
            <p className={`mt-1 text-3xl font-bold ${color}`}>{loading ? "—" : value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
        </div>
      ) : applications.length === 0 ? (
        <div className="glass-panel rounded-xl py-16 text-center">
          <CheckCircle className="mx-auto mb-3 h-10 w-10 text-green-400" />
          <p className="font-semibold text-white">All caught up</p>
          <p className="mt-1 text-sm text-slate-400">No pending KYC approvals.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => {
            const days = daysSince(app.createdAt);
            const isUrgent = days >= 3 || app.status === "manual_review";
            return (
              <div key={app.id} className="glass-panel bento-card rounded-xl p-5 svc-cyber-card">
                <div className="flex items-start gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--svc-cyber-muted))]">
                    <Shield className="h-5 w-5 text-[hsl(var(--svc-cyber))]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-xs text-slate-500">{app.id.slice(0, 8).toUpperCase()}</p>
                        <p className="text-sm font-semibold text-white">KYC Review — {clientName(app)}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Badge className={isUrgent ? "border-red-500/25 bg-red-500/15 text-xs text-red-400" : "border-yellow-500/25 bg-yellow-500/15 text-xs text-yellow-400"}>
                          {isUrgent ? "Urgent" : "Normal"}
                        </Badge>
                        <Badge className="border-white/10 bg-white/5 text-xs text-slate-300 capitalize">{app.status.replace(/_/g, " ")}</Badge>
                      </div>
                    </div>
                    <p className="mb-3 text-xs text-slate-400">{app.reviewNotes || `Identity verification application from ${app.user.email}.`}</p>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-xs text-slate-500">
                        <Clock className="mr-1 inline h-3 w-3" />{days === 0 ? "Today" : `${days}d ago`} · {app.user.email}
                      </span>
                      <div className="flex gap-2">
                        <Button asChild size="sm" className="border-0 bg-green-500/20 text-xs text-green-400 hover:bg-green-500/30">
                          <Link href={`/app/admin/kyc?application=${app.id}`}>Open Review</Link>
                        </Button>
                        <Button asChild size="sm" variant="outline" className="border-white/10 text-xs text-slate-300 hover:bg-white/10 hover:text-white">
                          <Link href="/app/admin/kyc">KYC Queue</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
