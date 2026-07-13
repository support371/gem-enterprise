"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Database,
  Layers3,
  Loader2,
  LockKeyhole,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CommandCenterOperatingLayerSnapshot } from "@/lib/commandCenterOperatingLayer";
import {
  commandCenterOperatingMetricLabels,
  commandCenterSnapshotLabels,
  type CommandCenterSnapshot,
} from "@/lib/commandCenterSnapshot";

type LoadState = "loading" | "ready" | "restricted" | "unavailable";

function OperatingLayerPanel({ layer }: { layer: CommandCenterOperatingLayerSnapshot }) {
  if (layer.source === "migration_required") {
    return (
      <div className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/[0.05] p-5">
        <div className="flex items-start gap-3">
          <Layers3 className="mt-0.5 h-5 w-5 text-amber-300" />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-white">Persistent operating layer requires approval</p>
              <Badge className="border-amber-500/25 bg-amber-500/10 text-amber-300">Migration required</Badge>
            </div>
            <p className="mt-1 text-sm text-slate-400">
              {layer.message}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              {layer.missingTables?.length ?? 0} operating tables are not installed. The reviewed proposal is stored under
              <code className="ml-1 font-mono text-amber-200">prisma/proposals</code> and is not auto-applied.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (layer.source === "unavailable" || !layer.metrics) {
    return (
      <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/[0.04] p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 text-red-300" />
          <div>
            <p className="font-semibold text-white">Operating-layer readiness unavailable</p>
            <p className="mt-1 text-sm text-slate-400">
              {layer.message ?? "The persistent operating layer could not be inspected safely."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="mt-5 rounded-xl border border-cyan-500/20 bg-cyan-500/[0.04] p-5">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Layers3 className="h-4 w-4 text-cyan-300" />
        <h3 className="font-semibold text-white">Persistent operating layer</h3>
        <Badge className="border-cyan-500/25 bg-cyan-500/10 text-cyan-300">Installed</Badge>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {commandCenterOperatingMetricLabels.map(({ key, label, detail }) => (
          <div key={key} className="rounded-lg border border-white/8 bg-black/10 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-bold text-white">
              {layer.metrics?.[key].toLocaleString() ?? "—"}
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function LiveCommandCenterSnapshot() {
  const [snapshot, setSnapshot] = useState<CommandCenterSnapshot | null>(null);
  const [state, setState] = useState<LoadState>("loading");

  async function loadSnapshot() {
    setState("loading");
    try {
      const response = await fetch("/api/command-center/snapshot", {
        cache: "no-store",
        credentials: "same-origin",
      });

      if (response.status === 401 || response.status === 403) {
        setSnapshot(null);
        setState("restricted");
        return;
      }

      if (!response.ok) throw new Error(`Snapshot request failed with ${response.status}`);

      const nextSnapshot = (await response.json()) as CommandCenterSnapshot;
      setSnapshot(nextSnapshot);
      setState(nextSnapshot.source === "database" && nextSnapshot.metrics ? "ready" : "unavailable");
    } catch (error) {
      console.error("[command-center] snapshot request failed", error);
      setSnapshot(null);
      setState("unavailable");
    }
  }

  useEffect(() => {
    void loadSnapshot();
  }, []);

  if (state === "loading") {
    return (
      <div className="rounded-xl border border-white/10 bg-card/75 p-5">
        <div className="flex items-center gap-3 text-sm text-slate-300">
          <Loader2 className="h-4 w-4 animate-spin text-cyan-300" />
          Loading authorized platform aggregates…
        </div>
      </div>
    );
  }

  if (state === "restricted") {
    return (
      <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.05] p-5">
        <div className="flex items-start gap-3">
          <LockKeyhole className="mt-0.5 h-5 w-5 text-violet-300" />
          <div>
            <p className="font-semibold text-white">Live platform aggregates are staff restricted</p>
            <p className="mt-1 text-sm text-slate-400">
              The command-center design remains visible in demo mode, while cross-organization totals require an active analyst, administrator, or internal role.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (state === "unavailable" || !snapshot?.metrics) {
    return (
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.05] p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <Database className="mt-0.5 h-5 w-5 text-amber-300" />
            <div>
              <p className="font-semibold text-white">Live database snapshot unavailable</p>
              <p className="mt-1 text-sm text-slate-400">
                {snapshot?.message ?? "The interface is using clearly disclosed demo values until the database is reachable."}
              </p>
            </div>
          </div>
          <Button size="sm" variant="outline" className="border-white/10" onClick={() => void loadSnapshot()}>
            <RefreshCw className="mr-2 h-3.5 w-3.5" />Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <section className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-5">
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-300" />
            <h2 className="font-semibold text-white">Live platform snapshot</h2>
            <Badge className="border-emerald-500/25 bg-emerald-500/10 text-emerald-300">Database</Badge>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Generated {new Date(snapshot.generatedAt).toLocaleString()} · staff-authorized aggregate counts only
          </p>
        </div>
        <Button size="sm" variant="outline" className="border-white/10" onClick={() => void loadSnapshot()}>
          <RefreshCw className="mr-2 h-3.5 w-3.5" />Refresh
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {commandCenterSnapshotLabels.map(({ key, label, detail }) => (
          <div key={key} className="rounded-lg border border-white/8 bg-black/10 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-bold text-white">{snapshot.metrics?.[key].toLocaleString() ?? "—"}</p>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{detail}</p>
          </div>
        ))}
      </div>

      <OperatingLayerPanel layer={snapshot.operatingLayer} />
    </section>
  );
}
