"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Headphones, Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SupportCaseConversation } from "@/components/support/SupportCaseConversation";

type OperationsTicket = {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  assignedTo?: string | null;
  createdAt: string;
  user: { email: string; profile?: { firstName?: string | null; lastName?: string | null } | null };
};

export function SupportOperationsConsole() {
  const [tickets, setTickets] = useState<OperationsTicket[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/support/operations", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to load support operations.");
      setTickets(Array.isArray(data.tickets) ? data.tickets : []);
      setSelectedId((current) => current || data.tickets?.[0]?.id || null);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load support operations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const summary = useMemo(() => ({
    unassigned: tickets.filter((ticket) => !ticket.assignedTo && ticket.status !== "resolved" && ticket.status !== "closed").length,
    active: tickets.filter((ticket) => ticket.status === "in_progress" || ticket.status === "waiting_on_client").length,
    critical: tickets.filter((ticket) => ticket.priority === "critical" && ticket.status !== "resolved" && ticket.status !== "closed").length,
  }), [tickets]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-wider text-cyan-200"><Headphones className="h-3.5 w-3.5" /> Human Support Operations</div>
          <h1 className="text-2xl font-bold text-white">Live support queue</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Claim governed AI handoffs, reply through a durable case thread, and update the client-visible case state.</p>
        </div>
        <Button variant="outline" onClick={() => void load()} disabled={loading}><RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh queue</Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[{ label: "Unassigned", value: summary.unassigned }, { label: "Active", value: summary.active }, { label: "Critical", value: summary.critical }].map((item) => (
          <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xs uppercase tracking-wider text-slate-500">{item.label}</p><p className="mt-2 text-3xl font-bold text-white">{item.value}</p></div>
        ))}
      </div>

      {error ? <div className="rounded-xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-100">{error}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Card className="border-white/10 bg-card">
          <CardHeader><CardTitle className="flex items-center gap-2 text-white"><ShieldCheck className="h-5 w-5 text-cyan-300" /> Case queue</CardTitle></CardHeader>
          <CardContent className="max-h-[48rem] space-y-2 overflow-y-auto">
            {loading ? <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading queue…</div> : null}
            {!loading && tickets.length === 0 ? <p className="py-10 text-center text-sm text-slate-500">No support cases are waiting.</p> : null}
            {tickets.map((ticket) => {
              const name = [ticket.user.profile?.firstName, ticket.user.profile?.lastName].filter(Boolean).join(" ") || ticket.user.email;
              return (
                <button key={ticket.id} type="button" onClick={() => setSelectedId(ticket.id)} className={`w-full rounded-xl border p-4 text-left transition ${selectedId === ticket.id ? "border-cyan-400/40 bg-cyan-400/10" : "border-white/10 bg-white/[0.03] hover:border-white/20"}`}>
                  <div className="flex items-start justify-between gap-3"><p className="text-sm font-semibold text-white">{ticket.subject}</p><Badge className="border-white/10 bg-white/10 text-[10px] text-slate-300">{ticket.priority}</Badge></div>
                  <p className="mt-1 text-xs text-slate-400">{name}</p>
                  <p className="mt-2 text-[10px] uppercase tracking-wider text-cyan-300">{ticket.status.replace(/_/g, " ")} · {ticket.assignedTo ? "assigned" : "unassigned"}</p>
                </button>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-card">
          <CardHeader><CardTitle className="text-white">Case conversation</CardTitle></CardHeader>
          <CardContent>
            {selectedId ? <SupportCaseConversation ticketId={selectedId} staffMode onChanged={() => void load()} /> : <p className="py-12 text-center text-sm text-slate-500">Select a case to review its conversation.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
