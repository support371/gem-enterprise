import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import {
  cancelVideoJob,
  getVideoJob,
  queueVideoJob,
} from "@/lib/video/comfyui";
import {
  createVideoRenderJob,
  getVerifiedVideoUpload,
  getVideoRenderJobById,
  getVideoRenderJobByPromptId,
  latestVideoRenderJobForContent,
  markVideoRenderQueued,
  recordVerifiedVideoUpload,
  updateVideoRenderState,
  type VideoRenderJobRecord,
  type VideoRenderJobState,
} from "@/lib/video/store";
import {
  contentHash,
  emitDomainEvent,
  emitTokMetricAudit,
  redactSecrets,
  TokMetricError,
} from "@/lib/tokmetric/security";

const VIDEO_CONTENT_TYPES = new Set(["SHORT_VIDEO", "LONG_VIDEO", "REEL"]);
const VIDEO_MIME_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);
const STORAGE_VERIFY_TIMEOUT_MS = 15_000;

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
};

export type VerifyRenderedUploadInput = {
  renderJobId: string;
  storageRef: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  checksumSha256: string;
  correlationId: string;
};

function object(value: unknown): JsonObject {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonObject)
    : {};
}

function toInputJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value ?? {})) as Prisma.InputJsonValue;
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
      "The rendered video must be uploaded to an approved storage origin.",
    );
  }
}

function outputFileNames(value: unknown, names = new Set<string>()) {
  if (Array.isArray(value)) {
    for (const entry of value) outputFileNames(entry, names);
    return names;
  }
  if (!value || typeof value !== "object") return names;
  for (const [key, entry] of Object.entries(value)) {
    if (key === "filename" && typeof entry === "string") names.add(entry);
    else outputFileNames(entry, names);
  }
  return names;
}

