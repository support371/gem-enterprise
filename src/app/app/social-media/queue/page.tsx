import { ListChecks } from "lucide-react";
import { SocialPublishingQueuePanel } from "@/components/social-media/SocialPublishingQueuePanel";

export default function SocialMediaQueuePage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-cyan-500/15 bg-cyan-500/[0.05] p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <ListChecks className="h-5 w-5 text-cyan-300" />
          <h2 className="text-lg font-bold text-white">Publishing queue</h2>
        </div>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
          Inspect real scheduled, active, blocked, retrying, failed, and published jobs without triggering an external
          action. Provider writes remain controlled by the server-side approval, connector, capability, and live gates.
        </p>
      </section>

      <SocialPublishingQueuePanel />
    </div>
  );
}
