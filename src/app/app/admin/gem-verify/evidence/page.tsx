"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  FileLock2,
  Loader2,
  LockKeyhole,
  RefreshCw,
  ScanSearch,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Control = {
  id: string;
  passed: boolean;
  detail: string;
};

type VaultStatus = {
  ok: boolean;
  evaluatedAt?: string;
  error?: string;
  diagnostic?: string;
  vault: {
    name: string;
    bucket: string;
    private: boolean;
    maxFileBytes: number;
    allowedMimeTypes: readonly string[];
    failClosed: boolean;
    readyForUpload: boolean;
  };
  foundation?: {
    schemaReady: boolean;
    rlsReady: boolean;
    bucketReady: boolean;
    appendOnlyAccessHistory: boolean;
    publicStoragePoliciesCreated: boolean;
  };
  runtime?: {
    supabaseUrlConfigured: boolean;
    serviceRoleConfigured: boolean;
    scannerConfigured: boolean;
    retentionApproved: boolean;
    operationallyApproved: boolean;
    uploadActivationRequested: boolean;
  };
  counts?: {
    evidenceItems: number;
    accessEvents: number;
    validations: number;
    retentionPolicies: number;
    activeRetentionPolicies: number;
    storedObjects: number;
  };
  controls?: Control[];
};

function formatBytes(bytes: number) {
  return `${Math.round(bytes / 1024 / 1024)} MB`;
}

export default function EvidenceVaultPage() {
  const [data, setData] = useState<VaultStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/verify/evidence/status", {
        cache: "no-store",
      });
      const body = (await response.json().catch(() => ({}))) as VaultStatus;
      setData(body);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const metricCards = [
    {
      label: "Evidence records",
      value: data?.counts?.evidenceItems ?? 0,
      icon: FileLock2,
    },
    {
      label: "Access events",
      value: data?.counts?.accessEvents ?? 0,
      icon: LockKeyhole,
    },
    {
      label: "Validation records",
      value: data?.counts?.validations ?? 0,
      icon: ScanSearch,
    },
    {
      label: "Stored objects",
      value: data?.counts?.storedObjects ?? 0,
      icon: Database,
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-300">
            <ShieldCheck className="h-3.5 w-3.5" /> GEM-owned evidence control plane
          </div>
          <h1 className="mt-3 text-3xl font-black text-white">
            Secure Evidence Vault
          </h1>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">
            Operate the private identity-evidence storage foundation, quarantine
            controls, validation records, access history, and retention readiness.
            Applicant uploads remain disabled until every required safeguard passes.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => void load()} disabled={loading}>
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button asChild variant="outline">
            <Link href="/app/admin/gem-verify">Back to GEM Verify</Link>
          </Button>
        </div>
      </header>

      <section
        className={`rounded-2xl border p-6 ${
          data?.vault?.readyForUpload
            ? "border-green-500/25 bg-green-500/5"
            : "border-amber-500/25 bg-amber-500/5"
        }`}
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-3">
            {data?.vault?.readyForUpload ? (
              <CheckCircle2 className="mt-0.5 h-6 w-6 text-green-400" />
            ) : (
              <AlertTriangle className="mt-0.5 h-6 w-6 text-amber-300" />
            )}
            <div>
              <h2 className="text-lg font-bold text-white">
                {data?.vault?.readyForUpload
                  ? "Evidence intake ready"
                  : "Evidence intake remains fail closed"}
              </h2>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-400">
                The database and private bucket foundation can exist safely while
                uploads remain blocked. Enabling intake requires server-only storage
                credentials, malware scanning, an approved retention policy, and
                explicit operational approval.
              </p>
            </div>
          </div>
          <Badge
            className={
              data?.vault?.readyForUpload
                ? "border-green-500/25 bg-green-500/10 text-green-300"
                : "border-amber-500/25 bg-amber-500/10 text-amber-300"
            }
          >
            {data?.vault?.readyForUpload ? "Ready" : "Uploads disabled"}
          </Badge>
        </div>
      </section>

      {data?.error && (
        <div className="rounded-xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-200">
          <p className="font-semibold">Vault status could not be fully evaluated</p>
          <p className="mt-1 text-red-100/70">{data.error}</p>
          {data.diagnostic && (
            <p className="mt-1 font-mono text-xs text-red-100/50">
              {data.diagnostic}
            </p>
          )}
        </div>
      )}

      {loading && !data ? (
        <div className="flex items-center gap-2 py-16 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" /> Evaluating vault controls
        </div>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metricCards.map(({ label, value, icon: Icon }) => (
              <article
                key={label}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
              >
                <Icon className="h-5 w-5 text-cyan-300" />
                <p className="mt-4 text-3xl font-black text-white">{value}</p>
                <p className="mt-1 text-xs uppercase tracking-widest text-slate-500">
                  {label}
                </p>
              </article>
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-white">Control readiness</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Every item must pass before document intake can be enabled.
                  </p>
                </div>
                <Badge className="border-white/10 bg-white/5 text-slate-300">
                  {data?.controls?.filter((control) => control.passed).length ?? 0}/
                  {data?.controls?.length ?? 0} passed
                </Badge>
              </div>

              <div className="mt-5 space-y-3">
                {data?.controls?.map((control) => (
                  <div
                    key={control.id}
                    className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/10 p-4"
                  >
                    {control.passed ? (
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-400" />
                    ) : (
                      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
                    )}
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {control.id.replace(/-/g, " ")}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-400">
                        {control.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                <h2 className="text-lg font-bold text-white">Storage policy</h2>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-slate-500">Bucket</dt>
                    <dd className="font-mono text-cyan-300">
                      {data?.vault?.bucket ?? "gem-verify-evidence"}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-slate-500">Public access</dt>
                    <dd className="font-semibold text-green-300">
                      {data?.vault?.private ? "Disabled" : "Check required"}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-slate-500">Maximum file size</dt>
                    <dd className="text-white">
                      {formatBytes(data?.vault?.maxFileBytes ?? 10485760)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Allowed file types</dt>
                    <dd className="mt-2 flex flex-wrap gap-2">
                      {(data?.vault?.allowedMimeTypes ?? []).map((mimeType) => (
                        <Badge
                          key={mimeType}
                          className="border-white/10 bg-white/5 text-slate-300"
                        >
                          {mimeType}
                        </Badge>
                      ))}
                    </dd>
                  </div>
                </dl>
              </section>

              <section className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">
                <h2 className="font-bold text-white">Current safe operating state</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  The control plane is designed to store metadata and audit evidence
                  without opening a public upload route. No applicant document should
                  be accepted until the scanner and retention controls are active.
                </p>
                <div className="mt-4 grid gap-2 text-xs text-slate-400">
                  <p>• No public object-storage policy is created.</p>
                  <p>• Access history is append-only.</p>
                  <p>• Automatic identity approval remains disabled.</p>
                  <p>• Biometric decisioning remains disabled.</p>
                </div>
              </section>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
