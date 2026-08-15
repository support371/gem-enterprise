import Link from "next/link";
import {
  ArrowRight,
  Blocks,
  BriefcaseBusiness,
  Building2,
  CircleDollarSign,
  Code2,
  Factory,
  FolderKanban,
  Gauge,
  Megaphone,
  Settings2,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const environments = [
  { label: "Production", detail: "Delivery, content, video and approvals", icon: Factory },
  { label: "Development", detail: "APIs, integrations, testing and releases", icon: Code2 },
  { label: "Marketing", detail: "Campaigns, social, news and audience", icon: Megaphone },
  { label: "Sales", detail: "Requests, services and client follow-through", icon: BriefcaseBusiness },
  { label: "Finance", detail: "Budgets, products, records and controls", icon: CircleDollarSign },
  { label: "Team", detail: "Members, meetings and weekly reporting", icon: Users },
  { label: "Client hub", detail: "Progress, deliverables, requests and support", icon: Building2 },
  { label: "Tools", detail: "Connected services and project utilities", icon: Blocks },
  { label: "Monitoring", detail: "Activity, readiness, analytics and alerts", icon: Gauge },
  { label: "Administration", detail: "Scoped access, controls and governance", icon: Settings2 },
];

export function ProjectWorkspaceShowcase() {
  return <section className="border-y border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,.08),transparent_38%),rgba(255,255,255,.015)] py-24">
    <div className="container mx-auto max-w-7xl px-6">
      <div className="grid gap-12 xl:grid-cols-[.85fr_1.15fr] xl:items-start">
        <div className="xl:sticky xl:top-24">
          <Badge className="mb-5 border-cyan-400/25 bg-cyan-400/10 text-cyan-300">PROJECT-CENTERED PLATFORM</Badge>
          <h2 className="text-4xl font-black leading-tight text-white md:text-5xl">One project home. Every operating environment.</h2>
          <p className="mt-6 text-lg leading-8 text-slate-400">GEM gives each approved organization a private workspace. Every project inside it receives dedicated environments, integrated tools, assigned people, controlled tasks, and a clear route back to its project home.</p>
          <div className="mt-8 space-y-3 text-sm text-slate-300">
            {["Organization membership defines the data boundary","Project roles define what each person can view or manage","Super-admin governance assigns access and receives approved reporting"].map((item)=><div key={item} className="flex gap-3 rounded-xl border border-white/10 bg-black/15 p-4"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300"/><span>{item}</span></div>)}
          </div>
          <div className="mt-8 flex flex-wrap gap-3"><Button asChild className="bg-cyan-300 text-slate-950 hover:bg-cyan-200"><Link href="/get-started">Create your access path <ArrowRight className="ml-2 h-4 w-4"/></Link></Button><Button asChild variant="outline" className="border-white/15 text-white"><Link href="/client-login">Open your workspace</Link></Button></div>
        </div>

        <div>
          <div className="mb-5 grid gap-3 sm:grid-cols-3">
            {[{label:"Organization",icon:Building2},{label:"Workspace",icon:FolderKanban},{label:"Project home",icon:Gauge}].map(({label,icon:Icon},index)=><div key={label} className="relative rounded-2xl border border-cyan-400/20 bg-slate-950/70 p-4 text-center"><Icon className="mx-auto h-5 w-5 text-cyan-300"/><p className="mt-2 text-sm font-semibold text-white">{label}</p>{index<2&&<ArrowRight className="absolute -right-5 top-1/2 z-10 hidden h-4 w-4 text-cyan-400 sm:block"/>}</div>)}
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-950/55 p-4 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-cyan-300">Tailored project workspace</p><h3 className="mt-1 text-xl font-bold text-white">Dedicated environments and integrated tools</h3></div><Badge variant="outline" className="hidden border-white/15 text-slate-400 sm:flex">Role scoped</Badge></div>
            <div className="grid gap-3 sm:grid-cols-2">{environments.map(({label,detail,icon:Icon})=><article key={label} className="rounded-xl border border-white/10 bg-white/[.025] p-4 transition hover:border-cyan-400/25"><div className="flex items-start gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10"><Icon className="h-4 w-4 text-cyan-300"/></span><div><h4 className="text-sm font-semibold text-white">{label}</h4><p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p></div></div></article>)}</div>
          </div>
          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/[.05] p-4"><Settings2 className="h-5 w-5 shrink-0 text-amber-300"/><p className="text-sm leading-6 text-slate-300"><strong className="text-white">Governance loop:</strong> assignments, approvals, workspace health, and approved highlights return to the Super Admin Center without granting cross-client access.</p></div>
        </div>
      </div>
    </div>
  </section>;
}
