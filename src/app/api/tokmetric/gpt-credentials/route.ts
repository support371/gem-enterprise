import { NextRequest, NextResponse } from "next/server";
import { invokeTokMetricCredentialAdmin } from "@/lib/tokmetric/credential-admin-route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return invokeTokMetricCredentialAdmin("list");
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON.", code: "INVALID_JSON" },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json(
      { error: "Credential request is invalid.", code: "INVALID_REQUEST" },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const payload = body as Record<string, unknown>;
  const action = typeof payload.action === "string" ? payload.action : "";

  if (action === "issue") {
    return invokeTokMetricCredentialAdmin(
      "issue",
      {
        label: payload.label,
        reason: payload.reason,
        expiresInDays: payload.expiresInDays,
        confirmWorkspaceId: payload.confirmWorkspaceId,
      },
      201,
    );
  }

  if (action === "revoke") {
    return invokeTokMetricCredentialAdmin("revoke", {
      credentialId: payload.credentialId,
      confirmLabel: payload.confirmLabel,
      reason: payload.reason,
    });
  }

  return NextResponse.json(
    {
      error: "Unknown credential action.",
      code: "UNKNOWN_ACTION",
    },
    { status: 400, headers: { "Cache-Control": "no-store" } },
  );
}
