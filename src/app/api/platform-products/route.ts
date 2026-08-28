import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/auth-helpers";
import { enterpriseControlDomains, enterpriseProducts } from "@/lib/enterpriseProductRegistry";

export async function GET() {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  return NextResponse.json(
    {
      products: enterpriseProducts,
      controlDomains: enterpriseControlDomains,
      boundaryPolicy: {
        sharedSessions: false,
        sharedDatabases: false,
        sharedServiceKeys: false,
        launcherGrantsAccess: false,
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
