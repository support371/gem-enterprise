import { NextRequest } from "next/server";
import { invokeEvidenceGatewayRoute } from "@/lib/kyc/evidence-gateway-route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const applicationId = request.nextUrl.searchParams.get("applicationId")?.trim();
  return invokeEvidenceGatewayRoute(
    "items",
    applicationId ? { applicationId } : {},
  );
}
