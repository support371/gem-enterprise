import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.8";

const url = Deno.env.get("SUPABASE_URL") ?? "";
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
if (!url || !serviceKey) throw new Error("Missing Supabase runtime configuration");
const db = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const encoder = new TextEncoder();
const decoder = new TextDecoder();
const adminRoles = new Set(["admin", "super_admin", "internal"]);
const safeId = /^[A-Za-z0-9_-]{8,128}$/;
const cors = {
  "Access-Control-Allow-Origin": "https://www.gemcybersecurityassist.com",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

class GatewayError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...cors,
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function decode(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "="));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function requireAdmin(token: unknown) {
  if (typeof token !== "string") throw new GatewayError(401, "UNAUTHORIZED", "Authentication required");
  const parts = token.split(".");
  if (parts.length !== 3) throw new GatewayError(401, "INVALID_SESSION", "Invalid session token");
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(serviceKey),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    decode(parts[2]),
    encoder.encode(`${parts[0]}.${parts[1]}`),
  );
  if (!valid) throw new GatewayError(401, "INVALID_SESSION", "Invalid session token");
  const payload = JSON.parse(decoder.decode(decode(parts[1]))) as Record<string, unknown>;
  const userId = typeof payload.sub === "string" ? payload.sub : "";
  const exp = typeof payload.exp === "number" ? payload.exp : 0;
  if (!userId || exp <= Math.floor(Date.now() / 1000)) throw new GatewayError(401, "SESSION_EXPIRED", "Session expired");
  if (payload.iss !== "gem-auth-gateway" || payload.aud !== "gem-enterprise") {
    throw new GatewayError(401, "INVALID_SESSION", "Invalid session issuer");
  }
  const actor = await readAccount(userId);
  if (!actor) throw new GatewayError(401, "ACCOUNT_NOT_FOUND", "Account not found");
  if (!actor.isActive || actor.status !== "active") throw new GatewayError(403, "ACCOUNT_DISABLED", "Account is not active");
  if (!adminRoles.has(actor.role)) throw new GatewayError(403, "FORBIDDEN", "Administrator access required");
}

function id(value: unknown, label: string) {
  if (typeof value !== "string" || !safeId.test(value)) {
    throw new GatewayError(400, "INVALID_IDENTIFIER", `${label} is invalid`);
  }
  return value;
}

async function readAccount(accountId: string) {
  const result = await db
    .from("users")
    .select("id,role,status,isActive,isEmailVerified")
    .eq("id", accountId)
    .maybeSingle();
  if (result.error) throw new GatewayError(503, "DATABASE_ERROR", result.error.message);
  if (!result.data) return null;
  return {
    id: String(result.data.id),
    role: String(result.data.role),
    status: String(result.data.status),
    isActive: result.data.isActive === true,
    isEmailVerified: result.data.isEmailVerified === true,
  };
}

function safeMetadata(value: unknown) {
  const source = record(value);
  const output: Record<string, string> = {};
  for (const key of ["stage", "reviewAction", "previousRole", "newRole"]) {
    if (typeof source[key] === "string") output[key] = source[key] as string;
  }
  return output;
}

