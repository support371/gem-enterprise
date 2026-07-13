const DEFAULT_GATEWAY_BASE_URL =
  "https://slzdjoqpzbkwzuaexlkj.supabase.co/functions/v1";
const DEFAULT_GATEWAY_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsemRqb3FwemJrd3p1YWV4bGtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyOTk1MTQsImV4cCI6MjA5ODg3NTUxNH0.0wfgX_m6SBn_TtD0ZNjkOZ-bk8Frp2Tq1HL9mYFBm4M";
const REQUEST_TIMEOUT_MS = 30_000;

export interface ContactGatewaySubmission {
  name: string;
  email: string;
  subject: string;
  message: string;
  website?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface ContactGatewayResult {
  ok: true;
  accepted: true;
  submissionId?: string;
  ticketId: null;
  persistence: "supabase_gateway";
  notificationDelivery?: "sent" | "failed" | "not_configured";
  suppressed?: boolean;
}

interface ContactGatewayErrorBody {
  error?: string;
  code?: string;
}

export class ContactGatewayError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ContactGatewayError";
  }
}

function gatewayBaseUrl(): string {
  return (
    process.env.GEM_SUPABASE_GATEWAY_BASE_URL?.trim() ||
    DEFAULT_GATEWAY_BASE_URL
  ).replace(/\/$/, "");
}

function gatewayAnonKey(): string {
  return (
    process.env.GEM_SUPABASE_GATEWAY_ANON_KEY?.trim() ||
    DEFAULT_GATEWAY_ANON_KEY
  );
}

export async function submitContactGateway(
  submission: ContactGatewaySubmission,
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
      body: JSON.stringify({ action: "submit", ...submission }),
      cache: "no-store",
      signal: controller.signal,
    });

    const body = (await response.json().catch(() => ({}))) as
      | ContactGatewayResult
      | ContactGatewayErrorBody;

    if (!response.ok || !("ok" in body) || body.ok !== true) {
      const errorBody = body as ContactGatewayErrorBody;
      throw new ContactGatewayError(
        response.status,
        errorBody.code || "CONTACT_GATEWAY_FAILED",
        errorBody.error || "Contact intake failed.",
      );
    }

    return body as ContactGatewayResult;
  } catch (error) {
    if (error instanceof ContactGatewayError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new ContactGatewayError(
        504,
        "CONTACT_GATEWAY_TIMEOUT",
        "Contact intake timed out.",
      );
    }
    throw new ContactGatewayError(
      503,
      "CONTACT_GATEWAY_UNAVAILABLE",
      "Contact intake is unavailable.",
    );
  } finally {
    clearTimeout(timeout);
  }
}
