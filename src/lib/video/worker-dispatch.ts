import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { createVideoRenderJob } from "@/lib/video/store";
import { finalizeContentRender } from "@/lib/video/content-rendering";
import {
  contentHash,
  emitDomainEvent,
  emitTokMetricAudit,
  TokMetricError,
} from "@/lib/tokmetric/security";

const VIDEO_CONTENT_TYPES = new Set(["SHORT_VIDEO", "LONG_VIDEO", "REEL"]);

type JsonObject = Record<string, unknown>;

type RenderWorkflowConfig = {
  workflow: Record<string, unknown>;
  promptNodeId: string;
  negativePromptNodeId?: string;
  seedNodeId?: string;
  defaultNegativePrompt: string;
};

type FinalizationClaim = {
  id: string;
  workspaceId: string;
  contentId: string;
  requestedById: string | null;
  externalPromptId: string | null;
  dispatchClaimId: string | null;
};

function object(value: unknown): JsonObject {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonObject)
    : {};
}

function configured(name: string) {
  return process.env[name]?.trim() ?? "";
}

export function videoRenderDispatchMode() {
  const value = configured("VIDEO_RENDER_DISPATCH_MODE").toLowerCase();
  if (!value || value === "worker") return "worker" as const;
  if (value === "server") return "server" as const;
  throw new TokMetricError(
    503,
    "VIDEO_RENDER_DISPATCH_MODE_INVALID",
    "VIDEO_RENDER_DISPATCH_MODE must be worker or server.",
  );
}

function workflowConfig(): RenderWorkflowConfig {
  const raw = configured("COMFYUI_WORKFLOW_JSON");
  const promptNodeId = configured("COMFYUI_PROMPT_NODE_ID");
  if (!raw || !promptNodeId) {
    throw new TokMetricError(
      503,
      "VIDEO_RENDER_WORKFLOW_NOT_CONFIGURED",
      "The local video workflow and prompt node are not configured.",
    );
  }

  let workflow: unknown;
  try {
    workflow = JSON.parse(raw);
  } catch {
    throw new TokMetricError(
      503,
      "VIDEO_RENDER_WORKFLOW_INVALID",
      "The configured local video workflow is not valid JSON.",
    );
  }
  if (!workflow || typeof workflow !== "object" || Array.isArray(workflow)) {
    throw new TokMetricError(
      503,
      "VIDEO_RENDER_WORKFLOW_INVALID",
      "The configured local video workflow must be a ComfyUI API-format object.",
    );
  }

  return {
    workflow: workflow as Record<string, unknown>,
    promptNodeId,
    negativePromptNodeId: configured("COMFYUI_NEGATIVE_PROMPT_NODE_ID") || undefined,
    seedNodeId: configured("COMFYUI_SEED_NODE_ID") || undefined,
    defaultNegativePrompt:
      configured("COMFYUI_DEFAULT_NEGATIVE_PROMPT") ||
      "real company logos, credentials, private data, unreadable text, distorted faces, weapons, exploit instructions",
  };
}

function rendererPrompt(version: { script: string | null; settings: unknown }) {
  const settings = object(version.settings);
  const recipe = object(settings.videoRecipe);
  const scenes = Array.isArray(recipe.scenes) ? recipe.scenes : [];
  const sceneDirections = scenes
    .map((scene, index) => {
      const item = object(scene);
      const visual = typeof item.visualDirection === "string" ? item.visualDirection : "";
      const narration = typeof item.narration === "string" ? item.narration : "";
      const onScreenText = typeof item.onScreenText === "string" ? item.onScreenText : "";
      return [
        `Scene ${index + 1}:`,
        visual && `Visual: ${visual}`,
        narration && `Narration intent: ${narration}`,
        onScreenText && `On-screen text concept: ${onScreenText}`,
      ]
        .filter(Boolean)
        .join(" ");
    })
    .filter(Boolean);

  const aspectRatio = typeof recipe.aspectRatio === "string" ? recipe.aspectRatio : "9:16";
  const cameraDirection =
    typeof recipe.cameraDirection === "string"
      ? recipe.cameraDirection
      : "Professional documentary camera movement";
  const voiceDirection =
    typeof recipe.voiceDirection === "string"
      ? recipe.voiceDirection
      : "Natural, calm professional narration";

  return [
    "Create a realistic cybersecurity education video for GEM Cybersecurity & Monitoring Assist.",
    "Use a natural professional environment and believable human motion without depicting a real identifiable person unless separately authorized.",
    "Do not display credentials, private infrastructure, exploit steps, customer data, certification seals, or unsupported guarantees.",
    `Aspect ratio: ${aspectRatio}.`,
    `Camera: ${cameraDirection}.`,
    `Voice direction: ${voiceDirection}.`,
    version.script ? `Approved script context: ${version.script}` : "",
    ...sceneDirections,
  ]
    .filter(Boolean)
    .join("\n");
}

function orchestratorMetadata(settings: unknown) {
  return object(object(settings).orchestrator);
}

