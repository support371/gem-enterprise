import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PlanWorkspaceViewer } from "@/components/admin/PlanWorkspaceViewer";
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

  return <PlanWorkspaceViewer plans={planWorkspaceCatalog} />;
}
