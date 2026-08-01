import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Database,
  Gauge,
  RefreshCcw,
  ShieldCheck,
} from "lucide-react";
import { getSocialMediaProviderReadiness } from "@/lib/social-media/providers";

const sourceClasses = [
  ["LIVE PROVIDER", "Returned directly by an authorized provider connection."],
  ["IMPORTED", "Uploaded or synchronized from a documented external report."],
  ["CALCULATED", "Derived from recorded source values with a defined calculation."],
  ["UNKNOWN", "Unavailable or unverified; never silently replaced by an estimate."],
] as const;

const learningLoop = [
  ["Observe", "Collect verified channel results, content outcomes, and operational blockers."],
  ["Compare", "Separate platform, format, topic, audience, timing, and destination effects."],
  ["Learn", "Promote useful patterns without converting correlation into unsupported claims."],
  ["Plan", "Feed approved lessons into the next campaign while retaining source and approval history."],
] as const;

export default function SocialMediaAnalyticsPage() {
  const providers = getSocialMediaProviderReadiness();
  const configured = providers.filter((provider) => provider.configurationReady).length;
  const liveReady = providers.filter((provider) => provider.externalWriteAllowed).length;
  const approvalBlocked = providers.filter(
    (provider) => provider.platformApprovalRequired && !provider.platformApprovalGranted,
  ).length;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-white/10 bg-card/75 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Channels</p>
            <BarChart3 className="h-4 w-4 text-sky-200" />
          </div>
          <p className="mt-3 text-3xl font-bold text-white">{providers.length}</p>
          <p className="mt-2 text-sm text-slate-400">Registered analytics destinations</p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-card/75 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Configured</p>
            <Database className="h-4 w-4 text-cyan-300" />
          </div>
          <p className="mt-3 text-3xl font-bold text-cyan-300">{configured}</p>
          <p className="mt-2 text-sm text-slate-400">Connections with application configuration</p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-card/75 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Live-ready</p>
            <Activity className="h-4 w-4 text-emerald-300" />
          </div>
          <p className="mt-3 text-3xl font-bold text-emerald-300">{liveReady}</p>
          <p className="mt-2 text-sm text-slate-400">Destinations passing every current gate</p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-card/75 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Approval blocks</p>
            <Gauge className="h-4 w-4 text-amber-200" />
          </div>
          <p className="mt-3 text-3xl font-bold text-amber-200">{approvalBlocked}</p>
          <p className="mt-2 text-sm text-slate-400">Provider approvals still outstanding</p>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <article className="rounded-2xl border border-white/10 bg-card/75 p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <RefreshCcw className="h-5 w-5 text-sky-200" />
            <h2 className="text-lg font-bold text-white">Cross-platform learning loop</h2>
          </div>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            Analytics becomes useful only when its origin and limits are visible. GEM keeps provider data,
            imports, calculations, and unavailable values separate before feeding lessons into future plans.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {learningLoop.map(([label, description], index) => (
              <div key={label} className="rounded-xl border border-white/8 bg-white/[0.025] p-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-500/10 text-xs font-bold text-sky-200">
                  {index + 1}
                </div>
                <h3 className="mt-3 text-sm font-semibold text-white">{label}</h3>
                <p className="mt-2 text-xs leading-5 text-slate-500">{description}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-fuchsia-500/15 bg-fuchsia-500/[0.05] p-5 sm:p-6">
          <div className="flex items-center gap-2 text-fuchsia-200">
            <BarChart3 className="h-5 w-5" />
            <h2 className="font-semibold">TikTok analytics workspace</h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-fuchsia-100/70">
            TokMetric provides the detailed TikTok view, including source-labeled account and content metrics,
            publishing context, approval history, and operational readiness.
          </p>
          <Link
            href="/tokmetric/analytics"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-fuchsia-200 hover:text-fuchsia-100"
          >
            Open TikTok analytics <ArrowRight className="h-4 w-4" />
          </Link>
        </article>
      </section>

      <section className="rounded-2xl border border-white/10 bg-card/75 p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-300" />
          <h2 className="text-lg font-bold text-white">Metric source labels</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {sourceClasses.map(([label, description]) => (
            <div key={label} className="rounded-xl border border-white/8 bg-white/[0.025] p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                <h3 className="text-xs font-semibold uppercase tracking-[0.1em] text-white">{label}</h3>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
