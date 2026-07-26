import { getVideoJob } from "@/lib/video/comfyui";
import {
  getVideoRenderJobById,
  recordVerifiedVideoUpload,
  updateVideoRenderState,
} from "@/lib/video/store";
import {
  emitTokMetricAudit,
  TokMetricError,
} from "@/lib/tokmetric/security";

const VIDEO_MIME_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);
const STORAGE_VERIFY_TIMEOUT_MS = 15_000;

export type TrustedWorkerUploadInput = {
  renderJobId: string;
  storageRef: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  checksumSha256: string;
  correlationId: string;
};

function configured(name: string) {
  return process.env[name]?.trim() ?? "";
}

function allowedStorageOrigins() {
  const explicit = configured("VIDEO_ASSET_ALLOWED_ORIGINS")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const storageUrl =
    configured("VIDEO_RENDER_STORAGE_URL") ||
    configured("SUPABASE_URL") ||
    configured("NEXT_PUBLIC_SUPABASE_URL");
  const values = [...explicit];
  if (storageUrl) {
    try {
      values.push(new URL(storageUrl).origin);
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
  return url;
}

function storageVerificationHeaders(storageRef: string) {
  const key =
    configured("VIDEO_RENDER_STORAGE_KEY") ||
    configured("SUPABASE_SERVICE_ROLE_KEY");
  if (!key) return {};

  const authOriginValue =
    configured("VIDEO_RENDER_STORAGE_AUTH_ORIGIN") ||
    configured("VIDEO_RENDER_STORAGE_URL") ||
    configured("SUPABASE_URL");
  if (!authOriginValue) return {};

  try {
    const storageOrigin = new URL(storageRef).origin;
    const authOrigin = new URL(authOriginValue).origin;
    if (storageOrigin !== authOrigin) return {};
    return {
      Authorization: `Bearer ${key}`,
      apikey: key,
    };
  } catch {
    return {};
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

async function verifyStorageObject(input: TrustedWorkerUploadInput) {
  const requestedUrl = assertStorageRefAllowed(input.storageRef);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), STORAGE_VERIFY_TIMEOUT_MS);
  try {
    const response = await fetch(input.storageRef, {
      method: "HEAD",
      headers: storageVerificationHeaders(input.storageRef),
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
    const resolvedUrl = assertStorageRefAllowed(response.url || input.storageRef);
    if (requestedUrl.origin !== resolvedUrl.origin) {
      throw new TokMetricError(
        409,
        "VIDEO_STORAGE_REDIRECT_BLOCKED",
        "The storage verification request redirected to a different origin.",
      );
    }

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
      etag: response.headers.get("etag"),
      lastModified: response.headers.get("last-modified"),
      resolvedOrigin: resolvedUrl.origin,
      authenticatedStorageVerification: Object.keys(
        storageVerificationHeaders(input.storageRef),
      ).length > 0,
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

export async function verifyTrustedWorkerUpload(input: TrustedWorkerUploadInput) {
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
  if (!record?.externalPromptId) {
    throw new TokMetricError(
      404,
      "VIDEO_RENDER_JOB_NOT_FOUND",
      "The durable video render job was not found.",
    );
  }

  let providerJob;
  try {
    providerJob = await getVideoJob(record.externalPromptId);
  } catch {
    throw new TokMetricError(
      502,
      "VIDEO_RENDER_PROVIDER_FAILED",
      "The local video worker could not confirm the completed render.",
    );
  }
  if (providerJob.status !== "completed") {
    throw new TokMetricError(
      409,
      "VIDEO_RENDER_NOT_COMPLETE",
      "Only a completed render can register an uploaded output.",
    );
  }

  const current = await updateVideoRenderState({
    id: record.id,
    state: "COMPLETED",
    outputManifest: providerJob.outputs,
  });
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
    checksumSha256: input.checksumSha256.toLowerCase(),
    safeMetadata: {
      provider: "trusted-render-worker",
      externalPromptId: current.externalPromptId,
      etag: verifiedObject.etag,
      lastModified: verifiedObject.lastModified,
      resolvedOrigin: verifiedObject.resolvedOrigin,
      authenticatedStorageVerification:
        verifiedObject.authenticatedStorageVerification,
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
      authenticatedStorageVerification:
        verifiedObject.authenticatedStorageVerification,
      externalPublicationTaken: false,
    },
  });

  return {
    renderJobId: current.id,
    uploadId: upload.id,
    verifiedAt: upload.verifiedAt,
    contentId: current.contentId,
    contentVersionId: current.contentVersionId,
    externalPublicationTaken: false,
  };
}
