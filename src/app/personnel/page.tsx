"use client";

import { useState, useEffect, useRef } from "react";
import {
  Shield,
  Building,
  Users,
  Terminal,
  Cpu,
  Database,
  Globe,
  ChevronDown,
  Mail,
  Phone,
  ExternalLink,
  X,
  Zap,
  Activity,
  Eye,
  Server,
  Layout,
  Bot,
  CircleDot,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ── Data ─────────────────────────────────────────────────────────────────────

const INIT_MESSAGES = [
  "INITIALIZING TEAM BOARD",
  "VALIDATING PROFILE STRUCTURE",
  "LOADING GEM / ATR PERSONNEL",
  "CHECKING DASHBOARD RELATIONS",
  "MONITORING SYSTEM STATUS",
];

const GEM_DEPARTMENTS = ["Security Operations", "Engineering", "Threat Intelligence", "Compliance"];
const ATR_DEPARTMENTS = ["Real Estate Ops", "Client Services", "Property Security", "Legal"];

const PERSONNEL: Personnel[] = [
  // GEM — Security Operations
  { id: "g1", name: "Darius Kellan", title: "SOC Team Lead", company: "GEM", department: "Security Operations", group: "Blue Team", email: "d.kellan@gemcybersecurityassist.com", phone: "+1 (401) 702-2460", website: "gemcybersecurityassist.com", description: "Leads 24/7 SOC operations and incident triage. Former NSA signals analyst with expertise in APT tracking and SIEM orchestration.", initials: "DK" },
  { id: "g2", name: "Priya Sundaram", title: "Threat Intelligence Analyst", company: "GEM", department: "Threat Intelligence", group: "Intel Core", email: "p.sundaram@gemcybersecurityassist.com", phone: "+1 (401) 702-2460", website: "gemcybersecurityassist.com", description: "Synthesizes IOC feeds, malware reversals, and adversary profiling into executive-ready briefs. GREM certified.", initials: "PS" },
  { id: "g3", name: "Evan Marsh", title: "Principal Security Engineer", company: "GEM", department: "Engineering", group: "Platform", email: "e.marsh@gemcybersecurityassist.com", phone: "+1 (401) 702-2460", website: "gemcybersecurityassist.com", description: "Architects zero-trust network segmentation and leads red team infrastructure. OSCP, CISSP holder.", initials: "EM" },
  { id: "g4", name: "Yara Osei", title: "Compliance Analyst", company: "GEM", department: "Compliance", group: "GRC", email: "y.osei@gemcybersecurityassist.com", phone: "+1 (401) 702-2460", website: "gemcybersecurityassist.com", description: "Manages SOC 2 readiness, ISO 27001 gap assessments, and client audit support programs.", initials: "YO" },
  { id: "g5", name: "Cole Tavares", title: "DevSecOps Engineer", company: "GEM", department: "Engineering", group: "Platform", email: "c.tavares@gemcybersecurityassist.com", phone: "+1 (401) 702-2460", website: "gemcybersecurityassist.com", description: "Builds secure CI/CD pipelines, IaC security scanning, and container hardening for GEM's cloud infrastructure.", initials: "CT" },
  { id: "g6", name: "Nadia Fenn", title: "Incident Response Lead", company: "GEM", department: "Security Operations", group: "IR Team", email: "n.fenn@gemcybersecurityassist.com", phone: "+1 (401) 702-2460", website: "gemcybersecurityassist.com", description: "Coordinates enterprise breach response, forensic evidence preservation, and post-incident remediation planning.", initials: "NF" },
  // ATR — Real Estate
  { id: "a1", name: "Marcus Webb", title: "VP Real Estate Operations", company: "ATR", department: "Real Estate Ops", group: "Leadership", email: "m.webb@alliancetrustrealty.com", phone: "+1 (401) 702-2460", website: "alliancetrustrealty.com", description: "Oversees ATR's full property portfolio, acquisition strategy, and operational excellence across residential and commercial assets.", initials: "MW" },
  { id: "a2", name: "Camille Dore", title: "Property Security Specialist", company: "ATR", department: "Property Security", group: "Physical Sec", email: "c.dore@alliancetrustrealty.com", phone: "+1 (401) 702-2460", website: "alliancetrustrealty.com", description: "Implements deed monitoring, title fraud prevention, and physical security audits for ATR's high-value properties.", initials: "CD" },
  { id: "a3", name: "Theo Bright", title: "Client Relations Manager", company: "ATR", department: "Client Services", group: "Accounts", email: "t.bright@alliancetrustrealty.com", phone: "+1 (401) 702-2460", website: "alliancetrustrealty.com", description: "Primary contact for institutional real estate clients. Manages SLA delivery and onboarding for new property portfolios.", initials: "TB" },
  { id: "a4", name: "Ingrid Reyes", title: "Real Estate Attorney", company: "ATR", department: "Legal", group: "Counsel", email: "i.reyes@alliancetrustrealty.com", phone: "+1 (401) 702-2460", website: "alliancetrustrealty.com", description: "Specializes in commercial real estate transactions, title disputes, and multi-jurisdictional compliance for ATR portfolios.", initials: "IR" },
  { id: "a5", name: "Desmond Akilu", title: "Portfolio Analyst", company: "ATR", department: "Real Estate Ops", group: "Analytics", email: "d.akilu@alliancetrustrealty.com", phone: "+1 (401) 702-2460", website: "alliancetrustrealty.com", description: "Quantitative analysis of real estate portfolio performance, risk modeling, and valuation across ATR's asset classes.", initials: "DA" },
  { id: "a6", name: "Sofia Lian", title: "Operations Coordinator", company: "ATR", department: "Client Services", group: "Accounts", email: "s.lian@alliancetrustrealty.com", phone: "+1 (401) 702-2460", website: "alliancetrustrealty.com", description: "Coordinates cross-department project timelines, vendor relations, and client deliverable schedules for ATR operations.", initials: "SL" },
];

const ARCH_NODES: ArchNode[] = [
  { id: "ui",  label: "UI",  sublabel: "Front-End Client",  icon: Layout,   color: "cyan",  x: 50, y: 15,  description: "Next.js 15 App Router with React Server Components, Tailwind CSS, and shadcn/ui. Hosted on Vercel edge network with global CDN distribution.", tech: ["Next.js 15", "React 19", "Tailwind CSS", "shadcn/ui", "TypeScript"] },
  { id: "api", label: "API", sublabel: "Back-End Server",   icon: Server,   color: "plum",  x: 25, y: 60,  description: "Node.js API layer handling authentication, data aggregation from Notion, and AI agent orchestration. Secured with JWT + rate limiting.", tech: ["Node.js", "Express", "JWT Auth", "Rate Limiting", "OpenAPI 3.1"] },
  { id: "db",  label: "DB",  sublabel: "Team Board",        icon: Database, color: "green", x: 75, y: 60,  description: "Notion as the canonical source of truth for personnel records. Synced via Notion API with caching layer for performance.", tech: ["Notion API", "Redis Cache", "Webhooks", "Schema Validation"] },
  { id: "ai",  label: "AI",  sublabel: "Overseer",          icon: Bot,      color: "amber", x: 50, y: 85,  description: "Claude-powered AI agent that monitors team roster changes, validates profile completeness, indexes records, and surfaces anomalies in real time.", tech: ["Claude API", "Agent SDK", "Tool Use", "Vector Index", "Event Streams"] },
];

const EDGES = [
  { from: "ui",  to: "api" },
  { from: "ui",  to: "db"  },
  { from: "api", to: "db"  },
  { from: "api", to: "ai"  },
  { from: "db",  to: "ai"  },
];

const AGENT_LOG_LINES = [
  "◈ Agent-0X1A online. Roster sync initiated.",
  "◈ Loading GEM personnel — 6 records found.",
  "◈ Loading ATR personnel — 6 records found.",
  "◈ Validating profile completeness: 12/12 OK.",
  "◈ Department index rebuilt: 8 departments mapped.",
  "◈ Checking photo slots — 0 avatars injected.",
  "◈ Relationship graph: UI → API → DB → AI verified.",
  "◈ Anomaly scan: 0 flags raised.",
  "◈ Notion schema validation: PASS.",
  "◈ Standby. Monitoring for roster mutations…",
];

// ── Types ────────────────────────────────────────────────────────────────────

interface Personnel {
  id: string; name: string; title: string; company: "GEM" | "ATR";
  department: string; group: string; email: string; phone: string;
  website: string; description: string; initials: string;
}

interface ArchNode {
  id: string; label: string; sublabel: string; icon: React.FC<{ className?: string }>;
  color: "cyan" | "plum" | "green" | "amber"; x: number; y: number;
  description: string; tech: string[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const NODE_COLORS = {
  cyan:  { ring: "border-cyan-400/60",  bg: "bg-cyan-400/10",  text: "text-cyan-400",  dot: "bg-cyan-400" },
  plum:  { ring: "border-purple-400/60", bg: "bg-purple-400/10", text: "text-purple-400", dot: "bg-purple-400" },
  green: { ring: "border-emerald-400/60", bg: "bg-emerald-400/10", text: "text-emerald-400", dot: "bg-emerald-400" },
  amber: { ring: "border-amber-400/60",  bg: "bg-amber-400/10",  text: "text-amber-400",  dot: "bg-amber-400" },
};

const DEPT_COLORS: Record<string, string> = {
  "Security Operations": "bg-cyan-400",
  "Engineering": "bg-blue-400",
  "Threat Intelligence": "bg-purple-400",
  "Compliance": "bg-emerald-400",
  "Real Estate Ops": "bg-amber-400",
  "Client Services": "bg-orange-400",
  "Property Security": "bg-rose-400",
  "Legal": "bg-indigo-400",
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function PersonnelPage() {
  const [initStep, setInitStep] = useState(0);
  const [ready, setReady] = useState(false);
  const [unitFilter, setUnitFilter] = useState<"ALL" | "GEM" | "ATR">("ALL");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [groupFilter, setGroupFilter] = useState("ALL");
  const [selectedNode, setSelectedNode] = useState<ArchNode | null>(null);
  const [agentLog, setAgentLog] = useState<string[]>([]);
  const [agentRunning, setAgentRunning] = useState(true);
  const [agentDead, setAgentDead] = useState(false);
  const termRef = useRef<HTMLDivElement>(null);

  // Init sequence
  useEffect(() => {
    if (initStep < INIT_MESSAGES.length) {
      const t = setTimeout(() => setInitStep((s) => s + 1), 420);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => setReady(true), 300);
      return () => clearTimeout(t);
    }
  }, [initStep]);

  // Agent log drip
  useEffect(() => {
    if (!agentRunning || agentDead) return;
    if (agentLog.length >= AGENT_LOG_LINES.length) {
      setAgentRunning(false);
      return;
    }
    const delay = agentLog.length === 0 ? 1200 : 700 + Math.random() * 500;
    const t = setTimeout(() => {
      setAgentLog((l) => [...l, AGENT_LOG_LINES[l.length]]);
    }, delay);
    return () => clearTimeout(t);
  }, [agentLog, agentRunning, agentDead]);

  useEffect(() => {
    if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight;
  }, [agentLog]);

  // Derived filters
  const allDepts = Array.from(new Set(PERSONNEL.map((p) => p.department)));
  const allGroups = Array.from(new Set(PERSONNEL.filter((p) => unitFilter === "ALL" || p.company === unitFilter).map((p) => p.group)));

  const filtered = PERSONNEL.filter((p) => {
    if (unitFilter !== "ALL" && p.company !== unitFilter) return false;
    if (deptFilter !== "ALL" && p.department !== deptFilter) return false;
    if (groupFilter !== "ALL" && p.group !== groupFilter) return false;
    return true;
  });

  // Dept distribution
  const deptCounts = allDepts.map((d) => ({
    name: d,
    count: PERSONNEL.filter((p) => p.department === d).length,
    company: PERSONNEL.find((p) => p.department === d)?.company ?? "GEM",
  }));
  const maxCount = Math.max(...deptCounts.map((d) => d.count));

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-border/40 cyber-grid">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--night-plum)/0.18)] via-transparent to-[hsl(var(--electric-cyan)/0.08)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-14 lg:py-20">
          {/* Status row */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-xs font-mono font-semibold text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              LIVE
            </span>
            <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground">
              PERSONNEL ARCHITECTURE AI OVERSEER
            </Badge>
          </div>

          <h1 className="mb-3 font-mono text-3xl font-bold tracking-tight lg:text-4xl">
            <span className="text-gradient-primary">GEM &amp; ATR Platform</span>
          </h1>
          <p className="mb-6 max-w-2xl text-muted-foreground">
            Unified Operations for Cybersecurity &amp; Real Estate. This live directory is built from
            the Notion-aligned team schema — profiles shaped around company, department, group, role,
            contact data, job description, and photo support.
          </p>

          {/* Init ticker */}
          <div className="glass-panel rounded-lg border border-border/40 px-4 py-3 font-mono text-xs">
            <div className="flex flex-wrap gap-x-6 gap-y-1">
              {INIT_MESSAGES.map((msg, i) => (
                <span
                  key={msg}
                  className={
                    i < initStep
                      ? "text-emerald-400"
                      : i === initStep
                      ? "animate-pulse text-cyan-400"
                      : "text-muted-foreground/30"
                  }
                >
                  {i < initStep ? "✓" : i === initStep ? "›" : "·"} {msg}
                </span>
              ))}
            </div>
          </div>

          {/* Unit summary */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="glass-panel rounded-xl border border-cyan-400/20 p-5">
              <div className="mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4 text-cyan-400" />
                <span className="font-mono text-xs font-semibold text-cyan-400 uppercase tracking-wider">GEM Team</span>
              </div>
              <p className="text-sm text-muted-foreground">Security / Engineering</p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {PERSONNEL.filter((p) => p.company === "GEM").length}
                <span className="ml-1 text-sm font-normal text-muted-foreground">personnel</span>
              </p>
            </div>
            <div className="glass-panel rounded-xl border border-amber-400/20 p-5">
              <div className="mb-2 flex items-center gap-2">
                <Building className="h-4 w-4 text-amber-400" />
                <span className="font-mono text-xs font-semibold text-amber-400 uppercase tracking-wider">ATR Team</span>
              </div>
              <p className="text-sm text-muted-foreground">Real Estate / Operations</p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {PERSONNEL.filter((p) => p.company === "ATR").length}
                <span className="ml-1 text-sm font-normal text-muted-foreground">personnel</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-12 space-y-16">

        {/* ── Department Distribution ── */}
        <section>
          <div className="mb-6 flex items-center gap-3">
            <Activity className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Department Distribution</h2>
            <Badge variant="secondary" className="font-mono text-[10px]">UPDATED</Badge>
          </div>
          <p className="mb-6 text-sm text-muted-foreground">Preview based on Notion-aligned profile model.</p>
          <div className="grid gap-3">
            {deptCounts.map((dept) => (
              <div key={dept.name} className="flex items-center gap-4">
                <span className="w-40 shrink-0 text-right text-xs text-muted-foreground font-mono truncate">{dept.name}</span>
                <div className="flex-1 h-6 bg-muted/30 rounded overflow-hidden">
                  <div
                    className={`h-full rounded transition-all duration-700 ${DEPT_COLORS[dept.name] ?? "bg-primary"} opacity-80`}
                    style={{ width: ready ? `${(dept.count / maxCount) * 100}%` : "0%" }}
                  />
                </div>
                <span className="w-6 text-xs font-mono text-muted-foreground">{dept.count}</span>
                <Badge variant="outline" className={`font-mono text-[10px] ${dept.company === "GEM" ? "border-cyan-400/40 text-cyan-400" : "border-amber-400/40 text-amber-400"}`}>
                  {dept.company}
                </Badge>
              </div>
            ))}
          </div>
        </section>

        {/* ── Team Directory ── */}
        <section>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Team Directory</h2>
              <span className="text-xs text-muted-foreground">Preview cards aligned to the shared Notion team database fields.</span>
            </div>
            <span className="text-xs text-muted-foreground font-mono">Showing {filtered.length} records</span>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-wrap gap-3">
            {/* Unit filter */}
            <div className="flex rounded-lg border border-border/40 overflow-hidden">
              {(["ALL", "GEM", "ATR"] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => { setUnitFilter(u); setDeptFilter("ALL"); setGroupFilter("ALL"); }}
                  className={`px-3 py-1.5 text-xs font-mono font-semibold transition-colors ${
                    unitFilter === u
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {u === "ALL" ? "All Units" : u}
                </button>
              ))}
            </div>

            {/* Dept filter */}
            <div className="relative">
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="appearance-none rounded-lg border border-border/40 bg-card px-3 py-1.5 pr-8 text-xs font-mono text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="ALL">All Departments</option>
                {allDepts.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            </div>

            {/* Group filter */}
            <div className="relative">
              <select
                value={groupFilter}
                onChange={(e) => setGroupFilter(e.target.value)}
                className="appearance-none rounded-lg border border-border/40 bg-card px-3 py-1.5 pr-8 text-xs font-mono text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="ALL">All Groups</option>
                {allGroups.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            </div>
          </div>

          {/* Data contract */}
          <div className="mb-6 glass-panel rounded-lg border border-border/40 px-4 py-2.5">
            <span className="text-[10px] font-mono text-muted-foreground">
              Data contract: <span className="text-foreground/70">Principal Name · Job Title · Company · Department · Group · Email · Phone · Website · Job Description · Photo</span>
            </span>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((person) => (
              <PersonnelCard key={person.id} person={person} />
            ))}
            {filtered.length === 0 && (
              <div className="col-span-3 py-12 text-center text-muted-foreground text-sm font-mono">
                No personnel match current filters.
              </div>
            )}
          </div>
        </section>

        {/* ── System Architecture ── */}
        <section>
          <div className="mb-6 flex items-center gap-3">
            <Cpu className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">System Architecture</h2>
          </div>
          <p className="mb-6 text-sm text-muted-foreground">
            Interactive structural diagram reflecting the planned front end, API layer, source-of-truth data, and AI monitoring layer.
          </p>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Diagram */}
            <div className="glass-panel rounded-2xl border border-border/40 p-6">
              <div className="relative mx-auto" style={{ width: "100%", paddingBottom: "80%" }}>
                <svg
                  className="absolute inset-0 w-full h-full"
                  viewBox="0 0 100 100"
                  style={{ overflow: "visible" }}
                >
                  {/* Edges */}
                  {EDGES.map((edge) => {
                    const fromNode = ARCH_NODES.find((n) => n.id === edge.from)!;
                    const toNode = ARCH_NODES.find((n) => n.id === edge.to)!;
                    const isActive = selectedNode?.id === edge.from || selectedNode?.id === edge.to;
                    return (
                      <line
                        key={`${edge.from}-${edge.to}`}
                        x1={`${fromNode.x}%`} y1={`${fromNode.y}%`}
                        x2={`${toNode.x}%`}  y2={`${toNode.y}%`}
                        strokeWidth={isActive ? "0.6" : "0.3"}
                        stroke={isActive ? "hsl(185 100% 45% / 0.7)" : "hsl(220 12% 40% / 0.4)"}
                        strokeDasharray={isActive ? "0" : "2 2"}
                        className="transition-all duration-300"
                      />
                    );
                  })}
                </svg>
                {/* Nodes */}
                {ARCH_NODES.map((node) => {
                  const c = NODE_COLORS[node.color];
                  const Icon = node.icon;
                  const isSelected = selectedNode?.id === node.id;
                  return (
                    <button
                      key={node.id}
                      onClick={() => setSelectedNode(isSelected ? null : node)}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 transition-all duration-200 group`}
                      style={{ left: `${node.x}%`, top: `${node.y}%` }}
                    >
                      <div className={`w-14 h-14 rounded-2xl border-2 ${c.ring} ${c.bg} flex flex-col items-center justify-center gap-0.5 ${isSelected ? "scale-110 shadow-lg" : "group-hover:scale-105"} transition-transform duration-200`}>
                        <Icon className={`h-5 w-5 ${c.text}`} />
                        <span className={`font-mono text-xs font-bold ${c.text}`}>{node.label}</span>
                      </div>
                      <span className="text-[9px] font-mono text-muted-foreground whitespace-nowrap">{node.sublabel}</span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-center text-[10px] font-mono text-muted-foreground">
                {selectedNode ? `Selected: ${selectedNode.label}` : "Select a node to view specifications."}
              </p>
            </div>

            {/* Spec panel */}
            <div className="flex flex-col gap-4">
              {selectedNode ? (
                <Card className="glass-panel border-border/40 flex-1">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl border-2 ${NODE_COLORS[selectedNode.color].ring} ${NODE_COLORS[selectedNode.color].bg} flex items-center justify-center`}>
                          <selectedNode.icon className={`h-5 w-5 ${NODE_COLORS[selectedNode.color].text}`} />
                        </div>
                        <div>
                          <CardTitle className="text-base">{selectedNode.sublabel}</CardTitle>
                          <p className={`text-xs font-mono ${NODE_COLORS[selectedNode.color].text}`}>{selectedNode.label} Layer</p>
                        </div>
                      </div>
                      <button onClick={() => setSelectedNode(null)} className="text-muted-foreground hover:text-foreground">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{selectedNode.description}</p>
                    <div>
                      <p className="mb-2 text-xs font-mono text-muted-foreground uppercase tracking-wider">Tech Stack</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedNode.tech.map((t) => (
                          <Badge key={t} variant="secondary" className="font-mono text-[10px]">{t}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center glass-panel rounded-2xl border border-border/40 p-8 text-center">
                  <CircleDot className="mb-3 h-8 w-8 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground font-mono">System Overview</p>
                  <p className="mt-1 text-xs text-muted-foreground/60">Select a node in the diagram to view specifications.</p>
                </div>
              )}
              {/* Node legend */}
              <div className="grid grid-cols-2 gap-2">
                {ARCH_NODES.map((n) => {
                  const c = NODE_COLORS[n.color];
                  return (
                    <button
                      key={n.id}
                      onClick={() => setSelectedNode(selectedNode?.id === n.id ? null : n)}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left transition-colors ${selectedNode?.id === n.id ? `${c.ring} ${c.bg}` : "border-border/40 hover:border-border"}`}
                    >
                      <span className={`h-2 w-2 rounded-full ${c.dot}`} />
                      <div>
                        <p className={`text-xs font-mono font-bold ${c.text}`}>{n.label}</p>
                        <p className="text-[10px] text-muted-foreground">{n.sublabel}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ── AI Agent Terminal ── */}
        <section>
          <div className="mb-6 flex items-center gap-3">
            <Terminal className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">AI Agent: Operational Overseer</h2>
          </div>
          <p className="mb-6 text-sm text-muted-foreground">
            Preview terminal. The agent cycles through the current roster model and simulates monitoring and indexing activity.
          </p>

          <div className="glass-panel rounded-2xl border border-border/40 overflow-hidden">
            {/* Terminal bar */}
            <div className="flex items-center justify-between border-b border-border/40 bg-muted/20 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-rose-400/70" />
                  <span className="h-3 w-3 rounded-full bg-amber-400/70" />
                  <span className="h-3 w-3 rounded-full bg-emerald-400/70" />
                </div>
                <span className="font-mono text-xs text-muted-foreground">overseer — agent-0x1a</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`flex items-center gap-1.5 font-mono text-xs ${agentDead ? "text-rose-400" : agentRunning ? "text-amber-400 animate-pulse" : "text-emerald-400"}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${agentDead ? "bg-rose-400" : agentRunning ? "bg-amber-400" : "bg-emerald-400"}`} />
                  {agentDead ? "KILLED" : agentRunning ? "RUNNING" : "STANDBY"}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">Agent-0X1A {agentDead ? "Offline" : "Online"}</span>
              </div>
            </div>

            {/* Terminal body */}
            <div
              ref={termRef}
              className="h-64 overflow-y-auto bg-[hsl(220_15%_8%)] p-4 font-mono text-xs leading-relaxed"
            >
              {agentLog.map((line, i) => (
                <div key={i} className={`${i === agentLog.length - 1 && agentRunning ? "text-cyan-400 animate-pulse" : "text-emerald-300/80"}`}>
                  {line}
                </div>
              ))}
              {agentDead && (
                <div className="mt-1 text-rose-400">◈ KILL SWITCH engaged. Agent-0X1A terminated.</div>
              )}
              {agentLog.length === 0 && (
                <span className="text-muted-foreground/40">Awaiting agent initialization…</span>
              )}
              {/* Cursor */}
              {!agentDead && (
                <span className="inline-block w-2 h-3 bg-cyan-400/70 animate-pulse ml-0.5" />
              )}
            </div>

            {/* Terminal actions */}
            <div className="flex items-center gap-3 border-t border-border/40 bg-muted/10 px-4 py-3">
              <Button
                size="sm"
                variant="outline"
                className="font-mono text-xs border-cyan-400/40 text-cyan-400 hover:bg-cyan-400/10"
                onClick={() => {
                  if (agentDead) return;
                  setAgentLog((l) => [...l, "◈ Avatar injection requested. Awaiting asset URL…"]);
                }}
                disabled={agentDead}
              >
                <Zap className="mr-1.5 h-3 w-3" />
                Inject Avatar
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="font-mono text-xs border-rose-400/40 text-rose-400 hover:bg-rose-400/10"
                onClick={() => {
                  setAgentDead(true);
                  setAgentRunning(false);
                }}
                disabled={agentDead}
              >
                <X className="mr-1.5 h-3 w-3" />
                Kill Switch
              </Button>
              {agentDead && (
                <Button
                  size="sm"
                  variant="outline"
                  className="font-mono text-xs border-emerald-400/40 text-emerald-400 hover:bg-emerald-400/10"
                  onClick={() => {
                    setAgentDead(false);
                    setAgentLog([]);
                    setAgentRunning(true);
                  }}
                >
                  <Activity className="mr-1.5 h-3 w-3" />
                  Restart Agent
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Footer note */}
        <p className="pb-8 text-center text-xs text-muted-foreground font-mono">
          Preview build based on your original GEM &amp; ATR platform layout and the confirmed Notion team schema.
        </p>
      </div>
    </div>
  );
}

// ── Personnel Card ─────────────────────────────────────────────────────────────

function PersonnelCard({ person }: { person: Personnel }) {
  const [expanded, setExpanded] = useState(false);
  const isGem = person.company === "GEM";

  return (
    <Card className="bento-card glass-panel border-border/40 flex flex-col">
      <CardContent className="flex flex-col gap-3 p-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${isGem ? "bg-cyan-400/10 text-cyan-400 border border-cyan-400/30" : "bg-amber-400/10 text-amber-400 border border-amber-400/30"}`}>
            {person.initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-sm text-foreground">{person.name}</p>
            <p className="truncate text-xs text-muted-foreground">{person.title}</p>
            <div className="mt-1.5 flex flex-wrap gap-1">
              <Badge variant="outline" className={`font-mono text-[9px] ${isGem ? "border-cyan-400/40 text-cyan-400" : "border-amber-400/40 text-amber-400"}`}>
                {person.company}
              </Badge>
              <Badge variant="secondary" className="font-mono text-[9px]">{person.group}</Badge>
            </div>
          </div>
        </div>

        {/* Dept */}
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
          <span className={`h-1.5 w-1.5 rounded-full ${DEPT_COLORS[person.department] ?? "bg-primary"}`} />
          {person.department}
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className="space-y-2 border-t border-border/40 pt-3 text-xs text-muted-foreground">
            <p className="text-foreground/80 leading-relaxed">{person.description}</p>
            <div className="flex items-center gap-2">
              <Mail className="h-3 w-3 shrink-0" />
              <a href={`mailto:${person.email}`} className="truncate hover:text-primary transition-colors">{person.email}</a>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-3 w-3 shrink-0" />
              <span>{person.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-3 w-3 shrink-0" />
              <span className="text-muted-foreground/70">{person.website}</span>
            </div>
          </div>
        )}

        {/* Toggle */}
        <button
          onClick={() => setExpanded((e) => !e)}
          className="mt-auto flex items-center gap-1 text-[10px] font-mono text-muted-foreground/60 hover:text-primary transition-colors"
        >
          <Eye className="h-3 w-3" />
          {expanded ? "Hide details" : "View profile"}
        </button>
      </CardContent>
    </Card>
  );
}
