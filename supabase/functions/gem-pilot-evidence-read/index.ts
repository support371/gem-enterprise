import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.8";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase runtime configuration");
}

const db = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const encoder = new TextEncoder();
const decoder = new TextDecoder();
const ADMIN_ROLES = ["admin", "super_admin", "internal"] as const;
const SAFE_ID = /^[A-Za-z0-9_-]{8,128}$/;
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "https://www.gemcybersecurityassist.com",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

class GatewayError extends Error {
  constructor(
    public status: number,
    public code: string,
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
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function decodeB64url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function signingKey() {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(SERVICE_ROLE_KEY),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
}

async function requireAdmin(token: unknown) {
  if (typeof token !== "string") {
    throw new GatewayError(401, "UNAUTHORIZED", "Authentication required");
  }
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new GatewayError(401, "INVALID_SESSION", "Invalid session token");
  }
  const unsigned = `${parts[0]}.${parts[1]}`;
  const valid = await crypto.subtle.verify(
    "HMAC",
    await signingKey(),
    decodeB64url(parts[2]),
    encoder.encode(unsigned),
  );
  if (!valid) {
    throw new GatewayError(401, "INVALID_SESSION", "Invalid session token");
  }

  const payload = JSON.parse(
    decoder.decode(decodeB64url(parts[1])),
  ) as Record<string, unknown>;
  const userId = typeof payload.sub === "string" ? payload.sub : "";
  const exp = typeof payload.exp === "number" ? payload.exp : 0;
  if (!userId || exp <= Math.floor(Date.now() / 1000)) {
    throw new GatewayError(401, "SESSION_EXPIRED", "Session expired");
  }
  if (
    payload.iss !== "gem-auth-gateway" ||
    payload.aud !== "gem-enterprise"
  ) {
    throw new GatewayError(401, "INVALID_SESSION", "Invalid session issuer");
  }

  const { data: user, error } = await db
    .from("users")
    .select("id,role,status,isActive,isEmailVerified")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw new GatewayError(503, "DATABASE_ERROR", error.message);
  if (!user) {
    throw new GatewayError(401, "ACCOUNT_NOT_FOUND", "Account not found");
  }
  if (!user.isActive || user.status !== "active") {
    throw new GatewayError(403, "ACCOUNT_DISABLED", "Account is not active");
  }
  if (!ADMIN_ROLES.includes(user.role as (typeof ADMIN_ROLES)[number])) {
    throw new GatewayError(403, "FORBIDDEN", "Administrator access required");
  }
}

function requireSafeId(value: unknown, field: string) {
  if (typeof value !== "string" || !SAFE_ID.test(value)) {
    throw new GatewayError(400, "INVALID_IDENTIFIER", `${field} is invalid`);
  }
  return value;
}

function account(value: Record<string, unknown> | null) {
  if (!value) return null;
  return {
    id: String(value.id ?? ""),
    role: String(value.role ?? ""),
    status: String(value.status ?? ""),
    isActive: value.isActive === true,
    isEmailVerified: value.isEmailVerified === true,
  };
}

async function readAccount(id: string) {
  const { data, error } = await db
    .from("users")
    .select("id,role,status,isActive,isEmailVerified")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new GatewayError(503, "DATABASE_ERROR", error.message);
  return account(data as Record<string, unknown> | null);
}

async function pilotEvidenceSource(body: Record<string, unknown>) {
  const applicationId = requireSafeId(body.applicationId, "Application ID");
  const analystId = requireSafeId(body.analystId, "Analyst ID");

  const [applicationResult, analyst] = await Promise.all([
    db
      .from("kyc_applications")
      .select(
        "id,userId,status,reviewerId,formData,submittedAt,reviewedAt,completedAt",
      )
      .eq("id", applicationId)
      .maybeSingle(),
    readAccount(analystId),
  ]);

  if (applicationResult.error) {
    throw new GatewayError(503, "DATABASE_ERROR", applicationResult.error.message);
  }
  if (!applicationResult.data) {
    throw new GatewayError(
      404,
      "APPLICATION_NOT_FOUND",
      "Verification application not found",
    );
  }
  if (!analyst) {
    throw new GatewayError(404, "ANALYST_NOT_FOUND", "Analyst account not found");
  }

  const application = applicationResult.data as Record<string, unknown>;
  const applicantId = requireSafeId(application.userId, "Applicant ID");
  const [applicant, decisionResult, reviewsResult, documentResult] =
    await Promise.all([
      readAccount(applicantId),
      db
        .from("decisions")
        .select("decision,decisionBy,decisionAt")
        .eq("applicationId", applicationId)
        .maybeSingle(),
      db
        .from("kyc_reviews")
        .select("id,reviewerId,action,createdAt")
        .eq("applicationId", applicationId)
        .order("createdAt", { ascending: true }),
      db
        .from("kyc_documents")
        .select("id", { count: "exact", head: true })
        .eq("applicationId", applicationId),
    ]);

  if (!applicant) {
    throw new GatewayError(404, "APPLICANT_NOT_FOUND", "Applicant account not found");
  }
  for (const result of [decisionResult, reviewsResult, documentResult]) {
    if (result.error) {
      throw new GatewayError(503, "DATABASE_ERROR", result.error.message);
    }
  }

  const decision = decisionResult.data as Record<string, unknown> | null;
  const decisionMaker = decision?.decisionBy
    ? await readAccount(requireSafeId(decision.decisionBy, "Decision-maker ID"))
    : null;

  const [applicationAudits, analystAudits] = await Promise.all([
    db
      .from("audit_logs")
      .select("action,resource,resourceId,userId,metadata,createdAt")
      .eq("resource", "verification_application")
      .eq("resourceId", applicationId)
      .order("createdAt", { ascending: true }),
    db
      .from("audit_logs")
      .select("action,resource,resourceId,userId,metadata,createdAt")
      .eq("action", "role_change")
      .eq("resource", "user")
      .eq("resourceId", analystId)
      .order("createdAt", { ascending: true }),
  ]);
  if (applicationAudits.error) {
    throw new GatewayError(503, "DATABASE_ERROR", applicationAudits.error.message);
  }
  if (analystAudits.error) {
    throw new GatewayError(503, "DATABASE_ERROR", analystAudits.error.message);
  }

  const marker = asRecord(asRecord(application.formData)._verificationPilot);
  const audits = [
    ...(applicationAudits.data ?? []),
    ...(analystAudits.data ?? []),
  ]
    .map((audit) => {
      const stage = asRecord(audit.metadata).stage;
      return {
        action: audit.action,
        resource: audit.resource,
        resourceId: audit.resourceId,
        userId: audit.userId,
        metadata: typeof stage === "string" ? { stage } : {},
        createdAt: audit.createdAt,
      };
    })
    .sort(
      (left, right) =>
        new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
    );

  return {
    application: {
      id: String(application.id),
      userId: applicantId,
      status: String(application.status ?? ""),
      reviewerId:
        typeof application.reviewerId === "string"
          ? application.reviewerId
          : null,
      formData: {
        _verificationPilot: {
          synthetic: marker.synthetic === true,
          scenario:
            typeof marker.scenario === "string" ? marker.scenario : null,
          version: typeof marker.version === "number" ? marker.version : null,
        },
      },
      submittedAt: application.submittedAt ?? null,
      reviewedAt: application.reviewedAt ?? null,
      completedAt: application.completedAt ?? null,
      reviews: reviewsResult.data ?? [],
      decision: decision
        ? {
            decision: String(decision.decision ?? ""),
            decisionBy: String(decision.decisionBy ?? ""),
            decisionAt: decision.decisionAt,
          }
        : null,
      documentCount: documentResult.count ?? 0,
    },
    applicant,
    analyst,
    decisionMaker,
    audits,
  };
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }
  if (request.method !== "POST") {
    return json({ error: "Method not allowed", code: "METHOD_NOT_ALLOWED" }, 405);
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    await requireAdmin(body.token);
    return json(await pilotEvidenceSource(body));
  } catch (error) {
    if (error instanceof GatewayError) {
      return json({ error: error.message, code: error.code }, error.status);
    }
    console.error(error);
    return json(
      { error: "Internal gateway error", code: "INTERNAL_ERROR" },
      500,
    );
  }
});
