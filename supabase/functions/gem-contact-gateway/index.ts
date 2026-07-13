import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.8";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const CONTACT_EMAIL_FROM =
  Deno.env.get("CONTACT_EMAIL_FROM") || Deno.env.get("RESET_EMAIL_FROM") || "";
const CONTACT_NOTIFICATION_TO =
  Deno.env.get("CONTACT_NOTIFICATION_TO") ||
  Deno.env.get("ADMIN_EMAIL") ||
  Deno.env.get("GEM_OWNER_EMAIL") ||
  "admin@gemcybersecurityassist.com";
const MAX_SUBMISSIONS_PER_EMAIL_PER_HOUR = 3;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase runtime configuration");
}

const db = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

class ContactGatewayError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

function requiredString(
  value: unknown,
  field: string,
  minLength: number,
  maxLength: number,
): string {
  if (typeof value !== "string") {
    throw new ContactGatewayError(400, "INVALID_REQUEST", `${field} is required.`);
  }
  const normalized = value.trim();
  if (normalized.length < minLength || normalized.length > maxLength) {
    throw new ContactGatewayError(400, "INVALID_REQUEST", `${field} is invalid.`);
  }
  return normalized;
}

function optionalString(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function normalizeEmail(value: unknown): string {
  const email = requiredString(value, "email", 3, 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ContactGatewayError(400, "INVALID_REQUEST", "email is invalid.");
  }
  return email;
}

async function enforceEmailRateLimit(email: string) {
  const cutoff = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count, error } = await db
    .from("support_bookings")
    .select("id", { count: "exact", head: true })
    .eq("email", email)
    .gte("createdAt", cutoff);

  if (error) {
    console.error("contact_gateway_rate_limit_query_failed", error.message);
    throw new ContactGatewayError(503, "DATABASE_ERROR", "Contact intake is unavailable.");
  }
  if ((count || 0) >= MAX_SUBMISSIONS_PER_EMAIL_PER_HOUR) {
    throw new ContactGatewayError(
      429,
      "RATE_LIMITED",
      "Too many contact requests. Please try again later.",
    );
  }
}

async function sendNotification(input: {
  submissionId: string;
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  if (!RESEND_API_KEY || !CONTACT_EMAIL_FROM || !CONTACT_NOTIFICATION_TO) {
    return "not_configured";
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: CONTACT_EMAIL_FROM,
        to: [CONTACT_NOTIFICATION_TO],
        reply_to: input.email,
        subject: `[GEM Contact] ${input.subject}`,
        text: [
          `Submission ID: ${input.submissionId}`,
          `Name: ${input.name}`,
          `Email: ${input.email}`,
          "",
          input.message,
        ].join("\n"),
      }),
    });

    if (!response.ok) {
      const failure = (await response.json().catch(() => ({}))) as { name?: string };
      console.error(
        "contact_gateway_notification_failed",
        response.status,
        failure.name || "unknown",
      );
      return "failed";
    }
    return "sent";
  } catch (error) {
    console.error(
      "contact_gateway_notification_failed",
      error instanceof Error ? error.name : "unknown",
    );
    return "failed";
  }
}

async function recordAudit(input: {
  submissionId: string;
  subject: string;
  notificationDelivery: string;
  ipAddress: string;
  userAgent: string;
}) {
  const { error } = await db.from("audit_logs").insert({
    id: crypto.randomUUID(),
    userId: null,
    action: "admin_action",
    resource: "contact_message",
    resourceId: input.submissionId,
    metadata: {
      source: "supabase_contact_gateway",
      subject: input.subject,
      notificationDelivery: input.notificationDelivery,
    },
    ipAddress: input.ipAddress || null,
    userAgent: input.userAgent || null,
    createdAt: new Date().toISOString(),
  });

  if (error) console.error("contact_gateway_audit_failed", error.message);
}

async function submitContact(body: Record<string, unknown>) {
  const website = optionalString(body.website, 500);
  if (website) {
    return { ok: true, accepted: true, suppressed: true };
  }

  const name = requiredString(body.name, "name", 2, 120);
  const email = normalizeEmail(body.email);
  const subject = requiredString(body.subject, "subject", 1, 200);
  const message = requiredString(body.message, "message", 10, 5_000);
  const ipAddress = optionalString(body.ipAddress, 128);
  const userAgent = optionalString(body.userAgent, 1_024);

  await enforceEmailRateLimit(email);

  const submissionId = crypto.randomUUID();
  const now = new Date().toISOString();
  const baseNotes = [
    "Website contact enquiry",
    `From: ${name} <${email}>`,
    "Authenticated: no (public gateway fallback)",
    "Persistence: Supabase contact gateway",
    "",
    message,
  ].join("\n");

  const { error: insertError } = await db.from("support_bookings").insert({
    id: submissionId,
    sessionId: null,
    userId: null,
    name,
    email,
    subject,
    preferredAt: null,
    status: "pending",
    notes: `${baseNotes}\n\nNotification delivery: pending`,
    createdAt: now,
    updatedAt: now,
  });

  if (insertError) {
    console.error("contact_gateway_insert_failed", insertError.message);
    throw new ContactGatewayError(503, "DATABASE_ERROR", "Contact intake is unavailable.");
  }

  const notificationDelivery = await sendNotification({
    submissionId,
    name,
    email,
    subject,
    message,
  });

  const { error: updateError } = await db
    .from("support_bookings")
    .update({
      notes: `${baseNotes}\n\nNotification delivery: ${notificationDelivery}`,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", submissionId);
  if (updateError) console.error("contact_gateway_delivery_status_update_failed", updateError.message);

  await recordAudit({
    submissionId,
    subject,
    notificationDelivery,
    ipAddress,
    userAgent,
  });

  return {
    ok: true,
    accepted: true,
    submissionId,
    ticketId: null,
    persistence: "supabase_gateway",
    notificationDelivery,
  };
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  if (request.method === "GET") {
    return json({
      ok: true,
      service: "gem-contact-gateway",
      version: "1.0.0",
      persistence: "support_bookings",
      notificationConfigured: Boolean(
        RESEND_API_KEY && CONTACT_EMAIL_FROM && CONTACT_NOTIFICATION_TO,
      ),
      failClosed: true,
    });
  }
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = (await request.json()) as Record<string, unknown>;
    if (body.action !== "submit") {
      throw new ContactGatewayError(400, "UNKNOWN_ACTION", "Unknown action.");
    }
    return json(await submitContact(body));
  } catch (error) {
    if (error instanceof ContactGatewayError) {
      return json({ error: error.message, code: error.code }, error.status);
    }
    console.error(
      "contact_gateway_internal_error",
      error instanceof Error ? error.name : "unknown",
    );
    return json(
      { error: "Contact intake is unavailable.", code: "INTERNAL_ERROR" },
      500,
    );
  }
});
