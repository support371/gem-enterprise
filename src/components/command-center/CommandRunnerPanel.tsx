"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Play, RefreshCw, TerminalSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CommandItem {
  id: string;
  label: string;
  description: string;
  timeoutMs: number;
}

interface JobItem {
  id: string;
  commandId: string;
  commandLabel: string;
  hostId: string;
  status: "queued" | "running" | "completed" | "failed" | "timed_out";
  requestedAt: string | null;
  updatedAt: string;
  durationMs?: number;
  exitCode?: number | null;
  stdout?: string;
  stderr?: string;
}

interface RunnerState {
  enabled: boolean;
  configured: boolean;
  hostId: string;
  commands: CommandItem[];
  jobs: JobItem[];
}

function statusClass(status: JobItem["status"]) {
  if (status === "completed") return "border-emerald-500/25 bg-emerald-500/10 text-emerald-300";
  if (status === "failed" || status === "timed_out") return "border-rose-500/25 bg-rose-500/10 text-rose-300";
  if (status === "running") return "border-cyan-500/25 bg-cyan-500/10 text-cyan-300";
  return "border-amber-500/25 bg-amber-500/10 text-amber-300";
}

export function CommandRunnerPanel() {
  const [state, setState] = useState<RunnerState | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/command-runner/jobs", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Unable to load command runner.");
      setState(payload);
      setMessage(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load command runner.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 5000);
    return () => window.clearInterval(timer);
  }, [load]);

  async function run(commandId: string) {
    setRunning(commandId);
    setMessage(null);
    try {
      const response = await fetch("/api/command-runner/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commandId }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Command could not be queued.");
      setMessage("Command queued for the authorized host.");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Command could not be queued.");
    } finally {
      setRunning(null);
    }
  }

  if (loading) {
    return (
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <p className="flex items-center gap-2 text-sm text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading direct command controls…
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.035] p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-cyan-300">
            <TerminalSquare className="h-5 w-5" />
            <h2 className="font-bold text-white">Authorized command runner</h2>
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            Run fixed repository validation commands on the configured GEM host. Free-form shell input,
            deployment, database mutation, and destructive commands are not exposed.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={state?.enabled && state?.configured
            ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
            : "border-amber-500/25 bg-amber-500/10 text-amber-300"}>
            {state?.enabled && state?.configured ? "Configured" : "Setup required"}
          </Badge>
          <Button size="sm" variant="outline" className="border-white/10" onClick={() => void load()}>
            <RefreshCw className="mr-2 h-3.5 w-3.5" /> Refresh
          </Button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {(state?.commands ?? []).map((command) => (
          <div key={command.id} className="rounded-xl border border-white/10 bg-black/10 p-4">
            <p className="font-semibold text-white">{command.label}</p>
            <p className="mt-2 min-h-10 text-xs leading-5 text-slate-500">{command.description}</p>
            <Button
              size="sm"
              className="mt-4 w-full bg-cyan-500 text-black hover:bg-cyan-400"
              disabled={!state?.enabled || !state?.configured || running !== null}
              onClick={() => void run(command.id)}
            >
              {running === command.id
                ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                : <Play className="mr-2 h-3.5 w-3.5" />}
              Run
            </Button>
          </div>
        ))}
      </div>

      {message ? <p className="mt-4 text-xs text-cyan-200">{message}</p> : null}

      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Recent executions</h3>
          <span className="text-xs text-slate-500">Host: {state?.hostId ?? "not configured"}</span>
        </div>
        <div className="space-y-3">
          {(state?.jobs ?? []).length ? state?.jobs.slice(0, 8).map((job) => (
            <div key={job.id} className="rounded-xl border border-white/8 bg-black/10 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-white">{job.commandLabel}</p>
                  <p className="mt-1 font-mono text-[11px] text-slate-500">{job.id}</p>
                </div>
                <Badge className={statusClass(job.status)}>{job.status.replace("_", " ")}</Badge>
              </div>
              {job.durationMs !== undefined ? (
                <p className="mt-2 text-xs text-slate-500">
                  Exit {job.exitCode ?? "n/a"} · {(job.durationMs / 1000).toFixed(1)}s
                </p>
              ) : null}
              {job.stdout ? (
                <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap rounded-lg bg-black/30 p-3 text-[11px] leading-5 text-slate-300">
                  {job.stdout}
                </pre>
              ) : null}
              {job.stderr ? (
                <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap rounded-lg border border-rose-500/10 bg-rose-500/[0.03] p-3 text-[11px] leading-5 text-rose-200/80">
                  {job.stderr}
                </pre>
              ) : null}
            </div>
          )) : (
            <p className="rounded-xl border border-dashed border-white/10 p-4 text-xs text-slate-500">
              No command executions have been recorded yet.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
