import { shouldUseTokMetricGptGateway } from "@/lib/tokmetric/gptGateway";

const DEFAULT_AGENT_GATEWAY_URL =
  "https://slzdjoqpzbkwzuaexlkj.supabase.co/functions/v1/gem-tokmetric-agent-gateway";
const REQUEST_TIMEOUT_MS = 60_000;

export class TokMetricAgentGatewayUnavailableError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "TokMetricAgentGatewayUnavailableError";
  }
}

export function shouldUseTokMetricAgentGateway(): boolean {
  if (process.env.GEM_TOKMETRIC_AGENT_GATEWAY_ENABLED === "false") return false;
  if (process.env.GEM_TOKMETRIC_AGENT_GATEWAY_ENABLED === "true") return true;
  return shouldUseTokMetricGptGateway();
}

export async function invokeTokMetricAgentGateway(input: {
  body: unknown;
  authorization: string;
  correlationId: string;
}): Promise<{ statusCode: number; body: unknown }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const url = (
      process.env.GEM_TOKMETRIC_AGENT_GATEWAY_URL?.trim() ||
      DEFAULT_AGENT_GATEWAY_URL
    ).replace(/\/$/, "");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: input.authorization,
        "Content-Type": "application/json",
        "X-Correlation-Id": input.correlationId,
      },
      body: JSON.stringify(input.body),
      cache: "no-store",
      signal: controller.signal,
    });

    const body = await response.json().catch(() => ({
      ok: false,
      error: {
        code: "TOKMETRIC_AGENT_GATEWAY_INVALID_RESPONSE",
        message: "TokMetric agent gateway returned an invalid response.",
      },
    }));

    return { statusCode: response.status, body };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new TokMetricAgentGatewayUnavailableError(
        "TOKMETRIC_AGENT_GATEWAY_TIMEOUT",
        "TokMetric agent gateway timed out.",
      );
    }
    throw new TokMetricAgentGatewayUnavailableError(
      "TOKMETRIC_AGENT_GATEWAY_UNAVAILABLE",
      "TokMetric agent gateway is unavailable.",
    );
  } finally {
    clearTimeout(timeout);
  }
}
