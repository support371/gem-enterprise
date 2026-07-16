import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.8";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase runtime configuration");
}

const db = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const READ_ACTIONS = new Set([
  "gptSystemReadiness",
  "gptConnectorReadiness",
  "gptListAccounts",
  "gptListCampaigns",
  "gptGetCampaign",
  "gptListContent",
  "gptGetContent",
  "gptGetApprovalStatus",
  "gptGetPublishJobStatus",
  "gptGetAnalyticsSummary",
  "gptGetAuditHistory",
]);

const WRITE_ACTIONS = new Set([
  "gptCreateCampaignDraft",
  "gptCreateContentDraft",
  "gptRunComplianceReview",
  "gptRequestApproval",
  "gptCreatePublishJob",
]);

type JsonRecord = Record<string, unknown>;

type AuthContext = {
  credential: {
    id: string;
    actor_user_id: string;
    workspace_id: string;
    expires_at: string | null;
  };
  actor: {
    id: string;
    role: string;
    status: string;
    isActive: boolean;
  };
  workspace: {
    id: string;
    name: string;
    slug: string;
    globalEmergencyLock: boolean;
    publishingDisabled: boolean;
    advertisingDisabled: boolean;
    shopWriteDisabled: boolean;
    connectorDisabled: boolean;
  };
};

class GatewayError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

const RESPONSE_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, content-type, x-correlation-id",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
  "Cache-Control": "no-store",
};

function respond(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: RESPONSE_HEADERS,
  });
}

function requiredText(value: unknown, field: string, max = 5_000): string {
  if (typeof value !== "string") {
    throw new GatewayError(400, "VALIDATION_ERROR", `${field} is required.`);
  }
  const normalized = value.trim();
  if (!normalized || normalized.length > max) {
    throw new GatewayError(400, "VALIDATION_ERROR", `${field} is invalid.`);
  }
  return normalized;
}

function optionalText(value: unknown, field: string, max = 5_000) {
  if (value === undefined || value === null || value === "") return undefined;
  return requiredText(value, field, max);
}

function listLimit(value: unknown) {
  if (value === undefined || value === null) return 25;
  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value < 1 ||
    value > 100
  ) {
    throw new GatewayError(400, "VALIDATION_ERROR", "limit is invalid.");
  }
  return value;
}

function correlationId(request: Request, supplied: unknown) {
  const value =
    request.headers.get("x-correlation-id") ||
    (typeof supplied === "string" ? supplied : "");
  return value.trim().slice(0, 200) || crypto.randomUUID();
}

function identifier(prefix: string) {
  return `${prefix}_${crypto.randomUUID().replaceAll("-", "")}`;
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function databaseFailure(operation: string, error: { message?: string } | null): never {
  console.error(
    "tokmetric_gpt_gateway_db_error",
    operation,
    error?.message || "unknown",
  );
  throw new GatewayError(
    503,
    "DATABASE_ERROR",
    "TokMetric operations storage is temporarily unavailable.",
  );
}

function redact(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redact);
  if (!value || typeof value !== "object") return value;

  const output: JsonRecord = {};
  for (const [key, nested] of Object.entries(value as JsonRecord)) {
    const sensitiveKey =
      /token|secret|authorization|password|credential|refresh/i.test(key);
    output[key] = sensitiveKey && typeof nested !== "boolean"
      ? "[REDACTED]"
      : redact(nested);
  }
  return output;
}

