import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  ClipboardList,
  FileText,
  PieChart,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const allocationDomains = [
  {
    label: "Cybersecurity",
    description: "Review client access to cyber intelligence, support, and monitoring workflows.",
    href: "/app/admin/users",
    icon: ShieldCheck,
    tone: "text-cyan-400 bg-cyan-500/10",
  },
  {
    label: "Financial Shield",
    description: "Review protected-asset workflows, portfolio visibility, and service request routing.",
    href: "/app/portfolios",
    icon: Briefcase,
    tone: "text-purple-400 bg-purple-500/10",
  },
  {
    label: "ATR Property Trust",
    description: "Review property-trust access, document readiness, and consultation routing.",
    href: "/app/products/real-estate",
    icon: Building2,
    tone: "text-yellow-400 bg-yellow-500/10",
  },
];

const reviewSteps = [
  "Confirm client KYC and compliance status.",
  "Review entitlement and service-domain eligibility.",
  "Route allocation-related changes through requests or meetings.",
  "Capture approval evidence through audit and admin review flows.",
];

export default function AllocationsPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-xs font-mono uppercase tracking-wider text-cyan-400">
            <PieChart className="h-3.5 w-3.5" /> Allocation Governance
          </div>
          <h1 className="text-2xl font-bold text-white">Allocations</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">
            Review service-domain access, entitlement routing, and portfolio governance without displaying unverifiable platform AUM or simulated client balances.
          </p>
        </div>
        <Badge className="border-yellow-500/25 bg-yellow-500/15 text-yellow-400">Human Review Gate</Badge>
      </div>

      <section className="grid gap-5 md:grid-cols-3">
        {allocationDomains.map(({ label, description, href, icon: Icon, tone }) => {
          const [textClass, bgClass] = tone.split(" ");
          return (
            <Link key={label} href={href} className="glass-panel bento-card rounded-2xl p-6 transition hover:border-cyan-500/30">
              <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl ${bgClass}`}>
                <Icon className={`h-6 w-6 ${textClass}`} />
              </div>
              <h2 className="text-lg font-bold text-white">{label}</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{description}</p>
              <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-cyan-400">
                Open workflow <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          );
        })}
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
        <div className="mb-6 flex items-center gap-3">
          <ClipboardList className="h-5 w-5 text-cyan-400" />
          <div>
            <h2 className="text-xl font-bold text-white">Allocation Review Workflow</h2>
            <p className="mt-1 text-sm text-slate-400">Use existing admin, KYC, request, and audit systems before making entitlement changes.</p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          {reviewSteps.map((step, index) => (
            <div key={step} className="rounded-2xl border border-white/10 bg-background/60 p-4">
              <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-full border border-cyan-500/25 bg-cyan-500/10 font-mono text-xs text-cyan-400">
                {String(index + 1).padStart(2, "0")}
              </div>
              <p className="text-sm leading-relaxed text-slate-300">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        {[
          { title: "User Access", body: "Review roles, active status, and account posture before entitlement changes.", href: "/app/admin/users", icon: Users },
          { title: "Audit Evidence", body: "Review administrative and compliance evidence before sensitive changes.", href: "/app/admin/audit", icon: FileText },
          { title: "Approval Queue", body: "Review pending KYC and manual approvals before access activation.", href: "/app/admin/approvals", icon: CheckCircle2 },
        ].map(({ title, body, href, icon: Icon }) => (
          <Link key={title} href={href} className="rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-cyan-500/30">
            <Icon className="mb-4 h-6 w-6 text-cyan-400" />
            <h3 className="text-base font-bold text-white">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{body}</p>
            <p className="mt-5 flex items-center gap-2 text-sm font-semibold text-cyan-400">Open surface <ArrowRight className="h-4 w-4" /></p>
          </Link>
        ))}
      </section>
    </div>
  );
}