async function reviewableContent(workspaceId: string, contentId: string) {
  const content = await db.content.findFirst({
    where: { id: contentId, workspaceId },
  });
  if (!content?.currentVersionId) {
    throw new TokMetricError(
      404,
      "CONTENT_NOT_FOUND",
      "The content or active version was not found.",
    );
  }
  if (["APPROVED", "ARCHIVED"].includes(content.state)) {
    throw new TokMetricError(
      409,
      "CONTENT_RENDER_IMMUTABLE",
      "Approved or archived content cannot enter the render workflow.",
    );
  }
  const version = await db.contentVersion.findUnique({
    where: { id: content.currentVersionId },
  });
  if (!version) {
    throw new TokMetricError(
      409,
      "CONTENT_VERSION_MISSING",
      "The active content version was not found.",
    );
  }
  const metadata = orchestratorMetadata(version.settings);
  if (
    typeof metadata.contentType !== "string" ||
    !VIDEO_CONTENT_TYPES.has(metadata.contentType)
  ) {
    throw new TokMetricError(
      409,
      "CONTENT_NOT_VIDEO_RENDERABLE",
      "Only orchestrated video content can be submitted to the video renderer.",
    );
  }
  const review = await db.complianceReview.findFirst({
    where: { contentVersionId: version.id },
    orderBy: { createdAt: "desc" },
  });
  if (!review || !["PASS", "PASS_WITH_DISCLOSURE"].includes(review.result)) {
    throw new TokMetricError(
      409,
      "VIDEO_RENDER_COMPLIANCE_REQUIRED",
      "A passing compliance review for the exact content version is required before rendering.",
    );
  }
  return { content, version, review };
}

async function ensureDispatchEvidence(input: {
  workspaceId: string;
  actorId: string;
  correlationId: string;
  renderJobId: string;
  contentId: string;
  contentVersionId: string;
  complianceReviewId: string;
  reused: boolean;
}) {
  const action = "video.render.dispatch_requested";
  const eventType = "VIDEO_RENDER_DISPATCH_REQUESTED";
  const [audit, event] = await Promise.all([
    db.auditEvent.findFirst({
      where: {
        workspaceId: input.workspaceId,
        action,
        entityType: "video_render_job",
        entityId: input.renderJobId,
      },
      select: { id: true },
    }),
    db.domainEvent.findFirst({
      where: {
        workspaceId: input.workspaceId,
        aggregateType: "content",
        aggregateId: input.contentId,
        eventType,
      },
      select: { id: true },
    }),
  ]);
  const metadata = {
    renderJobId: input.renderJobId,
    contentId: input.contentId,
    contentVersionId: input.contentVersionId,
    complianceReviewId: input.complianceReviewId,
    provider: "comfyui-local",
    dispatchMode: "trusted-worker",
    externalPublicationTaken: false,
  };
  if (!audit) {
    await emitTokMetricAudit({
      workspaceId: input.workspaceId,
      actorId: input.actorId,
      action,
      entityType: "video_render_job",
      entityId: input.renderJobId,
      correlationId: input.correlationId,
      outcome: input.reused ? "recovered" : "dispatching",
      sourceChannel: "social-media-command-center",
      metadata,
    });
  }
  if (!event) {
    await emitDomainEvent({
      workspaceId: input.workspaceId,
      aggregateType: "content",
      aggregateId: input.contentId,
      eventType,
      correlationId: input.correlationId,
      metadata,
    });
  }
}

export async function queueContentRenderForWorker(input: {
  workspaceId: string;
  contentId: string;
  actorId: string;
  correlationId: string;
  idempotencyKey: string;
  seed?: number;
}) {
  const { content, version, review } = await reviewableContent(
    input.workspaceId,
    input.contentId,
  );
  const config = workflowConfig();
  const prompt = rendererPrompt(version);
  const dispatchPayload = {
    prompt,
    negativePrompt: config.defaultNegativePrompt,
    workflow: config.workflow,
    promptNodeId: config.promptNodeId,
    negativePromptNodeId: config.negativePromptNodeId,
    seedNodeId: config.seedNodeId,
    seed: input.seed,
  };
  const durable = await createVideoRenderJob({
    workspaceId: input.workspaceId,
    contentId: content.id,
    contentVersionId: version.id,
    complianceReviewId: review.id,
    requestedById: input.actorId,
    idempotencyKey: input.idempotencyKey,
    request: {
      contentVersionId: version.id,
      seed: input.seed ?? null,
      promptHash: contentHash(prompt),
      workflowHash: contentHash(config.workflow),
      dispatchMode: "worker",
    },
    dispatchPayload,
  });

  await ensureDispatchEvidence({
    workspaceId: input.workspaceId,
    actorId: input.actorId,
    correlationId: input.correlationId,
    renderJobId: durable.record.id,
    contentId: content.id,
    contentVersionId: version.id,
    complianceReviewId: review.id,
    reused: durable.reused,
  });

  return {
    renderJobId: durable.record.id,
    promptId: durable.record.externalPromptId,
    clientId: durable.record.clientId,
    status: durable.record.state.toLowerCase(),
    dispatchMode: "trusted-worker" as const,
    contentId: content.id,
    contentVersionId: version.id,
    complianceReviewId: review.id,
    reused: durable.reused,
    externalActionTaken: false,
    externalPublicationTaken: false,
  };
}

