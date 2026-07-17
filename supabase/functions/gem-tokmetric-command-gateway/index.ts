import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.8";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const WORKSPACE_ID = "ws_60488340ded94dcfab3b875ef9ae591c";
const ADMIN_ROLES = ["admin", "super_admin", "internal"] as const;
const encoder = new TextEncoder();
const decoder = new TextDecoder();

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase runtime configuration");
}

const db = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

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
      "Referrer-Policy": "no-referrer",
    },
  });
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

function validSessionVersion(value: unknown): value is number {
  return Number.isSafeInteger(value) && Number(value) >= 0;
}

async function requireOperator(token: unknown) {
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
  const sessionVersion = payload.sessionVersion;
  if (
    !userId ||
    exp <= Math.floor(Date.now() / 1000) ||
    !validSessionVersion(sessionVersion)
  ) {
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
    .select("id,email,role,status,isActive,sessionVersion")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw new GatewayError(503, "DATABASE_ERROR", error.message);
  if (!user) throw new GatewayError(401, "ACCOUNT_NOT_FOUND", "Account not found");
  if (!user.isActive || user.status !== "active") {
    throw new GatewayError(403, "ACCOUNT_DISABLED", "Account is not active");
  }
  if (user.sessionVersion !== sessionVersion) {
    throw new GatewayError(401, "SESSION_REVOKED", "Session revoked");
  }
  if (!ADMIN_ROLES.includes(user.role as (typeof ADMIN_ROLES)[number])) {
    throw new GatewayError(403, "FORBIDDEN", "Administrator access required");
  }
  return user as { id: string; email: string; role: string };
}

function requiredText(
  value: unknown,
  field: string,
  minLength: number,
  maxLength: number,
) {
  if (typeof value !== "string") {
    throw new GatewayError(400, "INVALID_REQUEST", `${field} is required`);
  }
  const normalized = value.trim();
  if (normalized.length < minLength || normalized.length > maxLength) {
    throw new GatewayError(400, "INVALID_REQUEST", `${field} is invalid`);
  }
  return normalized;
}

function optionalText(value: unknown, maxLength: number) {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string" || value.length > maxLength) {
    throw new GatewayError(400, "INVALID_REQUEST", "Text value is invalid");
  }
  return value.trim() || null;
}

function uniqueStrings(value: unknown, maxItems: number, maxLength: number) {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > maxItems) {
    throw new GatewayError(400, "INVALID_REQUEST", "List value is invalid");
  }
  return [...new Set(value.map((item) => {
    if (typeof item !== "string" || item.length > maxLength) {
      throw new GatewayError(400, "INVALID_REQUEST", "List item is invalid");
    }
    return item.trim();
  }).filter(Boolean))];
}

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, entry]) => [key, canonical(entry)]),
    );
  }
  return value;
}

async function objectHash(value: unknown) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode(JSON.stringify(canonical(value))),
  );
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function id(prefix: string) {
  return `${prefix}_${crypto.randomUUID().replaceAll("-", "")}`;
}

async function requireWorkspace() {
  const { data, error } = await db
    .from("tokmetric_workspaces")
    .select(
      "id,name,slug,globalEmergencyLock,publishingDisabled,advertisingDisabled,shopWriteDisabled,connectorDisabled,createdAt,updatedAt",
    )
    .eq("id", WORKSPACE_ID)
    .maybeSingle();
  if (error) throw new GatewayError(503, "DATABASE_ERROR", error.message);
  if (!data) throw new GatewayError(404, "WORKSPACE_NOT_FOUND", "Workspace not found");
  return data;
}

