import { NextResponse } from "next/server";
import { getGatewaySessionToken } from "@/lib/auth";
import {
  evidenceGateway,
  type EvidenceGatewayAction,
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

export async function invokeEvidenceGatewayRoute<T>(
  action: EvidenceGatewayAction,
  payload: Record<string, unknown> = {},
  successStatus = 200,
) {
  const token = await getGatewaySessionToken();
  if (!token) {
    return json(
      {
        error: "Unauthorized",
        code: "GATEWAY_SESSION_REQUIRED",
        failClosed: true,
      },
      401,
    );
  }

  try {
    const result = await evidenceGateway<T>(action, token, payload);
    return json(result, successStatus);
  } catch (error) {
    if (error instanceof GatewayRequestError) {
      return json(
        {
          error: error.message,
          code: error.code,
          failClosed: true,
        },
        error.statusCode,
      );
    }

    console.error(`[evidence gateway:${action}]`, error);
    return json(
      {
        error: "Secure evidence service is unavailable.",
        code: "EVIDENCE_GATEWAY_UNAVAILABLE",
        failClosed: true,
      },
      503,
    );
  }
}
