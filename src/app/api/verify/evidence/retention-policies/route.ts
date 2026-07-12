import { NextRequest, NextResponse } from "next/server";
import { invokeRetentionGatewayRoute } from "@/lib/kyc/retention-gateway-route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return invokeRetentionGatewayRoute("retention_policy_list");
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json(
      { error: "Retention policy draft is invalid." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  return invokeRetentionGatewayRoute(
    "retention_policy_create",
    body as Record<string, unknown>,
    201,
  );
}
