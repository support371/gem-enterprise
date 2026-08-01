"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  FileCheck2,
  Frame,
  GitCommitHorizontal,
  Newspaper,
  RefreshCw,
  Route,
  ServerCog,
  ShieldCheck,
  XCircle,
} from "lucide-react";

type RouteCheck = {
  contract: string;
  path: string;
  status: number;
  available: boolean;
};

type NewsForgeStatus = {
  configured?: boolean;
  reachable?: boolean;
  routesAvailable?: boolean;
  embeddable?: boolean;
  sourceVerified?: boolean;
  ready?: boolean;
  host?: string;
  embeddedUrl?: string;
  checkedAt?: string;
  requiredVariables?: string[];
  sourceContract?: {
    repository?: string;
    branch?: string;
    expectedCommit?: string | null;
    requiredRoutes?: string[];
    embedQuery?: string;
  };
  platform?: {
    repository?: string;
    route?: string;
    deploymentCommit?: string | null;
  };
  manifest?: {
    sourceRepository?: string | null;
    sourceRef?: string | null;
    sourceCommit?: string | null;
    commitMatches?: boolean;
    routeContractComplete?: boolean;
  };
  framePolicy?: {
    frameAncestors?: string | null;
    xFrameOptions?: string | null;
    explicitGemPermission?: boolean;
  };
  routeChecks?: RouteCheck[];
  error?: string;
};

const CHECKS = [
  { key: "configured", label: "Host configured", icon: ServerCog },
  { key: "reachable", label: "Host reachable", icon: CheckCircle2 },
  { key: "routesAvailable", label: "Routes available", icon: Route },
  { key: "embeddable", label: "GEM framing allowed", icon: Frame },
  { key: "sourceVerified", label: "Source SHA verified", icon: GitCommitHorizontal },
  { key: "ready", label: "Integration ready", icon: ShieldCheck },
] as const;

function VerificationCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: boolean;
  icon: typeof ShieldCheck;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        value
          ? "border-emerald-500/25 bg-emerald-500/[0.07]"
          : "border-amber-500/25 bg-amber-500/[0.07]"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <Icon className={`h-5 w-5 ${value ? "text-emerald-300" : "text-amber-300"}`} />
        {value ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-300" />
        ) : (
          <XCircle className="h-4 w-4 text-amber-300" />
        )}
      </div>
      <p className="mt-3 text-sm font-medium text-white">{label}</p>
      <p className={`mt-1 text-xs ${value ? "text-emerald-200/70" : "text-amber-200/70"}`}>
        {value ? "Passed" : "Pending or blocked"}
      </p>
    </div>
  );
}

function ValueRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="grid gap-1 border-b border-white/[0.06] py-3 last:border-0 sm:grid-cols-[180px_1fr] sm:gap-4">
      <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</dt>
      <dd className="break-all font-mono text-xs leading-5 text-slate-300">{value || "Not available"}</dd>
    </div>
  );
}

export function NewsForgeIntegrationStatus() {
  const [status, setStatus] = useState<NewsForgeStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/intel/news-forge/status", {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });
      const payload = (await response.json()) as NewsForgeStatus;
      setStatus(payload);
      if (!response.ok && !payload) {
        setError(`Status request returned HTTP ${response.status}.`);
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load News Forge status.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const interval = window.setInterval(() => void refresh(), 60_000);
    return () => window.clearInterval(interval);
  }, [refresh]);

  const ready = Boolean(status?.ready);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-cyan-500/15 bg-gradient-to-br from-cyan-500/[0.09] via-card/80 to-amber-500/[0.06] p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/10">
              <Newspaper className="h-6 w-6 text-cyan-300" />
            </div>
            <div>
              <div
                className={`mb-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${
                  ready
                    ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
                    : "border-amber-500/25 bg-amber-500/10 text-amber-200"
                }`}
              >
                {ready ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                {ready ? "Verified and ready" : "Fail-closed verification pending"}
              </div>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">News Forge Integration</h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
                Live trace of the News Forge host, source commit, route contract, framing policy,
                and the exact GEM deployment consuming the channel.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void refresh()}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.08] disabled:cursor-wait disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh trace
            </button>
            <Link
              href="/intel/news"
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Open News channel <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {error && (
        <section className="rounded-2xl border border-red-500/25 bg-red-500/[0.07] p-5 text-sm text-red-200">
          {error}
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {CHECKS.map(({ key, label, icon }) => (
          <VerificationCard key={key} label={label} value={Boolean(status?.[key])} icon={icon} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-card/75 p-5">
          <div className="mb-3 flex items-center gap-2">
            <GitCommitHorizontal className="h-5 w-5 text-cyan-300" />
            <h2 className="font-semibold text-white">Source and deployment identity</h2>
          </div>
          <dl>
            <ValueRow label="Source repository" value={status?.sourceContract?.repository} />
            <ValueRow label="Source branch" value={status?.sourceContract?.branch} />
            <ValueRow label="Expected source SHA" value={status?.sourceContract?.expectedCommit} />
            <ValueRow label="Deployed source SHA" value={status?.manifest?.sourceCommit} />
            <ValueRow label="GEM deployment SHA" value={status?.platform?.deploymentCommit} />
            <ValueRow label="Configured host" value={status?.host} />
            <ValueRow label="Embedded URL" value={status?.embeddedUrl} />
          </dl>
        </div>

        <div className="rounded-2xl border border-white/10 bg-card/75 p-5">
          <div className="mb-3 flex items-center gap-2">
            <Frame className="h-5 w-5 text-cyan-300" />
            <h2 className="font-semibold text-white">Embedding and manifest policy</h2>
          </div>
          <dl>
            <ValueRow label="Frame ancestors" value={status?.framePolicy?.frameAncestors} />
            <ValueRow label="X-Frame-Options" value={status?.framePolicy?.xFrameOptions || "Not set"} />
            <ValueRow label="Manifest repository" value={status?.manifest?.sourceRepository} />
            <ValueRow label="Manifest ref" value={status?.manifest?.sourceRef} />
            <ValueRow
              label="Last checked"
              value={status?.checkedAt ? new Date(status.checkedAt).toLocaleString() : null}
            />
          </dl>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-card/75 p-5">
        <div className="mb-4 flex items-center gap-2">
          <Route className="h-5 w-5 text-cyan-300" />
          <h2 className="font-semibold text-white">Deployed route checks</h2>
        </div>

        {status?.routeChecks?.length ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {status.routeChecks.map((check) => (
              <div key={check.contract} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                <div className="flex items-center justify-between gap-3">
                  <code className="text-xs text-cyan-200">{check.contract}</code>
                  {check.available ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-300" />
                  )}
                </div>
                <p className="mt-2 break-all text-xs text-slate-500">Probe: {check.path}</p>
                <p className="mt-1 text-xs text-slate-400">HTTP {check.status || "not available"}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.06] p-4 text-sm text-amber-100">
            Route probes will appear after the source URL and expected source SHA are configured.
          </div>
        )}
      </section>

      {status?.requiredVariables?.length ? (
        <section className="rounded-2xl border border-amber-500/25 bg-amber-500/[0.06] p-5">
          <div className="flex items-start gap-3">
            <FileCheck2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
            <div>
              <h2 className="font-semibold text-white">Required preview configuration</h2>
              <p className="mt-1 text-sm leading-6 text-slate-400">
                The integration remains fail-closed until these branch-scoped values are present:
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {status.requiredVariables.map((variable) => (
                  <code key={variable} className="rounded bg-black/30 px-2 py-1 text-xs text-amber-200">
                    {variable}
                  </code>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
