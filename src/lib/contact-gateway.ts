import { GatewayRequestError } from "@/lib/supabase-gateway";

const DEFAULT_GATEWAY_BASE_URL =
  "https://slzdjoqpzbkwzuaexlkj.supabase.co/functions/v1";
const DEFAULT_GATEWAY_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsemRqb3FwemJrd3p1YWV4bGtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyOTk1MTQsImV4cCI6MjA5ODg3NTUxNH0.0wfgX_m6SBn_TtD0ZNjkOZ-bk8Frp2Tq1HL9mYFBm4M";
const REQUEST_TIMEOUT_MS = 30_000;

function gatewayBaseUrl() {
  return (
    process.env.GEM_SUPABASE_GATEWAY_BASE_URL?.trim() ||
    DEFAULT_GATEWAY_BASE_URL
  ).replace(/\/$/, "");
}

function gatewayAnonKey() {
  return (
    process.env.GEM_SUPABASE_GATEWAY_ANON_KEY?.trim() ||
    DEFAULT_GATEWAY_ANON_KEY
  );
}

export interface ContactGatewayInput {
  name: string;
  email: string;
  subject: string;
  message: string;
  website?: string;
  ipAddress: string;
  userAgent: string;
}

export interface ContactGatewayResult {
  ok: true;
  accepted: true;
  suppressed?: boolean;
  submissionId?: string;
  ticketId?: null;
  persistence?: "supabase_gateway";
  notificationDelivery?: string;
}

export async function submitContactGateway(
  input: ContactGatewayInput,
): Promise<ContactGatewayResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const key = gatewayAnonKey();
    const response = await fetch(`${gatewayBaseUrl()}/gem-contact-gateway`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        apikey: key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "submit", ...input }),
      cache: "no-store",
      signal: controller.signal,
    });
    const body = (await response.json().catch(() => null)) as
      | ContactGatewayResult
      | { error?: string; code?: string }
      | null;

    if (!response.ok) {
      const failure = body as { error?: string; code?: string } | null;
      throw new GatewayRequestError(
        response.status >= 500 ? 503 : response.status,
        failure?.code || "CONTACT_GATEWAY_FAILED",
        failure?.error || "Contact intake is unavailable.",
      );
    }

    if (!body || !("ok" in body) || body.ok !== true) {
      throw new GatewayRequestError(
        503,
        "CONTACT_GATEWAY_INVALID_RESPONSE",
        "Contact intake is unavailable.",
      );
    }

    return body as ContactGatewayResult;
  } catch (error) {
    if (error instanceof GatewayRequestError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new GatewayRequestError(
        504,
        "CONTACT_GATEWAY_TIMEOUT",
        "Contact intake timed out.",
      );
    }
    throw new GatewayRequestError(
      503,
      "CONTACT_GATEWAY_UNAVAILABLE",
      "Contact intake is unavailable.",
    );
  } finally {
    clearTimeout(timeout);
  }
}
