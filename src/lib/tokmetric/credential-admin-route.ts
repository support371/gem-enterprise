import { NextResponse } from "next/server";
import { getGatewaySessionToken } from "@/lib/auth";

export const TOKMETRIC_PRODUCTION_WORKSPACE_ID =
  process.env.TOKMETRIC_WORKSPACE_ID?.trim() ||
  "ws_60488340ded94dcfab3b875ef9ae591c";

export type TokMetricCredentialAdminAction = "list" | "issue" | "revoke";

function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
    },
  });
}

export async function invokeTokMetricCredentialAdmin(
  action: TokMetricCredentialAdminAction,
  payload: Record<string, unknown> = {},
  successStatus = 200,
) {
  const token = await getGatewaySessionToken();
  if (!token) {
    return json(
      { error: "Unauthorized", code: "GATEWAY_SESSION_REQUIRED" },
      401,
    );
  }

  const supabaseUrl = process.env.SUPABASE_URL?.trim().replace(/\/$/, "");
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!supabaseUrl || !serviceRoleKey) {
    return json(
      {
        error: "TokMetric credential service is not configured.",
        code: "TOKMETRIC_CREDENTIAL_SERVICE_NOT_CONFIGURED",
      },
      503,
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const response = await fetch(
      `${supabaseUrl}/functions/v1/gem-tokmetric-credential-admin`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          apikey: serviceRoleKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          token,
          workspaceId: TOKMETRIC_PRODUCTION_WORKSPACE_ID,
          ...payload,
        }),
        cache: "no-store",
        signal: controller.signal,
      },
    );

    const body = (await response.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;
    if (!response.ok) {
      return json(
        {
          error:
            typeof body.error === "string"
              ? body.error
              : "TokMetric credential request failed.",
          code:
            typeof body.code === "string"
              ? body.code
              : "TOKMETRIC_CREDENTIAL_REQUEST_FAILED",
        },
        response.status,
      );
    }

    return json(body, successStatus);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return json(
        {
          error: "TokMetric credential service timed out.",
          code: "TOKMETRIC_CREDENTIAL_SERVICE_TIMEOUT",
        },
        504,
      );
    }

    console.error(
      `[tokmetric credential admin:${action}]`,
      error instanceof Error ? error.name : "unknown",
    );
    return json(
      {
        error: "TokMetric credential service is unavailable.",
        code: "TOKMETRIC_CREDENTIAL_SERVICE_UNAVAILABLE",
      },
      503,
    );
  } finally {
    clearTimeout(timeout);
  }
}
