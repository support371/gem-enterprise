"use client";

import { useEffect, useMemo, useState } from "react";

const REVIEW_WORKSPACE_ID = "ws_60488340ded94dcfab3b875ef9ae591c";

type ConnectorAccount = {
  id: string;
  displayName: string;
  state: string;
  externalAccountId: string | null;
  grantedScopes: string[];
  lastHealthAt: string | null;
};

type Connector = {
  provider: string;
  displayName: string;
  state: string;
  requiredScopes: string[];
  environment: string;
  configurationMissing: string[];
  accounts: ConnectorAccount[];
};

function label(value: string) {
  return value.toLowerCase().replaceAll("_", " ").replace(/^./, (c) => c.toUpperCase());
}

function healthLabel(value: string | null) {
  if (!value) return "Not checked";
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toLocaleString() : "Unavailable";
}

export function TokMetricConnectorPanel() {
  const [workspaceId, setWorkspaceId] = useState(REVIEW_WORKSPACE_ID);
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState<{
    loading: boolean;
    error?: string;
    connectors: Connector[];
  }>({ loading: false, connectors: [] });
  const canLoad = useMemo(() => workspaceId.trim().length > 0, [workspaceId]);

  useEffect(() => {
    if (!canLoad) return;
    const controller = new AbortController();
    setState({ loading: true, connectors: [] });
    fetch(
      `/api/tokmetric/connectors?workspaceId=${encodeURIComponent(workspaceId.trim())}`,
      { signal: controller.signal, cache: "no-store" },
    )
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error?.message || payload.error || "Unable to load connectors.");
        }
        setState({ loading: false, connectors: payload.connectors ?? [] });
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setState({ loading: false, connectors: [], error: error.message });
        }
      });
    return () => controller.abort();
  }, [canLoad, reloadKey, workspaceId]);

  const oauthHref = `/api/tokmetric/oauth/start?workspaceId=${encodeURIComponent(
    workspaceId.trim(),
  )}&provider=TIKTOK_CONTENT_POSTING_API`;

  return (
    <section className="rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.04] p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
            Live connector state
          </p>
          <h2 className="mt-2 text-xl font-bold">Workspace TikTok connectors</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">
            The authorized review workspace is preselected so a signed-in reviewer can load real database-backed connector records without knowing an internal identifier. Tokens and client secrets are never returned to the browser.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-[minmax(260px,1fr)_auto_auto_auto]">
          <input
            aria-label="TokMetric workspace ID"
            value={workspaceId}
            onChange={(event) => setWorkspaceId(event.target.value)}
            placeholder="workspace ID"
            className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30"
          />
          <button
            type="button"
            onClick={() => setReloadKey((value) => value + 1)}
            disabled={!canLoad || state.loading}
            className="rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Refresh
          </button>
          <a
            href="/tokmetric/setup-status"
            className="rounded-xl border border-cyan-300/25 bg-cyan-300/[0.07] px-4 py-2 text-center text-sm font-semibold text-cyan-200 transition hover:bg-cyan-300/[0.12]"
          >
            Setup status
          </a>
          <a
            href={oauthHref}
            className="rounded-xl bg-cyan-300 px-4 py-2 text-center text-sm font-bold text-[#06111b] transition hover:bg-cyan-200"
          >
            Connect TikTok
          </a>
        </div>
      </div>

      {!canLoad && (
        <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/55">
          No workspace selected. Connector state is not fabricated.
        </div>
      )}
      {state.loading && (
        <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/55">
          Loading real connector state…
        </div>
      )}
      {state.error && (
        <div className="mt-4 rounded-xl border border-amber-300/20 bg-amber-300/[0.06] p-4 text-sm text-amber-100">
          {state.error}
        </div>
      )}
      {!state.loading && !state.error && canLoad && state.connectors.length === 0 && (
        <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/55">
          No connector definitions were returned for this authorized workspace.
        </div>
      )}
      {state.connectors.length > 0 && (
        <div className="mt-4 grid gap-3">
          {state.connectors.map((connector) => (
            <article
              key={connector.provider}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{connector.displayName}</h3>
                  <p className="mt-1 text-xs text-white/45">
                    {connector.provider} · {connector.environment} · required scopes: {connector.requiredScopes.join(", ") || "none"}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-white/70">
                  {label(connector.state)}
                </span>
              </div>

              {connector.configurationMissing.length > 0 && (
                <p className="mt-3 text-xs text-amber-100">
                  Missing managed configuration: {connector.configurationMissing.join(", ")}
                </p>
              )}

              {connector.accounts.length === 0 ? (
                <p className="mt-3 text-sm text-white/45">No authorized account records.</p>
              ) : (
                <div className="mt-4 grid gap-3">
                  {connector.accounts.map((account) => (
                    <div
                      key={account.id}
                      className="grid gap-3 rounded-xl border border-white/[0.07] bg-black/15 p-4 md:grid-cols-[1fr_auto] md:items-center"
                    >
                      <div>
                        <p className="font-semibold text-white/80">
                          {account.displayName || "Authorized TikTok account"}
                        </p>
                        <p className="mt-1 font-mono text-xs text-white/40">
                          Account ID: {account.externalAccountId ?? account.id}
                        </p>
                        <p className="mt-2 text-xs text-white/45">
                          Granted scopes: {account.grantedScopes.join(", ") || "none returned"}
                        </p>
                      </div>
                      <div className="text-left text-xs text-white/45 md:text-right">
                        <p className="font-semibold uppercase tracking-[0.12em] text-white/70">
                          {label(account.state)}
                        </p>
                        <p className="mt-1">Health: {healthLabel(account.lastHealthAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
