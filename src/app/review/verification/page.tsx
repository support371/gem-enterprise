"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle, Clock, Loader2, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type ReviewAction = "assign" | "start_review" | "request_information" | "approve" | "reject" | "close";
type WorkflowState = "draft" | "consented" | "submitted" | "under_review" | "needs_information" | "approved" | "rejected" | "closed";

type Application = {
  id: string;
  reference: string;
  workflowState: WorkflowState;
  entityType: string;
  submittedAt: string | null;
  reviewerId?: string | null;
  reviewNotes: string | null;
  rejectionReason: string | null;
  applicantData: {
    legalName: string;
    country: string;
    phone: string | null;
    organizationName: string | null;
    serviceInterest: string;
  };
  user?: { id: string; email: string };
  decision: { outcome: string; decidedAt: string | null; reason: string | null } | null;
  history: Array<{ id: string; action: string; createdAt: string | null; notes?: string | null }>;
};

const stateLabel: Record<WorkflowState, string> = {
  draft: "Draft",
  consented: "Consented",
  submitted: "Submitted",
  under_review: "Under review",
  needs_information: "Needs information",
  approved: "Approved",
  rejected: "Rejected",
  closed: "Closed",
};

export default function VerificationReviewPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [permissions, setPermissions] = useState<ReviewAction[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selected = useMemo(
    () => applications.find((application) => application.id === selectedId) ?? null,
    [applications, selectedId],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/verify/review", { cache: "no-store" });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error ?? "Review queue could not be loaded.");
      setApplications(body.applications ?? []);
      setPermissions(body.permissions ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Review queue could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function act(action: ReviewAction) {
    if (!selected) return;
    setActing(true);
    setError(null);
    try {
      const response = await fetch("/api/verify/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: selected.id,
          action,
          notes: notes.trim() || undefined,
        }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error ?? "Review action failed.");
      setNotes("");
      await load();
      setSelectedId(selected.id);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Review action failed.");
    } finally {
      setActing(false);
    }
  }

  function can(action: ReviewAction) {
    return permissions.includes(action);
  }

  const active = applications.filter((application) => !["approved", "rejected", "closed"].includes(application.workflowState));
  const completed = applications.filter((application) => ["approved", "rejected", "closed"].includes(application.workflowState));

  return (
    <div className="space-y-8 p-4 sm:p-0">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-xs uppercase tracking-wider text-cyan-400">
          <UserCheck className="h-3.5 w-3.5" /> Manual review queue
        </div>
        <h1 className="mt-3 text-2xl font-bold text-white">GEM Verify cases</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-400">
          Review limited application data only. Document upload, biometric checks, automatic decisions, and automatic service activation remain disabled.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 py-16 text-slate-400"><Loader2 className="h-5 w-5 animate-spin" /> Loading queue</div>
      ) : (
        <div className={`grid gap-6 ${selected ? "xl:grid-cols-[1.05fr_0.95fr]" : ""}`}>
          <div className="space-y-6">
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">Active cases ({active.length})</h2>
                <Button variant="ghost" size="sm" onClick={() => void load()}>Refresh</Button>
              </div>
              <div className="space-y-3">
                {active.length === 0 && <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-sm text-slate-500">No active applications are assigned or available.</div>}
                {active.map((application) => (
                  <button
                    type="button"
                    key={application.id}
                    onClick={() => { setSelectedId(application.id); setNotes(""); }}
                    className={`w-full rounded-xl border p-4 text-left transition ${selectedId === application.id ? "border-cyan-400/40 bg-cyan-500/5" : "border-white/10 bg-white/[0.02] hover:border-white/20"}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-xs text-cyan-400">{application.reference}</p>
                        <p className="mt-1 font-semibold text-white">{application.applicantData.legalName || application.user?.email}</p>
                        <p className="mt-1 text-xs text-slate-400">{application.applicantData.country} · {application.entityType.replace(/_/g, " ")}</p>
                      </div>
                      <Badge className="border-white/10 bg-white/5 text-slate-300">{stateLabel[application.workflowState]}</Badge>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">Completed ({completed.length})</h2>
              <div className="space-y-2">
                {completed.map((application) => (
                  <button type="button" key={application.id} onClick={() => setSelectedId(application.id)} className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-4 text-left opacity-80">
                    <div><p className="text-sm font-medium text-white">{application.applicantData.legalName}</p><p className="text-xs text-slate-500">{application.reference}</p></div>
                    <Badge className={application.workflowState === "approved" ? "bg-green-500/15 text-green-400" : "bg-slate-500/15 text-slate-300"}>{stateLabel[application.workflowState]}</Badge>
                  </button>
                ))}
              </div>
            </section>
          </div>

          {selected && (
            <aside className="h-fit rounded-xl border border-white/10 bg-white/[0.03] p-5 xl:sticky xl:top-20">
              <div className="flex items-start justify-between gap-3">
                <div><p className="font-mono text-xs text-cyan-400">{selected.reference}</p><h2 className="mt-1 text-xl font-bold text-white">{selected.applicantData.legalName}</h2></div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedId(null)}>Close</Button>
              </div>

              <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                <div><dt className="text-xs text-slate-500">Country</dt><dd className="text-white">{selected.applicantData.country}</dd></div>
                <div><dt className="text-xs text-slate-500">Applicant type</dt><dd className="capitalize text-white">{selected.entityType.replace(/_/g, " ")}</dd></div>
                <div><dt className="text-xs text-slate-500">Email</dt><dd className="break-all text-white">{selected.user?.email}</dd></div>
                <div><dt className="text-xs text-slate-500">Reviewer</dt><dd className="text-white">{selected.reviewerId ? "Assigned" : "Unassigned"}</dd></div>
              </dl>

              <div className="mt-5 rounded-lg border border-white/10 bg-black/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Service requested</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-300">{selected.applicantData.serviceInterest}</p>
              </div>

              {(selected.reviewNotes || selected.rejectionReason) && (
                <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-200">
                  {selected.rejectionReason || selected.reviewNotes}
                </div>
              )}

              <div className="mt-5 space-y-2">
                <label htmlFor="reviewNotes" className="text-xs font-medium text-slate-400">Review notes</label>
                <textarea id="reviewNotes" value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} maxLength={2000} className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white" placeholder="Required for information requests, rejection, and closure." />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2">
                {selected.workflowState === "submitted" && can("assign") && <Button disabled={acting} variant="outline" onClick={() => void act("assign")}>Assign to me</Button>}
                {selected.workflowState === "submitted" && can("start_review") && <Button disabled={acting} onClick={() => void act("start_review")} className="bg-cyan-400 text-black hover:bg-cyan-300">Start review</Button>}
                {selected.workflowState === "under_review" && can("request_information") && <Button disabled={acting} variant="outline" onClick={() => void act("request_information")}><AlertCircle className="mr-2 h-4 w-4" />Request info</Button>}
                {selected.workflowState === "under_review" && can("approve") && <Button disabled={acting} onClick={() => void act("approve")} className="bg-green-500/20 text-green-400 hover:bg-green-500/30"><CheckCircle className="mr-2 h-4 w-4" />Approve</Button>}
                {selected.workflowState === "under_review" && can("reject") && <Button disabled={acting} onClick={() => void act("reject")} className="bg-red-500/20 text-red-400 hover:bg-red-500/30">Reject</Button>}
                {["needs_information", "approved", "rejected"].includes(selected.workflowState) && can("close") && <Button disabled={acting} onClick={() => void act("close")} className="col-span-2"><Clock className="mr-2 h-4 w-4" />Close case</Button>}
              </div>
            </aside>
          )}
        </div>
      )}
    </div>
  );
}
