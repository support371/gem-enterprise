import { PenSquare } from "lucide-react";
import { ContentOrchestratorPanel } from "@/components/social-media/ContentOrchestratorPanel";

export default function SocialMediaCreatePage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-violet-500/15 bg-violet-500/[0.05] p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <PenSquare className="h-5 w-5 text-violet-200" />
          <h2 className="text-lg font-bold text-white">Create governed social content</h2>
        </div>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
          Build platform-specific text, image briefs, short-form video recipes, and campaign variants from approved
          GEM source material. Preparation does not publish; compliance and exact-version human approval remain required.
        </p>
      </section>

      <ContentOrchestratorPanel />
    </div>
  );
}
