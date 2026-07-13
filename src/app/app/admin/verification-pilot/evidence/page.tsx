"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type UserRecord = {
  id: string;
  email: string;
  role: string;
  status: string;
  isActive: boolean;
  isEmailVerified: boolean;
};

type EvidenceReport = {
  completed: boolean;
  evaluatedAt: string;
  mutatesProductionData: false;
  applicationId: string;
  analystId: string;
  outcome: string | null;
  checks: Array<{
    id: string;
    label: string;
    passed: boolean;
    detail: string;
  }>;
  counts: {
    reviewEvents: number;
    auditEvents: number;
    documents: number;
  };
};

export default function VerificationPilotEvidencePage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [applicationId, setApplicationId] = useState("");
  const [analystId, setAnalystId] = useState("");
  const [report, setReport] = useState<EvidenceReport | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analysts = useMemo(
    () =>
      users.filter(
        (user) =>
          user.role === "analyst" &&
          user.status === "active" &&
          user.isActive &&
          user.isEmailVerified,
      ),
    [users],
  );

  useEffect(() => {
    async function loadUsers() {
      try {
        const response = await fetch("/api/admin/users", { cache: "no-store" });
        const body = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(body.error ?? "Analyst accounts could not be loaded.");
        }
        setUsers(body.users ?? []);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Analyst accounts could not be loaded.",
        );
      } finally {
        setLoadingUsers(false);
      }
    }

    void loadUsers();
  }, []);

  async function evaluate() {
    setEvaluating(true);
    setError(null);
    setReport(null);
    try {
      const query = new URLSearchParams({ applicationId, analystId });
      const response = await fetch(`/api/verify/pilot-evidence?${query.toString()}`, {
        cache: "no-store",
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(body.error ?? "Pilot evidence could not be evaluated.");
      }
      setReport(body as EvidenceReport);
    } catch (evaluationError) {
      setError(
        evaluationError instanceof Error
          ? evaluationError.message
          : "Pilot evidence could not be evaluated.",
      );
    } finally {
      setEvaluating(false);
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-start gap-3">
        <Button asChild variant="ghost" size="icon" className="mt-1 text-slate-400">
          <Link href="/app/admin/verification-pilot">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-xs uppercase tracking-wider text-cyan-400">
            <ClipboardCheck className="h-3.5 w-3.5" /> Read-only acceptance evidence
          </div>
          <h1 className="text-2xl font-bold text-white">GEM Verify pilot evidence report</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            Evaluate one explicitly marked synthetic application and its selected analyst. This report never creates users, applications, reviews, decisions, documents, or audit events.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="applicationId">Synthetic application ID</Label>
            <Input
              id="applicationId"
              value={applicationId}
              onChange={(event) => setApplicationId(event.target.value.trim())}
              placeholder="Enter the exact verification application ID"
              className="border-white/10 bg-black/20 text-white"
            />
            <p className="text-xs leading-5 text-slate-500">
              Only applications created with the explicit Phase 1B synthetic marker can pass.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="analystId">Assigned analyst</Label>
            <select
              id="analystId"
              value={analystId}
              onChange={(event) => setAnalystId(event.target.value)}
              disabled={loadingUsers}
              className="w-full rounded-md border border-white/10 bg-[#111827] px-3 py-2 text-sm text-white"
            >
              <option value="">Select the exact active verified analyst</option>
              {analysts.map((analyst) => (
                <option key={analyst.id} value={analyst.id}>
                  {analyst.email}
                </option>
              ))}
            </select>
            <p className="text-xs leading-5 text-slate-500">
              The report checks assignment, role-change audit evidence, and decision-role separation.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button
            onClick={() => void evaluate()}
            disabled={evaluating || loadingUsers || !applicationId || !analystId}
            className="bg-cyan-400 text-black hover:bg-cyan-300"
          >
            {evaluating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Evaluating
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" /> Evaluate evidence
              </>
            )}
          </Button>
          <Badge className="bg-white/5 text-slate-300">Read-only</Badge>
          <Badge className="bg-white/5 text-slate-300">No document contents returned</Badge>
        </div>
      </section>

      {report && (
        <section
          className={`rounded-2xl border p-6 ${
            report.completed
              ? "border-green-500/25 bg-green-500/5"
              : "border-amber-500/25 bg-amber-500/5"
          }`}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-3">
              {report.completed ? (
                <CheckCircle2 className="mt-0.5 h-6 w-6 text-green-400" />
              ) : (
                <XCircle className="mt-0.5 h-6 w-6 text-amber-400" />
              )}
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {report.completed
                    ? "Synthetic pilot evidence complete"
                    : "Synthetic pilot evidence incomplete"}
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Evaluated {new Date(report.evaluatedAt).toLocaleString()} · Outcome: {report.outcome ?? "none"}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-white/5 text-slate-300">
                {report.counts.reviewEvents} review events
              </Badge>
              <Badge className="bg-white/5 text-slate-300">
                {report.counts.auditEvents} audit events
              </Badge>
              <Badge className="bg-white/5 text-slate-300">
                {report.counts.documents} documents
              </Badge>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {report.checks.map((check) => (
              <div key={check.id} className="rounded-xl border border-white/10 bg-black/10 p-4">
                <div className="flex items-start gap-3">
                  {check.passed ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-400" />
                  ) : (
                    <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                  )}
                  <div>
                    <h3 className="text-sm font-semibold text-white">{check.label}</h3>
                    <p className="mt-1 text-xs leading-5 text-slate-400">{check.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
