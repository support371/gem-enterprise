"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  ClipboardList,
  FileText,
  HeadphonesIcon,
  Loader2,
  Plus,
  Shield,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ServiceRequest = {
  id: string;
  type: string;
  subject: string;
  description?: string | null;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt?: string;
};

const requestTypes = [
  { type: "portfolio_review", label: "Portfolio Review", description: "Review allocations, reporting, exposure, and protected assets.", icon: Briefcase },
  { type: "compliance_review", label: "Compliance Review", description: "Clarify KYC state, documents, disclosures, or approval status.", icon: ShieldCheck },
  { type: "cyber_briefing", label: "Cyber Briefing", description: "Request intelligence briefing or operational security review.", icon: Shield },
  { type: "real_estate_trust", label: "ATR Property Trust", description: "Request property trust review, readiness, or advisor consultation.", icon: Building2 },
  { type: "document_request", label: "Document Request", description: "Ask for statements, agreements, KYC evidence, or compliance records.", icon: FileText },
  { type: "support", label: "Support", description: "General client service, escalation, or operational support request.", icon: HeadphonesIcon },
];

function formatLabel(value: string) {
  return value.replace(/[-_]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function statusClass(status: string) {
  const value = status.toLowerCase();
  if (value === "completed" || value === "resolved" || value === "closed") return "border-green-500/25 bg-green-500/15 text-green-400";
  if (value === "in_progress") return "border-cyan-500/25 bg-cyan-500/15 text-cyan-400";
  if (value === "pending_info") return "border-yellow-500/25 bg-yellow-500/15 text-yellow-400";
  if (value === "cancelled") return "border-red-500/25 bg-red-500/15 text-red-400";
  return "border-white/10 bg-white/10 text-slate-300";
}

function priorityClass(priority: string) {
  const value = priority.toLowerCase();
  if (value === "critical") return "text-red-400";
  if (value === "high") return "text-yellow-400";
  if (value === "medium") return "text-cyan-400";
  return "text-slate-400";
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedType, setSelectedType] = useState("portfolio_review");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");

  async function loadRequests() {
    setLoading(true);
    try {
      const response = await fetch("/api/requests");
      const data = await response.json();
      if (Array.isArray(data.requests)) setRequests(data.requests);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  const summary = useMemo(() => ({
    total: requests.length,
    open: requests.filter((item) => item.status === "open").length,
    inProgress: requests.filter((item) => item.status === "in_progress").length,
    completed: requests.filter((item) => item.status === "completed").length,
  }), [requests]);

  async function submitRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!subject.trim() || !description.trim()) return;
    setCreating(true);
    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: selectedType, subject, description, priority }),
      });
      if (response.ok) {
        setSubject("");
        setDescription("");
        setPriority("medium");
        await loadRequests();
      }
    } finally {
      setCreating(false);
    }
  }

  const cards = [
    { label: "Total Requests", value: summary.total, icon: ClipboardList, color: "text-cyan-400", bg: "bg-cyan-500/10" },
    { label: "Open", value: summary.open, icon: AlertCircle, color: "text-yellow-400", bg: "bg-yellow-500/10" },
    { label: "In Progress", value: summary.inProgress, icon: Loader2, color: "text-cyan-400", bg: "bg-cyan-500/10" },
    { label: "Completed", value: summary.completed, icon: CheckCircle2, color: "text-green-400", bg: "bg-green-500/10" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-xs font-mono uppercase tracking-wider text-cyan-400">
            <ClipboardList className="h-3.5 w-3.5" /> Service Operations
          </div>
          <h1 className="text-2xl font-bold text-white">Request Center</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">
            Submit, route, and track operational requests across portfolio, compliance, cyber, document, ATR Property Trust, and support workflows.
          </p>
        </div>
        <Badge className="border-green-500/25 bg-green-500/15 text-green-400">
          <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Connected to Service Requests
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="glass-panel bento-card rounded-xl p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${bg}`}><Icon className={`h-5 w-5 ${color}`} /></div>
              <p className={`text-3xl font-bold ${color}`}>{loading ? "—" : value}</p>
            </div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="border-white/10 bg-card">
          <CardHeader><CardTitle className="flex items-center gap-2 text-white"><Plus className="h-5 w-5 text-cyan-400" /> New Request</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={submitRequest} className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-2">
                {requestTypes.map(({ type, label, description: body, icon: Icon }) => (
                  <button key={type} type="button" onClick={() => setSelectedType(type)} className={`rounded-2xl border p-4 text-left transition ${selectedType === type ? "border-cyan-500/40 bg-cyan-500/10" : "border-white/10 bg-white/5 hover:border-white/20"}`}>
                    <Icon className="mb-3 h-5 w-5 text-cyan-400" />
                    <p className="text-sm font-semibold text-white">{label}</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-400">{body}</p>
                  </button>
                ))}
              </div>
              <input value={subject} onChange={(event) => setSubject(event.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-500/40" placeholder="Short request title" />
              <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={5} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-500/40" placeholder="Describe the request, expected outcome, relevant documents, and urgency." />
              <select value={priority} onChange={(event) => setPriority(event.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500/40">
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
              </select>
              <Button type="submit" disabled={creating || !subject.trim() || !description.trim()} className="w-full rounded-xl bg-cyan-400 text-black hover:bg-cyan-300">
                {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                {creating ? "Submitting Request" : "Submit Request"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-card">
          <CardHeader><CardTitle className="flex items-center gap-2 text-white"><ClipboardList className="h-5 w-5 text-cyan-400" /> Active Requests</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-12 text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading requests…</div>
            ) : requests.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center"><ClipboardList className="mx-auto mb-3 h-8 w-8 text-slate-600" /><p className="text-sm text-slate-500">No service requests yet.</p></div>
            ) : (
              <div className="space-y-3">
                {requests.map((request) => (
                  <div key={request.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div><p className="text-sm font-semibold text-white">{request.subject}</p><p className="mt-1 text-xs text-slate-500">{formatLabel(request.type)}</p></div>
                      <Badge className={statusClass(request.status)}>{formatLabel(request.status)}</Badge>
                    </div>
                    <p className="line-clamp-2 text-sm leading-relaxed text-slate-400">{request.description || "No description provided."}</p>
                    <div className="mt-4 flex items-center justify-between text-xs">
                      <span className={priorityClass(request.priority)}>{formatLabel(request.priority)} Priority</span>
                      <span className="font-mono text-slate-500">{new Date(request.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
