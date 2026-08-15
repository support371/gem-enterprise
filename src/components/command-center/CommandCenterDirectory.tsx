import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BadgeDollarSign,
  Bot,
  Building2,
  Code2,
  HeadphonesIcon,
  LineChart,
  Megaphone,
  MonitorCog,
  Plug,
  Scale,
  ShieldAlert,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  commandCenterNavigationGroups,
  commandCenterSections,
  type CommandCenterSection,
} from "@/lib/commandCenter";
import {
  commandCenterRoleDirections,
  commandCenterWorkspaces,
} from "@/lib/commandCenterNavigation";

const sectionIcons: Record<CommandCenterSection, LucideIcon> = {
  overview: Activity,
  executive: LineChart,
  development: Code2,
  marketing: Megaphone,
  sales: Building2,
  monitoring: MonitorCog,
  security: ShieldAlert,
  compliance: Scale,
  revenue: BadgeDollarSign,
  clients: Building2,
  teams: Users,
  support: HeadphonesIcon,
  agents: Bot,
  integrations: Plug,
};

const audienceBySection = new Map(
  commandCenterWorkspaces.map((workspace) => [workspace.section, workspace.audience]),
);

function sectionHref(section: CommandCenterSection) {
  return section === "overview" ? "/app/command-center" : `/app/command-center/${section}`;
}

export function CommandCenterDirectory() {
  return (
    <div className="space-y-8">
      <section aria-labelledby="role-directions-title">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Start in the right place</p>
        <h2 id="role-directions-title" className="mt-1 text-xl font-bold text-white">Directions by responsibility</h2>
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {commandCenterRoleDirections.map((item) => (
            <article key={item.role} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <Badge className="border-cyan-400/20 bg-cyan-400/10 text-cyan-300">{item.role}</Badge>
              <p className="mt-4 text-sm leading-6 text-slate-400">{item.direction}</p>
              <Link href={item.startHref} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-200">
                Open {item.startLabel} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="operating-pages-title">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Focused SaaS workspaces</p>
        <h2 id="operating-pages-title" className="mt-1 text-xl font-bold text-white">Choose one operating area</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
          Each page keeps one type of work together. Use this directory instead of loading every operational dataset into one dashboard.
        </p>

        <div className="mt-5 space-y-6">
          {commandCenterNavigationGroups.map((group) => (
            <div key={group.label}>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{group.label}</h3>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {group.sections.filter((section) => section !== "overview").map((section) => {
                  const meta = commandCenterSections[section];
                  const Icon = sectionIcons[section];
                  return (
                    <Link
                      key={section}
                      href={sectionHref(section)}
                      className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:-translate-y-0.5 hover:border-cyan-400/30 hover:bg-white/[0.055]"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <h4 className="mt-4 font-bold text-white">{meta.title}</h4>
                      <p className="mt-2 text-sm leading-6 text-slate-400">{meta.description}</p>
                      <p className="mt-3 text-xs text-slate-500">
                        {audienceBySection.get(section) ?? "Authorized leadership and operating teams"}
                      </p>
                      <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300">
                        Open workspace <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
