import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { WorkspaceAccessAdministration } from "@/components/admin/WorkspaceAccessAdministration";
import { requirePlatformOwner } from "@/lib/api/auth-helpers";
import { getGatewaySessionToken } from "@/lib/auth";
import type { WorkspaceAdministrationSnapshot } from "@/lib/workspace-access-admin/snapshot";
import { getWorkspaceAdministrationSnapshot } from "@/lib/workspaceAccessAdministration";
import { workspaceGateway } from "@/lib/supabase-gateway";

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
      redirect("/super-admin-login?next=/app/admin/workspace-access");
    }
    redirect("/app/admin?ownerAccess=required");
  }

  let snapshot: WorkspaceAdministrationSnapshot;
  if (gate.session.authSource === "supabase_gateway") {
    const token = await getGatewaySessionToken();
    if (!token) {
      redirect("/super-admin-login?next=/app/admin/workspace-access");
    }
    snapshot = await workspaceGateway<WorkspaceAdministrationSnapshot>(
      "admin_snapshot",
      token,
    );
  } else {
    snapshot = await getWorkspaceAdministrationSnapshot();
  }
  return <WorkspaceAccessAdministration initialSnapshot={snapshot} />;
}
