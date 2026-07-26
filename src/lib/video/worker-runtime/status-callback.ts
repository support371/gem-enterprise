import {
  callbackHeaders,
  timedJsonFetch,
} from "./network";
import {
  VideoWorkerError,
  type VideoWorkerConfig,
  type VideoWorkerJob,
} from "./types";

export async function reportWorkerRenderStatus(
  config: VideoWorkerConfig,
  job: VideoWorkerJob,
  input: {
    state: "RUNNING" | "FAILED";
    errorCode?: string;
    errorMessage?: string;
  },
) {
  const { response } = await timedJsonFetch(
    `${config.gemBaseUrl}/api/video/worker/jobs/${encodeURIComponent(
      job.renderJobId,
    )}/status`,
    {
      method: "POST",
      headers: {
        ...callbackHeaders(config),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        promptId: job.promptId,
        state: input.state,
        errorCode: input.errorCode?.slice(0, 100),
        errorMessage: input.errorMessage?.slice(0, 500),
      }),
      cache: "no-store",
    },
    config.requestTimeoutMs,
  );
  if (!response.ok) {
    throw new VideoWorkerError(
      "VIDEO_WORKER_STATUS_CALLBACK_FAILED",
      `The GEM render-status callback returned HTTP ${response.status}.`,
      response.status,
    );
  }
}