async function audit(
  actorId: string,
  action: string,
  entityType: string,
  entityId: string | null,
  outcome: string,
  metadata: Record<string, unknown> = {},
) {
  const now = new Date().toISOString();
  const correlationId = crypto.randomUUID();
  const { error } = await db.from("tokmetric_audit_events").insert({
    id: id("audit"),
    workspaceId: WORKSPACE_ID,
    actorId,
    action,
    entityType,
    entityId,
    correlationId,
    outcome,
    sourceChannel: "command_center",
    safeMetadata: metadata,
    createdAt: now,
  });
  if (error) console.error("tokmetric_activation_audit_failed", error.message);
}

async function domainEvent(
  aggregateType: string,
  aggregateId: string,
  eventType: string,
  metadata: Record<string, unknown> = {},
) {
  const { error } = await db.from("tokmetric_domain_events").insert({
    id: id("event"),
    workspaceId: WORKSPACE_ID,
    aggregateType,
    aggregateId,
    eventType,
    correlationId: crypto.randomUUID(),
    safeMetadata: metadata,
    createdAt: new Date().toISOString(),
  });
  if (error) console.error("tokmetric_domain_event_failed", error.message);
}

function dataOrThrow<T>(
  result: { data: T | null; error: { message: string } | null },
  code = "DATABASE_ERROR",
) {
  if (result.error) throw new GatewayError(503, code, result.error.message);
  return result.data;
}

