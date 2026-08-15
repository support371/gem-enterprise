import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BellRing,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  CircleGauge,
  Clock3,
  FolderKanban,
  LockKeyhole,
  Plug,
  RefreshCw,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { canOpenProjectEnvironment, projectEnvironments, type ProjectEnvironmentId } from "@/lib/projectWorkspace";
import { cn } from "@/lib/utils";

interface ProjectWorkspaceShellProps {
  environment: ProjectEnvironmentId;
  project: {
    id: string;
    name: string;
    summary: string;
    status: string;
    progress: number;
    workspaceId: string;
    _count: { updates: number };
    updates: Array<{ id: string; weekEnding: Date; status: string; accomplishments: string; inProgress: string }>;
  };
  workspace: {
    id: string;
    name: string;
    organization: { name: string };
    globalEmergencyLock: boolean;
    publishingDisabled: boolean;
    advertisingDisabled: boolean;
    shopWriteDisabled: boolean;
    connectorDisabled: boolean;
    _count: { members: number; connectors: number; approvalRequests: number };
  };
  membership: { role: { name: string } | null };
  permissions: Array<{ action: string; scope: string }>;
}

export function ProjectWorkspaceShell({ environment, project, workspace, membership, permissions }: ProjectWorkspaceShellProps) {
  const available = projectEnvironments.filter((item) => canOpenProjectEnvironment(item, permissions));
  const current = available.find((item) => item.id === environment) ?? available[0];
  const base = `/app/workspace/projects/${encodeURIComponent(project.id)}`;
  const scoped = (href: string) => `${href}${href.includes("?") ? "&" : "?"}workspace=${encodeURIComponent(workspace.id)}&project=${encodeURIComponent(project.id)}`;
  const actions = current.id === "overview"
    ? available.filter((item) => item.id !== "overview").slice(0, 6).map((item) => ({ label: item.label, description: item.description, href: `${base}/${item.id}` }))
    : current.destinations.map((item) => ({ ...item, href: scoped(item.href) }));
  const health = [
    { label: "Workspace access", ready: true, detail: "Membership verified" },
    { label: "Connectors", ready: !workspace.connectorDisabled, detail: workspace.connectorDisabled ? "Disabled by workspace control" : `${workspace._count.connectors} configured` },
    { label: "Publishing", ready: !workspace.publishingDisabled, detail: workspace.publishingDisabled ? "Controlled / disabled" : "Available" },
    { label: "Advertising", ready: !workspace.advertisingDisabled, detail: workspace.advertisingDisabled ? "Controlled / disabled" : "Available" },
  ];
  const metrics = [
    { label: "Project progress", value: `${project.progress}%`, helper: project.status, Icon: CircleGauge },
    { label: "Team members", value: String(workspace._count.members), helper: "active workspace members", Icon: Users },
    { label: "Integrated tools", value: String(workspace._count.connectors), helper: "configured connectors", Icon: Plug },
    { label: "Project updates", value: String(project._count.updates), helper: "recorded reports", Icon: Activity },
  ];

  return <div className="space-y-5 pb-12">
    <header className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 sm:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Link href={`/app/workspace?workspace=${encodeURIComponent(workspace.id)}`} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 text-slate-400 hover:border-cyan-400/30 hover:text-cyan-300" aria-label="Back to organization workspace"><ArrowLeft className="h-4 w-4"/></Link>
          <div className="min-w-0"><p className="truncate text-xs font-semibold uppercase tracking-[.16em] text-cyan-300">{workspace.organization.name} · {workspace.name}</p><h1 className="truncate text-xl font-bold text-white sm:text-2xl">{project.name}</h1></div>
        </div>
        <div className="flex flex-wrap items-center gap-2"><Badge className="border-emerald-400/25 bg-emerald-400/10 text-emerald-300"><span className="mr-2 h-1.5 w-1.5 rounded-full bg-emerald-300"/>Live workspace</Badge><Badge variant="outline" className="border-white/15 text-slate-300">{membership.role?.name ?? "Member"}</Badge><Link href={base} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-cyan-400/30"><RefreshCw className="h-3.5 w-3.5"/>Project home</Link></div>
      </div>
    </header>

    <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-950/50 p-2"><nav aria-label="Project environments" className="flex min-w-max gap-1">{available.map((item)=><Link key={item.id} href={item.id === "overview" ? base : `${base}/${item.id}`} className={cn("rounded-lg px-3 py-2 text-xs font-medium transition",item.id===current.id?"bg-cyan-300 text-slate-950":"text-slate-400 hover:bg-white/5 hover:text-white")}>{item.label}</Link>)}</nav></div>

    <section className="overflow-hidden rounded-2xl border border-cyan-400/20 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,.13),transparent_38%),linear-gradient(145deg,rgba(15,23,42,.98),rgba(2,6,23,.98))] p-5 sm:p-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-cyan-300">{current.audience}</p><h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">{current.label} dashboard</h2><p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">{current.description}</p></div><Badge variant="outline" className="w-fit border-white/15 text-slate-300"><ShieldCheck className="mr-1.5 h-3.5 w-3.5"/>Project scoped</Badge></div>
    </section>

    <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">{metrics.map(({label,value,helper,Icon})=><article key={label} className="rounded-2xl border border-white/10 bg-card p-4 sm:p-5"><div className="flex items-start justify-between"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-400/10"><Icon className="h-4 w-4 text-cyan-300"/></span></div><p className="mt-4 text-2xl font-bold text-white sm:text-3xl">{value}</p><p className="mt-1 text-xs text-slate-500">{helper}</p></article>)}</section>

    <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-5">
        <article className="rounded-2xl border border-white/10 bg-card p-5">
          <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-cyan-300">Delivery intelligence</p><h3 className="mt-1 text-lg font-bold text-white">Project activity and readiness</h3></div><Badge variant="outline" className="border-white/10 text-slate-400">Authoritative records</Badge></div>
          <div className="mt-6"><div className="mb-2 flex justify-between text-xs text-slate-400"><span>Recorded project progress</span><span>{project.progress}%</span></div><div className="h-3 rounded-full bg-white/10"><div className="h-3 rounded-full bg-gradient-to-r from-cyan-500 to-cyan-300" style={{width:`${project.progress}%`}}/></div></div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">{health.map((item)=><div key={item.label} className="flex items-start gap-3 rounded-xl border border-white/8 bg-black/15 p-4">{item.ready?<CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300"/>:<LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-amber-300"/>}<div><p className="text-sm font-semibold text-white">{item.label}</p><p className="mt-1 text-xs text-slate-500">{item.detail}</p></div></div>)}</div>
        </article>

        <article className="overflow-hidden rounded-2xl border border-white/10 bg-card">
          <div className="flex items-center justify-between border-b border-white/10 p-5"><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-cyan-300">Recent activity</p><h3 className="mt-1 text-lg font-bold text-white">Project reporting feed</h3></div><Link href={scoped("/app/workspace")} className="text-xs font-semibold text-cyan-300">View workspace</Link></div>
          {project.updates.length ? <div className="divide-y divide-white/8">{project.updates.map((update)=><div key={update.id} className="grid gap-3 p-4 sm:grid-cols-[150px_1fr_auto] sm:items-center"><div className="flex items-center gap-2 text-xs text-slate-400"><Clock3 className="h-3.5 w-3.5"/>{new Date(update.weekEnding).toLocaleDateString()}</div><div><p className="text-sm font-medium text-white">{update.accomplishments}</p><p className="mt-1 line-clamp-1 text-xs text-slate-500">In progress: {update.inProgress}</p></div><Badge variant="outline" className="w-fit border-white/10 text-slate-400">{update.status}</Badge></div>)}</div> : <div className="flex min-h-48 flex-col items-center justify-center p-8 text-center"><BellRing className="h-7 w-7 text-slate-600"/><p className="mt-3 font-medium text-white">No project updates yet</p><p className="mt-1 max-w-md text-sm text-slate-500">The feed will use real weekly reports when assigned members submit them.</p></div>}
        </article>
      </div>

      <aside className="space-y-5">
        <article className="rounded-2xl border border-white/10 bg-card p-4"><div className="mb-4"><p className="text-xs font-semibold uppercase tracking-[.16em] text-cyan-300">Quick actions</p><h3 className="mt-1 font-bold text-white">{current.label} tools</h3></div><div className="space-y-2">{actions.map((action)=><Link key={`${action.href}:${action.label}`} href={action.href} className="group flex items-start gap-3 rounded-xl border border-white/8 bg-black/15 p-3.5 transition hover:border-cyan-400/25"><BriefcaseBusiness className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300"/><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-white">{action.label}</span><span className="mt-1 block text-xs leading-5 text-slate-500">{action.description}</span></span><ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-600 group-hover:text-cyan-300"/></Link>)}</div></article>
        <article className="rounded-2xl border border-white/10 bg-card p-4"><p className="text-xs font-semibold uppercase tracking-[.16em] text-cyan-300">Integrations</p><h3 className="mt-1 font-bold text-white">Workspace connection state</h3><div className="mt-4 space-y-3"><div className="flex items-center justify-between rounded-xl border border-white/8 p-3"><span className="text-sm text-slate-300">Configured connectors</span><strong className="text-white">{workspace._count.connectors}</strong></div><div className="flex items-center justify-between rounded-xl border border-white/8 p-3"><span className="text-sm text-slate-300">Approval records</span><strong className="text-white">{workspace._count.approvalRequests}</strong></div><Link href={scoped("/app/social-media/accounts")} className="flex items-center justify-between rounded-xl border border-cyan-400/20 bg-cyan-400/[.04] p-3 text-sm font-semibold text-cyan-200">Manage integrations <ArrowRight className="h-4 w-4"/></Link></div></article>
      </aside>
    </section>

    <section className="grid gap-3 sm:grid-cols-3"><div className="flex gap-3 rounded-xl border border-white/10 bg-white/[.02] p-4"><Building2 className="h-5 w-5 text-cyan-300"/><div><p className="text-sm font-medium text-white">Workspace anchored</p><p className="mt-1 text-xs text-slate-500">Every page returns to this project.</p></div></div><div className="flex gap-3 rounded-xl border border-white/10 bg-white/[.02] p-4"><Users className="h-5 w-5 text-cyan-300"/><div><p className="text-sm font-medium text-white">Membership scoped</p><p className="mt-1 text-xs text-slate-500">Assigned members only.</p></div></div><div className="flex gap-3 rounded-xl border border-white/10 bg-white/[.02] p-4"><FolderKanban className="h-5 w-5 text-cyan-300"/><div><p className="text-sm font-medium text-white">Environment tailored</p><p className="mt-1 text-xs text-slate-500">Tools match the page and work.</p></div></div></section>
  </div>;
}
