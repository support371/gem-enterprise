import Link from "next/link";
import { Activity, ArrowRight, ShieldCheck } from "lucide-react";
import { SocialPublishingQueuePanel } from "@/components/social-media/SocialPublishingQueuePanel";

export default function SocialMediaActivityPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[1fr_auto]">
        <article className="rounded-2xl border border-white/10 bg-card/75 p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-sky-200" />
            <h2 className="text-lg font-bold text-white">Delivery activity and evidence</h2>
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
            Review queue attempts, provider outcomes, verified published links, blocked states, exact-version hashes,
            approval evidence, and safe provider errors. No activity is inferred when the underlying records do not exist.
          </p>
        </article>
        <Link href="/app/command-center/tokmetric" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/[0.05]">
          TikTok audit workspace <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.04] p-4 text-sm text-emerald-100/75">
        <div className="flex items-center gap-2 font-semibold text-emerald-200"><ShieldCheck className="h-4 w-4" /> Evidence-first activity</div>
        <p className="mt-2">External IDs and published URLs appear only after provider-confirmed results are recorded.</p>
      </div>

      <SocialPublishingQueuePanel />
    </div>
  );
}
