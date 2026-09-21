import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.110.8";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
if (!SUPABASE_URL || !SERVICE_ROLE_KEY) throw new Error("Missing Supabase runtime configuration");

const db = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const AUTHORITY_URL =
  "https://www.gemcybersecurityassist.com/api/internal/intake-gateway/verify";
const kinds = new Set(["ENTERPRISE", "COMMUNITY", "PRODUCT_REQUEST"]);
const statuses = new Set([
  "RECEIVED",
  "TRIAGE",
  "NEEDS_INFORMATION",
  "QUALIFIED",
  "APPROVED",
  "DECLINED",
  "CONVERTED",
  "CLOSED",
]);
const queues: Record<string, string> = {
  ENTERPRISE: "intake:enterprise",
  COMMUNITY: "intake:community",
  PRODUCT_REQUEST: "intake:product",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function text(value: unknown, min: number, max: number): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length >= min && normalized.length <= max ? normalized : null;
}

function optionalText(value: unknown, max: number): string | null {
  if (value == null || value === "") return null;
  return text(value, 1, max);
}

function mapSubmission(row: Record<string, unknown>) {
  return {
    id: row.id,
    publicId: row.public_id,
    kind: row.kind,
    status: row.status,
    queue: row.queue,
    userId: row.user_id,
    assignedToId: row.assigned_to_id,
    productSlug: row.product_slug,
    productName: row.product_name,
    productSku: row.product_sku,
    productCategory: row.product_category,
    name: row.name,
    email: row.email,
    phone: row.phone,
    organization: row.organization,
    title: row.title,
    jurisdiction: row.jurisdiction,
    subject: row.subject,
    message: row.message,
    payload: row.payload,
    consentVersion: row.consent_version,
    consentGivenAt: row.consent_given_at,
    privacyVersion: row.privacy_version,
    privacyAcceptedAt: row.privacy_accepted_at,
    source: row.source,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapEvent(row: Record<string, unknown>) {
  return {
    id: row.id,
    submissionId: row.submission_id,
    fromStatus: row.from_status,
    toStatus: row.to_status,
    actorId: row.actor_id,
    reason: row.reason,
    metadata: row.metadata,
    createdAt: row.created_at,
  };
}

async function authorize(
  action: "list" | "get" | "update" | "convert",
  intakeId: string | null,
  capability: unknown,
): Promise<{ actorId: string | null } | null> {
  const token = text(capability, 32, 4096);
  if (!token) return null;
  try {
    const response = await fetch(AUTHORITY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, action, intakeId }),
    });
    const body = (await response.json().catch(() => null)) as
      | { valid?: boolean; actorId?: string | null }
      | null;
    if (!response.ok || body?.valid !== true) return null;
    return {
      actorId: typeof body.actorId === "string" ? body.actorId : null,
    };
  } catch {
    return null;
  }
}