async function snapshot(actor: { id: string; role: string }) {
  const workspace = await requireWorkspace();
  const [connectorsResult, contentsResult, reviewsResult, approvalsResult, jobsResult, analyticsResult, auditsResult, credentialCountResult] = await Promise.all([
    db.from("tokmetric_connectors").select("id,provider,state,displayName,externalAccountId,grantedScopes,lastHealthAt,updatedAt").eq("workspaceId", WORKSPACE_ID).order("updatedAt", { ascending: false }),
    db.from("tokmetric_contents").select("id,title,state,currentVersionId,campaignId,createdAt,updatedAt").eq("workspaceId", WORKSPACE_ID).order("updatedAt", { ascending: false }).limit(50),
    db.from("tokmetric_compliance_reviews").select("id,contentId,contentVersionId,result,findings,createdAt").eq("workspaceId", WORKSPACE_ID).order("createdAt", { ascending: false }).limit(50),
    db.from("tokmetric_approval_requests").select("id,contentId,contentVersionId,requiredRole,action,objectHash,state,expiresAt,createdAt,updatedAt").eq("workspaceId", WORKSPACE_ID).order("updatedAt", { ascending: false }).limit(50),
    db.from("tokmetric_publish_jobs").select("id,connectorId,contentId,contentVersionId,internalState,externalState,scheduledFor,createdAt,updatedAt").eq("workspaceId", WORKSPACE_ID).order("updatedAt", { ascending: false }).limit(50),
    db.from("tokmetric_analytics_snapshots").select("id,source,metric,value,dimensions,capturedAt").eq("workspaceId", WORKSPACE_ID).order("capturedAt", { ascending: false }).limit(100),
    db.from("tokmetric_audit_events").select("id,action,entityType,entityId,outcome,sourceChannel,safeMetadata,createdAt").eq("workspaceId", WORKSPACE_ID).order("createdAt", { ascending: false }).limit(50),
    db.from("tokmetric_gpt_credentials").select("id", { count: "exact", head: true }).eq("workspace_id", WORKSPACE_ID).eq("status", "active"),
  ]);

  const connectors = dataOrThrow(connectorsResult) ?? [];
  const contents = dataOrThrow(contentsResult) ?? [];
  const reviews = dataOrThrow(reviewsResult) ?? [];
  const approvals = dataOrThrow(approvalsResult) ?? [];
  const publishJobs = dataOrThrow(jobsResult) ?? [];
  const analytics = dataOrThrow(analyticsResult) ?? [];
  const audits = dataOrThrow(auditsResult) ?? [];
  if (credentialCountResult.error) {
    throw new GatewayError(503, "DATABASE_ERROR", credentialCountResult.error.message);
  }

  const configMissing = [
    !Deno.env.get("TIKTOK_CLIENT_KEY") ? "TIKTOK_CLIENT_KEY" : null,
    !Deno.env.get("TIKTOK_CLIENT_SECRET") ? "TIKTOK_CLIENT_SECRET" : null,
    !Deno.env.get("TIKTOK_REDIRECT_URI") ? "TIKTOK_REDIRECT_URI" : null,
    !Deno.env.get("TOKMETRIC_TOKEN_ENCRYPTION_KEY") ? "TOKMETRIC_TOKEN_ENCRYPTION_KEY" : null,
  ].filter(Boolean);
  const oauthEnabled = Deno.env.get("TOKMETRIC_TIKTOK_OAUTH_ENABLED") === "true";
  const livePublishingEnabled = Deno.env.get("TOKMETRIC_LIVE_PUBLISHING_ENABLED") === "true";
  const connectedPublishingConnector = connectors.some((connector) =>
    connector.provider === "TIKTOK_CONTENT_POSTING_API" && connector.state === "CONNECTED"
  );
  const approvedContentCount = contents.filter((content) => content.state === "APPROVED").length;
  const pendingApprovalCount = approvals.filter((approval) => approval.state === "APPROVAL_REQUIRED").length;
  const blockers: string[] = [];
  if (workspace.globalEmergencyLock) blockers.push("GLOBAL_EMERGENCY_LOCK");
  if (workspace.connectorDisabled) blockers.push("CONNECTORS_DISABLED");
  if (workspace.publishingDisabled) blockers.push("WORKSPACE_PUBLISHING_DISABLED");
  if (configMissing.length > 0) blockers.push("TIKTOK_CONFIGURATION_MISSING");
  if (!oauthEnabled) blockers.push("TIKTOK_OAUTH_DISABLED");
  if (!connectedPublishingConnector) blockers.push("CONTENT_POSTING_CONNECTOR_NOT_CONNECTED");
  if (approvedContentCount === 0) blockers.push("NO_APPROVED_CONTENT_VERSION");
  if (!livePublishingEnabled) blockers.push("LIVE_PUBLISHING_GATE_DISABLED");

  return {
    ok: true,
    viewer: { id: actor.id, role: actor.role },
    workspace,
    counts: {
      connectors: connectors.length,
      connectedConnectors: connectors.filter((connector) => connector.state === "CONNECTED").length,
      contents: contents.length,
      approvedContents: approvedContentCount,
      pendingApprovals: pendingApprovalCount,
      publishJobs: publishJobs.length,
      analyticsSnapshots: analytics.length,
      activeGptCredentials: credentialCountResult.count ?? 0,
    },
    activation: {
      productionActivation: blockers.length === 0 ? "READY" : "BLOCKED",
      controlledWriteMode: "COMMAND_CENTER_ONLY",
      oauthEnabled,
      livePublishingEnabled,
      connectedPublishingConnector,
      configMissing,
      blockers,
    },
    connectors,
    contents,
    complianceReviews: reviews,
    approvals,
    publishJobs,
    analytics,
    auditEvents: audits,
    externalActionTaken: false,
  };
}

