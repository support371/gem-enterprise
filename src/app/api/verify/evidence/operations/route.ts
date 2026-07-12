import { NextRequest, NextResponse } from "next/server";
import { invokeEvidenceGatewayRoute } from "@/lib/kyc/evidence-gateway-route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_ACTIONS = new Set([
  "approve_operations",
  "activate_uploads",
  "deactivate_uploads",
]);

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON.", failClosed: true },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const action =
    body && typeof body === "object" && !Array.isArray(body) && "action" in body
      ? String((body as { action: unknown }).action)
      : "";

  if (!ALLOWED_ACTIONS.has(action)) {
    return NextResponse.json(
      { error: "Evidence operational action is invalid.", failClosed: true },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  return invokeEvidenceGatewayRoute(
    action as
      | "approve_operations"
      | "activate_uploads"
      | "deactivate_uploads",
  );
}
