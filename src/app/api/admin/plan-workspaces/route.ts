import { NextResponse } from "next/server";
import { requirePlatformOwner } from "@/lib/api/auth-helpers";
import { planWorkspaceCatalog } from "@/lib/planWorkspaces";

export async function GET() {
  const gate = await requirePlatformOwner();
  if (!gate.ok) return gate.response;

  return NextResponse.json(
    {
      mode: "owner_read_only_preview",
      plans: planWorkspaceCatalog,
      protections: {
        tenantDataIncluded: false,
        productionMutationAllowed: false,
        sharedCredentialsRequired: false,
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
