import { NextRequest, NextResponse } from "next/server";
import { invokeRetentionGatewayRoute } from "@/lib/kyc/retention-gateway-route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_ACTIONS = new Set(["submit", "approve", "reject", "deactivate"]);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!id || id.length > 128) {
    return NextResponse.json(
      { error: "Retention policy identifier is invalid." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const policyAction =
    body && typeof body === "object" && !Array.isArray(body) && "action" in body
      ? String((body as { action: unknown }).action)
      : "";
  const reason =
    body && typeof body === "object" && !Array.isArray(body) && "reason" in body
      ? String((body as { reason: unknown }).reason).trim()
      : undefined;

  if (!ALLOWED_ACTIONS.has(policyAction)) {
    return NextResponse.json(
      { error: "Retention policy action is invalid." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  return invokeRetentionGatewayRoute("retention_policy_action", {
    policyId: id,
    policyAction,
    ...(reason ? { reason } : {}),
  });
}
