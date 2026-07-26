import Link from "next/link";
import { ArrowLeft, ShieldCheck, Users } from "lucide-react";
import GemVerifyOperatorInvitationsClient from "@/components/admin/GemVerifyOperatorInvitationsClient";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Operator Invitations | GEM Verify",
  description:
    "Create, monitor and revoke protected one-time invitations for GEM Verify analysts and administrators.",
  robots: { index: false, follow: false },
};

export default function GemVerifyOperatorsPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-300">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Controlled operator onboarding
          </div>
          <h1 className="mt-3 flex items-center gap-3 text-3xl font-black text-white">
            <Users className="h-8 w-8 text-cyan-300" aria-hidden="true" />
            Operator Invitations
          </h1>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">
            Onboard the second administrator and verification analyst required for
            separated review, policy approval and evidence-intake activation.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/app/admin/gem-verify/evidence/governance">
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
            Back to Governance
          </Link>
        </Button>
      </header>

      <GemVerifyOperatorInvitationsClient />
    </div>
  );
}
