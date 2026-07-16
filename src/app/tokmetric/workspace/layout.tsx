import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

export default function TokMetricWorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <section className="border-b border-cyan-300/20 bg-[#071019] text-white">
        <div className="mx-auto flex max-w-screen-xl flex-col gap-4 px-4 py-5 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-300/25 bg-cyan-300/10">
              <ShieldCheck className="h-5 w-5 text-cyan-300" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                TokMetric is controlled from GEM Enterprise
              </p>
              <p className="mt-1 text-xs leading-5 text-white/50">
                TikTok operations, GPT controls, approvals, compliance, publishing locks, and connector state are consolidated in the authenticated Command Center.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href="/tokmetric/app"
              className="inline-flex items-center justify-center rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-white hover:bg-white/[0.06]"
            >
              View app gateway
            </Link>
            <Link
              href="/app/command-center/tokmetric"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-300 px-4 py-2 text-sm font-semibold text-[#071019] hover:bg-cyan-200"
            >
              Open in Command Center
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
      {children}
    </>
  );
}
