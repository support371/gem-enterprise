import { NextResponse } from "next/server";
import { getGatewaySessionToken } from "@/lib/auth";
import {
  adminWriteGateway,
  type AdminWriteGatewayAction,
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

export async function invokeRetentionGatewayRoute<T>(
  action: Extract<
    AdminWriteGatewayAction,
    | "retention_policy_list"
    | "retention_policy_create"
    | "retention_policy_action"
  >,
  payload: Record<string, unknown> = {},
  successStatus = 200,
) {
  const token = await getGatewaySessionToken();
  if (!token) {
    return json({ error: "Unauthorized", code: "GATEWAY_SESSION_REQUIRED" }, 401);
  }

  try {
    const result = await adminWriteGateway<T>(action, token, payload);
    return json(result, successStatus);
  } catch (error) {
    if (error instanceof GatewayRequestError) {
      return json(
        { error: error.message, code: error.code },
        error.statusCode,
      );
    }

    console.error(`[retention gateway:${action}]`, error);
    return json(
      {
        error: "Retention governance service is unavailable.",
        code: "RETENTION_GATEWAY_UNAVAILABLE",
      },
      503,
    );
  }
}
