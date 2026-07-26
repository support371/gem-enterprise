import { rm } from "node:fs/promises";
import { getVideoJob } from "@/lib/video/comfyui";
import { downloadVideoOutput, uploadDownloadedVideo } from "./io";
import { verifyUploadedVideo } from "./network";
import { selectVideoOutput } from "./outputs";
import {
  VideoWorkerError,
  type VideoWorkerConfig,
  type VideoWorkerJob,
} from "./types";

export async function processVideoWorkerJob(
  config: VideoWorkerConfig,
  job: VideoWorkerJob,
) {
  const providerJob = await getVideoJob(job.promptId);
  if (providerJob.status === "queued" || providerJob.status === "running") {
    return { outcome: "pending" as const, status: providerJob.status };
  }
  if (providerJob.status === "failed") {
    throw new VideoWorkerError(
      providerJob.error?.type || "VIDEO_RENDER_FAILED",
      providerJob.error?.message || "The ComfyUI render failed.",
      409,
    );
  }
  if (providerJob.status !== "completed") {
    return { outcome: "unknown" as const, status: providerJob.status };
  }

  const output = selectVideoOutput(providerJob.outputs);
  const downloaded = await downloadVideoOutput(config, output);
  try {
    const uploaded = await uploadDownloadedVideo(config, job, downloaded);
    await verifyUploadedVideo(config, job, downloaded, uploaded.storageRef);
    return {
      outcome: "verified" as const,
      fileName: downloaded.fileName,
      mimeType: downloaded.mimeType,
      fileSize: downloaded.fileSize,
      checksumSha256: downloaded.checksumSha256,
      storageRef: uploaded.storageRef,
      reusedStorageObject: uploaded.reused,
    };
  } finally {
    await rm(downloaded.tempDirectory, { recursive: true, force: true });
  }
}
