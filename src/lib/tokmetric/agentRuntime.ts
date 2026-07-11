import crypto from "node:crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  getTokMetricAgent,
  validateAgentOutput,
  type TokMetricAgentName,
} from "@/lib/tokmetric/agents";
import {
  contentHash,
  emitDomainEvent,
  emitTokMetricAudit,
  TokMetricError,
} from "@/lib/tokmetric/security";

export type TokMetricAgentSafetyState = "PASS" | "HUMAN_REVIEW_REQUIRED" | "BLOCKED";

export type TokMetricAgentRunInput = {
  workspaceId: string;
  actorId: string;
  agent: TokMetricAgentName;
  outputType: string;
  brief: string;
  sourceChannel: "website" | "custom_gpt" | "internal_job";
  correlationId: string;
};

export type TokMetricAgentContext = {
  workspace: {
    id: string;
    name: string;
    emergencyLock: boolean;
    publishingDisabled: boolean;
  };
  counts: {
    campaigns: number;
    content: number;
    reviews: number;
    approvals: number;
    connectors: number;
  };
  recentContent: Array<{ id: string; title: string; state: string }>;
  recentCampaigns: Array<{ id: string; title: string; state: string }>;
  connectorStates: Array<{ provider: string; state: string; displayName: string }>;
};

export type TokMetricAgentSafetyEvaluation = {
  state: TokMetricAgentSafetyState;
  findings: Array<{ code: string; severity: "info" | "warning" | "block"; message: string }>;
  sanitizedBrief: string;
};

const outputSchemas: Record<string, z.ZodTypeAny> = {
  campaign_brief: z.object({
    objective: z.string(),
    audience_hypothesis: z.string(),
    content_pillars: z.array(z.string()),
    recommended_cadence: z.string(),
    compliance_notes: z.array(z.string()),
  }),
  content_outline: z.object({
    title: z.string(),
    hook: z.string(),
    scenes: z.array(z.object({ sequence: z.number().int(), purpose: z.string(), draft_direction: z.string() })),
    call_to_action: z.string(),
  }),
  audience_notes: z.object({
    primary_audience: z.string(),
    needs: z.array(z.string()),
    trust_signals: z.array(z.string()),
    avoid: z.array(z.string()),
  }),
  script: z.object({
    hook: z.string(),
    body: z.array(z.string()),
    close: z.string(),
    estimated_duration_seconds: z.number().int().positive(),
    status: z.literal("DRAFT"),
  }),
  caption: z.object({
    caption: z.string(),
    disclosure_note: z.string(),
    status: z.literal("DRAFT"),
  }),
  hashtags: z.object({
    hashtags: z.array(z.string()),
    rationale: z.array(z.string()),
    status: z.literal("DRAFT"),
  }),
  findings: z.object({
    findings: z.array(z.object({ code: z.string(), severity: z.string(), message: z.string() })),
    requires_human_review: z.boolean(),
  }),
  recommended_changes: z.object({
    changes: z.array(z.string()),
    priority: z.string(),
    status: z.literal("DRAFT_RECOMMENDATION"),
  }),
  review_result: z.object({
    result: z.enum(["PASS", "HUMAN_REVIEW_REQUIRED", "BLOCKED"]),
    explanation: z.string(),
    findings: z.array(z.string()),
  }),
  publish_plan: z.object({
    prerequisites: z.array(z.string()),
    planned_state: z.literal("NOT_SUBMITTED"),
    external_action_taken: z.literal(false),
    next_human_step: z.string(),
  }),
  job_request: z.object({
    request_type: z.literal("INTERNAL_DRAFT"),
    required_inputs: z.array(z.string()),
    blockers: z.array(z.string()),
    external_action_taken: z.literal(false),
  }),
  preflight_report: z.object({
    checks: z.array(z.object({ name: z.string(), status: z.string() })),
    ready_for_external_submission: z.literal(false),
    reason: z.string(),
  }),
};