async function createDraft(actor: { id: string }, body: Record<string, unknown>) {
  await requireWorkspace();
  const title = requiredText(body.title, "title", 1, 200);
  const script = optionalText(body.script, 10000);
  const caption = optionalText(body.caption, 2200);
  const hashtags = uniqueStrings(body.hashtags, 50, 100);
  const settings = body.settings && typeof body.settings === "object" && !Array.isArray(body.settings)
    ? body.settings as Record<string, unknown>
    : {};
  const contentId = id("content");
  const versionId = id("contentver");
  const payload = { script, caption, hashtags, settings, mediaAssetIds: [] };
  const hash = await objectHash(payload);
  const now = new Date().toISOString();

  const contentInsert = await db.from("tokmetric_contents").insert({
    id: contentId,
    workspaceId: WORKSPACE_ID,
    campaignId: null,
    ownerId: actor.id,
    title,
    state: "DRAFT",
    currentVersionId: null,
    createdAt: now,
    updatedAt: now,
  });
  if (contentInsert.error) throw new GatewayError(503, "CONTENT_CREATE_FAILED", contentInsert.error.message);

  const versionInsert = await db.from("tokmetric_content_versions").insert({
    id: versionId,
    contentId,
    version: 1,
    objectHash: hash,
    script,
    caption,
    hashtags,
    settings,
    mediaAssetIds: [],
    createdById: actor.id,
    createdAt: now,
  });
  if (versionInsert.error) {
    await db.from("tokmetric_contents").delete().eq("id", contentId);
    throw new GatewayError(503, "CONTENT_VERSION_CREATE_FAILED", versionInsert.error.message);
  }
  const update = await db.from("tokmetric_contents").update({ currentVersionId: versionId, updatedAt: now }).eq("id", contentId);
  if (update.error) throw new GatewayError(503, "CONTENT_UPDATE_FAILED", update.error.message);

  await Promise.all([
    audit(actor.id, "tokmetric.content.created", "content", contentId, "success", { versionId, objectHash: hash }),
    domainEvent("content", contentId, "CONTENT_DRAFT_CREATED", { versionId, objectHash: hash }),
  ]);
  return { ok: true, content: { id: contentId, title, state: "DRAFT", currentVersionId: versionId }, version: { id: versionId, version: 1, objectHash: hash }, externalActionTaken: false };
}

async function createVersion(actor: { id: string }, body: Record<string, unknown>) {
  const contentId = requiredText(body.contentId, "contentId", 3, 200);
  const { data: content, error: contentError } = await db.from("tokmetric_contents").select("id,title,state,currentVersionId").eq("workspaceId", WORKSPACE_ID).eq("id", contentId).maybeSingle();
  if (contentError) throw new GatewayError(503, "DATABASE_ERROR", contentError.message);
  if (!content) throw new GatewayError(404, "CONTENT_NOT_FOUND", "Content not found");
  if (["APPROVED", "ARCHIVED"].includes(content.state)) throw new GatewayError(409, "CONTENT_IMMUTABLE", "Approved or archived content cannot be edited directly");

  const script = optionalText(body.script, 10000);
  const caption = optionalText(body.caption, 2200);
  const hashtags = uniqueStrings(body.hashtags, 50, 100);
  const settings = body.settings && typeof body.settings === "object" && !Array.isArray(body.settings)
    ? body.settings as Record<string, unknown>
    : {};
  const payload = { script, caption, hashtags, settings, mediaAssetIds: [] };
  const hash = await objectHash(payload);
  const { data: existing, error: existingError } = await db.from("tokmetric_content_versions").select("id,version,objectHash").eq("contentId", contentId).eq("objectHash", hash).maybeSingle();
  if (existingError) throw new GatewayError(503, "DATABASE_ERROR", existingError.message);
  if (existing) return { ok: true, reused: true, version: existing, externalActionTaken: false };

  const { data: latest, error: latestError } = await db.from("tokmetric_content_versions").select("version").eq("contentId", contentId).order("version", { ascending: false }).limit(1).maybeSingle();
  if (latestError) throw new GatewayError(503, "DATABASE_ERROR", latestError.message);
  const version = (latest?.version ?? 0) + 1;
  const versionId = id("contentver");
  const now = new Date().toISOString();
  const insert = await db.from("tokmetric_content_versions").insert({ id: versionId, contentId, version, objectHash: hash, script, caption, hashtags, settings, mediaAssetIds: [], createdById: actor.id, createdAt: now });
  if (insert.error) throw new GatewayError(503, "CONTENT_VERSION_CREATE_FAILED", insert.error.message);
  const update = await db.from("tokmetric_contents").update({ currentVersionId: versionId, state: "DRAFT", updatedAt: now }).eq("id", contentId);
  if (update.error) throw new GatewayError(503, "CONTENT_UPDATE_FAILED", update.error.message);
  await domainEvent("content", contentId, "CONTENT_VERSION_CREATED", { versionId, objectHash: hash, version });
  return { ok: true, reused: false, version: { id: versionId, version, objectHash: hash }, externalActionTaken: false };
}

