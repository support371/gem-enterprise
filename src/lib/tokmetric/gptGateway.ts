import { shouldUseSupabaseGateway } from "@/lib/supabase-gateway";

const DEFAULT_TOKMETRIC_GPT_GATEWAY_URL =
  "https://slzdjoqpzbkwzuaexlkj.supabase.co/functions/v1/gem-tokmetric-gpt-gateway";
const REQUEST_TIMEOUT_MS = 60_000;

export interface TokMetricGatewayResponse {
  ok: boolean;
  correlationId?: string;
  data?: unknown;
  error?: {
    code?: string;
    message?: string;
    correlationId?: string;
  };
}

export class TokMetricGatewayUnavailableError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "TokMetricGatewayUnavailableError";
  }
}

function gatewayUrl(): string {
  return (
    process.env.GEM_TOKMETRIC_GPT_GATEWAY_URL?.trim() ||
    DEFAULT_TOKMETRIC_GPT_GATEWAY_URL
  ).replace(/\/$/, "");
}

export function shouldUseTokMetricGptGateway(): boolean {
  if (process.env.GEM_TOKMETRIC_GPT_GATEWAY_ENABLED === "false") return false;
  if (process.env.GEM_TOKMETRIC_GPT_GATEWAY_ENABLED === "true") return true;

  return shouldUseSupabaseGateway() || !process.env.GPT_AUTH_TOKEN?.trim();
}

export async function invokeTokMetricGptGateway(input: {
  action: string;
  body: unknown;
  authorization: string;
  correlationId: string;
}): Promise<{ statusCode: number; body: TokMetricGatewayResponse }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(gatewayUrl(), {
      method: "POST",
      headers: {
        Authorization: input.authorization,
        "Content-Type": "application/json",
        "X-Correlation-Id": input.correlationId,
      },
      body: JSON.stringify({
        action: input.action,
        body: input.body,
        correlationId: input.correlationId,
      }),
      cache: "no-store",
      signal: controller.signal,
    });

    const responseBody = (await response.json().catch(() => ({
      ok: false,
      error: {
        code: "TOKMETRIC_GATEWAY_INVALID_RESPONSE",
        message: "TokMetric GPT gateway returned an invalid response.",
      },
    }))) as TokMetricGatewayResponse;

    return {
      statusCode: response.status,
      body: responseBody,
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new TokMetricGatewayUnavailableError(
        "TOKMETRIC_GATEWAY_TIMEOUT",
        "TokMetric GPT gateway timed out.",
      );
    }

    throw new TokMetricGatewayUnavailableError(
      "TOKMETRIC_GATEWAY_UNAVAILABLE",
      "TokMetric GPT gateway is unavailable.",
    );
  } finally {
    clearTimeout(timeout);
  }
}
