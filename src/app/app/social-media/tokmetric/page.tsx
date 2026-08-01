import Link from "next/link";
import {
  BarChart3,
  Bot,
  CalendarDays,
  CheckCircle2,
  Code2,
  FileCheck2,
  KeyRound,
  LockKeyhole,
  RadioTower,
  ShieldCheck,
  UsersRound,
  Video,
} from "lucide-react";
import { TokMetricConnectorPanel } from "@/components/tokmetric/TokMetricConnectorPanel";
import { TokMetricGptCredentialManager } from "@/components/tokmetric/TokMetricGptCredentialManager";

const modules = [
  {
    href: "/tokmetric/dashboard",
    label: "Operations Dashboard",
    description: "Connector state, approval readiness, compliance posture, and publishing blockers.",
    icon: BarChart3,
  },
  {
    href: "/tokmetric/accounts",
    label: "TikTok Accounts",
    description: "OAuth-only connections for Organic, Shop, Business, advertiser, and developer accounts.",
    icon: KeyRound,
  },
  {
    href: "/tokmetric/content-studio",
    label: "TikTok Content Studio",
    description: "Campaigns, scripts, captions, media versions, hashtags, covers, and schedules.",
    icon: Video,
  },
  {
    href: "/tokmetric/compliance",
    label: "Compliance Center",
    description: "Commercial disclosures, claims, copyright, music rights, privacy, and policy review.",
    icon: FileCheck2,
  },
  {
    href: "/tokmetric/approvals",
    label: "Approval Center",
    description: "Human decisions tied to exact content versions, hashes, accounts, and settings.",
    icon: UsersRound,
  },
  {
    href: "/tokmetric/publishing",
    label: "Publishing Queue",
    description: "Controlled jobs, prerequisites, idempotency, emergency locks, and external status.",
    icon: RadioTower,
  },
  {
    href: "/tokmetric/analytics",
    label: "TikTok Analytics",
    description: "Source-labeled metrics that separate live, imported, calculated, and unknown data.",
    icon: CalendarDays,
  },
  {
    href: "/tokmetric/developer",
    label: "Developer & GPT Controls",
    description: "OAuth callbacks, APIs, webhooks, logs, rate limits, and Custom GPT Action readiness.",
    icon: Code2,
  },
  {
    href: "/tokmetric/agents",
    label: "Specialized AI Agents",
    description: "Controlled strategist, script writer, quality reviewer, and publishing coordinator workflows.",
    icon: Bot,
  },
] as const;

const controlState = [
  ["Native GEM Enterprise module", "READY"],
  ["Custom GPT Action contracts", "READY"],
  ["Bearer credential management", "READY"],
  ["TikTok OAuth authorization", "AUTHORIZATION REQUIRED"],
  ["Human approval enforcement", "ENABLED"],
  ["Live publishing", "LOCKED"],
] as const;

function StateBadge({ state }: { state: string }) {
  const ready = ["READY", "ENABLED"].includes(state);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] ${
        ready
          ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
          : "border-amber-500/25 bg-amber-500/10 text-amber-300"
      }`}
    >
      {ready ? <CheckCircle2 className="h-3.5 w-3.5" /> : <LockKeyhole className="h-3.5 w-3.5" />}
      {state}
    </span>
  );
}

export default function SocialMediaTokMetricPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-fuchsia-500/15 bg-gradient-to-br from-fuchsia-500/[0.08] via-card/80 to-cyan-500/[0.06] p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-start">
          <div className="max-w-4xl">
            <div className="flex items-center gap-2 text-fuchsia-200">
              <Video className="h-5 w-5" />
              <h2 className="text-lg font-bold text-white">TokMetric — full TikTok management</h2>
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              Manage TikTok and TikTok Shop account authorization, content production, compliance, exact-version
              approvals, publishing preparation, analytics, developer controls, and specialized AI agents from one
              complete website page.
            </p>
          </div>
          <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/[0.05] p-4 text-sm leading-6 text-emerald-100/75 xl:max-w-sm">
            <div className="mb-2 flex items-center gap-2 font-semibold text-emerald-300">
              <ShieldCheck className="h-4 w-4" />
              Governed module
            </div>
            Account connection, approval, and publishing authority remain separate controls.
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {modules.map(({ href, label, description, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group rounded-2xl border border-white/10 bg-card/75 p-5 transition hover:border-fuchsia-500/25 hover:bg-fuchsia-500/[0.04]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fuchsia-500/10">
              <Icon className="h-5 w-5 text-fuchsia-200" />
            </div>
            <h3 className="mt-5 font-semibold text-white group-hover:text-fuchsia-100">{label}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
          </Link>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <TokMetricConnectorPanel />

        <article className="rounded-2xl border border-white/10 bg-card/75 p-5">
          <div className="mb-5 flex items-center gap-2">
            <Bot className="h-5 w-5 text-fuchsia-200" />
            <h2 className="text-lg font-bold text-white">Module controls</h2>
          </div>
          <div className="space-y-3">
            {controlState.map(([label, state]) => (
              <div
                key={label}
                className="flex flex-col gap-2 rounded-xl border border-white/8 bg-white/[0.025] p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="text-sm text-slate-300">{label}</span>
                <StateBadge state={state} />
              </div>
            ))}
          </div>
        </article>
      </section>

      <TokMetricGptCredentialManager />
    </div>
  );
}
