"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  LockKeyhole,
  Power,
  PowerOff,
  RefreshCw,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type StatusResponse = {
  backend?: string;
  bucket?: {
    name: string;
    private: boolean;
  };
  settings?: {
    operationallyApproved: boolean;
    operationallyApprovedByDifferentUserRequired: boolean;
    uploadActive: boolean;
    activationSeparationSatisfied: boolean;
  };
  retention?: {
    activePolicies: number;
  };
  counts?: {
    evidenceItems: number;
    storedObjects: number;
  };
  scanner?: {
    engine: string;
    assurance: string;
    antivirusEquivalent: boolean;
    biometricAnalysis: boolean;
  };
  readyForUpload?: boolean;
  error?: string;
};

type OperationAction =
  | "approve_operations"
  | "activate_uploads"
  | "deactivate_uploads";

function tone(passed: boolean) {
  return passed
    ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
    : "border-amber-400/30 bg-amber-400/10 text-amber-200";
}

async function readBody<T>(response: Response): Promise<T> {
  return (await response.json().catch(() => ({}))) as T;
}

export default function GemVerifyEvidenceOperationsClient() {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<OperationAction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/verify/evidence/status", {
        cache: "no-store",
      });
      if (response.status === 401) {
        window.location.assign(
          "/client-login?next=%2Fapp%2Fadmin%2Fgem-verify%2Fevidence%2Fgovernance",
        );
        return;
      }
      const body = await readBody<StatusResponse>(response);
      if (!response.ok) {
        throw new Error(body.error ?? "Evidence operations status is unavailable.");
      }
      setStatus(body);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Evidence operations status is unavailable.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function runAction(action: OperationAction) {
    const messages: Record<OperationAction, string> = {
      approve_operations:
        "Record operational approval? A different authorized administrator must perform final activation.",
      activate_uploads:
        "Activate applicant evidence uploads? This succeeds only when an active retention policy exists and a different administrator recorded operational approval.",
      deactivate_uploads:
        "Deactivate applicant evidence uploads immediately? Existing evidence remains preserved and auditable.",
    };

    if (!window.confirm(messages[action])) return;

    setActing(action);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch("/api/verify/evidence/operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (response.status === 401) {
        window.location.assign(
          "/client-login?next=%2Fapp%2Fadmin%2Fgem-verify%2Fevidence%2Fgovernance",
        );
        return;
      }
      const body = await readBody<{ error?: string }>(response);
      if (!response.ok) {
        throw new Error(body.error ?? "Evidence operation was rejected.");
      }

      setNotice(
        action === "approve_operations"
          ? "Operational approval recorded. Final activation must be performed by a different authorized administrator."
          : action === "activate_uploads"
            ? "Evidence intake activated under two-person control."
            : "Evidence intake deactivated. New uploads are blocked immediately.",
      );
      await load();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Evidence operation was rejected.",
      );
    } finally {
      setActing(null);
    }
  }

  const operationallyApproved =
    status?.settings?.operationallyApproved === true;
  const uploadActive = status?.settings?.uploadActive === true;
  const activePolicies = status?.retention?.activePolicies ?? 0;
  const privateBucket = status?.bucket?.private === true;
  const readyForUpload = status?.readyForUpload === true;

  return (
    <section className="overflow-hidden rounded-2xl border border-cyan-400/20 bg-slate-950/65 shadow-2xl shadow-cyan-950/20">
      <div className="border-b border-white/10 bg-gradient-to-r from-cyan-500/10 via-blue-500/5 to-transparent p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-cyan-200">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              First-party evidence operations
            </div>
            <h2 className="mt-2 text-2xl font-black text-white">
              Intake Approval & Activation
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              GEM owns the private evidence gateway, storage controls and
              structural scanner. Intake remains fail-closed until retention is
              approved, one administrator records operational approval and a
              different administrator performs final activation.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => void load()}
            disabled={loading || acting !== null}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
            )}
            Refresh status
          </Button>
        </div>
      </div>

      <div className="space-y-6 p-6">
        {error ? (
          <div className="flex gap-3 rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-100">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        ) : null}
        {notice ? (
          <div className="flex gap-3 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm text-emerald-100">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <span>{notice}</span>
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <LockKeyhole className="h-5 w-5 text-cyan-300" aria-hidden="true" />
            <p className="mt-3 text-xs uppercase tracking-wide text-slate-500">Private bucket</p>
            <Badge className={`mt-2 ${tone(privateBucket)}`}>
              {privateBucket ? "Confirmed" : "Unavailable"}
            </Badge>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <ShieldCheck className="h-5 w-5 text-cyan-300" aria-hidden="true" />
            <p className="mt-3 text-xs uppercase tracking-wide text-slate-500">Active policies</p>
            <p className="mt-2 text-2xl font-black text-white">{activePolicies}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <UserCheck className="h-5 w-5 text-cyan-300" aria-hidden="true" />
            <p className="mt-3 text-xs uppercase tracking-wide text-slate-500">Operations approval</p>
            <Badge className={`mt-2 ${tone(operationallyApproved)}`}>
              {operationallyApproved ? "Approved" : "Pending"}
            </Badge>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <Power className="h-5 w-5 text-cyan-300" aria-hidden="true" />
            <p className="mt-3 text-xs uppercase tracking-wide text-slate-500">Upload gate</p>
            <Badge className={`mt-2 ${tone(uploadActive)}`}>
              {uploadActive ? "Active" : "Blocked"}
            </Badge>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <CheckCircle2 className="h-5 w-5 text-cyan-300" aria-hidden="true" />
            <p className="mt-3 text-xs uppercase tracking-wide text-slate-500">Overall readiness</p>
            <Badge className={`mt-2 ${tone(readyForUpload)}`}>
              {readyForUpload ? "Ready" : "Fail-closed"}
            </Badge>
          </div>
        </div>

        <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.06] p-4 text-sm leading-6 text-amber-100">
          <strong>Separation of duties:</strong> the account that records
          operational approval cannot activate uploads. A second authorized
          administrator must sign in and perform activation after an independently
          approved retention policy is active.
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            onClick={() => void runAction("approve_operations")}
            disabled={
              loading ||
              acting !== null ||
              operationallyApproved ||
              uploadActive
            }
          >
            {acting === "approve_operations" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <UserCheck className="mr-2 h-4 w-4" aria-hidden="true" />
            )}
            Record operational approval
          </Button>
          <Button
            type="button"
            onClick={() => void runAction("activate_uploads")}
            disabled={
              loading ||
              acting !== null ||
              uploadActive ||
              !operationallyApproved ||
              activePolicies < 1
            }
          >
            {acting === "activate_uploads" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Power className="mr-2 h-4 w-4" aria-hidden="true" />
            )}
            Activate evidence intake
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => void runAction("deactivate_uploads")}
            disabled={loading || acting !== null || !uploadActive}
          >
            {acting === "deactivate_uploads" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <PowerOff className="mr-2 h-4 w-4" aria-hidden="true" />
            )}
            Deactivate intake
          </Button>
        </div>
      </div>
    </section>
  );
}
