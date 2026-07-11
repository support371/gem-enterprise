import { Prisma } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { getTokMetricReadiness } from "@/lib/tokmetric/readiness";
import {
  contentHash,
  emitDomainEvent,
  emitTokMetricAudit,
  redactSecrets,
  TokMetricError,
} from "@/lib/tokmetric/security";
import {
  createContentDraft,
  queuePublishJob,
  requestContentApproval,
  runComplianceReview,
} from "@/lib/tokmetric/workflow";

export const TOKMETRIC_GPT_ACTIONS = [
  "gptSystemReadiness",
  "gptConnectorReadiness",
  "gptListAccounts",
  "gptListCampaigns",
  "gptGetCampaign",
  "gptCreateCampaignDraft",
  "gptListContent",
  "gptGetContent",
  "gptCreateContentDraft",
  "gptRunComplianceReview",
  "gptRequestApproval",
  "gptGetApprovalStatus",
  "gptCreatePublishJob",
  "gptGetPublishJobStatus",
  "gptGetAnalyticsSummary",
  "gptGetAuditHistory",
] as const;

export type TokMetricGptAction = (typeof TOKMETRIC_GPT_ACTIONS)[number];

const workspaceSchema = z.object({ workspace_id: z.string().min(1) });
const listSchema = workspaceSchema.extend({ limit: z.number().int().min(1).max(100).default(25) });
const idSchema = workspaceSchema.extend({ id: z.string().min(1) });

const createCampaignSchema = workspaceSchema.extend({
  name: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  platform: z.enum(["tiktok_organic", "tiktok_shop", "tiktok_business"]),
  goal: z.enum(["awareness", "engagement", "conversions", "traffic", "followers"]),
  target_audience: z.string().max(2000).optional(),
  budget: z.number().nonnegative().optional(),
  start_date: z.string().date().optional(),
  end_date: z.string().date().optional(),
});

const createContentSchema = workspaceSchema.extend({
  campaign_id: z.string().min(1).optional(),
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  content_type: z.enum(["video", "image", "carousel", "story", "live"]),
  platform: z.enum(["tiktok_organic", "tiktok_shop", "tiktok_business"]),
  script: z.string().max(10000).optional(),
  caption: z.string().max(2200).optional(),
  hashtags: z.array(z.string().max(100)).max(50).optional(),
  media_asset_id: z.string().min(1).optional(),
  settings: z.record(z.unknown()).optional(),
});

const reviewSchema = workspaceSchema.extend({
  content_id: z.string().min(1).optional(),
  content_version_id: z.string().min(1).optional(),
  policy_version_id: z.string().min(1).optional(),
}).refine((value) => Boolean(value.content_id || value.content_version_id), {
  message: "content_id or content_version_id is required",
});

const approvalSchema = workspaceSchema.extend({
  content_id: z.string().min(1).optional(),
  object_version_id: z.string().min(1).optional(),
  required_role: z.string().min(1).max(100).optional(),
  expires_at: z.string().datetime().optional(),
}).refine((value) => Boolean(value.content_id || value.object_version_id), {
  message: "content_id or object_version_id is required",
});

const publishSchema = workspaceSchema.extend({
  content_version_id: z.string().min(1),
  connector_instance_id: z.string().min(1),
  approval_request_id: z.string().min(1),
  scheduled_at: z.string().datetime().optional(),
  idempotency_key: z.string().min(16).max(200),
});

function asInputJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value ?? {})) as Prisma.InputJsonValue;
}

function parseBody<T extends z.ZodTypeAny>(schema: T, body: unknown): z.infer<T> {
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new TokMetricError(400, "VALIDATION_ERROR", "TokMetric GPT action request validation failed.");
  }
  return parsed.data;
}

async function requireWorkspace(workspaceId: string) {
  const workspace = await db.workspace.findUnique({ where: { id: workspaceId } });
  if (!workspace) throw new TokMetricError(404, "WORKSPACE_NOT_FOUND", "Workspace was not found.");
  return workspace;
}

async function requireGptActor() {
  const actorId = process.env.TOKMETRIC_GPT_ACTOR_USER_ID?.trim();
  if (!actorId) {
    throw new TokMetricError(
      503,
      "GPT_ACTOR_NOT_CONFIGURED",
      "TOKMETRIC_GPT_ACTOR_USER_ID must reference an active internal user before GPT write actions are enabled.",
    );
  }
  const actor = await db.user.findFirst({ where: { id: actorId, isActive: true } });
  if (!actor) throw new TokMetricError(503, "GPT_ACTOR_INVALID", "The configured TokMetric GPT actor is not active.");
  return actor;
}