const secretPatterns: Array<{ pattern: RegExp; replacement: string }> = [
  { pattern: /\bsk-[a-zA-Z0-9_-]{12,}\b/g, replacement: "[REDACTED_API_KEY]" },
  { pattern: /\b(?:access|refresh)[-_ ]?token\s*[:=]\s*\S+/gi, replacement: "[REDACTED_TOKEN]" },
  { pattern: /\bclient[-_ ]?secret\s*[:=]\s*\S+/gi, replacement: "[REDACTED_CLIENT_SECRET]" },
  { pattern: /\bpassword\s*[:=]\s*\S+/gi, replacement: "[REDACTED_PASSWORD]" },
  { pattern: /\bcookie\s*[:=]\s*\S+/gi, replacement: "[REDACTED_COOKIE]" },
];

const prohibitedExecutionPatterns = [
  /\bbypass\s+(?:human\s+)?approval\b/i,
  /\bauto[- ]?approve\b/i,
  /\bpublish\s+(?:it\s+)?now\b/i,
  /\bpost\s+directly\b/i,
  /\bforce\s+publish\b/i,
  /\bignore\s+(?:the\s+)?emergency\s+lock\b/i,
  /\bspend\s+(?:the\s+)?budget\b/i,
];

const riskyClaimPatterns = [
  /\bguaranteed\s+(?:profit|return|results?)\b/i,
  /\brisk[- ]?free\s+(?:profit|return)\b/i,
  /\b100%\s+secure\b/i,
  /\bunhackable\b/i,
];

