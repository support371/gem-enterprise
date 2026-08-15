import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { LiveCommandCenterSnapshot } from "@/components/command-center/LiveCommandCenterSnapshot";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { commandCenterSections, type CommandCenterSection } from "@/lib/commandCenter";
import { getCommandCenterWorkspace } from "@/lib/commandCenterNavigation";

const focusedSections = new Set<CommandCenterSection>([
  "development",
  "marketing",
  "sales",
  "monitoring",
  "teams",
  "support",
]);

export function isFocusedOperationsSection(section: CommandCenterSection) {
  return focusedSections.has(section);
}

export function FocusedOperationsWorkspace({ section }: { section: CommandCenterSection }) {
  const workspace = getCommandCenterWorkspace(section);
  if (!workspace) return null;
  const meta = commandCenterSections[section];

  return (
    <div className="space-y-6">
      {section === "monitoring" ? <LiveCommandCenterSnapshot /> : null}

      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
          <Badge className="border-cyan-400/20 bg-cyan-400/10 text-cyan-300">{workspace.audience}</Badge>
          <h2 className="mt-4 text-xl font-bold text-white">{meta.title} workspace</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">{workspace.outcome}</p>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {workspace.destinations.map((destination) => (
              <Link
                key={destination.href}
                href={destination.href}
                className="group rounded-xl border border-white/10 bg-black/10 p-4 transition hover:border-cyan-400/30 hover:bg-cyan-400/[0.04]"
              >
                <p className="font-semibold text-white">{destination.label}</p>
                <p className="mt-2 text-xs leading-5 text-slate-500">{destination.description}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-cyan-300">
                  Open page <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </div>

        <aside className="rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.04] p-5 sm:p-6">
          <div className="flex items-center gap-2 text-cyan-300">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            <h2 className="font-bold text-white">Operating direction</h2>
          </div>
          <ol className="mt-5 space-y-4">
            {[
              "Open the dedicated system that owns the task.",
              "Work only inside the assigned organization or platform scope.",
              "Use the existing approval, audit, and escalation path before high-impact action.",
            ].map((step, index) => (
              <li key={step} className="flex gap-3 text-sm leading-6 text-slate-400">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/10 text-xs font-bold text-cyan-300">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
          <div className="mt-6 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.04] p-3 text-xs leading-5 text-emerald-200/80">
            <CheckCircle2 className="mr-2 inline h-4 w-4" aria-hidden="true" />
            Pages guide users to existing controlled workflows; they do not grant new roles, permissions, or entitlements.
          </div>
          <Button asChild variant="outline" size="sm" className="mt-5 w-full border-white/10 text-slate-200 hover:bg-white/[0.07]">
            <Link href="/app/command-center">Return to operations directory</Link>
          </Button>
        </aside>
      </section>
    </div>
  );
}
