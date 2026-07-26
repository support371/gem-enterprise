import { basename, extname } from "node:path";
import {
  VideoWorkerError,
  type VideoOutputDescriptor,
  type VideoWorkerConfig,
  type VideoWorkerJob,
} from "./types";

const VIDEO_MIME_TYPES = {
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
} as const;

export function sanitizePathSegment(value: string) {
  const normalized = value
    .normalize("NFKC")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^[._-]+|[._-]+$/g, "")
    .slice(0, 120);
  if (!normalized) {
    throw new VideoWorkerError(
      "VIDEO_PATH_SEGMENT_INVALID",
      "A deterministic storage path segment could not be produced.",
    );
  }
  return normalized;
}

export function mimeTypeForFileName(fileName: string) {
  const extension = extname(fileName).toLowerCase() as keyof typeof VIDEO_MIME_TYPES;
  return VIDEO_MIME_TYPES[extension] ?? null;
}

function outputDescriptors(value: unknown, results: VideoOutputDescriptor[] = []) {
  if (Array.isArray(value)) {
    for (const entry of value) outputDescriptors(entry, results);
    return results;
  }
  if (!value || typeof value !== "object") return results;

  const record = value as Record<string, unknown>;
  if (typeof record.filename === "string") {
    const mimeType = mimeTypeForFileName(record.filename);
    if (mimeType) {
      results.push({
        fileName: basename(record.filename),
        subfolder: typeof record.subfolder === "string" ? record.subfolder : "",
        type: typeof record.type === "string" ? record.type : "output",
        mimeType,
      });
    }
  }
  for (const entry of Object.values(record)) outputDescriptors(entry, results);
  return results;
}

export function selectVideoOutput(manifest: unknown) {
  const preference = new Map([
    ["video/mp4", 0],
    ["video/webm", 1],
    ["video/quicktime", 2],
  ]);
  const outputs = outputDescriptors(manifest)
    .filter((entry, index, all) =>
      all.findIndex(
        (candidate) =>
          candidate.fileName === entry.fileName &&
          candidate.subfolder === entry.subfolder &&
          candidate.type === entry.type,
      ) === index,
    )
    .sort((left, right) => {
      const typeOrder = Number(left.type !== "output") - Number(right.type !== "output");
      if (typeOrder !== 0) return typeOrder;
      const mimeOrder =
        (preference.get(left.mimeType) ?? 99) -
        (preference.get(right.mimeType) ?? 99);
      if (mimeOrder !== 0) return mimeOrder;
      return left.fileName.localeCompare(right.fileName);
    });

  if (!outputs[0]) {
    throw new VideoWorkerError(
      "VIDEO_OUTPUT_NOT_FOUND",
      "The completed ComfyUI job does not contain a supported video output.",
    );
  }
  return outputs[0];
}

export function buildStorageObjectPath(input: {
  storagePrefix: string;
  job: VideoWorkerJob;
  checksumSha256: string;
  fileName: string;
}) {
  const safeName = sanitizePathSegment(input.fileName);
  return [
    sanitizePathSegment(input.storagePrefix),
    sanitizePathSegment(input.job.workspaceId),
    sanitizePathSegment(input.job.contentId),
    sanitizePathSegment(input.job.renderJobId),
    `${input.checksumSha256.toLowerCase()}-${safeName}`,
  ].join("/");
}

export function buildComfyOutputUrl(
  config: VideoWorkerConfig,
  output: VideoOutputDescriptor,
) {
  const url = new URL(`${config.comfyBaseUrl}/view`);
  url.searchParams.set("filename", output.fileName);
  if (output.subfolder) url.searchParams.set("subfolder", output.subfolder);
  url.searchParams.set("type", output.type);
  return url.toString();
}

export function buildStorageObjectUrl(
  config: VideoWorkerConfig,
  objectPath: string,
) {
  const encodedPath = objectPath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `${config.storageBaseUrl}/storage/v1/object/${encodeURIComponent(
    config.storageBucket,
  )}/${encodedPath}`;
}

export function computeBackoffMs(attempt: number) {
  return Math.min(60_000, 1_000 * 2 ** Math.max(0, attempt));
}
