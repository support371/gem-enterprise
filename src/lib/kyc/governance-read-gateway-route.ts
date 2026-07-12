import { NextResponse } from "next/server";
import { getGatewaySessionToken } from "@/lib/auth";
import {
  adminReadGateway,
  type AdminReadGatewayAction,
  GatewayRequestError,
} from "@/lib/supabase-gateway";

function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function invokeGovernanceReadGatewayRoute<T>(
  action: Extract<
    AdminReadGatewayAction,
    "retention_dry_run" | "deletion_requests"
  >,
  payload: Record<string, unknown> = {},
) {
  const token = await getGatewaySessionToken();
  if (!token) {
    return json({ error: "Unauthorized", code: "GATEWAY_SESSION_REQUIRED" }, 401);
  }

  try {
    const result = await adminReadGateway<T>(action, token, payload);
    return json(result);
  } catch (error) {
    if (error instanceof GatewayRequestError) {
      return json(
        { error: error.message, code: error.code, deletionPerformed: false },
        error.statusCode,
      );
    }

    console.error(`[governance read gateway:${action}]`, error);
    return json(
      {
        error: "Evidence governance data is unavailable.",
        code: "GOVERNANCE_READ_GATEWAY_UNAVAILABLE",
        deletionPerformed: false,
      },
      503,
    );
  }
}