async function source(body: Record<string, unknown>) {
  const applicationId = id(body.applicationId, "Application ID");
  const analystId = id(body.analystId, "Analyst ID");
  const [applicationResult, analyst] = await Promise.all([
    db.from("kyc_applications")
      .select("id,userId,status,reviewerId,formData,submittedAt,reviewedAt,completedAt")
      .eq("id", applicationId).maybeSingle(),
    readAccount(analystId),
  ]);
  if (applicationResult.error) throw new GatewayError(503, "DATABASE_ERROR", applicationResult.error.message);
  if (!applicationResult.data) throw new GatewayError(404, "APPLICATION_NOT_FOUND", "Verification application not found");
  if (!analyst) throw new GatewayError(404, "ANALYST_NOT_FOUND", "Analyst account not found");

  const application = applicationResult.data as Record<string, unknown>;
  const applicantId = id(application.userId, "Applicant ID");
  const [applicant, decisionResult, reviewsResult, documentsResult] = await Promise.all([
    readAccount(applicantId),
    db.from("decisions").select("decision,decisionBy,decisionAt").eq("applicationId", applicationId).maybeSingle(),
    db.from("kyc_reviews").select("id,reviewerId,action,createdAt").eq("applicationId", applicationId).order("createdAt"),
    db.from("kyc_documents").select("id", { count: "exact", head: true }).eq("applicationId", applicationId),
  ]);
  for (const result of [decisionResult, reviewsResult, documentsResult]) {
    if (result.error) throw new GatewayError(503, "DATABASE_ERROR", result.error.message);
  }
  if (!applicant) throw new GatewayError(404, "APPLICANT_NOT_FOUND", "Applicant account not found");

  const decision = decisionResult.data as Record<string, unknown> | null;
  const decisionMaker = decision?.decisionBy
    ? await readAccount(id(decision.decisionBy, "Decision-maker ID"))
    : null;
  const controlledIds = [applicantId, analystId, decisionMaker?.id].filter(
    (value): value is string => Boolean(value),
  );
  const fields = "action,resource,resourceId,userId,metadata,createdAt";
  const [applicationAudits, analystAudits, loginAudits] = await Promise.all([
    db.from("audit_logs").select(fields).eq("resource", "verification_application").eq("resourceId", applicationId).order("createdAt"),
    db.from("audit_logs").select(fields).eq("action", "role_change").eq("resource", "user").eq("resourceId", analystId).order("createdAt"),
    db.from("audit_logs").select(fields).eq("action", "login").eq("resource", "user").in("resourceId", controlledIds).order("createdAt"),
  ]);
  for (const result of [applicationAudits, analystAudits, loginAudits]) {
    if (result.error) throw new GatewayError(503, "DATABASE_ERROR", result.error.message);
  }

  const marker = record(record(application.formData)._verificationPilot);
  const audits = [
    ...(applicationAudits.data ?? []),
    ...(analystAudits.data ?? []),
    ...(loginAudits.data ?? []),
  ].map((entry) => ({
    action: entry.action,
    resource: entry.resource,
    resourceId: entry.resourceId,
    userId: entry.userId,
    metadata: safeMetadata(entry.metadata),
    createdAt: entry.createdAt,
  })).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return {
    application: {
      id: String(application.id),
      userId: applicantId,
      status: String(application.status ?? ""),
      reviewerId: typeof application.reviewerId === "string" ? application.reviewerId : null,
      formData: { _verificationPilot: {
        synthetic: marker.synthetic === true,
        scenario: typeof marker.scenario === "string" ? marker.scenario : null,
        version: typeof marker.version === "number" ? marker.version : null,
      } },
      submittedAt: application.submittedAt ?? null,
      reviewedAt: application.reviewedAt ?? null,
      completedAt: application.completedAt ?? null,
      reviews: reviewsResult.data ?? [],
      decision: decision ? {
        decision: String(decision.decision ?? ""),
        decisionBy: String(decision.decisionBy ?? ""),
        decisionAt: decision.decisionAt,
      } : null,
      documentCount: documentsResult.count ?? 0,
    },
    applicant,
    analyst,
    decisionMaker,
    audits,
  };
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (request.method !== "POST") return json({ error: "Method not allowed", code: "METHOD_NOT_ALLOWED" }, 405);
  try {
    const body = await request.json() as Record<string, unknown>;
    await requireAdmin(body.token);
    return json(await source(body));
  } catch (error) {
    if (error instanceof GatewayError) return json({ error: error.message, code: error.code }, error.status);
    console.error(error);
    return json({ error: "Internal gateway error", code: "INTERNAL_ERROR" }, 500);
  }
});
