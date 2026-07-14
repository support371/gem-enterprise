import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { WorkspaceAccessAdministration } from "@/components/admin/WorkspaceAccessAdministration";
import { requirePlatformOwner } from "@/lib/api/auth-helpers";
import { getWorkspaceAdministrationSnapshot } from "@/lib/workspaceAccessAdministration";

export const metadata: Metadata = {
  title: "Workspace Access Administration | GEM Enterprise",
  description: "Owner-only workspace role and membership administration.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export const dynamic = "force-dynamic";

export default async function WorkspaceAccessPage() {
  const gate = await requirePlatformOwner();
  if (!gate.ok) {
    if (gate.response.status === 401) {
      redirect("/client-login?next=/app/admin/workspace-access");
    }
    redirect("/app/admin?ownerAccess=required");
  }

  const snapshot = await getWorkspaceAdministrationSnapshot();
  return <WorkspaceAccessAdministration initialSnapshot={snapshot} />;
}
