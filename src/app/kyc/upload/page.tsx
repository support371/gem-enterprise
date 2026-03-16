"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type DocumentSlot = {
  id: string;
  label: string;
  description: string;
  required: boolean;
};

const DOCUMENT_SLOTS: DocumentSlot[] = [
  {
    id: "government-id",
    label: "Government-Issued ID",
    description: "Passport, driver's license, or national ID card",
    required: true,
  },
  {
    id: "proof-of-address",
    label: "Proof of Address",
    description: "Utility bill, bank statement, or government letter (within 90 days)",
    required: true,
  },
  {
    id: "financial-statement",
    label: "Financial Statement",
    description: "Bank statement or brokerage account statement (within 6 months)",
    required: true,
  },
  {
    id: "tax-document",
    label: "Tax Document",
    description: "Most recent tax return or W-2 / 1099 form",
    required: false,
  },
  {
    id: "entity-documents",
    label: "Entity Documents",
    description: "Articles of incorporation, trust deed, or operating agreement",
    required: false,
  },
];

type FileEntry = {
  file: File;
  name: string;
  size: string;
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function UploadArea({
  slot,
  file,
  onFile,
}: {
  slot: DocumentSlot;
  file: FileEntry | null;
  onFile: (slotId: string, file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragging(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) onFile(slot.id, dropped);
    },
    [slot.id, onFile]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    onFile(slot.id, selected);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-foreground">{slot.label}</span>
        {slot.required && (
          <span className="text-xs text-[hsl(var(--electric-cyan))] font-mono">Required</span>
        )}
      </div>
      <p className="text-xs text-muted-foreground">{slot.description}</p>

      {file ? (
        <div className="flex items-center gap-3 rounded-lg border border-[hsl(var(--electric-cyan)/0.4)] bg-[hsl(var(--electric-cyan)/0.05)] px-4 py-3">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5 text-[hsl(var(--electric-cyan))] shrink-0" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">{file.size}</p>
          </div>
          <button
            type="button"
            onClick={() => onFile(slot.id, null)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Remove file"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`cursor-pointer rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors ${
            dragging
              ? "border-[hsl(var(--electric-cyan))] bg-[hsl(var(--electric-cyan)/0.08)]"
              : "border-[hsl(var(--border))] hover:border-[hsl(var(--electric-cyan)/0.5)] hover:bg-[hsl(var(--electric-cyan)/0.03)]"
          }`}
          aria-label={`Upload ${slot.label}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8 mx-auto mb-2 text-muted-foreground" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          <p className="text-sm text-muted-foreground mb-1">
            Drag & Drop or <span className="text-[hsl(var(--electric-cyan))]">click to upload</span>
          </p>
          <p className="text-xs text-muted-foreground/70">Accepted: PDF, JPG, JPEG, PNG</p>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="sr-only"
            onChange={handleChange}
            tabIndex={-1}
          />
        </div>
      )}
    </div>
  );
}

export default function KYCUploadPage() {
  const router = useRouter();
  const [files, setFiles] = useState<Record<string, FileEntry | null>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback((slotId: string, file: File | null) => {
    setFiles((prev) => ({
      ...prev,
      [slotId]: file
        ? { file, name: file.name, size: formatBytes(file.size) }
        : null,
    }));
  }, []);

  const requiredIds = DOCUMENT_SLOTS.filter((s) => s.required).map((s) => s.id);
  const allRequiredUploaded = requiredIds.every((id) => !!files[id]);

  const handleSubmit = async () => {
    if (!allRequiredUploaded) {
      setError("Please upload all required documents before submitting.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      // Stub — build FormData if/when real upload endpoint exists
      await fetch("/api/kyc/upload", { method: "POST" });
      router.push("/kyc/review");
    } catch {
      router.push("/kyc/review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/kyc/start"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
          <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
        </svg>
        Back
      </Link>

      <h1 className="text-2xl font-bold text-foreground mb-2">Upload Verification Documents</h1>
      <p className="text-muted-foreground text-sm mb-8">
        Upload the documents listed below. Required documents must be provided to complete your
        application. All files are encrypted in transit and at rest.
      </p>

      <div className="space-y-6 mb-8">
        {DOCUMENT_SLOTS.map((slot) => (
          <div key={slot.id} className="glass-panel rounded-xl p-5 border border-[hsl(var(--border))]">
            <UploadArea slot={slot} file={files[slot.id] ?? null} onFile={handleFile} />
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button
        onClick={handleSubmit}
        disabled={submitting || !allRequiredUploaded}
        className="w-full bg-[hsl(var(--electric-cyan))] text-[hsl(var(--primary-foreground))] font-semibold hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? "Submitting…" : "Submit Documents"}
      </Button>

      {/* Disclosure */}
      <div className="mt-8 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)] px-5 py-4 text-xs text-muted-foreground leading-relaxed">
        <strong className="block text-foreground mb-1 text-sm">Document Upload Disclosure</strong>
        All documents submitted are treated as confidential and used solely for identity verification
        and regulatory compliance purposes. Files are encrypted using AES-256 at rest and TLS 1.3
        in transit. GEM Enterprise retains documents for the duration required by applicable
        anti-money laundering (AML) and know-your-customer (KYC) regulations, typically 5–7 years.
        Documents will not be shared with third parties except as required by law or with your
        explicit consent.
      </div>
    </div>
  );
}
