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

const AGENTS = new Set([
  "content_strategist",
  "script_writer",
  "quality_reviewer",
  "publishing_coordinator",
]);

const OUTPUT_TYPES = new Set([
  "campaign_brief",
  "content_outline",
  "audience_notes",
  "script",
  "caption",
  "hashtags",
  "findings",
  "recommended_changes",
  "review_result",
  "publish_plan",
  "job_request",
  "preflight_report",
]);

type JsonRecord = Record<string, unknown>;

class AgentGatewayError extends Error {
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

function requiredText(value: unknown, field: string, max: number) {
  if (typeof value !== "string") {
    throw new AgentGatewayError(400, "VALIDATION_ERROR", `${field} is required.`);
  }
  const normalized = value.trim();
  if (!normalized || normalized.length > max) {
    throw new AgentGatewayError(400, "VALIDATION_ERROR", `${field} is invalid.`);
  }
  return normalized;
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
    "tokmetric_agent_gateway_db_error",
    operation,
    error?.message || "unknown",
  );
  throw new AgentGatewayError(
    503,
    "DATABASE_ERROR",
    "TokMetric agent storage is temporarily unavailable.",
  );
}

async function authenticate(request: Request) {
  const authorization = request.headers.get("authorization") || "";
  const bearer = authorization.startsWith("Bearer ")
    ? authorization.slice(7).trim()
    : "";

  if (bearer.length < 32 || bearer.length > 500) {
    throw new AgentGatewayError(
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
    throw new AgentGatewayError(
      401,
      "GPT_AUTH_INVALID",
      "A valid TokMetric GPT bearer token is required.",
    );
  }
  if (
    credential.expires_at &&
    Date.parse(credential.expires_at) <= Date.now()
  ) {
    throw new AgentGatewayError(
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
    throw new AgentGatewayError(
      503,
      "GPT_ACTOR_INVALID",
      "The configured TokMetric GPT actor is not active or authorized.",
    );
  }
  if (!workspace) {
    throw new AgentGatewayError(
      503,
      "WORKSPACE_NOT_FOUND",
      "The configured TokMetric workspace was not found.",
    );
  }

  return { credential, actor, workspace };
}

function safetyReview(brief: string) {
  const findings: Array<{
    code: string;
    severity: "warning" | "block";
    message: string;
  }> = [];
  const normalized = brief.toLowerCase();

  if (
    normalized.includes("guaranteed profit") ||
    normalized.includes("risk-free return")
  ) {
    findings.push({
      code: "MISLEADING_FINANCIAL_CLAIM",
      severity: "block",
      message: "Unsupported guaranteed or risk-free financial claims require removal.",
    });
  }
  if (normalized.includes("100% secure") || normalized.includes("unhackable")) {
    findings.push({
      code: "ABSOLUTE_SECURITY_CLAIM",
      severity: "warning",
      message: "Absolute security claims require substantiation and human review.",
    });
  }
  if (
    normalized.includes("publish now") ||
    normalized.includes("bypass approval") ||
    normalized.includes("skip compliance")
  ) {
    findings.push({
      code: "EXTERNAL_ACTION_REQUEST",
      severity: "block",
      message: "The specialized agent cannot publish or bypass approval controls.",
    });
  }

  return {
    state: findings.length ? "HUMAN_REVIEW_REQUIRED" : "PASS",
    findings,
  };
}

function buildOutput(agent: string, outputType: string, brief: string) {
  const common = {
    brief,
    operatingMode: "controlled_internal_plan",
    requiredHumanReview: true,
    externalActionTaken: false,
    publishingEnabled: false,
  };

  switch (agent) {
    case "content_strategist":
      return {
        ...common,
        objective: "Convert the supplied brief into a reviewable TikTok content plan.",
        recommendedWorkflow: [
          "Confirm audience, jurisdiction, offer, and evidence requirements.",
          "Create an internal campaign or content draft in the Command Center.",
          "Run compliance review and resolve findings.",
          "Request human approval for the exact version.",
        ],
        outputType,
      };
    case "script_writer":
      return {
        ...common,
        structure: [
          "Opening hook grounded in the supplied brief.",
          "Clear explanation without unsupported guarantees.",
          "Evidence-aware value proposition.",
          "Compliant call to action for human review.",
        ],
        outputType,
      };
    case "quality_reviewer":
      return {
        ...common,
        reviewChecklist: [
          "Claims are supportable and non-absolute.",
          "No regulated promise or misleading financial statement.",
          "Required disclosure and eligibility language is present.",
          "Media, caption, and hashtags match the approved version.",
        ],
        outputType,
      };
    case "publishing_coordinator":
      return {
        ...common,
        preflight: {
          connectorRequired: true,
          exactVersionApprovalRequired: true,
          compliancePassRequired: true,
          livePublishingGateRequired: true,
          currentProductionActivation: "BLOCKED",
        },
        outputType,
      };
    default:
      throw new AgentGatewayError(
        400,
        "AGENT_NOT_SUPPORTED",
        "The requested TokMetric agent is not registered.",
      );
  }
}

async function recordAudit(
  context: Awaited<ReturnType<typeof authenticate>>,
  correlationId: string,
  agent: string,
  outputType: string,
  safetyState: string,
) {
  const result = await db.from("tokmetric_audit_events").insert({
    id: identifier("audit"),
    workspaceId: context.workspace.id,
    actorId: context.actor.id,
    action: "tokmetric.agent.plan_generated",
    entityType: "agent_run",
    entityId: null,
    correlationId,
    outcome: safetyState === "PASS" ? "success" : "review_required",
    sourceChannel: "custom_gpt",
    safeMetadata: {
      agent,
      outputType,
      safetyState,
      provider: "gem-controlled-planner",
      credentialId: "[REDACTED]",
      externalActionTaken: false,
    },
    createdAt: new Date().toISOString(),
  });
  if (result.error) {
    console.error("tokmetric_agent_gateway_audit_failed", result.error.message);
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
        error: { code: "METHOD_NOT_ALLOWED", message: "Method not allowed." },
      },
      405,
    );
  }

  const startedAt = Date.now();
  const correlationId =
    request.headers.get("x-correlation-id")?.trim().slice(0, 200) ||
    crypto.randomUUID();

  try {
    const parsed = await request.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new AgentGatewayError(
        400,
        "INVALID_JSON",
        "Request body must be valid JSON.",
      );
    }
    const body = parsed as JsonRecord;
    const agent = requiredText(body.agent, "agent", 100);
    const outputType = requiredText(body.outputType, "outputType", 100);
    const workspaceId = requiredText(body.workspaceId, "workspaceId", 200);
    const brief = requiredText(body.brief, "brief", 5_000);

    if (!AGENTS.has(agent)) {
      throw new AgentGatewayError(
        400,
        "AGENT_NOT_SUPPORTED",
        "The requested TokMetric agent is not registered.",
      );
    }
    if (!OUTPUT_TYPES.has(outputType)) {
      throw new AgentGatewayError(
        400,
        "OUTPUT_TYPE_NOT_SUPPORTED",
        "The requested output type is not registered.",
      );
    }

    const context = await authenticate(request);
    if (workspaceId !== context.workspace.id) {
      throw new AgentGatewayError(
        403,
        "WORKSPACE_FORBIDDEN",
        "The TokMetric GPT credential cannot access this workspace.",
      );
    }

    const safety = safetyReview(brief);
    const output = buildOutput(agent, outputType, brief);
    await recordAudit(
      context,
      correlationId,
      agent,
      outputType,
      safety.state,
    );

    return respond({
      ok: true,
      correlationId,
      workspaceId,
      data: {
        runId: identifier("agent_run"),
        status: "COMPLETED",
        outputType,
        safety,
        output,
        provider: "gem-controlled-planner",
        modelVersion: "deterministic-policy-v1",
        promptVersion: "tokmetric-agent-plan-v1",
        estimatedCostMicros: 0,
        durationMs: Date.now() - startedAt,
        externalActionTaken: false,
      },
    });
  } catch (error) {
    const known = error instanceof AgentGatewayError
      ? error
      : new AgentGatewayError(
        500,
        "INTERNAL_ERROR",
        "TokMetric agent planning failed safely.",
      );
    if (!(error instanceof AgentGatewayError)) {
      console.error(
        "tokmetric_agent_gateway_internal_error",
        error instanceof Error ? error.name : "unknown",
      );
    }
    return respond(
      {
        ok: false,
        error: {
          code: known.code,
          message: known.message,
          correlationId,
        },
      },
      known.status,
    );
  }
});
