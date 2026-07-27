import {
  callbackHeaders,
  timedJsonFetch,
} from "./network";
import {
  VideoWorkerError,
  type DownloadedVideo,
  type VideoWorkerConfig,
  type VideoWorkerJob,
} from "./types";

export async function verifyUploadedVideo(
  config: VideoWorkerConfig,
  job: VideoWorkerJob,
  downloaded: DownloadedVideo,
  storageRef: string,
  outputManifest: Record<string, unknown>,
) {
  const { response, payload } = await timedJsonFetch(
    `${config.gemBaseUrl}/api/video/uploads/verify`,
    {
      method: "POST",
      headers: {
        ...callbackHeaders(config),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        renderJobId: job.renderJobId,
        storageRef,
        fileName: downloaded.fileName,
        mimeType: downloaded.mimeType,
        fileSize: downloaded.fileSize,
        checksumSha256: downloaded.checksumSha256,
        outputManifest,
      }),
      cache: "no-store",
    },
    config.requestTimeoutMs,
  );
  if (!response.ok) {
    throw new VideoWorkerError(
      "VIDEO_UPLOAD_CALLBACK_FAILED",
      `The GEM upload-verification callback returned HTTP ${response.status}.`,
      response.status,
    );
  }
  return payload;
}
