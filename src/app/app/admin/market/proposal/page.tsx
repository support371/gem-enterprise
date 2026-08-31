import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { ProposalWorkbench } from "@/components/market/ProposalWorkbench";

type PageProps = { searchParams: Promise<{ intakeId?: string }> };

export default async function MarketProposalPage({ searchParams }: PageProps) {
  const { intakeId = "" } = await searchParams;

  return (
    <div className="space-y-7 animate-fade-in">
      <header>
        <Link href="/app/admin/market" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-200">
          <ArrowLeft className="h-4 w-4" /> Market pipeline
        </Link>
        <div className="mt-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300"><FileText className="h-5 w-5" /></div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-cyan-300">Commercial handoff</p>
            <h1 className="mt-1 text-2xl font-bold text-white">Proposal & Payment Readiness</h1>
          </div>
        </div>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-400">
          Prepare a customer-facing proposal without changing the authoritative intake record. Human qualification and approval remain separate from customer payment and workspace provisioning.
        </p>
      </header>

      {intakeId ? (
        <ProposalWorkbench intakeId={intakeId} />
      ) : (
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-5 text-sm text-amber-100">
          Open an opportunity from the Market Pipeline to prepare its proposal.
        </div>
      )}
    </div>
  );
}
