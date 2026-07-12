import { NextRequest } from "next/server";
import { invokeGovernanceReadGatewayRoute } from "@/lib/kyc/governance-read-gateway-route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const requestedLimit = Number(request.nextUrl.searchParams.get("limit") ?? 100);
  const limit = Number.isInteger(requestedLimit)
    ? Math.min(Math.max(requestedLimit, 1), 500)
    : 100;

  return invokeGovernanceReadGatewayRoute("retention_dry_run", { limit });
}
