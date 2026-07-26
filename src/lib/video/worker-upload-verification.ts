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
const MAX_OUTPUT_MANIFEST_BYTES = 2 * 1024 * 1024;

export type TrustedWorkerUploadInput = {
  renderJobId: string;
  storageRef: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  checksumSha256: string;
  outputManifest: Record<string, unknown>;
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

function storageCredentialOrigin() {
  const explicit = configured("VIDEO_RENDER_STORAGE_AUTH_ORIGIN");
  const storageUrl = configured("VIDEO_RENDER_STORAGE_URL") || configured("SUPABASE_URL");
  const candidate = explicit || storageUrl;
  if (!candidate) return null;
  try {
    return new URL(candidate).origin;
  } catch {
    return null;
  }
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

function storageHeaders(storageRef: string): HeadersInit {
  const key =
    configured("VIDEO_RENDER_STORAGE_KEY") ||
    configured("SUPABASE_SERVICE_ROLE_KEY");
  if (!key) return {};
  const credentialOrigin = storageCredentialOrigin();
  if (!credentialOrigin) {
    throw new TokMetricError(
      503,
      "VIDEO_STORAGE_AUTH_ORIGIN_NOT_CONFIGURED",
      "The storage credential origin is not configured.",
    );
  }
  const referenceOrigin = new URL(storageRef).origin;
  if (referenceOrigin !== credentialOrigin) return {};
  return {
    Authorization: `Bearer ${key}`,
    apikey: key,
  };
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

function validateOutputManifest(value: Record<string, unknown>) {
  const serialized = JSON.stringify(value);
  if (!serialized || serialized === "{}") {
    throw new TokMetricError(
      400,
      "VIDEO_OUTPUT_MANIFEST_REQUIRED",
      "The trusted worker must provide the completed provider output manifest.",
    );
  }
  if (Buffer.byteLength(serialized, "utf8") > MAX_OUTPUT_MANIFEST_BYTES) {
    throw new TokMetricError(
      413,
      "VIDEO_OUTPUT_MANIFEST_TOO_LARGE",
      "The provider output manifest exceeds the allowed size.",
    );
  }
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
      headers: storageHeaders(input.storageRef),
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
  validateOutputManifest(input.outputManifest);

  const record = await getVideoRenderJobById(input.renderJobId);
  if (!record || !record.externalPromptId) {
    throw new TokMetricError(
      404,
      "VIDEO_RENDER_JOB_NOT_FOUND",
      "The durable video render job was not found.",
    );
  }
  if (["FAILED", "CANCELLED"].includes(record.state)) {
    throw new TokMetricError(
      409,
      "VIDEO_RENDER_NOT_COMPLETE",
      "A failed or cancelled render cannot register an uploaded output.",
    );
  }

  const names = outputFileNames(input.outputManifest);
  if (!names.has(input.fileName)) {
    throw new TokMetricError(
      409,
      "VIDEO_OUTPUT_BINDING_INVALID",
      "The uploaded file is not present in the trusted worker output manifest.",
    );
  }

  const current =
    record.state === "FINALIZED"
      ? record
      : await updateVideoRenderState({
          id: record.id,
          state: "COMPLETED",
          outputManifest: input.outputManifest,
          errorCode: undefined,
          errorMessage: undefined,
        });

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
