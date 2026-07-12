import { NextRequest, NextResponse } from "next/server";
import { invokeEvidenceGatewayRoute } from "@/lib/kyc/evidence-gateway-route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json(
      { error: "Reviewer evidence access request is invalid.", failClosed: true },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  return invokeEvidenceGatewayRoute(
    "review_url",
    body as Record<string, unknown>,
  );
}
