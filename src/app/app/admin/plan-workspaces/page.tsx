import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { PlanWorkspaceViewer } from "@/components/admin/PlanWorkspaceViewer";
import { Button } from "@/components/ui/button";
import { requirePlatformOwner } from "@/lib/api/auth-helpers";
import { planWorkspaceCatalog } from "@/lib/planWorkspaces";

export const metadata: Metadata = {
  title: "Plan Workspace Viewer | GEM Enterprise",
  description: "Owner-only, read-only review of GEM Enterprise plan and role workspaces.",
};

export const dynamic = "force-dynamic";

export default async function PlanWorkspacesPage() {
  const gate = await requirePlatformOwner();
  if (!gate.ok) {
    if (gate.response.status === 401) {
      redirect("/client-login?next=/app/admin/plan-workspaces");
    }
    redirect("/app/admin?ownerAccess=required");
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 rounded-xl border border-cyan-400/20 bg-cyan-400/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" />
          <div>
            <p className="font-semibold text-white">Preview and real access remain separate</p>
            <p className="mt-1 text-sm leading-6 text-slate-400">
              This viewer is synthetic and read-only. Use the protected access screen to create a
              real role or assign an existing active account to a production workspace.
            </p>
          </div>
        </div>
        <Button asChild className="shrink-0 bg-cyan-300 text-slate-950 hover:bg-cyan-200">
          <Link href="/app/admin/workspace-access">
            Manage real workspace access <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
      <PlanWorkspaceViewer plans={planWorkspaceCatalog} />
    </div>
  );
}
