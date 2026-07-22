import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  KeyRound,
  Megaphone,
  Plug,
  ShieldCheck,
} from "lucide-react";
import { getSocialMediaProviderReadiness } from "@/lib/social-media/providers";

export const metadata: Metadata = {
  title: "Integrations | GEM Enterprise Command Center",
  description: "Governed connector readiness and activation controls for GEM Enterprise.",
};

export default function IntegrationsCommandCenterPage() {
  const socialProviders = getSocialMediaProviderReadiness();
  const configured = socialProviders.filter((provider) => provider.configurationReady).length;

  const integrationCards = [
    {
      href: "/app/command-center/social-media",
      title: "Social Media Operations",
      description:
        "TikTok, Facebook Pages, Instagram professional accounts, X, Nextdoor, Indeed Employer, LinkedIn, and YouTube readiness.",
      icon: Megaphone,
      status: `${configured}/${socialProviders.length} configured`,
    },
    {
      href: "/app/command-center/tokmetric",
      title: "TokMetric",
      description:
        "TikTok OAuth, content production, compliance, exact-version approvals, publishing preflight, analytics, and audit controls.",
      icon: Bot,
      status: "External publishing locked",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-cyan-500/15 bg-gradient-to-br from-cyan-500/[0.09] via-card/80 to-violet-500/[0.06] p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/10">
            <Plug className="h-6 w-6 text-cyan-300" />
          </div>
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              Governed connectors
            </div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">Integration Command Center</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
              Review configuration readiness, authorization requirements, live gates, account scope,
              and the exact controls that must pass before any external action is permitted.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {integrationCards.map(({ href, title, description, icon: Icon, status }) => (
          <Link
            key={href}
            href={href}
            className="group rounded-2xl border border-white/10 bg-card/75 p-5 transition hover:border-cyan-500/30 hover:bg-cyan-500/[0.05]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10">
                <Icon className="h-5 w-5 text-cyan-300" />
              </div>
              <ArrowRight className="h-5 w-5 text-slate-600 transition group-hover:translate-x-1 group-hover:text-cyan-300" />
            </div>
            <h2 className="mt-5 text-lg font-semibold text-white group-hover:text-cyan-200">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-medium text-slate-300">
              <KeyRound className="h-3.5 w-3.5" />
              {status}
            </div>
          </Link>
        ))}
      </section>

      <section className="rounded-2xl border border-white/10 bg-card/75 p-5">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
          <div>
            <h2 className="font-semibold text-white">Activation rule</h2>
            <p className="mt-1 text-sm leading-6 text-slate-400">
              A configured provider is not an authorized provider. Connection health, required scopes,
              compliance, human approval, version hashes, idempotency, and live-publishing gates remain
              separate mandatory controls.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
