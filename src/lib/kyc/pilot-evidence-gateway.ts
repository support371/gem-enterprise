import { GatewayRequestError } from "@/lib/supabase-gateway";

const DEFAULT_GATEWAY_BASE_URL =
  "https://slzdjoqpzbkwzuaexlkj.supabase.co/functions/v1";
const REQUEST_TIMEOUT_MS = 60_000;

function gatewayBaseUrl() {
  return (
    process.env.GEM_SUPABASE_GATEWAY_BASE_URL?.trim() ||
    DEFAULT_GATEWAY_BASE_URL
  ).replace(/\/$/, "");
}

export async function readPilotEvidenceGateway<T>(input: {
  token: string;
  applicationId: string;
  analystId: string;
}): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(
      `${gatewayBaseUrl()}/gem-pilot-evidence-read-v4`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        cache: "no-store",
        signal: controller.signal,
      },
    );
    const body = (await response.json().catch(() => ({}))) as
      | T
      | { error?: string; code?: string };

    if (!response.ok) {
      const errorBody = body as { error?: string; code?: string };
      throw new GatewayRequestError(
        response.status,
        errorBody.code || "PILOT_EVIDENCE_GATEWAY_FAILED",
        errorBody.error || "Pilot evidence gateway request failed.",
      );
    }

    return body as T;
  } catch (error) {
    if (error instanceof GatewayRequestError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new GatewayRequestError(
        504,
        "PILOT_EVIDENCE_GATEWAY_TIMEOUT",
        "Pilot evidence gateway timed out.",
      );
    }
    throw new GatewayRequestError(
      503,
      "PILOT_EVIDENCE_GATEWAY_UNAVAILABLE",
      "Pilot evidence gateway is unavailable.",
    );
  } finally {
    clearTimeout(timeout);
  }
}
