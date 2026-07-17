import { GatewayRequestError } from "@/lib/supabase-gateway";

const DEFAULT_COMMAND_GATEWAY_URL =
  "https://slzdjoqpzbkwzuaexlkj.supabase.co/functions/v1/gem-tokmetric-command-gateway";
const REQUEST_TIMEOUT_MS = 60_000;

export type TokMetricCommandOperation =
  | "snapshot"
  | "create_draft"
  | "create_version"
  | "run_review"
  | "request_approval"
  | "decide_approval"
  | "publish_preflight";

function gatewayUrl() {
  return (
    process.env.GEM_TOKMETRIC_COMMAND_GATEWAY_URL?.trim() ||
    DEFAULT_COMMAND_GATEWAY_URL
  );
}

function gatewayAnonKey() {
  const key = process.env.GEM_SUPABASE_GATEWAY_ANON_KEY?.trim();
  if (!key) {
    throw new GatewayRequestError(
      503,
      "TOKMETRIC_COMMAND_CONFIGURATION_MISSING",
      "TokMetric command gateway authentication is not configured.",
    );
  }
  return key;
}

export async function invokeTokMetricCommandGateway<T>(
  token: string,
  operation: TokMetricCommandOperation,
  payload: Record<string, unknown> = {},
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const key = gatewayAnonKey();
    const response = await fetch(gatewayUrl(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        apikey: key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, operation, ...payload }),
      cache: "no-store",
      signal: controller.signal,
    });
    const body = (await response.json().catch(() => ({}))) as
      | T
      | { error?: string; code?: string };
    if (!response.ok) {
      const error = body as { error?: string; code?: string };
      throw new GatewayRequestError(
        response.status,
        error.code || "TOKMETRIC_COMMAND_FAILED",
        error.error || "TokMetric command failed.",
      );
    }
    return body as T;
  } catch (error) {
    if (error instanceof GatewayRequestError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new GatewayRequestError(
        504,
        "TOKMETRIC_COMMAND_TIMEOUT",
        "TokMetric command gateway timed out.",
      );
    }
    throw new GatewayRequestError(
      503,
      "TOKMETRIC_COMMAND_UNAVAILABLE",
      "TokMetric command gateway is unavailable.",
    );
  } finally {
    clearTimeout(timeout);
  }
}
