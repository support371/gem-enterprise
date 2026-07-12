import { NextRequest, NextResponse } from "next/server";
import { invokeGovernanceReadGatewayRoute } from "@/lib/kyc/governance-read-gateway-route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_STATUSES = new Set([
  "requested",
  "approved",
  "rejected",
  "executed",
  "cancelled",
  "failed",
]);

export async function GET(request: NextRequest) {
  const statusFilter = request.nextUrl.searchParams.get("status")?.trim() ?? "";
  if (statusFilter && !ALLOWED_STATUSES.has(statusFilter)) {
    return NextResponse.json(
      { error: "Deletion-request status filter is invalid." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  return invokeGovernanceReadGatewayRoute(
    "deletion_requests",
    statusFilter ? { statusFilter } : {},
  );
}