async function runReview(actor: { id: string }, body: Record<string, unknown>) {
  const contentId = requiredText(body.contentId, "contentId", 3, 200);
  const { data: content, error: contentError } = await db.from("tokmetric_contents").select("id,currentVersionId").eq("workspaceId", WORKSPACE_ID).eq("id", contentId).maybeSingle();
  if (contentError) throw new GatewayError(503, "DATABASE_ERROR", contentError.message);
  if (!content?.currentVersionId) throw new GatewayError(404, "CONTENT_NOT_FOUND", "Content or active version not found");
  const { data: version, error: versionError } = await db.from("tokmetric_content_versions").select("id,objectHash,script,caption,hashtags").eq("id", content.currentVersionId).maybeSingle();
  if (versionError) throw new GatewayError(503, "DATABASE_ERROR", versionError.message);
  if (!version) throw new GatewayError(409, "CONTENT_VERSION_MISSING", "Content version not found");

  const findings: Array<{ code: string; severity: string; message: string }> = [];
  const combined = `${version.script ?? ""}\n${version.caption ?? ""}`.toLowerCase();
  if (!combined.trim()) findings.push({ code: "EMPTY_CONTENT", severity: "block", message: "Content script and caption are empty." });
  if (combined.includes("guaranteed profit") || combined.includes("risk-free return")) findings.push({ code: "MISLEADING_FINANCIAL_CLAIM", severity: "block", message: "Unsupported guaranteed or risk-free financial claim detected." });
  if (combined.includes("100% secure") || combined.includes("unhackable")) findings.push({ code: "ABSOLUTE_SECURITY_CLAIM", severity: "warning", message: "Absolute cybersecurity claims require substantiation or revision." });
  if ((version.hashtags ?? []).length > 30) findings.push({ code: "HASHTAG_LIMIT", severity: "warning", message: "Hashtag count exceeds the review threshold." });
  const hasBlock = findings.some((finding) => finding.severity === "block");
  const hasWarning = findings.some((finding) => finding.severity === "warning");
  const result = hasBlock ? "BLOCKED" : hasWarning ? "HUMAN_REVIEW_REQUIRED" : "PASS";
  const nextState = hasBlock ? "BLOCKED" : hasWarning ? "REVIEW_READY" : "APPROVAL_REQUIRED";
  const reviewId = id("review");
  const now = new Date().toISOString();
  const insert = await db.from("tokmetric_compliance_reviews").insert({ id: reviewId, workspaceId: WORKSPACE_ID, contentId, contentVersionId: version.id, policyVersionId: null, result, findings, reviewerId: actor.id, createdAt: now });
  if (insert.error) throw new GatewayError(503, "COMPLIANCE_REVIEW_FAILED", insert.error.message);
  const update = await db.from("tokmetric_contents").update({ state: nextState, updatedAt: now }).eq("id", contentId);
  if (update.error) throw new GatewayError(503, "CONTENT_UPDATE_FAILED", update.error.message);
  await audit(actor.id, "tokmetric.compliance.reviewed", "compliance_review", reviewId, hasBlock ? "blocked" : "success", { contentId, contentVersionId: version.id, result, findings });
  return { ok: true, review: { id: reviewId, contentId, contentVersionId: version.id, result, findings }, contentState: nextState, externalActionTaken: false };
}