async function resolveContentId(workspaceId: string, contentId?: string, contentVersionId?: string) {
  if (contentId) {
    const content = await db.content.findFirst({ where: { id: contentId, workspaceId } });
    if (!content) throw new TokMetricError(404, "CONTENT_NOT_FOUND", "Content was not found.");
    return content.id;
  }
  const version = await db.contentVersion.findFirst({
    where: { id: contentVersionId, content: { workspaceId } },
    select: { contentId: true },
  });
  if (!version) throw new TokMetricError(404, "CONTENT_VERSION_NOT_FOUND", "Content version was not found.");
  return version.contentId;
}

async function createCampaignDraft(body: unknown, correlationId: string) {
  const input = parseBody(createCampaignSchema, body);
  await requireWorkspace(input.workspace_id);
  const actor = await requireGptActor();
  const payload = {
    description: input.description ?? null,
    platform: input.platform,
    goal: input.goal,
    targetAudience: input.target_audience ?? null,
    budget: input.budget ?? null,
    startDate: input.start_date ?? null,
    endDate: input.end_date ?? null,
  };
  const objectHash = contentHash(payload);
  const result = await db.$transaction(async (tx) => {
    const campaign = await tx.campaign.create({
      data: {
        workspaceId: input.workspace_id,
        ownerId: actor.id,
        title: input.name.trim(),
        state: "DRAFT",
      },
    });
    const version = await tx.campaignVersion.create({
      data: {
        campaignId: campaign.id,
        version: 1,
        objectHash,
        payload: asInputJson(payload),
        createdById: actor.id,
      },
    });
    const updated = await tx.campaign.update({
      where: { id: campaign.id },
      data: { currentVersionId: version.id },
    });
    return { campaign: updated, version };
  });
  await emitTokMetricAudit({
    workspaceId: input.workspace_id,
    actorId: actor.id,
    action: "tokmetric.campaign.created_by_gpt",
    entityType: "campaign",
    entityId: result.campaign.id,
    correlationId,
    outcome: "success",
    sourceChannel: "custom_gpt",
    metadata: { versionId: result.version.id, objectHash },
  });
  await emitDomainEvent({
    workspaceId: input.workspace_id,
    aggregateType: "campaign",
    aggregateId: result.campaign.id,
    eventType: "CAMPAIGN_DRAFT_CREATED",
    correlationId,
    metadata: { versionId: result.version.id, objectHash },
  });
  return { statusCode: 201, data: { campaign_id: result.campaign.id, campaign_version_id: result.version.id, object_hash: objectHash, status: "DRAFT" } };
}

