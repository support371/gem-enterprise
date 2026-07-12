import Link from "next/link";
import { ArrowLeft, ScanSearch, Scale, ShieldCheck } from "lucide-react";
import GemVerifyEvidenceGovernanceClient from "@/components/admin/GemVerifyEvidenceGovernanceClient";
import GemVerifyEvidenceOperationsClient from "@/components/admin/GemVerifyEvidenceOperationsClient";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Evidence Governance | GEM Verify",
  description:
    "Protected retention, operational approval, two-person activation, legal-hold and deletion-decision governance for the GEM Verify Secure Evidence Vault.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function EvidenceGovernancePage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-300">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            GEM Verify controlled governance
          </div>
          <h1 className="mt-3 flex items-center gap-3 text-3xl font-black text-white">
            <Scale className="h-8 w-8 text-cyan-300" aria-hidden="true" />
            Evidence Governance
          </h1>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">
            Control retention policies, independent operational approval,
            two-person upload activation, legal holds and deletion decisions.
            Evidence intake and physical deletion both remain fail-closed until
            their separate controls are satisfied.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/app/admin/gem-verify/evidence/scanner">
              <ScanSearch className="mr-2 h-4 w-4" aria-hidden="true" />
              Scanner Operations
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/app/admin/gem-verify/evidence">
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
              Back to Evidence Vault
            </Link>
          </Button>
        </div>
      </header>

      <GemVerifyEvidenceOperationsClient />
      <GemVerifyEvidenceGovernanceClient />
    </div>
  );
}