function cleanSentence(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function conciseTopic(brief: string) {
  const first = cleanSentence(brief).split(/[.!?]/)[0]?.trim();
  return (first || "TokMetric content initiative").slice(0, 140);
}

function keywordHashtags(brief: string) {
  const stop = new Set(["about", "after", "before", "could", "should", "their", "there", "these", "those", "through", "using", "with", "from", "that", "this", "your", "into", "have", "will", "would"]);
  const words = brief.toLowerCase().match(/[a-z][a-z0-9]{3,}/g) ?? [];
  const unique = [...new Set(words.filter((word) => !stop.has(word)))].slice(0, 6);
  return unique.length ? unique.map((word) => `#${word}`) : ["#TokMetric", "#TikTokOperations", "#ContentCompliance"];
}

export function evaluateTokMetricAgentSafety(brief: string): TokMetricAgentSafetyEvaluation {
  let sanitizedBrief = brief.slice(0, 5000);
  const findings: TokMetricAgentSafetyEvaluation["findings"] = [];

  for (const entry of secretPatterns) {
    if (entry.pattern.test(sanitizedBrief)) {
      entry.pattern.lastIndex = 0;
      sanitizedBrief = sanitizedBrief.replace(entry.pattern, entry.replacement);
      findings.push({
        code: "SECRET_MATERIAL_REDACTED",
        severity: "block",
        message: "Credential-like material was removed and must not be processed by a content agent.",
      });
    }
    entry.pattern.lastIndex = 0;
  }

  for (const pattern of prohibitedExecutionPatterns) {
    if (pattern.test(sanitizedBrief)) {
      findings.push({
        code: "UNAUTHORIZED_EXTERNAL_ACTION_REQUEST",
        severity: "block",
        message: "The request attempts to bypass approval or trigger an external action.",
      });
    }
  }

  for (const pattern of riskyClaimPatterns) {
    if (pattern.test(sanitizedBrief)) {
      findings.push({
        code: "UNSUPPORTED_ABSOLUTE_CLAIM",
        severity: "warning",
        message: "The brief contains an absolute or guaranteed claim that requires revision and evidence.",
      });
    }
  }

  const state: TokMetricAgentSafetyState = findings.some((finding) => finding.severity === "block")
    ? "BLOCKED"
    : findings.some((finding) => finding.severity === "warning")
      ? "HUMAN_REVIEW_REQUIRED"
      : "PASS";

  return { state, findings, sanitizedBrief: cleanSentence(sanitizedBrief) };
}

export async function retrieveTokMetricAgentContext(workspaceId: string): Promise<TokMetricAgentContext> {
  const workspace = await db.workspace.findUnique({
    where: { id: workspaceId },
    select: {
      id: true,
      name: true,
      globalEmergencyLock: true,
      publishingDisabled: true,
      _count: {
        select: {
          campaigns: true,
          contents: true,
          complianceReviews: true,
          approvalRequests: true,
          connectors: true,
        },
      },
      contents: {
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: { id: true, title: true, state: true },
      },
      campaigns: {
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: { id: true, title: true, state: true },
      },
      connectors: {
        orderBy: { updatedAt: "desc" },
        take: 10,
        select: { provider: true, state: true, displayName: true },
      },
    },
  });

  if (!workspace) throw new TokMetricError(404, "WORKSPACE_NOT_FOUND", "Workspace was not found.");

  return {
    workspace: {
      id: workspace.id,
      name: workspace.name,
      emergencyLock: workspace.globalEmergencyLock,
      publishingDisabled: workspace.publishingDisabled,
    },
    counts: {
      campaigns: workspace._count.campaigns,
      content: workspace._count.contents,
      reviews: workspace._count.complianceReviews,
      approvals: workspace._count.approvalRequests,
      connectors: workspace._count.connectors,
    },
    recentContent: workspace.contents.map((item) => ({ ...item, state: item.state.toString() })),
    recentCampaigns: workspace.campaigns.map((item) => ({ ...item, state: item.state.toString() })),
    connectorStates: workspace.connectors.map((item) => ({
      provider: item.provider.toString(),
      state: item.state.toString(),
      displayName: item.displayName,
    })),
  };
}

export function generateControlledAgentOutput(input: {
  agent: TokMetricAgentName;
  outputType: string;
  brief: string;
  safety: TokMetricAgentSafetyEvaluation;
  context?: TokMetricAgentContext;
}): Record<string, unknown> {
  const topic = conciseTopic(input.brief);
  const hashtags = keywordHashtags(input.brief);
  const contextNotice = input.context
    ? `${input.context.counts.content} content records and ${input.context.counts.connectors} connector records are visible in the workspace.`
    : "Workspace context was not requested for this local evaluation.";

  const findings = input.safety.findings.map((finding) => ({
    code: finding.code,
    severity: finding.severity,
    message: finding.message,
  }));

  const outputs: Record<string, Record<string, unknown>> = {
    campaign_brief: {
      objective: `Develop a reviewable TikTok campaign around: ${topic}`,
      audience_hypothesis: "Reach users who value clear, trustworthy, and compliance-conscious explanations.",
      content_pillars: ["Education", "Trust and safety", "Practical workflow", "Responsible growth"],
      recommended_cadence: "Prepare three draft concepts, review them, then approve a measured publishing schedule.",
      compliance_notes: ["Avoid guarantees", "Use evidence for material claims", "Complete human approval before publishing", contextNotice],
    },
    content_outline: {
      title: topic,
      hook: `Start with the clearest user problem connected to ${topic}.`,
      scenes: [
        { sequence: 1, purpose: "Hook", draft_direction: "State the problem in one factual sentence." },
        { sequence: 2, purpose: "Explain", draft_direction: "Show the relevant TokMetric or business workflow." },
        { sequence: 3, purpose: "Proof", draft_direction: "Add evidence, limitations, or a transparent source label." },
        { sequence: 4, purpose: "Close", draft_direction: "Invite the viewer to learn more without making guarantees." },
      ],
      call_to_action: "Review the full information and use only authorized platform actions.",
    },
    audience_notes: {
      primary_audience: "TikTok creators, business operators, and teams seeking controlled content operations.",
      needs: ["Clear value", "Trustworthy claims", "Simple next steps", "Visible approval controls"],
      trust_signals: ["Official OAuth", "Human approval", "Source-labeled analytics", "Public privacy and terms pages"],
      avoid: ["Guaranteed outcomes", "Fake urgency", "Unsupported claims", "Implied platform endorsement"],
    },
    script: {
      hook: `Here is a clear way to understand ${topic}.`,
      body: [
        "First, define the real user problem and the permitted outcome.",
        "Next, prepare the content as a draft and run compliance checks.",
        "Finally, require human approval before any authorized platform submission.",
      ],
      close: "Use the documented workflow and verify every external result before reporting success.",
      estimated_duration_seconds: 35,
      status: "DRAFT",
    },
    caption: {
      caption: `${topic}. Prepared as a reviewable draft with compliance and human approval controls.`,
      disclosure_note: "Add any required commercial-content, sponsorship, or product disclosure before approval.",
      status: "DRAFT",
    },
    hashtags: {
      hashtags,
      rationale: hashtags.map((tag) => `${tag} reflects a high-signal topic extracted from the brief.`),
      status: "DRAFT",
    },
    findings: {
      findings,
      requires_human_review: input.safety.state !== "PASS",
    },
    recommended_changes: {
      changes: findings.length
        ? findings.map((finding) => `Resolve ${finding.code}: ${finding.message}`)
        : ["Preserve factual language", "Attach evidence for important claims", "Complete final human review"],
      priority: input.safety.state === "BLOCKED" ? "critical" : input.safety.state === "HUMAN_REVIEW_REQUIRED" ? "high" : "normal",
      status: "DRAFT_RECOMMENDATION",
    },
    review_result: {
      result: input.safety.state,
      explanation: input.safety.state === "PASS" ? "No configured blocking pattern was detected in the supplied brief." : "Configured safety controls detected issues requiring intervention.",
      findings: findings.map((finding) => finding.message),
    },
    publish_plan: {
      prerequisites: ["Connected and healthy TikTok connector", "Passing compliance review", "Approval bound to the exact content hash", "Open emergency controls", "Enabled production or sandbox publishing gate"],
      planned_state: "NOT_SUBMITTED",
      external_action_taken: false,
      next_human_step: "Review prerequisites and approve the exact version before creating a publishing job.",
    },
    job_request: {
      request_type: "INTERNAL_DRAFT",
      required_inputs: ["workspace_id", "content_version_id", "connector_instance_id", "approval_request_id", "idempotency_key"],
      blockers: input.context?.workspace.publishingDisabled ? ["Workspace publishing is disabled"] : ["External submission still requires platform authorization and an enabled environment gate"],
      external_action_taken: false,
    },
    preflight_report: {
      checks: [
        { name: "Human approval", status: "REQUIRED" },
        { name: "Exact content hash", status: "REQUIRED" },
        { name: "Connector health", status: input.context?.connectorStates.some((item) => item.state === "CONNECTED") ? "AVAILABLE" : "NOT_CONFIGURED" },
        { name: "Emergency lock", status: input.context?.workspace.emergencyLock ? "BLOCKED" : "CLEAR" },
        { name: "Live publishing gate", status: input.context?.workspace.publishingDisabled ? "BLOCKED" : "REQUIRES_ENVIRONMENT_VERIFICATION" },
      ],
      ready_for_external_submission: false,
      reason: "The agent can prepare and assess a plan but cannot submit externally or claim platform success.",
    },
  };

  const output = outputs[input.outputType];
  if (!output) throw new TokMetricError(400, "AGENT_OUTPUT_NOT_IMPLEMENTED", "The requested controlled output is not implemented.");
  return output;
}

export async function resolveConfiguredTokMetricGptActor(workspaceId: string) {
  const actorId = process.env.TOKMETRIC_GPT_ACTOR_USER_ID?.trim();
  if (!actorId) throw new TokMetricError(503, "GPT_ACTOR_NOT_CONFIGURED", "TOKMETRIC_GPT_ACTOR_USER_ID is not configured.");
  const actor = await db.user.findFirst({ where: { id: actorId, isActive: true } });
  if (!actor) throw new TokMetricError(503, "GPT_ACTOR_INVALID", "The configured TokMetric GPT actor is not active.");
  if (!["admin", "super_admin", "internal"].includes(actor.role)) {
    const membership = await db.workspaceMember.findUnique({ where: { workspaceId_userId: { workspaceId, userId: actor.id } } });
    if (!membership || membership.status !== "active") throw new TokMetricError(403, "WORKSPACE_FORBIDDEN", "The configured GPT actor cannot access this workspace.");
  }
  return actor;
}

export async function runTokMetricAgent(input: TokMetricAgentRunInput) {
  const startedAt = Date.now();
  const agent = validateAgentOutput(input.agent, input.outputType);
  const safety = evaluateTokMetricAgentSafety(input.brief);
  const context = await retrieveTokMetricAgentContext(input.workspaceId);
  const runId = crypto.randomUUID();
  const inputHash = contentHash({ agent: input.agent, outputType: input.outputType, brief: safety.sanitizedBrief });

  if (safety.state === "BLOCKED") {
    await emitTokMetricAudit({
      workspaceId: input.workspaceId,
      actorId: input.actorId,
      action: "tokmetric.agent.blocked",
      entityType: "agent_run",
      entityId: runId,
      correlationId: input.correlationId,
      outcome: "blocked",
      sourceChannel: input.sourceChannel,
      metadata: { agent: input.agent, outputType: input.outputType, inputHash, safety: safety.state, findings: safety.findings },
    });
    await emitDomainEvent({
      workspaceId: input.workspaceId,
      aggregateType: "agent_run",
      aggregateId: runId,
      eventType: "AGENT_RUN_BLOCKED",
      correlationId: input.correlationId,
      metadata: { agent: input.agent, outputType: input.outputType, inputHash, safety: safety.state, findings: safety.findings, externalActionTaken: false },
    });
    throw new TokMetricError(422, "AGENT_SAFETY_BLOCKED", "The agent request was blocked by TokMetric safety controls.");
  }

  const output = generateControlledAgentOutput({ agent: input.agent, outputType: input.outputType, brief: safety.sanitizedBrief, safety, context });
  const schema = outputSchemas[input.outputType];
  const validated = schema.safeParse(output);
  if (!validated.success) throw new TokMetricError(500, "AGENT_OUTPUT_INVALID", "The controlled agent produced an invalid output shape.");

  const outputHash = contentHash(validated.data);
  const completedAt = new Date();
  const durationMs = Date.now() - startedAt;
  const metadata = {
    agent: agent.name,
    outputType: input.outputType,
    promptVersion: agent.promptVersion,
    provider: "tokmetric_controlled_rules",
    modelVersion: agent.modelVersion,
    inputHash,
    outputHash,
    safety: safety.state,
    findings: safety.findings,
    requiresHumanApproval: agent.requiresHumanApproval || safety.state !== "PASS",
    estimatedCostMicros: 0,
    durationMs,
    externalActionTaken: false,
    output: validated.data,
    completedAt: completedAt.toISOString(),
  };

  await emitDomainEvent({
    workspaceId: input.workspaceId,
    aggregateType: "agent_run",
    aggregateId: runId,
    eventType: "AGENT_RUN_COMPLETED",
    correlationId: input.correlationId,
    metadata,
  });
  await emitTokMetricAudit({
    workspaceId: input.workspaceId,
    actorId: input.actorId,
    action: "tokmetric.agent.completed",
    entityType: "agent_run",
    entityId: runId,
    correlationId: input.correlationId,
    outcome: "success",
    sourceChannel: input.sourceChannel,
    metadata: { ...metadata, output: undefined },
  });

  return {
    runId,
    status: "COMPLETED" as const,
    agent,
    outputType: input.outputType,
    safety,
    output: validated.data,
    provider: "tokmetric_controlled_rules",
    modelVersion: agent.modelVersion,
    promptVersion: agent.promptVersion,
    estimatedCostMicros: 0,
    durationMs,
    externalActionTaken: false,
  };
}
