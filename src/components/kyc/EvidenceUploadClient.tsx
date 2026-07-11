"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FileCheck2,
  Loader2,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const ACCEPTED_TYPES = "application/pdf,image/jpeg,image/png";

type ReadinessResponse = {
  ok: boolean;
  active: boolean;
  failClosed: boolean;
  state: string;
  application: {
    id: string;
    workflowState: string | null;
    acceptingEvidence: boolean;
  } | null;
  uploadPolicy?: {
    maxFileBytes: number;
    allowedMimeTypes: string[];
    documentTypes: Array<{
      value: string;
      retentionDays: number;
    }>;
  };
  error?: string;
};

type EvidenceItem = {
  id: string;
  documentType: string;
  fileName: string;
  fileSizeBytes: number;
  status: string;
  quarantineStatus: string;
  validationStatus: string;
  reviewerStatus: string;
  uploadCompletedAt: string | null;
  scanRequestedAt: string | null;
  scanCompletedAt: string | null;
  createdAt: string | null;
  validations: Array<{
    checkType: string;
    status: string;
    checkedAt: string | null;
  }>;
};

type ItemsResponse = {
  ok: boolean;
  evidenceItems: EvidenceItem[];
  error?: string;
};

type UploadIntentResponse = {
  ok?: boolean;
  evidenceId?: string;
  error?: string;
  code?: string;
  upload?: {
    method: "PUT";
    url: string;
    expiresAt: string;
    headers: Record<string, string>;
  };
};