export async function executeTokMetricGptAction(
  action: TokMetricGptAction,
  body: unknown,
  correlationId: string,
) {
  switch (action) {
    case "gptSystemReadiness": {
      const readiness = await getTokMetricReadiness();
      return {
        statusCode: 200,
        data: {
          ...readiness,
          gpt_auth_configured: Boolean(process.env.GPT_AUTH_TOKEN),
          gpt_actor_configured: Boolean(process.env.TOKMETRIC_GPT_ACTOR_USER_ID),
          token_encryption_configured: Boolean(process.env.TOKMETRIC_TOKEN_ENCRYPTION_KEY),
          tiktok_client_configured: Boolean(process.env.TIKTOK_CLIENT_KEY && process.env.TIKTOK_CLIENT_SECRET),
          production_activation: process.env.TOKMETRIC_LIVE_PUBLISHING_ENABLED === "true" ? "ENABLED" : "BLOCKED",
        },
      };
    }

    case "gptConnectorReadiness": {
      const input = parseBody(workspaceSchema, body);
      const workspace = await requireWorkspace(input.workspace_id);
      const connectors = await db.connector.findMany({
        where: { workspaceId: input.workspace_id },
        select: { id: true, provider: true, state: true, displayName: true, grantedScopes: true, lastHealthAt: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
      });
      return {
        statusCode: 200,
        data: {
          workspace_id: workspace.id,
          emergency_lock_enabled: workspace.globalEmergencyLock,
          connector_writes_disabled: workspace.connectorDisabled,
          connectors,
          overall_status: connectors.some((connector) => connector.state === "CONNECTED") ? "PARTIAL" : "ACTION_REQUIRED",
        },
      };
    }

    case "gptListAccounts": {
      const input = parseBody(listSchema.extend({ provider: z.string().optional(), status: z.string().optional() }), body);
      await requireWorkspace(input.workspace_id);
      const connectors = await db.connector.findMany({
        where: {
          workspaceId: input.workspace_id,
          ...(input.provider ? { provider: input.provider as never } : {}),
          ...(input.status ? { state: input.status as never } : {}),
        },
        select: {
          id: true,
          provider: true,
          state: true,
          displayName: true,
          externalAccountId: true,
          grantedScopes: true,
          lastHealthAt: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: "desc" },
        take: input.limit,
      });
      return { statusCode: 200, data: { accounts: connectors, total: connectors.length } };
    }

    case "gptListCampaigns": {
      const input = parseBody(listSchema.extend({ status: z.string().optional() }), body);
      await requireWorkspace(input.workspace_id);
      const campaigns = await db.campaign.findMany({
        where: { workspaceId: input.workspace_id, ...(input.status ? { state: input.status as never } : {}) },
        include: { versions: { orderBy: { version: "desc" }, take: 1 } },
        orderBy: { updatedAt: "desc" },
        take: input.limit,
      });
      return { statusCode: 200, data: { campaigns, total: campaigns.length } };
    }

    case "gptGetCampaign": {
      const input = parseBody(idSchema.extend({ campaign_id: z.string().min(1).optional() }), body);
      const campaignId = input.campaign_id ?? input.id;
      const campaign = await db.campaign.findFirst({
        where: { id: campaignId, workspaceId: input.workspace_id },
        include: { versions: { orderBy: { version: "desc" } }, contents: { orderBy: { updatedAt: "desc" }, take: 25 } },
      });
      if (!campaign) throw new TokMetricError(404, "CAMPAIGN_NOT_FOUND", "Campaign was not found.");
      return { statusCode: 200, data: { campaign } };
    }

    case "gptCreateCampaignDraft":
      return createCampaignDraft(body, correlationId);

    case "gptListContent": {
      const input = parseBody(listSchema.extend({ campaign_id: z.string().optional(), status: z.string().optional() }), body);
      await requireWorkspace(input.workspace_id);
      const content = await db.content.findMany({
        where: {
          workspaceId: input.workspace_id,
          ...(input.campaign_id ? { campaignId: input.campaign_id } : {}),
          ...(input.status ? { state: input.status as never } : {}),
        },
        include: { versions: { orderBy: { version: "desc" }, take: 1 } },
        orderBy: { updatedAt: "desc" },
        take: input.limit,
      });
      return { statusCode: 200, data: { content, total: content.length } };
    }

    case "gptGetContent": {
      const input = parseBody(idSchema.extend({ content_id: z.string().min(1).optional() }), body);
      const contentId = input.content_id ?? input.id;
      const content = await db.content.findFirst({
        where: { id: contentId, workspaceId: input.workspace_id },
        include: {
          versions: { orderBy: { version: "desc" } },
          reviews: { orderBy: { createdAt: "desc" }, take: 10 },
          approvals: { orderBy: { updatedAt: "desc" }, take: 10, include: { decisions: true } },
          publishJobs: { orderBy: { updatedAt: "desc" }, take: 10 },
        },
      });
      if (!content) throw new TokMetricError(404, "CONTENT_NOT_FOUND", "Content was not found.");
      return { statusCode: 200, data: { content } };
    }

    case "gptCreateContentDraft": {
      const input = parseBody(createContentSchema, body);
      await requireWorkspace(input.workspace_id);
      const actor = await requireGptActor();
      const settings = {
        ...(input.settings ?? {}),
        description: input.description ?? null,
        contentType: input.content_type,
        platform: input.platform,
      };
      const result = await createContentDraft(
        {
          workspaceId: input.workspace_id,
          campaignId: input.campaign_id,
          title: input.title,
          script: input.script,
          caption: input.caption,
          hashtags: input.hashtags,
          settings,
          mediaAssetIds: input.media_asset_id ? [input.media_asset_id] : [],
        },
        actor.id,
        correlationId,
      );
      return {
        statusCode: 201,
        data: {
          content_id: result.content.id,
          content_version_id: result.version.id,
          content_hash: result.version.objectHash,
          status: result.content.state,
        },
      };
    }

    case "gptRunComplianceReview": {
      const input = parseBody(reviewSchema, body);
      await requireWorkspace(input.workspace_id);
      const actor = await requireGptActor();
      const contentId = await resolveContentId(input.workspace_id, input.content_id, input.content_version_id);
      const review = await runComplianceReview({
        workspaceId: input.workspace_id,
        contentId,
        policyVersionId: input.policy_version_id,
        actorId: actor.id,
        correlationId,
      });
      return { statusCode: 200, data: { compliance_review_id: review.id, status: review.result, findings: review.findings } };
    }

    case "gptRequestApproval": {
      const input = parseBody(approvalSchema, body);
      await requireWorkspace(input.workspace_id);
      const actor = await requireGptActor();
      const contentId = await resolveContentId(input.workspace_id, input.content_id, input.object_version_id);
      const approval = await requestContentApproval({
        workspaceId: input.workspace_id,
        contentId,
        actorId: actor.id,
        requiredRole: input.required_role,
        expiresAt: input.expires_at ? new Date(input.expires_at) : undefined,
        correlationId,
      });
      return { statusCode: 201, data: { approval_request_id: approval.id, status: approval.state, object_hash: approval.objectHash } };
    }

    case "gptGetApprovalStatus": {
      const input = parseBody(idSchema.extend({ approval_request_id: z.string().min(1).optional() }), body);
      const approvalId = input.approval_request_id ?? input.id;
      const approval = await db.approvalRequest.findFirst({
        where: { id: approvalId, workspaceId: input.workspace_id },
        include: { decisions: { orderBy: { createdAt: "desc" } }, contentVersion: true },
      });
      if (!approval) throw new TokMetricError(404, "APPROVAL_NOT_FOUND", "Approval request was not found.");
      return { statusCode: 200, data: { approval } };
    }

    case "gptCreatePublishJob": {
      const input = parseBody(publishSchema, body);
      await requireWorkspace(input.workspace_id);
      const actor = await requireGptActor();
      const version = await db.contentVersion.findFirst({
        where: { id: input.content_version_id, content: { workspaceId: input.workspace_id } },
        include: { content: true },
      });
      if (!version) throw new TokMetricError(404, "CONTENT_VERSION_NOT_FOUND", "Content version was not found.");
      const approval = await db.approvalRequest.findFirst({
        where: {
          id: input.approval_request_id,
          workspaceId: input.workspace_id,
          contentVersionId: version.id,
          objectHash: version.objectHash,
          state: "APPROVED",
        },
      });
      if (!approval) throw new TokMetricError(409, "APPROVAL_REQUIRED", "The supplied approval is not valid for this content version.");
      const job = await queuePublishJob({
        workspaceId: input.workspace_id,
        contentId: version.contentId,
        connectorId: input.connector_instance_id,
        actorId: actor.id,
        idempotencyKey: input.idempotency_key,
        scheduledFor: input.scheduled_at ? new Date(input.scheduled_at) : undefined,
        correlationId,
      });
      return { statusCode: 202, data: { job_id: job.id, internal_status: job.internalState, external_status: job.externalState } };
    }

    case "gptGetPublishJobStatus": {
      const input = parseBody(idSchema.extend({ job_id: z.string().min(1).optional() }), body);
      const jobId = input.job_id ?? input.id;
      const job = await db.publishJob.findFirst({
        where: { id: jobId, workspaceId: input.workspace_id },
        include: { attempts: { orderBy: { attempt: "desc" } }, connector: { select: { id: true, provider: true, state: true, displayName: true } } },
      });
      if (!job) throw new TokMetricError(404, "PUBLISH_JOB_NOT_FOUND", "Publishing job was not found.");
      return { statusCode: 200, data: { job } };
    }

    case "gptGetAnalyticsSummary": {
      const input = parseBody(listSchema.extend({ account_id: z.string().optional(), date_from: z.string().date().optional(), date_to: z.string().date().optional() }), body);
      await requireWorkspace(input.workspace_id);
      const snapshots = await db.analyticsSnapshot.findMany({
        where: {
          workspaceId: input.workspace_id,
          ...(input.date_from || input.date_to
            ? {
                capturedAt: {
                  ...(input.date_from ? { gte: new Date(`${input.date_from}T00:00:00.000Z`) } : {}),
                  ...(input.date_to ? { lte: new Date(`${input.date_to}T23:59:59.999Z`) } : {}),
                },
              }
            : {}),
        },
        orderBy: { capturedAt: "desc" },
        take: input.limit,
      });
      const sources = [...new Set(snapshots.map((snapshot) => snapshot.source))];
      return { statusCode: 200, data: { source: sources.length === 1 ? sources[0] : sources.length ? "MIXED" : "UNKNOWN", snapshots } };
    }

    case "gptGetAuditHistory": {
      const input = parseBody(listSchema.extend({ entity_type: z.string().optional(), entity_id: z.string().optional(), severity: z.string().optional() }), body);
      await requireWorkspace(input.workspace_id);
      const events = await db.auditEvent.findMany({
        where: {
          workspaceId: input.workspace_id,
          ...(input.entity_type ? { entityType: input.entity_type } : {}),
          ...(input.entity_id ? { entityId: input.entity_id } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: input.limit,
      });
      return { statusCode: 200, data: { events: redactSecrets(events), total: events.length } };
    }
  }
}