async function requestApproval(actor: { id: string }, body: Record<string, unknown>) {
  const contentId = requiredText(body.contentId, "contentId", 3, 200);
  const requiredRole = typeof body.requiredRole === "string" && body.requiredRole.trim() ? body.requiredRole.trim().slice(0, 100) : "approver";
  const expiresAt = typeof body.expiresAt === "string" ? new Date(body.expiresAt) : null;
  if (expiresAt && !Number.isFinite(expiresAt.getTime())) throw new GatewayError(400, "INVALID_EXPIRY", "Approval expiry is invalid");
  const { data: content, error: contentError } = await db.from("tokmetric_contents").select("id,currentVersionId").eq("workspaceId", WORKSPACE_ID).eq("id", contentId).maybeSingle();
  if (contentError) throw new GatewayError(503, "DATABASE_ERROR", contentError.message);
  if (!content?.currentVersionId) throw new GatewayError(404, "CONTENT_NOT_FOUND", "Content or active version not found");
  const { data: version, error: versionError } = await db.from("tokmetric_content_versions").select("id,objectHash").eq("id", content.currentVersionId).maybeSingle();
  if (versionError) throw new GatewayError(503, "DATABASE_ERROR", versionError.message);
  if (!version) throw new GatewayError(409, "CONTENT_VERSION_MISSING", "Content version not found");
  const { data: blockingReview, error: reviewError } = await db.from("tokmetric_compliance_reviews").select("id,result").eq("contentVersionId", version.id).in("result", ["BLOCKED", "CHANGES_REQUIRED"]).order("createdAt", { ascending: false }).limit(1).maybeSingle();
  if (reviewError) throw new GatewayError(503, "DATABASE_ERROR", reviewError.message);
  if (blockingReview) throw new GatewayError(409, "COMPLIANCE_BLOCKED", "Resolve blocking compliance findings first");
  const approvalId = id("approval");
  const now = new Date().toISOString();
  const insert = await db.from("tokmetric_approval_requests").insert({ id: approvalId, workspaceId: WORKSPACE_ID, contentId, contentVersionId: version.id, requestedById: actor.id, requiredRole, action: "publish_tiktok_content", objectHash: version.objectHash, state: "APPROVAL_REQUIRED", expiresAt: expiresAt?.toISOString() ?? null, createdAt: now, updatedAt: now });
  if (insert.error) throw new GatewayError(503, "APPROVAL_CREATE_FAILED", insert.error.message);
  const update = await db.from("tokmetric_contents").update({ state: "APPROVAL_REQUIRED", updatedAt: now }).eq("id", contentId);
  if (update.error) throw new GatewayError(503, "CONTENT_UPDATE_FAILED", update.error.message);
  await audit(actor.id, "tokmetric.approval.requested", "approval", approvalId, "success", { contentId, contentVersionId: version.id, requiredRole });
  return { ok: true, approval: { id: approvalId, contentId, contentVersionId: version.id, state: "APPROVAL_REQUIRED", requiredRole }, externalActionTaken: false };
}