function humanState(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function readableBytes(value: number) {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function statusTone(item: EvidenceItem) {
  if (item.status === "released" && item.quarantineStatus === "passed") {
    return "border-emerald-400/30 bg-emerald-400/10 text-emerald-100";
  }
  if (
    item.quarantineStatus === "failed" ||
    item.validationStatus === "failed" ||
    item.status === "rejected"
  ) {
    return "border-red-400/30 bg-red-400/10 text-red-100";
  }
  return "border-amber-400/30 bg-amber-400/10 text-amber-100";
}

export default function EvidenceUploadClient() {
  const [readiness, setReadiness] = useState<ReadinessResponse | null>(null);
  const [items, setItems] = useState<EvidenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [documentType, setDocumentType] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [readinessResponse, itemsResponse] = await Promise.all([
        fetch("/api/verify/evidence/readiness", { cache: "no-store" }),
        fetch("/api/verify/evidence/items", { cache: "no-store" }),
      ]);

      if (readinessResponse.status === 401 || itemsResponse.status === 401) {
        window.location.assign("/client-login?next=%2Fkyc%2Fupload");
        return;
      }

      const readinessBody = (await readinessResponse.json()) as ReadinessResponse;
      const itemsBody = (await itemsResponse.json()) as ItemsResponse;
      setReadiness(readinessBody);
      setItems(itemsBody.evidenceItems ?? []);

      const firstDocumentType = readinessBody.uploadPolicy?.documentTypes[0]?.value;
      setDocumentType((current) => current || firstDocumentType || "");

      if (!readinessResponse.ok && readinessBody.error) {
        setError(readinessBody.error);
      } else if (!itemsResponse.ok && itemsBody.error) {
        setError(itemsBody.error);
      }
    } catch {
      setError("Secure evidence status could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const policy = readiness?.uploadPolicy;
  const maxFileBytes = policy?.maxFileBytes ?? 10 * 1024 * 1024;
  const canSubmit = Boolean(
    readiness?.active &&
      readiness.application?.id &&
      documentType &&
      file &&
      !submitting,
  );

  const readinessMessage = useMemo(() => {
    switch (readiness?.state) {
      case "ready":
        return "Secure evidence intake is active for this application.";
      case "application_required":
        return "Start a verification application before submitting evidence.";
      case "application_not_accepting_evidence":
        return "This application is not currently accepting evidence.";
      case "retention_policy_unavailable":
        return "No approved retention policy currently covers evidence intake.";
      case "vault_controls_incomplete":
        return "The private storage or scanning controls are not fully activated.";
      case "readiness_unavailable":
        return "Vault readiness cannot currently be verified.";
      default:
        return "Secure evidence intake remains fail-closed.";
    }
  }, [readiness?.state]);

  function handleFileChange(nextFile: File | null) {
    setError(null);
    setNotice(null);
    if (!nextFile) {
      setFile(null);
      return;
    }
    if (!ACCEPTED_TYPES.split(",").includes(nextFile.type)) {
      setFile(null);
      setError("Only PDF, JPEG and PNG evidence files are accepted.");
      return;
    }
    if (nextFile.size <= 0 || nextFile.size > maxFileBytes) {
      setFile(null);
      setError(`Evidence files must be no larger than ${readableBytes(maxFileBytes)}.`);
      return;
    }
    setFile(nextFile);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit || !file || !readiness?.application) return;

    setSubmitting(true);
    setError(null);
    setNotice(null);

    try {
      const intentResponse = await fetch("/api/verify/evidence/upload-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: readiness.application.id,
          documentType,
          fileName: file.name,
          mimeType: file.type,
          fileSizeBytes: file.size,
        }),
      });
      const intent = (await intentResponse.json()) as UploadIntentResponse;
      if (!intentResponse.ok || !intent.evidenceId || !intent.upload) {
        throw new Error(intent.error ?? "Upload authorization was not issued.");
      }

      const uploadResponse = await fetch(intent.upload.url, {
        method: intent.upload.method,
        headers: intent.upload.headers,
        body: file,
      });
      if (!uploadResponse.ok) {
        throw new Error("The private storage service did not accept the file.");
      }

      const completionResponse = await fetch("/api/verify/evidence/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ evidenceId: intent.evidenceId }),
      });
      const completion = (await completionResponse.json()) as {
        error?: string;
        status?: string;
        quarantineStatus?: string;
      };
      if (!completionResponse.ok) {
        throw new Error(
          completion.error ?? "The uploaded evidence could not be verified.",
        );
      }

      setFile(null);
      const input = document.getElementById("evidence-file") as HTMLInputElement | null;
      if (input) input.value = "";
      setNotice(
        completion.quarantineStatus === "scanning"
          ? "Upload completed. The file is quarantined while security scanning runs."
          : "Upload completed and evidence status was updated.",
      );
      await load();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "The evidence upload could not be completed.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-56 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
        <Loader2 className="h-7 w-7 animate-spin text-cyan-300" aria-hidden="true" />
        <span className="ml-3 text-sm text-white/70">Checking secure vault readiness…</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section
        className={`rounded-2xl border p-6 ${
          readiness?.active
            ? "border-emerald-400/30 bg-emerald-400/10"
            : "border-amber-400/30 bg-amber-400/10"
        }`}
      >
        <div className="flex items-start gap-4">
          <div className="rounded-xl border border-white/10 bg-black/15 p-3">
            {readiness?.active ? (
              <ShieldCheck className="h-6 w-6 text-emerald-200" aria-hidden="true" />
            ) : (
              <LockKeyhole className="h-6 w-6 text-amber-200" aria-hidden="true" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
              Secure Evidence Vault
            </p>
            <h2 className="mt-2 text-xl font-bold text-white">{readinessMessage}</h2>
            <p className="mt-2 text-sm leading-6 text-white/70">
              Files stay private, enter quarantine first and cannot be viewed by a reviewer until integrity validation and malware scanning pass.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void load()}
            className="border-white/15 text-white hover:bg-white/10"
          >
            <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
            Refresh
          </Button>
        </div>
      </section>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-100">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <p>{error}</p>
        </div>
      )}

      {notice && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm text-emerald-100">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <p>{notice}</p>
        </div>
      )}

      <form
        onSubmit={submit}
        className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
      >
        <div className="flex items-center gap-3">
          <UploadCloud className="h-6 w-6 text-cyan-300" aria-hidden="true" />
          <div>
            <h2 className="text-lg font-semibold text-white">Submit evidence</h2>
            <p className="text-sm text-white/55">
              PDF, JPEG or PNG · maximum {readableBytes(maxFileBytes)}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-5">
          <label className="grid gap-2 text-sm font-medium text-white/80">
            Evidence type
            <select
              value={documentType}
              onChange={(event) => setDocumentType(event.target.value)}
              disabled={!readiness?.active || submitting}
              className="h-11 rounded-lg border border-white/10 bg-[#111925] px-3 text-white outline-none focus:border-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {!policy?.documentTypes.length && (
                <option value="">No approved evidence types available</option>
              )}
              {policy?.documentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {humanState(type.value)}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-medium text-white/80">
            File
            <input
              id="evidence-file"
              type="file"
              accept={ACCEPTED_TYPES}
              disabled={!readiness?.active || submitting}
              onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
              className="rounded-lg border border-dashed border-white/15 bg-black/10 p-4 text-sm text-white/70 file:mr-4 file:rounded-md file:border-0 file:bg-cyan-300 file:px-3 file:py-2 file:font-semibold file:text-black disabled:cursor-not-allowed disabled:opacity-50"
            />
          </label>

          {file && (
            <div className="flex items-center gap-3 rounded-xl border border-cyan-300/20 bg-cyan-300/5 p-4 text-sm text-cyan-50">
              <FileCheck2 className="h-5 w-5 shrink-0 text-cyan-300" aria-hidden="true" />
              <div className="min-w-0">
                <p className="truncate font-medium">{file.name}</p>
                <p className="text-cyan-100/60">{readableBytes(file.size)} · {file.type}</p>
              </div>
            </div>
          )}
        </div>

        <Button
          type="submit"
          disabled={!canSubmit}
          className="mt-6 w-full bg-cyan-300 font-semibold text-black hover:bg-cyan-200"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              Uploading and validating…
            </>
          ) : (
            <>
              <UploadCloud className="mr-2 h-4 w-4" aria-hidden="true" />
              Upload to secure quarantine
            </>
          )}
        </Button>
      </form>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Evidence status</h2>
            <p className="mt-1 text-sm text-white/55">
              Object locations and temporary access links are never displayed here.
            </p>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
            {items.length} item{items.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="mt-5 grid gap-3">
          {!items.length && (
            <p className="rounded-xl border border-white/10 bg-black/10 p-4 text-sm text-white/55">
              No evidence has been submitted for this application.
            </p>
          )}
          {items.map((item) => (
            <article key={item.id} className={`rounded-xl border p-4 ${statusTone(item)}`}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{item.fileName}</p>
                  <p className="mt-1 text-xs opacity-70">
                    {humanState(item.documentType)} · {readableBytes(item.fileSizeBytes)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-wide">
                  <span className="rounded-full border border-current/20 px-2.5 py-1">
                    {humanState(item.status)}
                  </span>
                  <span className="rounded-full border border-current/20 px-2.5 py-1">
                    Scan: {humanState(item.quarantineStatus)}
                  </span>
                  <span className="rounded-full border border-current/20 px-2.5 py-1">
                    Validation: {humanState(item.validationStatus)}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
