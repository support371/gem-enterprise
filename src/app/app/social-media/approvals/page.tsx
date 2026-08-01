import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  LockKeyhole,
  Scale,
  ShieldAlert,
  UsersRound,
} from "lucide-react";
import { getSocialMediaProviderReadiness } from "@/lib/social-media/providers";

const reviewLanes = [
  {
    href: "/tokmetric/compliance",
    label: "Compliance Review",
    description: "Inspect disclosures, claims, copyright, music rights, privacy, and platform policy requirements.",
    icon: FileCheck2,
  },
  {
    href: "/tokmetric/approvals",
    label: "Human Approval",
    description: "Approve or reject the exact content version, media hash, destination, and publishing settings.",
    icon: UsersRound,
  },
  {
    href: "/tokmetric/publishing",
    label: "Publishing Preconditions",
    description: "Confirm account authorization, connector health, idempotency, live gates, and queue readiness.",
    icon: LockKeyhole,
  },
] as const;

const mandatoryChecks = [
  "The content is grounded in an approved GEM service or source record.",
  "Unsupported performance, guarantee, certification, and government-approval claims are removed.",
  "No internal security architecture, credentials, customer environments, or incident details are exposed.",
  "Regulatory wording accurately describes support or advisory scope and does not imply certification.",
  "Media rights, music rights, likeness permissions, alt text, and captions are complete.",
  "The approval is bound to the exact copy, media, destination, and object hash being published.",
] as const;

export default function SocialMediaApprovalsPage() {
  const providers = getSocialMediaProviderReadiness();
  const approvalRequired = providers.filter((provider) => provider.platformApprovalRequired);
  const approvalRecorded = approvalRequired.filter((provider) => provider.platformApprovalGranted);

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <article className="rounded-2xl border border-white/10 bg-card/75 p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-emerald-300" />
            <h2 className="text-lg font-bold text-white">Compliance and exact-version approval</h2>
          </div>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            Every publishable item moves through automated checks and a separate human decision. Approval is not a
            general permission for a campaign; it is evidence tied to the exact copy, media asset, destination,
            account, settings, and content hash that will enter the publishing queue.
          </p>
        </article>

        <article className="rounded-2xl border border-amber-500/15 bg-amber-500/[0.05] p-5 sm:p-6">
          <div className="flex items-center gap-2 text-amber-200">
            <ShieldAlert className="h-5 w-5" />
            <h2 className="font-semibold">Platform approval status</h2>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/8 bg-black/10 p-3">
              <p className="text-xs uppercase tracking-wider text-slate-500">Required</p>
              <p className="mt-2 text-2xl font-bold text-white">{approvalRequired.length}</p>
            </div>
            <div className="rounded-xl border border-white/8 bg-black/10 p-3">
              <p className="text-xs uppercase tracking-wider text-slate-500">Recorded</p>
              <p className="mt-2 text-2xl font-bold text-emerald-300">{approvalRecorded.length}</p>
            </div>
          </div>
          <p className="mt-3 text-xs leading-5 text-amber-100/70">
            Provider developer-product approval is managed by an authorized administrator and remains separate from
            content approval.
          </p>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {reviewLanes.map(({ href, label, description, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group rounded-2xl border border-white/10 bg-card/75 p-5 transition hover:border-emerald-500/25 hover:bg-emerald-500/[0.04]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
              <Icon className="h-5 w-5 text-emerald-300" />
            </div>
            <div className="mt-5 flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white group-hover:text-emerald-200">{label}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
              </div>
              <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-600 transition group-hover:translate-x-1 group-hover:text-emerald-300" />
            </div>
          </Link>
        ))}
      </section>

      <section className="rounded-2xl border border-white/10 bg-card/75 p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-300" />
          <h2 className="text-lg font-bold text-white">Mandatory publication checks</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {mandatoryChecks.map((check) => (
            <div key={check} className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/[0.025] p-4">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
              <p className="text-sm leading-6 text-slate-400">{check}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
