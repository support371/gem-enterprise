import { createHash } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Readable, Transform } from "node:stream";
import type { ReadableStream as NodeReadableStream } from "node:stream/web";
import { pipeline } from "node:stream/promises";
import {
  buildComfyOutputUrl,
  buildStorageObjectPath,
  buildStorageObjectUrl,
  sanitizePathSegment,
} from "./outputs";
import { storageHeaders, timedFetch } from "./network";
import {
  VideoWorkerError,
  type DownloadedVideo,
  type VideoOutputDescriptor,
  type VideoWorkerConfig,
  type VideoWorkerJob,
} from "./types";

export async function downloadVideoOutput(
  config: VideoWorkerConfig,
  output: VideoOutputDescriptor,
): Promise<DownloadedVideo> {
  const headers: Record<string, string> = {};
  if (config.comfyBearerToken) {
    headers.Authorization = `Bearer ${config.comfyBearerToken}`;
  }
  const response = await timedFetch(
    buildComfyOutputUrl(config, output),
    { method: "GET", headers, cache: "no-store" },
    config.requestTimeoutMs,
  );
  if (!response.ok || !response.body) {
    throw new VideoWorkerError(
      "VIDEO_OUTPUT_DOWNLOAD_FAILED",
      `ComfyUI returned HTTP ${response.status} for the completed output.`,
      response.status,
    );
  }

  const declaredLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > config.maxFileBytes) {
    throw new VideoWorkerError(
      "VIDEO_OUTPUT_TOO_LARGE",
      "The completed video exceeds the configured worker file-size limit.",
      413,
    );
  }
  const declaredType = response.headers.get("content-type")?.split(";")[0]?.trim();
  if (
    declaredType &&
    declaredType !== "application/octet-stream" &&
    declaredType !== output.mimeType
  ) {
    throw new VideoWorkerError(
      "VIDEO_OUTPUT_TYPE_MISMATCH",
      "The downloaded output content type does not match its approved video extension.",
      409,
    );
  }

  const tempDirectory = await mkdtemp(join(tmpdir(), "gem-video-worker-"));
  const tempPath = join(tempDirectory, sanitizePathSegment(output.fileName));
  const hash = createHash("sha256");
  let fileSize = 0;
  const meter = new Transform({
    transform(chunk: Buffer | Uint8Array, _encoding, callback) {
      const bytes = Buffer.from(chunk);
      fileSize += bytes.length;
      if (fileSize > config.maxFileBytes) {
        callback(
          new VideoWorkerError(
            "VIDEO_OUTPUT_TOO_LARGE",
            "The completed video exceeds the configured worker file-size limit.",
            413,
          ),
        );
        return;
      }
      hash.update(bytes);
      callback(null, bytes);
    },
  });

  try {
    const source = Readable.fromWeb(
      response.body as unknown as NodeReadableStream<Uint8Array>,
    );
    await pipeline(source, meter, createWriteStream(tempPath, { flags: "wx" }));
    if (fileSize <= 0) {
      throw new VideoWorkerError(
        "VIDEO_OUTPUT_EMPTY",
        "The completed video output is empty.",
        409,
      );
    }
    return {
      tempDirectory,
      tempPath,
      fileName: output.fileName,
      mimeType: output.mimeType,
      fileSize,
      checksumSha256: hash.digest("hex"),
    };
  } catch (error) {
    await rm(tempDirectory, { recursive: true, force: true });
    if (error instanceof VideoWorkerError) throw error;
    throw new VideoWorkerError(
      "VIDEO_OUTPUT_DOWNLOAD_FAILED",
      "The completed video could not be written to temporary storage.",
      502,
    );
  }
}

async function verifyExistingStorageObject(
  config: VideoWorkerConfig,
  storageRef: string,
  downloaded: DownloadedVideo,
) {
  const response = await timedFetch(
    storageRef,
    {
      method: "HEAD",
      headers: storageHeaders(config),
      cache: "no-store",
    },
    config.requestTimeoutMs,
  );
  const size = Number(response.headers.get("content-length"));
  const type = response.headers.get("content-type")?.split(";")[0]?.trim();
  if (!response.ok || size !== downloaded.fileSize || type !== downloaded.mimeType) {
    throw new VideoWorkerError(
      "VIDEO_STORAGE_OBJECT_CONFLICT",
      "The deterministic storage path already exists with different metadata.",
      409,
    );
  }
}

export async function uploadDownloadedVideo(
  config: VideoWorkerConfig,
  job: VideoWorkerJob,
  downloaded: DownloadedVideo,
) {
  const objectPath = buildStorageObjectPath({
    storagePrefix: config.storagePrefix,
    job,
    checksumSha256: downloaded.checksumSha256,
    fileName: downloaded.fileName,
  });
  const storageRef = buildStorageObjectUrl(config, objectPath);
  const init: RequestInit & { duplex: "half" } = {
    method: "POST",
    headers: {
      ...storageHeaders(config),
      "Content-Type": downloaded.mimeType,
      "x-upsert": "false",
    },
    body: createReadStream(downloaded.tempPath) as unknown as BodyInit,
    duplex: "half",
  };
  const response = await timedFetch(
    storageRef,
    init,
    Math.max(config.requestTimeoutMs, 120_000),
  );
  if (response.status === 409) {
    await verifyExistingStorageObject(config, storageRef, downloaded);
    return { storageRef, objectPath, reused: true };
  }
  if (!response.ok) {
    throw new VideoWorkerError(
      "VIDEO_STORAGE_UPLOAD_FAILED",
      `The storage upload returned HTTP ${response.status}.`,
      response.status,
    );
  }
  return { storageRef, objectPath, reused: false };
}
