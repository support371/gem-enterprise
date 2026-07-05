"use client";

import { useEffect, useMemo, useState } from "react";

type Connector = {
  provider: string;
  displayName: string;
  state: string;
  requiredScopes: string[];
  environment: string;
  configurationMissing: string[];
  accounts: Array<{ id: string; displayName: string; state: string; externalAccountId: string | null; grantedScopes: string[]; lastHealthAt: string | null }>;
};

function label(value: string) {
  return value.toLowerCase().replaceAll("_", " ").replace(/^./, (c) => c.toUpperCase());
}

export function TokMetricConnectorPanel() {
  const [workspaceId, setWorkspaceId] = useState("");
  const [state, setState] = useState<{ loading: boolean; error?: string; connectors: Connector[] }>({ loading: false, connectors: [] });
  const canLoad = useMemo(() => workspaceId.trim().length > 0, [workspaceId]);

  useEffect(() => {
    if (!canLoad) return;
    const controller = new AbortController();
    setState({ loading: true, connectors: [] });
    fetch(`/api/tokmetric/connectors?workspaceId=${encodeURIComponent(workspaceId.trim())}`, { signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error?.message || "Unable to load connectors.");
        setState({ loading: false, connectors: payload.connectors });
      })
      .catch((error) => {
        if (error.name !== "AbortError") setState({ loading: false, connectors: [], error: error.message });
      });
    return () => controller.abort();
  }, [canLoad, workspaceId]);

  return (
    <section className="rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.04] p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">Live connector state</p>
          <h2 className="mt-2 text-xl font-bold">Workspace TikTok connectors</h2>
          <p className="mt-2 text-sm leading-6 text-white/55">Enter a workspace ID to load authenticated connector records. Tokens and client secrets are never returned to the browser.</p>
        </div>
        <input
          value={workspaceId}
          onChange={(event) => setWorkspaceId(event.target.value)}
          placeholder="workspace ID"
          className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30"
        />
      </div>
      {!canLoad && <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/55">No workspace selected. Connector state is not fabricated.</div>}
      {state.loading && <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/55">Loading connector state…</div>}
      {state.error && <div className="mt-4 rounded-xl border border-amber-300/20 bg-amber-300/[0.06] p-4 text-sm text-amber-100">{state.error}</div>}
      {state.connectors.length > 0 && (
        <div className="mt-4 grid gap-3">
          {state.connectors.map((connector) => (
            <article key={connector.provider} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{connector.displayName}</h3>
                  <p className="mt-1 text-xs text-white/45">{connector.environment} · scopes: {connector.requiredScopes.join(", ")}</p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-white/70">{label(connector.state)}</span>
              </div>
              {connector.configurationMissing.length > 0 && <p className="mt-3 text-xs text-amber-100">Missing configuration: {connector.configurationMissing.join(", ")}</p>}
              {connector.accounts.length === 0 ? <p className="mt-3 text-sm text-white/45">No authorized account records.</p> : (
                <ul className="mt-3 space-y-2 text-sm text-white/55">
                  {connector.accounts.map((account) => <li key={account.id}>Account {account.externalAccountId ?? account.id}: {label(account.state)}</li>)}
                </ul>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