async function authenticate(request: Request): Promise<AuthContext> {
  const authorization = request.headers.get("authorization") || "";
  const bearer = authorization.startsWith("Bearer ")
    ? authorization.slice(7).trim()
    : "";

  if (bearer.length < 32 || bearer.length > 500) {
    throw new GatewayError(
      401,
      "GPT_AUTH_INVALID",
      "A valid TokMetric GPT bearer token is required.",
    );
  }

  const tokenHash = await sha256(bearer);
  const credentialResult = await db
    .from("tokmetric_gpt_credentials")
    .select("id,actor_user_id,workspace_id,status,expires_at")
    .eq("token_hash", tokenHash)
    .eq("status", "active")
    .maybeSingle();

  if (credentialResult.error) {
    databaseFailure("credential_lookup", credentialResult.error);
  }
  const credential = credentialResult.data;
  if (!credential) {
    throw new GatewayError(
      401,
      "GPT_AUTH_INVALID",
      "A valid TokMetric GPT bearer token is required.",
    );
  }
  if (
    credential.expires_at &&
    Date.parse(credential.expires_at) <= Date.now()
  ) {
    throw new GatewayError(
      401,
      "GPT_AUTH_EXPIRED",
      "The TokMetric GPT credential has expired.",
    );
  }

  const [actorResult, workspaceResult] = await Promise.all([
    db
      .from("users")
      .select("id,role,status,isActive")
      .eq("id", credential.actor_user_id)
      .maybeSingle(),
    db
      .from("tokmetric_workspaces")
      .select(
        "id,name,slug,globalEmergencyLock,publishingDisabled,advertisingDisabled,shopWriteDisabled,connectorDisabled",
      )
      .eq("id", credential.workspace_id)
      .maybeSingle(),
  ]);

  if (actorResult.error) databaseFailure("actor_lookup", actorResult.error);
  if (workspaceResult.error) {
    databaseFailure("workspace_lookup", workspaceResult.error);
  }

  const actor = actorResult.data;
  const workspace = workspaceResult.data;
  if (
    !actor ||
    actor.isActive !== true ||
    actor.status !== "active" ||
    !["admin", "super_admin", "internal"].includes(actor.role)
  ) {
    throw new GatewayError(
      503,
      "GPT_ACTOR_INVALID",
      "The configured TokMetric GPT actor is not active or authorized.",
    );
  }
  if (!workspace) {
    throw new GatewayError(
      503,
      "WORKSPACE_NOT_FOUND",
      "The configured TokMetric workspace was not found.",
    );
  }

  const updateResult = await db
    .from("tokmetric_gpt_credentials")
    .update({
      last_used_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", credential.id);
  if (updateResult.error) {
    console.error(
      "tokmetric_gpt_gateway_last_used_update_failed",
      updateResult.error.message,
    );
  }

  return { credential, actor, workspace } as AuthContext;
}

function enforceWorkspace(body: JsonRecord, context: AuthContext) {
  const workspaceId = requiredText(body.workspace_id, "workspace_id", 200);
  if (workspaceId !== context.workspace.id) {
    throw new GatewayError(
      403,
      "WORKSPACE_FORBIDDEN",
      "The TokMetric GPT credential cannot access this workspace.",
    );
  }
  return workspaceId;
}

async function countRows(
  table: string,
  configure?: (query: any) => any,
): Promise<number> {
  let query = db.from(table).select("id", { count: "exact", head: true });
  if (configure) query = configure(query);
  const result = await query;
  if (result.error) databaseFailure(`count_${table}`, result.error);
  return result.count || 0;
}

async function recordAudit(
  context: AuthContext,
  action: string,
  cid: string,
  outcome: string,
  metadata: JsonRecord,
) {
  const result = await db.from("tokmetric_audit_events").insert({
    id: identifier("audit"),
    workspaceId: context.workspace.id,
    actorId: context.actor.id,
    action,
    entityType: "gpt_action",
    entityId: null,
    correlationId: cid,
    outcome,
    sourceChannel: "custom_gpt",
    safeMetadata: {
      ...(redact(metadata) as JsonRecord),
      gateway: "supabase",
      credentialId: context.credential.id,
    },
    createdAt: new Date().toISOString(),
  });
  if (result.error) {
    console.error("tokmetric_gpt_gateway_audit_failed", result.error.message);
  }
}

async function latestVersions(
  table: string,
  foreignKey: string,
  ids: string[],
) {
  if (!ids.length) return [];
  const result = await db
    .from(table)
    .select("*")
    .in(foreignKey, ids)
    .order("version", { ascending: false });
  if (result.error) databaseFailure(`versions_${table}`, result.error);
  return result.data || [];
}

async function systemReadiness(context: AuthContext) {
  const workspaceId = context.workspace.id;
  const [connectorRows, publishRows, workspaces, drafts, approvals, analytics] =
    await Promise.all([
      db
        .from("tokmetric_connectors")
        .select("state")
        .eq("workspaceId", workspaceId),
      db
        .from("tokmetric_publish_jobs")
        .select("internalState,externalState")
        .eq("workspaceId", workspaceId),
      countRows("tokmetric_workspaces"),
      countRows("tokmetric_contents", (query) =>
        query.eq("workspaceId", workspaceId).eq("state", "DRAFT")
      ),
      countRows("tokmetric_approval_requests", (query) =>
        query
          .eq("workspaceId", workspaceId)
          .eq("state", "APPROVAL_REQUIRED")
      ),
      countRows("tokmetric_analytics_snapshots", (query) =>
        query.eq("workspaceId", workspaceId)
      ),
    ]);

  if (connectorRows.error) {
    databaseFailure("readiness_connectors", connectorRows.error);
  }
  if (publishRows.error) {
    databaseFailure("readiness_publish_jobs", publishRows.error);
  }

  const connectorGroups: Record<string, number> = {};
  for (const row of connectorRows.data || []) {
    connectorGroups[row.state] = (connectorGroups[row.state] || 0) + 1;
  }

  const publishGroups: Record<string, number> = {};
  for (const row of publishRows.data || []) {
    const key = `${row.internalState}:${row.externalState}`;
    publishGroups[key] = (publishGroups[key] || 0) + 1;
  }

  return {
    livePublishingEnabled: false,
    workspaces,
    connectors: Object.entries(connectorGroups).map(([state, value]) => ({
      state,
      _count: value,
    })),
    drafts,
    approvals,
    publishJobs: Object.entries(publishGroups).map(([states, value]) => {
      const [internalState, externalState] = states.split(":");
      return { internalState, externalState, _count: value };
    }),
    analytics,
    externalTruth:
      "Live TikTok operations remain disabled unless production activation gates pass.",
    gpt_auth_configured: true,
    gpt_actor_configured: true,
    secure_credential_hashing_configured: true,
    token_encryption_configured: false,
    tiktok_client_configured: false,
    production_activation: "BLOCKED",
    controlled_write_mode: "COMMAND_CENTER_ONLY",
    workspace_id: workspaceId,
    workspace_name: context.workspace.name,
  };
}

async function executeReadAction(
  action: string,
  body: JsonRecord,
  context: AuthContext,
): Promise<unknown> {
  const workspaceId = context.workspace.id;

  switch (action) {
    case "gptSystemReadiness":
      return systemReadiness(context);

    case "gptConnectorReadiness": {
      enforceWorkspace(body, context);
      const result = await db
        .from("tokmetric_connectors")
        .select("id,provider,state,displayName,grantedScopes,lastHealthAt,updatedAt")
        .eq("workspaceId", workspaceId)
        .order("updatedAt", { ascending: false });
      if (result.error) databaseFailure("connector_readiness", result.error);
      const connectors = result.data || [];
      return {
        workspace_id: workspaceId,
        emergency_lock_enabled: context.workspace.globalEmergencyLock,
        connector_writes_disabled: context.workspace.connectorDisabled,
        connectors,
        overall_status: connectors.some((connector) =>
            connector.state === "CONNECTED"
          )
          ? "PARTIAL"
          : "ACTION_REQUIRED",
      };
    }

    case "gptListAccounts": {
      enforceWorkspace(body, context);
      let query = db
        .from("tokmetric_connectors")
        .select(
          "id,provider,state,displayName,externalAccountId,grantedScopes,lastHealthAt,createdAt,updatedAt",
        )
        .eq("workspaceId", workspaceId);
      const provider = optionalText(body.provider, "provider", 100);
      const status = optionalText(body.status, "status", 100);
      if (provider) query = query.eq("provider", provider);
      if (status) query = query.eq("state", status);
      const result = await query
        .order("updatedAt", { ascending: false })
        .limit(listLimit(body.limit));
      if (result.error) databaseFailure("list_accounts", result.error);
      return { accounts: result.data || [], total: result.data?.length || 0 };
    }

    case "gptListCampaigns": {
      enforceWorkspace(body, context);
      let query = db
        .from("tokmetric_campaigns")
        .select("*")
        .eq("workspaceId", workspaceId);
      const status = optionalText(body.status, "status", 100);
      if (status) query = query.eq("state", status);
      const result = await query
        .order("updatedAt", { ascending: false })
        .limit(listLimit(body.limit));
      if (result.error) databaseFailure("list_campaigns", result.error);
      const campaigns = result.data || [];
      const versions = await latestVersions(
        "tokmetric_campaign_versions",
        "campaignId",
        campaigns.map((campaign) => campaign.id),
      );
      return {
        campaigns: campaigns.map((campaign) => ({
          ...campaign,
          versions: versions
            .filter((version) => version.campaignId === campaign.id)
            .slice(0, 1),
        })),
        total: campaigns.length,
      };
    }

    case "gptGetCampaign": {
      enforceWorkspace(body, context);
      const campaignId = requiredText(body.campaign_id, "campaign_id", 200);
      const campaign = await db
        .from("tokmetric_campaigns")
        .select("*")
        .eq("workspaceId", workspaceId)
        .eq("id", campaignId)
        .maybeSingle();
      if (campaign.error) databaseFailure("get_campaign", campaign.error);
      if (!campaign.data) {
        throw new GatewayError(
          404,
          "CAMPAIGN_NOT_FOUND",
          "Campaign was not found.",
        );
      }
      const [versions, contents] = await Promise.all([
        db
          .from("tokmetric_campaign_versions")
          .select("*")
          .eq("campaignId", campaignId)
          .order("version", { ascending: false }),
        db
          .from("tokmetric_contents")
          .select("*")
          .eq("workspaceId", workspaceId)
          .eq("campaignId", campaignId)
          .order("updatedAt", { ascending: false })
          .limit(25),
      ]);
      if (versions.error) databaseFailure("campaign_versions", versions.error);
      if (contents.error) databaseFailure("campaign_contents", contents.error);
      return {
        campaign: {
          ...campaign.data,
          versions: versions.data || [],
          contents: contents.data || [],
        },
      };
    }

    case "gptListContent": {
      enforceWorkspace(body, context);
      let query = db
        .from("tokmetric_contents")
        .select("*")
        .eq("workspaceId", workspaceId);
      const campaignId = optionalText(body.campaign_id, "campaign_id", 200);
      const status = optionalText(body.status, "status", 100);
      if (campaignId) query = query.eq("campaignId", campaignId);
      if (status) query = query.eq("state", status);
      const result = await query
        .order("updatedAt", { ascending: false })
        .limit(listLimit(body.limit));
      if (result.error) databaseFailure("list_content", result.error);
      const content = result.data || [];
      const versions = await latestVersions(
        "tokmetric_content_versions",
        "contentId",
        content.map((item) => item.id),
      );
      return {
        content: content.map((item) => ({
          ...item,
          versions: versions
            .filter((version) => version.contentId === item.id)
            .slice(0, 1),
        })),
        total: content.length,
      };
    }

    case "gptGetContent": {
      enforceWorkspace(body, context);
      const contentId = requiredText(body.content_id, "content_id", 200);
      const content = await db
        .from("tokmetric_contents")
        .select("*")
        .eq("workspaceId", workspaceId)
        .eq("id", contentId)
        .maybeSingle();
      if (content.error) databaseFailure("get_content", content.error);
      if (!content.data) {
        throw new GatewayError(
          404,
          "CONTENT_NOT_FOUND",
          "Content was not found.",
        );
      }
      const [versions, reviews, approvals, publishJobs] = await Promise.all([
        db
          .from("tokmetric_content_versions")
          .select("*")
          .eq("contentId", contentId)
          .order("version", { ascending: false }),
        db
          .from("tokmetric_compliance_reviews")
          .select("*")
          .eq("workspaceId", workspaceId)
          .eq("contentId", contentId)
          .order("createdAt", { ascending: false })
          .limit(10),
        db
          .from("tokmetric_approval_requests")
          .select("*")
          .eq("workspaceId", workspaceId)
          .eq("contentId", contentId)
          .order("updatedAt", { ascending: false })
          .limit(10),
        db
          .from("tokmetric_publish_jobs")
          .select("*")
          .eq("workspaceId", workspaceId)
          .eq("contentId", contentId)
          .order("updatedAt", { ascending: false })
          .limit(10),
      ]);
      if (versions.error) databaseFailure("content_versions", versions.error);
      if (reviews.error) databaseFailure("content_reviews", reviews.error);
      if (approvals.error) databaseFailure("content_approvals", approvals.error);
      if (publishJobs.error) {
        databaseFailure("content_publish_jobs", publishJobs.error);
      }
      return {
        content: {
          ...content.data,
          versions: versions.data || [],
          reviews: reviews.data || [],
          approvals: approvals.data || [],
          publishJobs: publishJobs.data || [],
        },
      };
    }

    case "gptGetApprovalStatus": {
      enforceWorkspace(body, context);
      const approvalId = requiredText(
        body.approval_request_id,
        "approval_request_id",
        200,
      );
      const approval = await db
        .from("tokmetric_approval_requests")
        .select("*")
        .eq("workspaceId", workspaceId)
        .eq("id", approvalId)
        .maybeSingle();
      if (approval.error) databaseFailure("get_approval", approval.error);
      if (!approval.data) {
        throw new GatewayError(
          404,
          "APPROVAL_NOT_FOUND",
          "Approval request was not found.",
        );
      }
      const decisions = await db
        .from("tokmetric_approval_decisions")
        .select("*")
        .eq("approvalRequestId", approvalId)
        .order("createdAt", { ascending: false });
      if (decisions.error) {
        databaseFailure("approval_decisions", decisions.error);
      }
      return {
        approval: { ...approval.data, decisions: decisions.data || [] },
      };
    }

    case "gptGetPublishJobStatus": {
      enforceWorkspace(body, context);
      const jobId = requiredText(body.job_id, "job_id", 200);
      const job = await db
        .from("tokmetric_publish_jobs")
        .select("*")
        .eq("workspaceId", workspaceId)
        .eq("id", jobId)
        .maybeSingle();
      if (job.error) databaseFailure("get_publish_job", job.error);
      if (!job.data) {
        throw new GatewayError(
          404,
          "PUBLISH_JOB_NOT_FOUND",
          "Publishing job was not found.",
        );
      }
      const [attempts, connector] = await Promise.all([
        db
          .from("tokmetric_job_attempts")
          .select("*")
          .eq("publishJobId", jobId)
          .order("attempt", { ascending: false }),
        job.data.connectorId
          ? db
              .from("tokmetric_connectors")
              .select("id,provider,state,displayName")
              .eq("id", job.data.connectorId)
              .maybeSingle()
          : Promise.resolve({ data: null, error: null }),
      ]);
      if (attempts.error) databaseFailure("publish_attempts", attempts.error);
      if (connector.error) databaseFailure("publish_connector", connector.error);
      return {
        job: {
          ...job.data,
          attempts: attempts.data || [],
          connector: connector.data,
        },
      };
    }

    case "gptGetAnalyticsSummary": {
      enforceWorkspace(body, context);
      let query = db
        .from("tokmetric_analytics_snapshots")
        .select("*")
        .eq("workspaceId", workspaceId);
      const from = optionalText(body.date_from, "date_from", 20);
      const to = optionalText(body.date_to, "date_to", 20);
      if (from) query = query.gte("capturedAt", `${from}T00:00:00.000Z`);
      if (to) query = query.lte("capturedAt", `${to}T23:59:59.999Z`);
      const result = await query
        .order("capturedAt", { ascending: false })
        .limit(listLimit(body.limit));
      if (result.error) databaseFailure("analytics_summary", result.error);
      const snapshots = result.data || [];
      const sources = [...new Set(snapshots.map((item) => item.source))];
      return {
        source: sources.length === 1
          ? sources[0]
          : sources.length
          ? "MIXED"
          : "UNKNOWN",
        snapshots,
      };
    }

    case "gptGetAuditHistory": {
      enforceWorkspace(body, context);
      let query = db
        .from("tokmetric_audit_events")
        .select("*")
        .eq("workspaceId", workspaceId);
      const entityType = optionalText(body.entity_type, "entity_type", 200);
      const entityId = optionalText(body.entity_id, "entity_id", 200);
      if (entityType) query = query.eq("entityType", entityType);
      if (entityId) query = query.eq("entityId", entityId);
      const result = await query
        .order("createdAt", { ascending: false })
        .limit(listLimit(body.limit));
      if (result.error) databaseFailure("audit_history", result.error);
      return {
        events: redact(result.data || []),
        total: result.data?.length || 0,
      };
    }

    default:
      throw new GatewayError(
        404,
        "GPT_ACTION_NOT_FOUND",
        "The requested TokMetric GPT action does not exist.",
      );
  }
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: RESPONSE_HEADERS });
  }
  if (request.method !== "POST") {
    return respond(
      {
        ok: false,
        error: {
          code: "METHOD_NOT_ALLOWED",
          message: "Method not allowed.",
        },
      },
      405,
    );
  }

  let payload: JsonRecord;
  try {
    const parsed = await request.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("invalid request body");
    }
    payload = parsed as JsonRecord;
  } catch {
    return respond(
      {
        ok: false,
        error: {
          code: "INVALID_JSON",
          message: "Request body must be valid JSON.",
        },
      },
      400,
    );
  }

  const cid = correlationId(request, payload.correlationId);
  let context: AuthContext | null = null;

  try {
    const action = requiredText(payload.action, "action", 100);
    if (!READ_ACTIONS.has(action) && !WRITE_ACTIONS.has(action)) {
      throw new GatewayError(
        404,
        "GPT_ACTION_NOT_FOUND",
        "The requested TokMetric GPT action does not exist.",
      );
    }

    const body =
      payload.body &&
        typeof payload.body === "object" &&
        !Array.isArray(payload.body)
        ? payload.body as JsonRecord
        : {};

    context = await authenticate(request);

    if (WRITE_ACTIONS.has(action)) {
      throw new GatewayError(
        423,
        "CONTROLLED_WRITE_DISABLED",
        "This Custom GPT write action remains disabled during the controlled production launch. Use the authenticated Command Center for human-reviewed changes.",
      );
    }

    const data = await executeReadAction(action, body, context);
    await recordAudit(
      context,
      `tokmetric.gpt.${action}`,
      cid,
      "success",
      { mode: "read_only" },
    );

    return respond({ ok: true, correlationId: cid, data: redact(data) });
  } catch (error) {
    const known = error instanceof GatewayError
      ? error
      : new GatewayError(
        500,
        "INTERNAL_ERROR",
        "TokMetric GPT operation failed safely.",
      );

    if (!(error instanceof GatewayError)) {
      console.error(
        "tokmetric_gpt_gateway_internal_error",
        error instanceof Error ? error.name : "unknown",
      );
    }

    if (context) {
      await recordAudit(
        context,
        "tokmetric.gpt.request_failed",
        cid,
        known.status === 423 ? "blocked" : "failed",
        { code: known.code, statusCode: known.status },
      );
    }

    return respond(
      {
        ok: false,
        error: {
          code: known.code,
          message: known.message,
          correlationId: cid,
        },
      },
      known.status,
    );
  }
});