async function decideApproval(actor: { id: string }, body: Record<string, unknown>) {
  const approvalId = requiredText(body.approvalId, "approvalId", 3, 200);
  const decision = requiredText(body.decision, "decision", 3, 20).toLowerCase();
  if (!["approve", "reject", "revoke"].includes(decision)) throw new GatewayError(400, "INVALID_DECISION", "Approval decision is invalid");
  const reason = optionalText(body.reason, 2000);
  const { data: approval, error: approvalError } = await db.from("tokmetric_approval_requests").select("id,contentId,contentVersionId,objectHash,state,expiresAt").eq("workspaceId", WORKSPACE_ID).eq("id", approvalId).maybeSingle();
  if (approvalError) throw new GatewayError(503, "DATABASE_ERROR", approvalError.message);
  if (!approval?.contentVersionId) throw new GatewayError(404, "APPROVAL_NOT_FOUND", "Approval request not found");
  if (approval.expiresAt && new Date(approval.expiresAt).getTime() <= Date.now()) {
    await db.from("tokmetric_approval_requests").update({ state: "EXPIRED", updatedAt: new Date().toISOString() }).eq("id", approvalId);
    throw new GatewayError(409, "APPROVAL_EXPIRED", "Approval request has expired");
  }
  const { data: version, error: versionError } = await db.from("tokmetric_content_versions").select("id,objectHash").eq("id", approval.contentVersionId).maybeSingle();
  if (versionError) throw new GatewayError(503, "DATABASE_ERROR", versionError.message);
  if (!version || version.objectHash !== approval.objectHash) {
    await db.from("tokmetric_approval_requests").update({ state: "REVOKED", updatedAt: new Date().toISOString() }).eq("id", approvalId);
    throw new GatewayError(409, "APPROVAL_VERSION_MISMATCH", "Approval no longer matches the content version");
  }
  const nextState = decision === "approve" ? "APPROVED" : decision === "reject" ? "REJECTED" : "REVOKED";
  const now = new Date().toISOString();
  const decisionInsert = await db.from("tokmetric_approval_decisions").insert({ id: id("decision"), approvalRequestId: approvalId, actorId: actor.id, decision, objectHash: approval.objectHash, reason, createdAt: now });
  if (decisionInsert.error) throw new GatewayError(503, "APPROVAL_DECISION_FAILED", decisionInsert.error.message);
  const approvalUpdate = await db.from("tokmetric_approval_requests").update({ state: nextState, updatedAt: now }).eq("id", approvalId);
  if (approvalUpdate.error) throw new GatewayError(503, "APPROVAL_UPDATE_FAILED", approvalUpdate.error.message);
  if (approval.contentId) {
    const contentUpdate = await db.from("tokmetric_contents").update({ state: nextState, updatedAt: now }).eq("id", approval.contentId);
    if (contentUpdate.error) throw new GatewayError(503, "CONTENT_UPDATE_FAILED", contentUpdate.error.message);
  }
  await Promise.all([
    audit(actor.id, `tokmetric.approval.${decision}`, "approval", approvalId, "success", { contentId: approval.contentId, contentVersionId: approval.contentVersionId, nextState }),
    domainEvent("approval", approvalId, `APPROVAL_${decision.toUpperCase()}`, { contentId: approval.contentId, contentVersionId: approval.contentVersionId }),
  ]);
  return { ok: true, approvalId, state: nextState, externalActionTaken: false };
}

