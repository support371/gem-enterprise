"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  CircleUserRound,
  ClipboardList,
  Loader2,
  PackageSearch,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { IntakeKind, IntakeStatus, IntakeSubmissionRecord } from "@/lib/intake/types";
import { nextIntakeStatuses } from "@/lib/intake/workflow";

const kinds: Array<{ value: IntakeKind | "ALL"; label: string; icon: typeof Building2 }> = [
  { value: "ALL", label: "All queues", icon: ClipboardList },
  { value: "ENTERPRISE", label: "Enterprise", icon: Building2 },
  { value: "COMMUNITY", label: "Community", icon: CircleUserRound },
  { value: "PRODUCT_REQUEST", label: "Products", icon: PackageSearch },
];

function format(value: string) {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function statusClass(status: IntakeStatus) {
  if (["APPROVED", "CONVERTED"].includes(status)) {
    return "border-emerald-500/25 bg-emerald-500/15 text-emerald-300";
  }
  if (["DECLINED", "CLOSED"].includes(status)) {
    return "border-slate-500/25 bg-slate-500/15 text-slate-300";
  }
  if (status === "NEEDS_INFORMATION") {
    return "border-amber-500/25 bg-amber-500/15 text-amber-300";
  }
  if (status === "QUALIFIED") {
    return "border-cyan-500/25 bg-cyan-500/15 text-cyan-300";
  }
  return "border-violet-500/25 bg-violet-500/15 text-violet-300";
}

export default function AdminIntakePage() {
  const [kind, setKind] = useState<IntakeKind | "ALL">("ALL");
  const [submissions, setSubmissions] = useState<IntakeSubmissionRecord[]>([]);
  const [selected, setSelected] = useState<IntakeSubmissionRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextStatus, setNextStatus] = useState<IntakeStatus | "">("");
  const [reason, setReason] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = kind === "ALL" ? "" : `?kind=${encodeURIComponent(kind)}`;
      const response = await fetch(`/api/admin/intake${query}`, { cache: "no-store" });
      const result = (await response.json()) as {
        submissions?: IntakeSubmissionRecord[];
        error?: string;
      };
      if (!response.ok) throw new Error(result.error || "Unable to load the intake queue");
      setSubmissions(result.submissions ?? []);
      setSelected((current) => {
        if (!current) return result.submissions?.[0] ?? null;
        return (
          result.submissions?.find((item) => item.id === current.id) ??
          result.submissions?.[0] ??
          null
        );
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load the intake queue");
    } finally {
      setLoading(false);
    }
  }, [kind]);

  useEffect(() => {
    void load();
  }, [load]);

  const summary = useMemo(
    () => ({
      total: submissions.length,
      received: submissions.filter((item) => item.status === "RECEIVED").length,
      review: submissions.filter((item) =>
        ["TRIAGE", "NEEDS_INFORMATION", "QUALIFIED"].includes(item.status),
      ).length,
      completed: submissions.filter((item) =>
        ["APPROVED", "DECLINED", "CONVERTED", "CLOSED"].includes(item.status),
      ).length,
    }),
    [submissions],
  );

  async function updateStatus() {
    if (!selected || !nextStatus || reason.trim().length < 10) return;
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/intake/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus, reason }),
      });
      const result = (await response.json()) as {
        submission?: IntakeSubmissionRecord;
        error?: string;
      };
      if (!response.ok) throw new Error(result.error || "Unable to update the submission");
      setNextStatus("");
      setReason("");
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to update the submission");
    } finally {
      setSaving(false);
    }
  }

  const cards = [
    { label: "Loaded", value: summary.total, icon: ClipboardList },
    { label: "Received", value: summary.received, icon: AlertCircle },
    { label: "In review", value: summary.review, icon: Loader2 },
    { label: "Decision/closed", value: summary.completed, icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-xs font-mono uppercase tracking-wider text-cyan-300">
            <ClipboardList className="h-3.5 w-3.5" /> Intake governance
          </div>
          <h1 className="text-2xl font-bold text-white">Qualification Queues</h1>
          <p className="mt-1 max-w-3xl text-sm text-slate-400">
            Review enterprise applications, Community applications, and product requests in
            separate queues. Every status decision requires a reason and produces an immutable
            event.
          </p>
        </div>
        <Button onClick={() => void load()} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="glass-panel rounded-xl p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
              <Icon className="h-4 w-4 text-cyan-300" />
            </div>
            <p className="mt-4 text-3xl font-bold text-white">{loading ? "—" : value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {kinds.map(({ value, label, icon: Icon }) => (
          <Button
            key={value}
            type="button"
            variant={kind === value ? "default" : "outline"}
            onClick={() => setKind(value)}
            className="gap-2"
          >
            <Icon className="h-4 w-4" /> {label}
          </Button>
        ))}
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200"
        >
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="border-white/10 bg-card">
          <CardHeader>
            <CardTitle className="text-white">Queue</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-12 text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading submissions…
              </div>
            ) : submissions.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-sm text-slate-500">
                No submissions in this queue.
              </div>
            ) : (
              <div className="space-y-3">
                {submissions.map((submission) => (
                  <button
                    key={submission.id}
                    type="button"
                    onClick={() => {
                      setSelected(submission);
                      setNextStatus("");
                      setReason("");
                    }}
                    className={`w-full rounded-xl border p-4 text-left transition ${
                      selected?.id === submission.id
                        ? "border-cyan-500/40 bg-cyan-500/10"
                        : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-xs text-cyan-300">{submission.publicId}</p>
                        <p className="mt-1 text-sm font-semibold text-white">{submission.subject}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {submission.name} · {submission.email}
                        </p>
                      </div>
                      <Badge className={statusClass(submission.status)}>
                        {format(submission.status)}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-card">
          <CardHeader>
            <CardTitle className="text-white">Review</CardTitle>
          </CardHeader>
          <CardContent>
            {!selected ? (
              <p className="py-12 text-center text-sm text-slate-500">Select a submission.</p>
            ) : (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{format(selected.kind)}</Badge>
                  <Badge className={statusClass(selected.status)}>{format(selected.status)}</Badge>
                  <span className="font-mono text-xs text-slate-500">{selected.publicId}</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">{selected.subject}</h2>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-300">
                    {selected.message}
                  </p>
                </div>
                <dl className="grid gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-slate-500">Applicant</dt>
                    <dd className="text-white">{selected.name}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Email</dt>
                    <dd className="break-all text-white">{selected.email}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Organization</dt>
                    <dd className="text-white">{selected.organization || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Jurisdiction</dt>
                    <dd className="text-white">{selected.jurisdiction || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Product</dt>
                    <dd className="text-white">{selected.productName || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Received</dt>
                    <dd className="text-white">{new Date(selected.createdAt).toLocaleString()}</dd>
                  </div>
                </dl>

                {nextIntakeStatuses(selected.status).length === 0 ? (
                  <p className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">
                    This record is closed. History remains immutable.
                  </p>
                ) : (
                  <div className="space-y-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-5">
                    <label className="block space-y-2 text-sm">
                      <span className="font-medium text-white">Next status</span>
                      <select
                        value={nextStatus}
                        onChange={(event) =>
                          setNextStatus(event.target.value as IntakeStatus | "")
                        }
                        className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
                      >
                        <option value="">Select a valid transition</option>
                        {nextIntakeStatuses(selected.status).map((status) => (
                          <option key={status} value={status}>
                            {format(status)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block space-y-2 text-sm">
                      <span className="font-medium text-white">Decision reason</span>
                      <textarea
                        value={reason}
                        onChange={(event) => setReason(event.target.value)}
                        minLength={10}
                        maxLength={1000}
                        rows={4}
                        className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
                      />
                    </label>
                    <Button
                      onClick={() => void updateStatus()}
                      disabled={saving || !nextStatus || reason.trim().length < 10}
                      className="w-full gap-2"
                    >
                      {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                      Record reviewed status
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
