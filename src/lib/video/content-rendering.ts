import { db } from "@/lib/db";
import { getVideoJob, queueVideoJob } from "@/lib/video/comfyui";
import {
  createContentVersion,
  registerMediaAsset,
  requestContentApproval,
  runComplianceReview,
} from "@/lib/tokmetric/workflow";
import {
  emitDomainEvent,
  emitTokMetricAudit,
  TokMetricError,
} from "@/lib/tokmetric/security";

const VIDEO_CONTENT_TYPES = new Set(["SHORT_VIDEO", "LONG_VIDEO", "REEL"]);
const VIDEO_MIME_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);

type JsonObject = Record<string, unknown>;

type RenderWorkflowConfig = {
  workflow: Record<string, unknown>;
  promptNodeId: string;
  negativePromptNodeId?: string;
  seedNodeId?: string;
  defaultNegativePrompt: string;
};

export type FinalizeContentRenderInput = {
  workspaceId: string;
  contentId: string;
  promptId: string;
  actorId: string;
  correlationId: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  checksum: string;
  storageRef: string;
};

function object(value: unknown): JsonObject {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonObject)
    : {};
}

function configured(name: string) {
  return process.env[name]?.trim() ?? "";
}

function providerFailure(error: unknown): never {
  if (error instanceof TokMetricError) throw error;
  const message = error instanceof Error ? error.message : "COMFYUI_REQUEST_FAILED";
  if (message === "COMFYUI_NOT_CONFIGURED") {
    throw new TokMetricError(503, message, "The local video worker is not configured.");
  }
  if (message === "COMFYUI_QUEUE_FULL") {
    throw new TokMetricError(429, message, "The local video render queue is full.");
  }
  if (message === "COMFYUI_TIMEOUT") {
    throw new TokMetricError(504, message, "The local video worker timed out.");
  }
  if (message.startsWith("WORKFLOW_NODE_NOT_FOUND:")) {
    throw new TokMetricError(
      503,
      "VIDEO_RENDER_WORKFLOW_NODE_MISSING",
      "The configured ComfyUI workflow does not contain a required input node.",
    );
  }
  throw new TokMetricError(
    502,
    "VIDEO_RENDER_PROVIDER_FAILED",
    "The local video worker could not complete the requested operation.",
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
    "The result must look professional and authentic without depicting a real identifiable person unless separately authorized.",
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

function approvalAction(settings: unknown) {
  const provider = orchestratorMetadata(settings).provider;
  return typeof provider === "string"
    ? `publish_${provider.toLowerCase()}_content`
    : "publish_content";
}

function allowedStorageOrigins() {
  const explicit = configured("VIDEO_ASSET_ALLOWED_ORIGINS")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const supabase = configured("SUPABASE_URL") || configured("NEXT_PUBLIC_SUPABASE_URL");
  const values = [...explicit];
  if (supabase) {
    try {
      values.push(new URL(supabase).origin);
    } catch {
      // Invalid configuration remains fail-closed.
    }
  }
  return new Set(values);
}

function assertStorageRefAllowed(storageRef: string) {
  let url: URL;
  try {
    url = new URL(storageRef);
  } catch {
    throw new TokMetricError(
      400,
      "VIDEO_STORAGE_REF_INVALID",
      "The video storage reference is invalid.",
    );
  }
  const allowed = allowedStorageOrigins();
  if (!allowed.size || !allowed.has(url.origin)) {
    throw new TokMetricError(
      409,
      "VIDEO_STORAGE_ORIGIN_NOT_APPROVED",
      "The rendered video must be uploaded to an approved storage origin before finalization.",
    );
  }
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

export async function queueContentRender(input: {
  workspaceId: string;
  contentId: string;
  actorId: string;
  correlationId: string;
  seed?: number;
}) {
  const { content, version, review } = await reviewableContent(
    input.workspaceId,
    input.contentId,
  );
  const config = workflowConfig();

  let job: Awaited<ReturnType<typeof queueVideoJob>>;
  try {
    job = await queueVideoJob({
      prompt: rendererPrompt(version),
      negativePrompt: config.defaultNegativePrompt,
      workflow: config.workflow,
      promptNodeId: config.promptNodeId,
      negativePromptNodeId: config.negativePromptNodeId,
      seedNodeId: config.seedNodeId,
      seed: input.seed,
    });
  } catch (error) {
    providerFailure(error);
  }

  const metadata = {
    contentId: content.id,
    contentVersionId: version.id,
    complianceReviewId: review.id,
    provider: "comfyui-local",
    promptId: job.promptId,
    externalPublicationTaken: false,
  };
  await emitTokMetricAudit({
    workspaceId: input.workspaceId,
    actorId: input.actorId,
    action: "video.render.queued",
    entityType: "video_render_job",
    entityId: job.promptId,
    correlationId: input.correlationId,
    outcome: "queued",
    sourceChannel: "social-media-command-center",
    metadata,
  });
  await emitDomainEvent({
    workspaceId: input.workspaceId,
    aggregateType: "content",
    aggregateId: content.id,
    eventType: "VIDEO_RENDER_QUEUED",
    correlationId: input.correlationId,
    metadata,
  });

  return {
    ...job,
    contentId: content.id,
    contentVersionId: version.id,
    complianceReviewId: review.id,
    externalActionTaken: true,
    externalPublicationTaken: false,
  };
}

export async function latestContentRender(input: {
  workspaceId: string;
  contentId: string;
}) {
  const event = await db.auditEvent.findFirst({
    where: {
      workspaceId: input.workspaceId,
      action: "video.render.queued",
      entityType: "video_render_job",
      safeMetadata: { path: ["contentId"], equals: input.contentId },
    },
    orderBy: { createdAt: "desc" },
  });
  if (!event?.entityId) return null;
  try {
    const job = await getVideoJob(event.entityId);
    return { ...job, queuedAt: event.createdAt };
  } catch (error) {
    providerFailure(error);
  }
}

export async function finalizeContentRender(input: FinalizeContentRenderInput) {
  if (!VIDEO_MIME_TYPES.has(input.mimeType)) {
    throw new TokMetricError(
      400,
      "VIDEO_MIME_TYPE_INVALID",
      "The rendered asset must be an approved video type.",
    );
  }
  if (input.fileSize <= 0 || input.fileSize > 1024 * 1024 * 1024) {
    throw new TokMetricError(
      400,
      "VIDEO_FILE_SIZE_INVALID",
      "The rendered video size is outside the approved range.",
    );
  }
  if (!/^[a-f0-9]{64}$/i.test(input.checksum)) {
    throw new TokMetricError(
      400,
      "VIDEO_CHECKSUM_INVALID",
      "A SHA-256 checksum is required.",
    );
  }
  assertStorageRefAllowed(input.storageRef);

  const queuedEvent = await db.auditEvent.findFirst({
    where: {
      workspaceId: input.workspaceId,
      action: "video.render.queued",
      entityType: "video_render_job",
      entityId: input.promptId,
    },
    orderBy: { createdAt: "desc" },
  });
  const queuedMetadata = object(queuedEvent?.safeMetadata);
  if (!queuedEvent || queuedMetadata.contentId !== input.contentId) {
    throw new TokMetricError(
      409,
      "VIDEO_RENDER_OWNERSHIP_INVALID",
      "The render job is not bound to this workspace and content item.",
    );
  }

  let job: Awaited<ReturnType<typeof getVideoJob>>;
  try {
    job = await getVideoJob(input.promptId);
  } catch (error) {
    providerFailure(error);
  }
  if (job.status !== "completed") {
    throw new TokMetricError(
      409,
      "VIDEO_RENDER_NOT_COMPLETE",
      "Only a successfully completed render can be finalized.",
    );
  }

  const { content, version } = await reviewableContent(
    input.workspaceId,
    input.contentId,
  );
  if (queuedMetadata.contentVersionId !== version.id) {
    throw new TokMetricError(
      409,
      "VIDEO_RENDER_VERSION_MISMATCH",
      "The content version changed after the render was queued.",
    );
  }

  const mediaAsset = await registerMediaAsset({
    workspaceId: input.workspaceId,
    actorId: input.actorId,
    fileName: input.fileName,
    mimeType: input.mimeType,
    fileSize: input.fileSize,
    checksum: input.checksum.toLowerCase(),
    storageRef: input.storageRef,
    metadata: {
      provider: "comfyui-local",
      promptId: input.promptId,
      sourceContentId: content.id,
      sourceContentVersionId: version.id,
      outputDescriptors: job.outputs,
      humanApprovalRequired: true,
    },
  });

  const settings = object(version.settings);
  const nextVersion = await createContentVersion(
    content.id,
    input.workspaceId,
    input.actorId,
    input.correlationId,
    {
      script: version.script ?? undefined,
      caption: version.caption ?? undefined,
      hashtags: version.hashtags,
      settings: {
        ...settings,
        render: {
          provider: "comfyui-local",
          promptId: input.promptId,
          mediaAssetId: mediaAsset.id,
          finalizedAt: new Date().toISOString(),
          humanApprovalRequired: true,
        },
      },
      mediaAssetIds: [...new Set([...version.mediaAssetIds, mediaAsset.id])],
    },
  );
  const review = await runComplianceReview({
    workspaceId: input.workspaceId,
    contentId: content.id,
    actorId: input.actorId,
    correlationId: input.correlationId,
  });

  let approvalRequestId: string | undefined;
  if (["PASS", "PASS_WITH_DISCLOSURE"].includes(review.result)) {
    const approval = await requestContentApproval({
      workspaceId: input.workspaceId,
      contentId: content.id,
      actorId: input.actorId,
      action: approvalAction(settings),
      correlationId: input.correlationId,
    });
    approvalRequestId = approval.id;
  }

  await emitTokMetricAudit({
    workspaceId: input.workspaceId,
    actorId: input.actorId,
    action: "video.render.finalized",
    entityType: "media_asset",
    entityId: mediaAsset.id,
    correlationId: input.correlationId,
    outcome: review.result,
    sourceChannel: "social-media-command-center",
    metadata: {
      contentId: content.id,
      previousContentVersionId: version.id,
      contentVersionId: nextVersion.version.id,
      promptId: input.promptId,
      approvalRequestId,
      storageRefOrigin: new URL(input.storageRef).origin,
    },
  });

  return {
    mediaAssetId: mediaAsset.id,
    contentId: content.id,
    contentVersionId: nextVersion.version.id,
    complianceReviewId: review.id,
    complianceResult: review.result,
    approvalRequestId,
    state: approvalRequestId
      ? "AWAITING_HUMAN_APPROVAL"
      : "COMPLIANCE_REVIEW_REQUIRED",
    externalPublicationTaken: false,
  };
}
