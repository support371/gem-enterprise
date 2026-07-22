"use client";

import { useEffect, useMemo, useState } from "react";
import { ExternalLink, KeyRound, Link2Off, Loader2, ShieldAlert } from "lucide-react";
import type { SafeSocialOAuthReadiness } from "@/lib/social-media/oauth/readiness";

type Connector = {
  id: string;
  workspaceId: string;
  provider: string;
  state: string;
  displayName: string;
  externalAccountId: string | null;
  grantedScopes: string[];
  safeMetadata: Record<string, unknown>;
  lastHealthAt: string | null;
  disabledAt: string | null;
};

function label(value: string) {
  return value.toLowerCase().replaceAll("_", " ").replace(/^./, (character) => character.toUpperCase());
}

export function SocialConnectorPanel({ providers }: { providers: SafeSocialOAuthReadiness[] }) {
  const [workspaceId, setWorkspaceId] = useState("");
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [disconnecting, setDisconnecting] = useState<string>();
  const canLoad = useMemo(() => workspaceId.trim().length > 0, [workspaceId]);

  async function loadConnectors(signal?: AbortSignal) {
    if (!canLoad) return;
    setLoading(true);
    setError(undefined);
    try {
      const response = await fetch(
        `/api/social-media/connectors?workspaceId=${encodeURIComponent(workspaceId.trim())}`,
        { signal, cache: "no-store" },
      );
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error?.message || "Unable to load social connectors.");
      setConnectors(payload.connectors || []);
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") return;
      setConnectors([]);
      setError(caught instanceof Error ? caught.message : "Unable to load social connectors.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }

  useEffect(() => {
    if (!canLoad) {
      setConnectors([]);
      setError(undefined);
      return;
    }
    const controller = new AbortController();
    void loadConnectors(controller.signal);
    return () => controller.abort();
    // loadConnectors is intentionally driven only by the selected workspace.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canLoad, workspaceId]);

  function connect(provider: SafeSocialOAuthReadiness) {
    if (!canLoad || !provider.readyToAuthorize) return;
    const url = new URL(`/api/social-media/oauth/${provider.provider.toLowerCase()}/start`, window.location.origin);
    url.searchParams.set("workspaceId", workspaceId.trim());
    url.searchParams.set("redirectAfter", "/app/command-center/social-media");
    window.location.assign(url.toString());
  }

  async function disconnect(connector: Connector) {
    const confirmed = window.confirm(
      `Disconnect ${connector.displayName}? The stored access and refresh credentials will be deleted.`,
    );
    if (!confirmed) return;
    setDisconnecting(connector.id);
    setError(undefined);
    try {
      const response = await fetch("/api/social-media/connectors", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId: workspaceId.trim(), connectorId: connector.id }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error?.message || "Unable to disconnect connector.");
      await loadConnectors();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to disconnect connector.");
    } finally {
      setDisconnecting(undefined);
    }
  }

  const connectorsByProvider = useMemo(() => {
    const grouped = new Map<string, Connector[]>();
    for (const connector of connectors) {
      if (connector.disabledAt || connector.state === "DISCONNECTED") continue;
      const existing = grouped.get(connector.provider) || [];
      existing.push(connector);
      grouped.set(connector.provider, existing);
    }
    return grouped;
  }, [connectors]);

  return (
    <section className="rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.04] p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
            Authorized account connectors
          </p>
          <h2 className="mt-2 text-xl font-bold text-white">Workspace social accounts</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
            Enter an authorized workspace ID to load real connector records. Client secrets, access
            tokens, refresh tokens, and encrypted credential references are never returned to the browser.
          </p>
        </div>
        <input
          value={workspaceId}
          onChange={(event) => setWorkspaceId(event.target.value)}
          placeholder="workspace ID"
          autoComplete="off"
          className="min-w-64 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-cyan-300/40"
        />
      </div>

      {!canLoad ? (
        <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/55">
          No workspace selected. Account authorization state is not fabricated.
        </div>
      ) : null}
      {loading ? (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/55">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading connector state…
        </div>
      ) : null}
      {error ? (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-300/20 bg-amber-300/[0.06] p-4 text-sm text-amber-100">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </div>
      ) : null}

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {providers.map((provider) => {
          const providerConnectors = connectorsByProvider.get(provider.provider) || [];
          return (
            <article key={provider.provider} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-cyan-300" />
                    <h3 className="font-semibold text-white">{provider.displayName}</h3>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-white/45">
                    Requested scopes: {provider.requestedScopes.length > 0 ? provider.requestedScopes.join(", ") : "not configured"}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-white/70">
                  {providerConnectors.length > 0
                    ? `${providerConnectors.length} connected`
                    : provider.readyToAuthorize
                      ? "Authorization required"
                      : "Blocked"}
                </span>
              </div>

              {provider.missing.length > 0 ? (
                <p className="mt-3 text-xs leading-5 text-amber-100">
                  Missing or blocked: {provider.missing.join(", ")}
                </p>
              ) : null}

              {providerConnectors.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {providerConnectors.map((connector) => (
                    <div
                      key={connector.id}
                      className="rounded-lg border border-emerald-300/15 bg-emerald-300/[0.04] p-3 text-sm text-white/60"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p>Account: {connector.externalAccountId || "profile discovery pending"}</p>
                          <p className="mt-1">State: {label(connector.state)}</p>
                          <p className="mt-1">
                            Granted scopes: {connector.grantedScopes.join(", ") || "not returned by provider"}
                          </p>
                          <p className="mt-1">
                            Last health record: {connector.lastHealthAt ? new Date(connector.lastHealthAt).toLocaleString() : "not recorded"}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => void disconnect(connector)}
                          disabled={disconnecting === connector.id}
                          className="inline-flex items-center gap-2 rounded-lg border border-rose-300/20 px-3 py-2 text-xs font-semibold text-rose-200 hover:bg-rose-300/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {disconnecting === connector.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Link2Off className="h-3.5 w-3.5" />
                          )}
                          Delete stored authorization
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => connect(provider)}
                disabled={!canLoad || !provider.readyToAuthorize}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-cyan-300 px-3 py-2 text-xs font-semibold text-black hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/35"
              >
                {providerConnectors.length > 0 ? "Authorize another account" : "Authorize account"}
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </article>
          );
        })}
      </div>

      <p className="mt-4 text-xs leading-5 text-white/40">
        Account authorization stores credentials for later approved operations. It does not enable
        publishing; all global and provider-specific live gates remain separate and disabled.
      </p>
    </section>
  );
}
