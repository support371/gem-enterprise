import Link from "next/link";
import { ArrowRight, Layers3 } from "lucide-react";
import { ContentOrchestratorPanel } from "@/components/social-media/ContentOrchestratorPanel";

export default function SocialMediaCampaignsPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[1fr_auto]">
        <article className="rounded-2xl border border-white/10 bg-card/75 p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <Layers3 className="h-5 w-5 text-cyan-300" />
            <h2 className="text-lg font-bold text-white">Campaign workspace</h2>
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
            Load or generate the real GEM daily campaign plan, inspect every destination-specific content item, queue
            governed video production, and keep approval evidence attached to the exact content version.
          </p>
        </article>
        <div className="flex flex-col gap-2">
          <Link href="/app/social-media/calendar" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/[0.05]">
            Open calendar <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/app/social-media/queue" className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-black hover:bg-cyan-300">
            Open queue <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <ContentOrchestratorPanel />
    </div>
  );
}