async function verifyStorageObject(input: {
  storageRef: string;
  mimeType: string;
  fileSize: number;
}) {
  assertStorageRefAllowed(input.storageRef);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), STORAGE_VERIFY_TIMEOUT_MS);
  try {
    const response = await fetch(input.storageRef, {
      method: "HEAD",
      cache: "no-store",
      redirect: "follow",
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new TokMetricError(
        409,
        "VIDEO_STORAGE_OBJECT_UNAVAILABLE",
        "The uploaded video could not be verified at the approved storage origin.",
      );
    }
    assertStorageRefAllowed(response.url || input.storageRef);
    const contentLength = Number(response.headers.get("content-length"));
    const contentType = response.headers.get("content-type")?.split(";")[0]?.trim();
    if (!Number.isFinite(contentLength) || contentLength <= 0) {
      throw new TokMetricError(
        409,
        "VIDEO_STORAGE_SIZE_UNVERIFIED",
        "The storage origin did not provide a verifiable video size.",
      );
    }
    if (contentLength !== input.fileSize) {
      throw new TokMetricError(
        409,
        "VIDEO_STORAGE_SIZE_MISMATCH",
        "The stored video's size does not match the trusted worker manifest.",
      );
    }
    if (!contentType || contentType !== input.mimeType) {
      throw new TokMetricError(
        409,
        "VIDEO_STORAGE_TYPE_MISMATCH",
        "The stored video's content type does not match the trusted worker manifest.",
      );
    }
    return {
      contentLength,
      contentType,
      etag: response.headers.get("etag"),
      lastModified: response.headers.get("last-modified"),
      resolvedOrigin: new URL(response.url || input.storageRef).origin,
    };
  } catch (error) {
    if (error instanceof TokMetricError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new TokMetricError(
        504,
        "VIDEO_STORAGE_VERIFY_TIMEOUT",
        "The uploaded video verification request timed out.",
      );
    }
    throw new TokMetricError(
      502,
      "VIDEO_STORAGE_VERIFY_FAILED",
      "The uploaded video could not be verified.",
    );
  } finally {
    clearTimeout(timeout);
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

function storedState(status: string): VideoRenderJobState {
  if (status === "queued") return "QUEUED";
  if (status === "running") return "RUNNING";
  if (status === "completed") return "COMPLETED";
  if (status === "failed") return "FAILED";
  return "QUEUED";
}

async function syncRenderJob(record: VideoRenderJobRecord) {
  if (!record.externalPromptId || record.state === "FINALIZED") return record;
  try {
    const providerJob = await getVideoJob(record.externalPromptId);
    const state = storedState(providerJob.status);
    return await updateVideoRenderState({
      id: record.id,
      state,
      outputManifest: providerJob.outputs,
      errorCode: providerJob.error?.type,
      errorMessage: providerJob.error?.message,
    });
  } catch (error) {
    providerFailure(error);
  }
}

export async function queueContentRender(input: {
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
    },
  });

  if (durable.reused && durable.record.externalPromptId) {
    const current = await syncRenderJob(durable.record);
    return {
      renderJobId: current.id,
      promptId: current.externalPromptId,
      clientId: current.clientId,
      status: current.state.toLowerCase(),
      contentId: current.contentId,
      contentVersionId: current.contentVersionId,
      complianceReviewId: current.complianceReviewId,
      reused: true,
      externalActionTaken: false,
      externalPublicationTaken: false,
    };
  }

  let providerJob: Awaited<ReturnType<typeof queueVideoJob>>;
  try {
    providerJob = await queueVideoJob(
      {
        prompt,
        negativePrompt: config.defaultNegativePrompt,
        workflow: config.workflow,
        promptNodeId: config.promptNodeId,
        negativePromptNodeId: config.negativePromptNodeId,
        seedNodeId: config.seedNodeId,
        seed: input.seed,
      },
      {
        clientId: durable.record.clientId,
        extraData: {
          gemRenderJobId: durable.record.id,
          workspaceId: input.workspaceId,
          contentId: content.id,
          contentVersionId: version.id,
        },
      },
    );
  } catch (error) {
    await updateVideoRenderState({
      id: durable.record.id,
      state: "FAILED",
      errorCode: error instanceof Error ? error.message.slice(0, 100) : "PROVIDER_FAILED",
      errorMessage: "The render dispatch failed before a provider prompt was recorded.",
    }).catch(() => undefined);
    providerFailure(error);
  }

  let queued: VideoRenderJobRecord;
  try {
    queued = await markVideoRenderQueued({
      id: durable.record.id,
      promptId: providerJob.promptId,
    });
  } catch (error) {
    await cancelVideoJob(providerJob.promptId).catch(() => undefined);
    throw error;
  }

  const metadata = {
    renderJobId: queued.id,
    contentId: content.id,
    contentVersionId: version.id,
    complianceReviewId: review.id,
    provider: "comfyui-local",
    promptId: queued.externalPromptId,
    externalPublicationTaken: false,
  };
  await emitTokMetricAudit({
    workspaceId: input.workspaceId,
    actorId: input.actorId,
    action: "video.render.queued",
    entityType: "video_render_job",
    entityId: queued.id,
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
    renderJobId: queued.id,
    promptId: providerJob.promptId,
    clientId: queued.clientId,
    status: "queued" as const,
    queueDepthBeforeSubmission: providerJob.queueDepthBeforeSubmission,
    queueLimit: providerJob.queueLimit,
    contentId: content.id,
    contentVersionId: version.id,
    complianceReviewId: review.id,
    reused: false,
    externalActionTaken: true,
    externalPublicationTaken: false,
  };
}

export async function latestContentRender(input: {
  workspaceId: string;
  contentId: string;
}) {
  const record = await latestVideoRenderJobForContent(input);
  if (!record) return null;
  const current = await syncRenderJob(record);
  return {
    renderJobId: current.id,
    promptId: current.externalPromptId,
    status: current.state.toLowerCase(),
    outputs: current.outputManifest,
    error:
      current.errorCode || current.errorMessage
        ? { type: current.errorCode, message: current.errorMessage }
        : undefined,
    queuedAt: current.createdAt,
    finalizedAt: current.finalizedAt,
  };
}

export async function verifyRenderedUpload(input: VerifyRenderedUploadInput) {
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
  if (!/^[a-f0-9]{64}$/i.test(input.checksumSha256)) {
    throw new TokMetricError(
      400,
      "VIDEO_CHECKSUM_INVALID",
      "A SHA-256 checksum is required.",
    );
  }

  const record = await getVideoRenderJobById(input.renderJobId);
  if (!record || !record.externalPromptId) {
    throw new TokMetricError(
      404,
      "VIDEO_RENDER_JOB_NOT_FOUND",
      "The durable video render job was not found.",
    );
  }
  const current = await syncRenderJob(record);
  if (current.state !== "COMPLETED") {
    throw new TokMetricError(
      409,
      "VIDEO_RENDER_NOT_COMPLETE",
      "Only a completed render can register an uploaded output.",
    );
  }
  const names = outputFileNames(current.outputManifest);
  if (!names.has(input.fileName)) {
    throw new TokMetricError(
      409,
      "VIDEO_OUTPUT_BINDING_INVALID",
      "The uploaded file is not present in the completed render output manifest.",
    );
  }

  const verifiedObject = await verifyStorageObject(input);
  const upload = await recordVerifiedVideoUpload({
    renderJobId: current.id,
    storageRef: input.storageRef,
    fileName: input.fileName,
    mimeType: input.mimeType,
    fileSize: input.fileSize,
    checksumSha256: input.checksumSha256,
    safeMetadata: {
      provider: "trusted-render-worker",
      externalPromptId: current.externalPromptId,
      etag: verifiedObject.etag,
      lastModified: verifiedObject.lastModified,
      resolvedOrigin: verifiedObject.resolvedOrigin,
    },
  });

  await emitTokMetricAudit({
    workspaceId: current.workspaceId,
    action: "video.upload.verified",
    entityType: "video_render_upload",
    entityId: upload.id,
    correlationId: input.correlationId,
    outcome: "verified",
    sourceChannel: "video-render-worker",
    metadata: {
      renderJobId: current.id,
      contentId: current.contentId,
      contentVersionId: current.contentVersionId,
      storageRefOrigin: new URL(upload.storageRef).origin,
      checksumSha256: upload.checksumSha256,
    },
  });

  return {
    renderJobId: current.id,
    uploadId: upload.id,
    verifiedAt: upload.verifiedAt,
    contentId: current.contentId,
    contentVersionId: current.contentVersionId,
  };
}

export async function finalizeContentRender(input: FinalizeContentRenderInput) {
  const record = await getVideoRenderJobByPromptId(input.promptId);
  if (
    !record ||
    record.workspaceId !== input.workspaceId ||
    record.contentId !== input.contentId
  ) {
    throw new TokMetricError(
      409,
      "VIDEO_RENDER_OWNERSHIP_INVALID",
      "The render job is not bound to this workspace and content item.",
    );
  }
  const current = await syncRenderJob(record);
  if (current.state !== "COMPLETED" && current.state !== "FINALIZED") {
    throw new TokMetricError(
      409,
      "VIDEO_RENDER_NOT_COMPLETE",
      "Only a completed render can be finalized.",
    );
  }
  const upload = await getVerifiedVideoUpload(current.id);
  if (!upload) {
    throw new TokMetricError(
      409,
      "VIDEO_UPLOAD_VERIFICATION_REQUIRED",
      "The trusted render worker must verify the uploaded file before finalization.",
    );
  }

  const { content, version, review } = await reviewableContent(
    input.workspaceId,
    input.contentId,
  );
  if (current.contentVersionId !== version.id) {
    throw new TokMetricError(
      409,
      "VIDEO_RENDER_VERSION_MISMATCH",
      "The content version changed after the render was queued.",
    );
  }

  const settings = object(version.settings);
  const mediaAssetIds = [...new Set([...version.mediaAssetIds])];
  const result = await db.$transaction(async (transaction) => {
    let mediaAsset = await transaction.mediaAsset.findFirst({
      where: {
        workspaceId: input.workspaceId,
        checksum: upload.checksumSha256,
        version: 1,
      },
    });
    if (mediaAsset && mediaAsset.storageRef !== upload.storageRef) {
      throw new TokMetricError(
        409,
        "VIDEO_MEDIA_ASSET_CONFLICT",
        "The verified checksum is already bound to a different media reference.",
      );
    }
    if (!mediaAsset) {
      mediaAsset = await transaction.mediaAsset.create({
        data: {
          workspaceId: input.workspaceId,
          ownerId: input.actorId,
          objectHash: contentHash({
            checksum: upload.checksumSha256,
            storageRef: upload.storageRef,
          }),
          fileName: upload.fileName,
          mimeType: upload.mimeType,
          fileSize: upload.fileSize,
          checksum: upload.checksumSha256,
          storageRef: upload.storageRef,
          metadata: toInputJson({
            provider: "comfyui-local",
            renderJobId: current.id,
            promptId: current.externalPromptId,
            verifiedUploadId: upload.id,
            sourceContentId: content.id,
            sourceContentVersionId: version.id,
            outputDescriptors: current.outputManifest,
            humanApprovalRequired: true,
          }),
        },
      });
    }

    const nextMediaAssetIds = [...new Set([...mediaAssetIds, mediaAsset.id])];
    const nextSettings = {
      ...settings,
      render: {
        provider: "comfyui-local",
        renderJobId: current.id,
        promptId: current.externalPromptId,
        mediaAssetId: mediaAsset.id,
        verifiedUploadId: upload.id,
        finalizedAt: new Date().toISOString(),
        humanApprovalRequired: true,
      },
    };
    const normalized = {
      script: version.script,
      caption: version.caption,
      hashtags: [...new Set(version.hashtags)],
      settings: nextSettings,
      mediaAssetIds: nextMediaAssetIds,
    };
    const objectHash = contentHash(normalized);
    let nextVersion = await transaction.contentVersion.findFirst({
      where: { contentId: content.id, objectHash },
    });
    if (!nextVersion) {
      const latest = await transaction.contentVersion.aggregate({
        where: { contentId: content.id },
        _max: { version: true },
      });
      nextVersion = await transaction.contentVersion.create({
        data: {
          contentId: content.id,
          version: (latest._max.version ?? 0) + 1,
          objectHash,
          script: normalized.script,
          caption: normalized.caption,
          hashtags: normalized.hashtags,
          settings: toInputJson(normalized.settings),
          mediaAssetIds: normalized.mediaAssetIds,
          createdById: input.actorId,
        },
      });
    }

    const previousFindings = Array.isArray(review.findings) ? review.findings : [];
    let exactReview = await transaction.complianceReview.findFirst({
      where: { contentVersionId: nextVersion.id },
      orderBy: { createdAt: "desc" },
    });
    if (!exactReview) {
      exactReview = await transaction.complianceReview.create({
        data: {
          workspaceId: input.workspaceId,
          contentId: content.id,
          contentVersionId: nextVersion.id,
          policyVersionId: review.policyVersionId,
          result: review.result,
          findings: toInputJson([
            ...previousFindings,
            {
              code: "VERIFIED_RENDERED_MEDIA",
              severity: "info",
              message:
                "The rendered file was bound to the completed provider output and a trusted worker upload verification record.",
            },
          ]),
          reviewerId: input.actorId,
        },
      });
    }

    const action = approvalAction(settings);
    let approval = await transaction.approvalRequest.findFirst({
      where: {
        workspaceId: input.workspaceId,
        contentId: content.id,
        contentVersionId: nextVersion.id,
        objectHash: nextVersion.objectHash,
        action,
        state: { in: ["APPROVAL_REQUIRED", "APPROVED"] },
      },
      orderBy: { createdAt: "desc" },
    });
    if (!approval) {
      approval = await transaction.approvalRequest.create({
        data: {
          workspaceId: input.workspaceId,
          contentId: content.id,
          contentVersionId: nextVersion.id,
          requestedById: input.actorId,
          requiredRole: "approver",
          action,
          objectHash: nextVersion.objectHash,
          state: "APPROVAL_REQUIRED",
        },
      });
    }

    await transaction.content.update({
      where: { id: content.id },
      data: {
        currentVersionId: nextVersion.id,
        state: "APPROVAL_REQUIRED",
      },
    });
    await transaction.$executeRaw(Prisma.sql`
      UPDATE video_render_jobs
      SET state = 'FINALIZED',
          finalized_at = COALESCE(finalized_at, CURRENT_TIMESTAMP),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${current.id}
    `);

    const safeMetadata = redactSecrets({
      renderJobId: current.id,
      contentId: content.id,
      previousContentVersionId: version.id,
      contentVersionId: nextVersion.id,
      mediaAssetId: mediaAsset.id,
      complianceReviewId: exactReview.id,
      approvalRequestId: approval.id,
      storageRefOrigin: new URL(upload.storageRef).origin,
    }) as object;
    await transaction.auditEvent.create({
      data: {
        workspaceId: input.workspaceId,
        actorId: input.actorId,
        action: "video.render.finalized",
        entityType: "video_render_job",
        entityId: current.id,
        correlationId: input.correlationId,
        outcome: "approval_required",
        sourceChannel: "social-media-command-center",
        safeMetadata,
      },
    });
    await transaction.domainEvent.create({
      data: {
        workspaceId: input.workspaceId,
        aggregateType: "content",
        aggregateId: content.id,
        eventType: "VIDEO_RENDER_FINALIZED",
        correlationId: input.correlationId,
        safeMetadata,
      },
    });

    return { mediaAsset, nextVersion, exactReview, approval };
  });

  return {
    renderJobId: current.id,
    mediaAssetId: result.mediaAsset.id,
    contentId: content.id,
    contentVersionId: result.nextVersion.id,
    complianceReviewId: result.exactReview.id,
    complianceResult: result.exactReview.result,
    approvalRequestId: result.approval.id,
    state: "AWAITING_HUMAN_APPROVAL",
    externalPublicationTaken: false,
  };
}