async function claimVerifiedRendersForFinalization(limit: number) {
  const boundedLimit = Math.min(Math.max(Math.trunc(limit), 1), 20);
  const claimId = randomUUID();
  const claimExpiresAt = new Date(Date.now() + 3 * 60_000);
  return db.$transaction(async (transaction) =>
    transaction.$queryRaw<FinalizationClaim[]>(Prisma.sql`
      WITH candidates AS (
        SELECT jobs.id
        FROM video_render_jobs jobs
        INNER JOIN video_render_uploads uploads
          ON uploads.render_job_id = jobs.id
        WHERE jobs.state = 'COMPLETED'
          AND jobs.requested_by_id IS NOT NULL
          AND (
            jobs.dispatch_claim_id IS NULL
            OR jobs.dispatch_claim_expires_at IS NULL
            OR jobs.dispatch_claim_expires_at <= CURRENT_TIMESTAMP
          )
        ORDER BY jobs.completed_at ASC NULLS LAST, jobs.created_at ASC
        FOR UPDATE OF jobs SKIP LOCKED
        LIMIT ${boundedLimit}
      )
      UPDATE video_render_jobs jobs
      SET dispatch_claim_id = ${claimId},
          dispatch_claim_expires_at = ${claimExpiresAt},
          updated_at = CURRENT_TIMESTAMP
      FROM candidates
      WHERE jobs.id = candidates.id
      RETURNING
        jobs.id,
        jobs.workspace_id AS "workspaceId",
        jobs.content_id AS "contentId",
        jobs.requested_by_id AS "requestedById",
        jobs.external_prompt_id AS "externalPromptId",
        jobs.dispatch_claim_id AS "dispatchClaimId"
    `),
  );
}

async function releaseFinalizationClaim(input: {
  id: string;
  claimId: string;
  errorCode: string;
  errorMessage: string;
}) {
  await db.$executeRaw(Prisma.sql`
    UPDATE video_render_jobs
    SET dispatch_claim_id = NULL,
        dispatch_claim_expires_at = NULL,
        error_code = ${input.errorCode.slice(0, 100)},
        error_message = ${input.errorMessage.slice(0, 500)},
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ${input.id}
      AND state = 'COMPLETED'
      AND dispatch_claim_id = ${input.claimId}
  `);
}

export async function finalizeVerifiedWorkerRenders(input: {
  limit?: number;
  correlationId: string;
}) {
  const claimed = await claimVerifiedRendersForFinalization(input.limit ?? 5);
  const results: Array<Record<string, unknown>> = [];

  for (const record of claimed) {
    const claimId = record.dispatchClaimId;
    if (!claimId || !record.externalPromptId || !record.requestedById) {
      if (claimId) {
        await releaseFinalizationClaim({
          id: record.id,
          claimId,
          errorCode: "VIDEO_FINALIZATION_ACTOR_OR_PROMPT_MISSING",
          errorMessage:
            "The verified render does not have the prompt or original authorized actor required for finalization.",
        });
      }
      results.push({
        renderJobId: record.id,
        status: "failed",
        code: "VIDEO_FINALIZATION_ACTOR_OR_PROMPT_MISSING",
      });
      continue;
    }

    const actor = await db.user.findUnique({
      where: { id: record.requestedById },
      select: { status: true, isActive: true },
    });
    if (!actor?.isActive || actor.status !== "active") {
      await releaseFinalizationClaim({
        id: record.id,
        claimId,
        errorCode: "VIDEO_FINALIZATION_ACTOR_INACTIVE",
        errorMessage:
          "The original authorized operator is no longer active, so automatic finalization is blocked.",
      });
      results.push({
        renderJobId: record.id,
        status: "failed",
        code: "VIDEO_FINALIZATION_ACTOR_INACTIVE",
      });
      continue;
    }

    try {
      const finalized = await finalizeContentRender({
        workspaceId: record.workspaceId,
        contentId: record.contentId,
        promptId: record.externalPromptId,
        actorId: record.requestedById,
        correlationId: input.correlationId,
      });
      results.push({
        renderJobId: record.id,
        status: "finalized",
        contentVersionId: finalized.contentVersionId,
        approvalRequestId: finalized.approvalRequestId,
      });
    } catch (error) {
      const code = error instanceof TokMetricError ? error.code : "VIDEO_FINALIZATION_FAILED";
      const message =
        error instanceof TokMetricError
          ? error.message
          : "The verified render could not be finalized.";
      await releaseFinalizationClaim({
        id: record.id,
        claimId,
        errorCode: code,
        errorMessage: message,
      }).catch(() => undefined);
      results.push({ renderJobId: record.id, status: "failed", code });
    }
  }

  return {
    claimed: claimed.length,
    finalized: results.filter((result) => result.status === "finalized").length,
    failed: results.filter((result) => result.status === "failed").length,
    results,
    externalPublicationTaken: false,
  };
}