async function createPublicIntake(input: Record<string, unknown>) {
  const kind = typeof input.kind === "string" && kinds.has(input.kind) ? input.kind : null;
  const queue = typeof input.queue === "string" ? input.queue : null;
  const name = text(input.name, 2, 160);
  const email = text(input.email, 3, 320)?.toLowerCase() ?? null;
  const subject = text(input.subject, 5, 240);
  const message = text(input.message, 20, 5000);
  const consentVersion = text(input.consentVersion, 3, 128);
  const privacyVersion = text(input.privacyVersion, 3, 128);
  const payload =
    input.payload && typeof input.payload === "object" && !Array.isArray(input.payload)
      ? input.payload
      : null;

  if (
    !kind || queue !== queues[kind] || !name || !email ||
    !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ||
    !subject || !message || !consentVersion || !privacyVersion || !payload ||
    JSON.stringify(payload).length > 20000 || input.source !== "web"
  ) {
    return json({ error: "Validation failed", code: "VALIDATION_FAILED" }, 400);
  }

  const product =
    input.product && typeof input.product === "object" && !Array.isArray(input.product)
      ? input.product as Record<string, unknown>
      : null;
  if (kind === "PRODUCT_REQUEST" && !text(product?.slug, 1, 160)) {
    return json({ error: "Product reference required", code: "INVALID_PRODUCT_REFERENCE" }, 400);
  }

  const id = crypto.randomUUID();
  const eventId = crypto.randomUUID();
  const prefix = kind === "ENTERPRISE" ? "ENT" : kind === "COMMUNITY" ? "COM" : "PRD";
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const suffix = crypto.randomUUID().replaceAll("-", "").slice(0, 10).toUpperCase();
  const publicId = `GEM-${prefix}-${date}-${suffix}`;
  const now = new Date().toISOString();

  const hash = (value: unknown) =>
    typeof value === "string" && /^[a-f0-9]{64}$/i.test(value) ? value.toLowerCase() : null;

  const { data, error } = await db.rpc("gem_create_public_intake", {
    p_id: id,
    p_event_id: eventId,
    p_public_id: publicId,
    p_kind: kind,
    p_queue: queue,
    p_user_id: optionalText(input.userId, 128),
    p_product_slug: optionalText(product?.slug, 160),
    p_product_name: optionalText(product?.name, 240),
    p_product_sku: optionalText(product?.sku, 160),
    p_product_category: optionalText(product?.category, 160),
    p_name: name,
    p_email: email,
    p_phone: optionalText(input.phone, 80),
    p_organization: optionalText(input.organization, 240),
    p_title: optionalText(input.title, 160),
    p_jurisdiction: optionalText(input.jurisdiction, 240),
    p_subject: subject,
    p_message: message,
    p_payload: payload,
    p_consent_version: consentVersion,
    p_privacy_version: privacyVersion,
    p_source: "web",
    p_ip_hash: hash(input.ipHash),
    p_user_agent_hash: hash(input.userAgentHash),
    p_now: now,
  });

  if (error || !Array.isArray(data) || !data[0]) {
    console.error("gem_create_public_intake failed", error?.code, error?.message);
    return json({ error: "The request could not be recorded", code: "INTAKE_WRITE_FAILED" }, 500);
  }

  return json({ submission: mapSubmission(data[0] as Record<string, unknown>) }, 201);
}

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed", code: "METHOD_NOT_ALLOWED" }, 405);
  }

  const body = await request.json().catch(() => null) as
    | {
        action?: unknown;
        input?: Record<string, unknown>;
        capability?: unknown;
        filters?: Record<string, unknown>;
        intakeId?: unknown;
        transition?: Record<string, unknown>;
        payment?: Record<string, unknown>;
      }
    | null;
  if (!body || typeof body.action !== "string") {
    return json({ error: "Invalid request", code: "INVALID_REQUEST" }, 400);
  }

  if (body.action === "create") {
    if (!body.input) return json({ error: "Invalid request", code: "INVALID_REQUEST" }, 400);
    return createPublicIntake(body.input);
  }

  if (body.action === "list") {
    const authority = await authorize("list", null, body.capability);
    if (!authority) return json({ error: "Forbidden", code: "CAPABILITY_REQUIRED" }, 403);

    const filters = body.filters ?? {};
    const kind = typeof filters.kind === "string" && kinds.has(filters.kind) ? filters.kind : null;
    const status =
      typeof filters.status === "string" && statuses.has(filters.status) ? filters.status : null;
    const queue = optionalText(filters.queue, 80);
    const requestedLimit =
      typeof filters.limit === "number" && Number.isInteger(filters.limit) ? filters.limit : 100;
    const limit = Math.min(Math.max(requestedLimit, 1), 250);

    let query = db
      .from("intake_submissions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (kind) query = query.eq("kind", kind);
    if (status) query = query.eq("status", status);
    if (queue) query = query.eq("queue", queue);

    const { data, error } = await query;
    if (error) return json({ error: "Unable to load intake", code: "INTAKE_READ_FAILED" }, 500);
    return json({ submissions: (data ?? []).map((row) => mapSubmission(row)) });
  }

  const intakeId = text(body.intakeId, 1, 128);
  if (!intakeId) return json({ error: "Invalid intake reference", code: "INVALID_INTAKE_ID" }, 400);

  if (body.action === "get") {
    const authority = await authorize("get", intakeId, body.capability);
    if (!authority) return json({ error: "Forbidden", code: "CAPABILITY_REQUIRED" }, 403);

    const { data: submission, error: submissionError } = await db
      .from("intake_submissions")
      .select("*")
      .eq("id", intakeId)
      .maybeSingle();
    if (submissionError) return json({ error: "Unable to load intake", code: "INTAKE_READ_FAILED" }, 500);
    if (!submission) return json({ error: "Intake not found", code: "INTAKE_NOT_FOUND" }, 404);

    const { data: events, error: eventsError } = await db
      .from("intake_status_events")
      .select("*")
      .eq("submission_id", intakeId)
      .order("created_at", { ascending: true });
    if (eventsError) return json({ error: "Unable to load intake history", code: "INTAKE_READ_FAILED" }, 500);

    return json({
      submission: mapSubmission(submission),
      events: (events ?? []).map((row) => mapEvent(row)),
    });
  }

  if (body.action === "update") {
    const authority = await authorize("update", intakeId, body.capability);
    if (!authority?.actorId) return json({ error: "Forbidden", code: "CAPABILITY_REQUIRED" }, 403);
    const transition = body.transition ?? {};
    const expectedStatus =
      typeof transition.expectedStatus === "string" && statuses.has(transition.expectedStatus)
        ? transition.expectedStatus
        : null;
    const nextStatus =
      typeof transition.status === "string" && statuses.has(transition.status)
        ? transition.status
        : null;
    const reason = text(transition.reason, 10, 1000);
    const assignmentSupplied = Object.prototype.hasOwnProperty.call(transition, "assignedToId");
    const assignedToId = optionalText(transition.assignedToId, 128);
    if (!expectedStatus || !nextStatus || !reason) {
      return json({ error: "Invalid transition", code: "INVALID_TRANSITION" }, 400);
    }

    const { data, error } = await db.rpc("gem_transition_intake", {
      p_id: intakeId,
      p_event_id: crypto.randomUUID(),
      p_expected_status: expectedStatus,
      p_next_status: nextStatus,
      p_actor_id: authority.actorId,
      p_reason: reason,
      p_metadata: { source: "intake_gateway", action: "admin_status_transition" },
      p_assignment_supplied: assignmentSupplied,
      p_assigned_to_id: assignedToId,
      p_now: new Date().toISOString(),
    });
    if (error || !Array.isArray(data) || !data[0]) {
      return json({ error: "Unable to update intake", code: "INTAKE_UPDATE_FAILED" }, 500);
    }
    const result = data[0] as { outcome?: string; current_status?: string; submission?: Record<string, unknown> };
    if (result.outcome === "not_found") return json({ error: "Intake not found", code: "INTAKE_NOT_FOUND" }, 404);
    if (result.outcome === "conflict" || result.outcome === "invalid_transition") {
      return json({
        error: "Intake status changed or transition is not allowed.",
        code: "STALE_INTAKE_STATUS",
        currentStatus: result.current_status ?? null,
      }, 409);
    }
    if (result.outcome !== "updated" || !result.submission) {
      return json({ error: "Unable to update intake", code: "INTAKE_UPDATE_FAILED" }, 500);
    }
    return json({ submission: mapSubmission(result.submission) });
  }

  if (body.action === "convert") {
    const authority = await authorize("convert", intakeId, body.capability);
    if (!authority) return json({ error: "Forbidden", code: "CAPABILITY_REQUIRED" }, 403);
    const payment =
      body.payment && typeof body.payment === "object" && !Array.isArray(body.payment)
        ? body.payment
        : null;
    const stripeSessionId = text(payment?.stripeSessionId, 1, 255);
    const stripePaymentIntentId = optionalText(payment?.stripePaymentIntentId, 255);
    if (!stripeSessionId) return json({ error: "Invalid payment evidence", code: "INVALID_PAYMENT_EVIDENCE" }, 400);

    const { data, error } = await db.rpc("gem_transition_intake", {
      p_id: intakeId,
      p_event_id: crypto.randomUUID(),
      p_expected_status: "APPROVED",
      p_next_status: "CONVERTED",
      p_actor_id: null,
      p_reason: "Verified GEM Stripe payment completed",
      p_metadata: {
        source: "stripe_webhook",
        stripeSessionId,
        stripePaymentIntentId,
        offerCode: payment?.offerCode ?? null,
        amountUsd: payment?.amountUsd ?? null,
      },
      p_assignment_supplied: false,
      p_assigned_to_id: null,
      p_now: new Date().toISOString(),
    });
    if (error || !Array.isArray(data) || !data[0]) {
      return json({ error: "Unable to reconcile payment", code: "PAYMENT_CONVERSION_FAILED" }, 500);
    }
    const result = data[0] as { outcome?: string; current_status?: string };
    if (result.outcome === "updated") return json({ outcome: "converted" });
    if (result.outcome === "not_found") return json({ outcome: "not_found" });
    if (result.current_status === "CONVERTED") return json({ outcome: "already_converted" });
    return json({ outcome: "ignored", status: result.current_status ?? "UNKNOWN" });
  }

  return json({ error: "Unsupported action", code: "UNSUPPORTED_ACTION" }, 400);
});
