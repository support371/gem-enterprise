"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Copy, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { IntakeSubmissionRecord } from "@/lib/intake/types";
import { foundingBusinessReviewOffer, marketLabelForStatus } from "@/lib/market/launchOffer";

type IntakeDetail = { submission?: IntakeSubmissionRecord; error?: string };
type ProposalResponse = {
  proposalUrl?: string;
  error?: string;
  paymentReady?: boolean;
  paymentBlockers?: string[];
};

export function ProposalWorkbench({ intakeId }: { intakeId: string }) {
  const [submission, setSubmission] = useState<IntakeSubmissionRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proposalUrl, setProposalUrl] = useState<string | null>(null);
  const [paymentReady, setPaymentReady] = useState<boolean | null>(null);
  const [paymentBlockers, setPaymentBlockers] = useState<string[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/intake/${encodeURIComponent(intakeId)}`, { cache: "no-store" });
      const result = (await response.json()) as IntakeDetail;
      if (!response.ok || !result.submission) throw new Error(result.error || "Opportunity could not be loaded.");
      setSubmission(result.submission);
    } catch (caught) {
      setSubmission(null);
      setError(caught instanceof Error ? caught.message : "Opportunity could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [intakeId]);

  useEffect(() => { void load(); }, [load]);

  async function createLink() {
    setCreating(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/market/proposal-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intakeId }),
      });
      const result = (await response.json()) as ProposalResponse;
      setPaymentReady(result.paymentReady ?? false);
      setPaymentBlockers(result.paymentBlockers ?? []);
      if (!response.ok || !result.proposalUrl) throw new Error(result.error || "Secure proposal link could not be created.");
      setProposalUrl(result.proposalUrl);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Secure proposal link could not be created.");
    } finally {
      setCreating(false);
    }
  }

  async function copyLink() {
    if (proposalUrl) await navigator.clipboard.writeText(proposalUrl);
  }

  if (loading) return <div className="flex items-center gap-2 py-16 text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading opportunity…</div>;
  if (!submission) return <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-red-200">{error || "Opportunity unavailable."}</div>;

  const qualified = ["QUALIFIED", "APPROVED"].includes(submission.status);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs text-cyan-300">{submission.publicId}</p>
            <h2 className="mt-2 text-2xl font-bold text-white">{submission.organization || submission.name}</h2>
            <p className="mt-2 text-sm text-slate-400">{submission.subject}</p>
          </div>
          <span className="rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
            {marketLabelForStatus(submission.status)}
          </span>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-black/15 p-4"><p className="text-xs text-slate-500">Offer</p><p className="mt-1 text-sm font-semibold text-white">{foundingBusinessReviewOffer.shortName}</p></div>
          <div className="rounded-xl border border-white/10 bg-black/15 p-4"><p className="text-xs text-slate-500">Price</p><p className="mt-1 text-sm font-semibold text-white">${foundingBusinessReviewOffer.priceUsd}</p></div>
          <div className="rounded-xl border border-white/10 bg-black/15 p-4"><p className="text-xs text-slate-500">Checkout gate</p><p className="mt-1 text-sm font-semibold text-white">{submission.status === "APPROVED" ? "Eligible when merchant is ready" : "Requires APPROVED status"}</p></div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h3 className="font-semibold text-white">Secure customer proposal</h3>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
          Generate a seven-day signed link. The customer can review the bounded scope. Checkout remains locked until human approval and verified GEM payment configuration are both present.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button onClick={() => void createLink()} disabled={!qualified || creating} className="gap-2">
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            {creating ? "Preparing…" : "Generate proposal link"}
          </Button>
          <Button onClick={() => void load()} variant="outline" className="gap-2"><RefreshCw className="h-4 w-4" /> Refresh</Button>
        </div>
        {!qualified && <p className="mt-3 text-sm text-amber-300">Move this opportunity to QUALIFIED in Intake Governance before issuing a proposal.</p>}

        {proposalUrl && (
          <div className="mt-5 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4">
            <p className="text-sm font-semibold text-emerald-200">Proposal link ready</p>
            <p className="mt-2 break-all font-mono text-xs text-emerald-100/80">{proposalUrl}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button onClick={() => void copyLink()} variant="outline" size="sm" className="gap-2"><Copy className="h-4 w-4" /> Copy</Button>
              <Button asChild variant="outline" size="sm" className="gap-2"><a href={proposalUrl} target="_blank" rel="noreferrer">Open <ExternalLink className="h-4 w-4" /></a></Button>
            </div>
          </div>
        )}

        {paymentReady === false && paymentBlockers.length > 0 && (
          <div className="mt-5 rounded-xl border border-amber-500/25 bg-amber-500/10 p-4">
            <p className="text-sm font-semibold text-amber-200">Payment activation remains fail-closed</p>
            <ul className="mt-2 space-y-1 text-xs leading-5 text-amber-100/80">
              {paymentBlockers.map((blocker) => <li key={blocker}>• {blocker}</li>)}
            </ul>
          </div>
        )}
        {error && <p className="mt-4 text-sm text-red-300" role="alert">{error}</p>}
      </section>
    </div>
  );
}
