import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.110.8";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
if (!SUPABASE_URL || !SERVICE_ROLE_KEY) throw new Error("Missing Supabase runtime configuration");

const db = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const kinds = new Set(["ENTERPRISE", "COMMUNITY", "PRODUCT_REQUEST"]);
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

Deno.serve(async (request) => {
  if (request.method !== "POST") return json({ error: "Method not allowed", code: "METHOD_NOT_ALLOWED" }, 405);

  const body = await request.json().catch(() => null) as
    | { action?: unknown; input?: Record<string, unknown> }
    | null;
  if (!body || body.action !== "create" || !body.input) {
    return json({ error: "Invalid request", code: "INVALID_REQUEST" }, 400);
  }

  const input = body.input;
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
});