async function publishPreflight(actor: { id: string }, body: Record<string, unknown>) {
  const contentId = requiredText(body.contentId, "contentId", 3, 200);
  const connectorId = typeof body.connectorId === "string" ? body.connectorId.trim() : "";
  const workspace = await requireWorkspace();
  const { data: content, error: contentError } = await db.from("tokmetric_contents").select("id,title,state,currentVersionId").eq("workspaceId", WORKSPACE_ID).eq("id", contentId).maybeSingle();
  if (contentError) throw new GatewayError(503, "DATABASE_ERROR", contentError.message);
  if (!content?.currentVersionId) throw new GatewayError(404, "CONTENT_NOT_FOUND", "Content or active version not found");
  const { data: version, error: versionError } = await db.from("tokmetric_content_versions").select("id,objectHash").eq("id", content.currentVersionId).maybeSingle();
  if (versionError) throw new GatewayError(503, "DATABASE_ERROR", versionError.message);
  if (!version) throw new GatewayError(409, "CONTENT_VERSION_MISSING", "Content version not found");
  const connectorQuery = db.from("tokmetric_connectors").select("id,provider,state,grantedScopes").eq("workspaceId", WORKSPACE_ID);
  const { data: connector, error: connectorError } = connectorId
    ? await connectorQuery.eq("id", connectorId).maybeSingle()
    : await connectorQuery.eq("provider", "TIKTOK_CONTENT_POSTING_API").order("updatedAt", { ascending: false }).limit(1).maybeSingle();
  if (connectorError) throw new GatewayError(503, "DATABASE_ERROR", connectorError.message);
  const { data: approval, error: approvalError } = await db.from("tokmetric_approval_requests").select("id,state,objectHash,expiresAt").eq("contentVersionId", version.id).eq("objectHash", version.objectHash).eq("state", "APPROVED").order("updatedAt", { ascending: false }).limit(1).maybeSingle();
  if (approvalError) throw new GatewayError(503, "DATABASE_ERROR", approvalError.message);
  const blockers: string[] = [];
  if (workspace.globalEmergencyLock) blockers.push("GLOBAL_EMERGENCY_LOCK");
  if (workspace.publishingDisabled) blockers.push("WORKSPACE_PUBLISHING_DISABLED");
  if (content.state !== "APPROVED") blockers.push("CONTENT_NOT_APPROVED");
  if (!approval) blockers.push("EXACT_VERSION_APPROVAL_MISSING");
  if (approval?.expiresAt && new Date(approval.expiresAt).getTime() <= Date.now()) blockers.push("APPROVAL_EXPIRED");
  if (!connector) blockers.push("CONTENT_POSTING_CONNECTOR_MISSING");
  if (connector && connector.state !== "CONNECTED") blockers.push("CONTENT_POSTING_CONNECTOR_NOT_CONNECTED");
  if (Deno.env.get("TOKMETRIC_LIVE_PUBLISHING_ENABLED") !== "true") blockers.push("LIVE_PUBLISHING_GATE_DISABLED");
  await audit(actor.id, "tokmetric.publish.preflight", "content", contentId, blockers.length === 0 ? "pass" : "blocked", { connectorId: connector?.id ?? null, contentVersionId: version.id, blockers });
  return {
    ok: true,
    preflight: {
      ready: blockers.length === 0,
      blockers,
      content: { id: content.id, title: content.title, state: content.state },
      contentVersionId: version.id,
      connector: connector ?? null,
      approval: approval ?? null,
      livePublishingEnabled: Deno.env.get("TOKMETRIC_LIVE_PUBLISHING_ENABLED") === "true",
    },
    externalActionTaken: false,
  };
}

async function dispatch(actor: { id: string; role: string }, body: Record<string, unknown>) {
  const operation = typeof body.operation === "string" ? body.operation : "snapshot";
  if (operation === "snapshot") return snapshot(actor);
  if (operation === "create_draft") return createDraft(actor, body);
  if (operation === "create_version") return createVersion(actor, body);
  if (operation === "run_review") return runReview(actor, body);
  if (operation === "request_approval") return requestApproval(actor, body);
  if (operation === "decide_approval") return decideApproval(actor, body);
  if (operation === "publish_preflight") return publishPreflight(actor, body);
  throw new GatewayError(400, "UNKNOWN_OPERATION", "Unknown TokMetric operation");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  if (req.method === "GET") {
    return json({
      ok: true,
      service: "gem-tokmetric-command-gateway",
      version: "1.0.0",
      workspaceId: WORKSPACE_ID,
      controlledWriteMode: "COMMAND_CENTER_ONLY",
      livePublishingEnabled: Deno.env.get("TOKMETRIC_LIVE_PUBLISHING_ENABLED") === "true",
      externalWritesAvailable: false,
    });
  }
  if (req.method !== "POST") return json({ error: "Method not allowed", code: "METHOD_NOT_ALLOWED" }, 405);
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const actor = await requireOperator(body.token);
    const result = await dispatch(actor, body);
    return json(result, body.operation === "create_draft" || body.operation === "request_approval" ? 201 : 200);
  } catch (error) {
    if (error instanceof GatewayError) return json({ error: error.message, code: error.code }, error.status);
    console.error("tokmetric_command_gateway_internal_error", error instanceof Error ? error.name : "unknown");
    return json({ error: "TokMetric command gateway unavailable", code: "INTERNAL_ERROR" }, 500);
  }
});
