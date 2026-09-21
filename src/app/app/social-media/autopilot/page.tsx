import {
  Activity,
  Clock3,
  Gauge,
  Network,
  ShieldCheck,
} from "lucide-react";
import {
  getSocialAutopilotEgressPolicy,
  getSocialAutopilotProviderPolicies,
  socialAutopilotAutoApprovalEnabled,
  socialAutopilotEnabled,
} from "@/lib/social-media/autopilot/policy";
import {
  globalSocialPublishingEnabled,
  providerSocialPublishingEnabled,
} from "@/lib/social-media/publishing/gates";

function label(provider: string) {
  return provider
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export default function SocialAutopilotPage() {
  const policies = getSocialAutopilotProviderPolicies();
  const enabled = socialAutopilotEnabled();
  const autoApproval = socialAutopilotAutoApprovalEnabled();
  const globalLive = globalSocialPublishingEnabled();
  const totalDailyTarget = policies.reduce(
    (total, policy) => total + policy.dailyTarget,
    0,
  );
  let egress:
    | ReturnType<typeof getSocialAutopilotEgressPolicy>
    | { mode: "BLOCKED"; region?: string; stableIdentityRequired: true; rotatingProxyAllowed: false };
  try {
    egress = getSocialAutopilotEgressPolicy();
  } catch {
    egress = {
      mode: "BLOCKED",
      stableIdentityRequired: true,
      rotatingProxyAllowed: false,
    };
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-white/10 bg-card/75 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Autopilot
            </p>
            <Activity className="h-4 w-4 text-cyan-300" />
          </div>
          <p className="mt-3 text-2xl font-bold text-white">
            {enabled ? "Enabled" : "Disabled"}
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Automated planning and queue replenishment
          </p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-card/75 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Daily target
            </p>
            <Gauge className="h-4 w-4 text-violet-200" />
          </div>
          <p className="mt-3 text-2xl font-bold text-white">{totalDailyTarget}</p>
          <p className="mt-2 text-sm text-slate-400">
            Cross-platform deliveries before hard caps
          </p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-card/75 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Reserve
            </p>
            <Clock3 className="h-4 w-4 text-amber-200" />
          </div>
          <p className="mt-3 text-2xl font-bold text-white">
            {Math.max(...policies.map((policy) => policy.reserveDays))} days
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Rolling future content buffer
          </p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-card/75 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Live writes
            </p>
            <ShieldCheck className="h-4 w-4 text-emerald-300" />
          </div>
          <p className="mt-3 text-2xl font-bold text-white">
            {globalLive ? "Globally allowed" : "Locked"}
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Provider gates remain independently authoritative
          </p>
        </article>
      </section>

      <section className="rounded-2xl border border-cyan-500/15 bg-cyan-500/[0.05] p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <Network className="h-5 w-5 text-cyan-300" />
          <h2 className="text-lg font-bold text-white">
            Autonomous publishing policy
          </h2>
        </div>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-400">
          Clean PASS content can receive an exact-version automated policy decision,
          enter the provider queue, and publish when its scheduled slot is due and
          every account, scope, emergency-lock, and live-provider gate passes.
          Warnings and blocked reviews remain outside autonomous approval.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-slate-300">
            Auto policy: {autoApproval ? "enabled" : "disabled"}
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-slate-300">
            Egress: {egress.mode}
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-slate-300">
            Rotating proxy: prohibited
          </span>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {policies.map((policy) => (
          <article
            key={policy.provider}
            className="rounded-2xl border border-white/10 bg-card/75 p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-white">
                  {label(policy.provider)}
                </h3>
                <p className="mt-2 text-sm text-slate-400">
                  {policy.dailyTarget}/day target · {policy.hardDailyCap}/day hard cap ·
                  {" "}{policy.minSpacingMinutes} minute minimum spacing
                </p>
              </div>
              <span
                className={
                  providerSocialPublishingEnabled(policy.provider)
                    ? "rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-200"
                    : "rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-200"
                }
              >
                {providerSocialPublishingEnabled(policy.provider)
                  ? "provider live gate on"
                  : "provider live gate off"}
              </span>
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-500">
              Reserve: {policy.reserveDays} days. Automatic approval applies only to
              clean compliance PASS results and an exact content-version hash.
            </p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-amber-500/15 bg-amber-500/[0.05] p-5 text-sm leading-6 text-amber-100/75">
        TikTok/TokMetric and the existing Telegram publisher remain separate
        provider lanes. Autopilot does not use browser automation, rotating
        residential/mobile proxies, fake engagement, or account-behavior simulation.
      </section>
    </div>
  );
}
