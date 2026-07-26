import {
  findVideoPromptIdByClientId,
  queueVideoJob,
} from "@/lib/video/comfyui";
import {
  deleteDispatchJournal,
  readDispatchJournal,
  writeDispatchJournal,
} from "./journal";
import {
  completeWorkerDispatch,
  failWorkerDispatch,
} from "./network";
import {
  VideoWorkerError,
  type VideoWorkerConfig,
  type VideoWorkerDispatchJob,
} from "./types";

function safeDispatchError(error: unknown) {
  if (error instanceof VideoWorkerError) {
    return {
      code: error.code,
      message: error.message,
      status: error.status,
    };
  }
  const raw = error instanceof Error ? error.message : "VIDEO_RENDER_DISPATCH_FAILED";
  if (raw === "COMFYUI_QUEUE_FULL") {
    return {
      code: raw,
      message: "The local ComfyUI queue is currently full.",
      status: 429,
    };
  }
  if (raw === "COMFYUI_TIMEOUT") {
    return {
      code: raw,
      message: "The local ComfyUI request timed out.",
      status: 504,
    };
  }
  if (raw === "COMFYUI_NOT_CONFIGURED") {
    return {
      code: raw,
      message: "The local ComfyUI worker is not configured.",
      status: 503,
    };
  }
  if (raw.startsWith("WORKFLOW_NODE_NOT_FOUND:")) {
    return {
      code: "VIDEO_RENDER_WORKFLOW_NODE_MISSING",
      message: "The configured ComfyUI workflow is missing a required input node.",
      status: 409,
    };
  }
  return {
    code: "VIDEO_RENDER_DISPATCH_FAILED",
    message: "The trusted worker could not submit the render to ComfyUI.",
    status: 502,
  };
}

function retryable(status: number | undefined) {
  return (
    status === undefined ||
    status === 408 ||
    status === 429 ||
    status >= 500
  );
}

export async function processVideoWorkerDispatchJob(
  config: VideoWorkerConfig,
  job: VideoWorkerDispatchJob,
) {
  const journal = await readDispatchJournal(config, job.renderJobId);
  if (journal) {
    await completeWorkerDispatch(config, job, journal.promptId);
    await deleteDispatchJournal(config, job.renderJobId);
    return {
      outcome: "dispatch_recovered" as const,
      renderJobId: job.renderJobId,
      promptId: journal.promptId,
    };
  }

  let acceptedPromptId: string | null = null;
  try {
    const recoveredPromptId = await findVideoPromptIdByClientId(job.clientId);
    if (recoveredPromptId) {
      acceptedPromptId = recoveredPromptId;
      await writeDispatchJournal(config, {
        renderJobId: job.renderJobId,
        claimId: job.claimId,
        promptId: recoveredPromptId,
        recordedAt: new Date().toISOString(),
      });
      await completeWorkerDispatch(config, job, recoveredPromptId);
      await deleteDispatchJournal(config, job.renderJobId);
      return {
        outcome: "provider_dispatch_recovered" as const,
        renderJobId: job.renderJobId,
        promptId: recoveredPromptId,
      };
    }

    const providerJob = await queueVideoJob(job.dispatch, {
      clientId: job.clientId,
      extraData: {
        gemRenderJobId: job.renderJobId,
        workspaceId: job.workspaceId,
        contentId: job.contentId,
        contentVersionId: job.contentVersionId,
        complianceReviewId: job.complianceReviewId,
      },
    });
    acceptedPromptId = providerJob.promptId;
    await writeDispatchJournal(config, {
      renderJobId: job.renderJobId,
      claimId: job.claimId,
      promptId: providerJob.promptId,
      recordedAt: new Date().toISOString(),
    });
    await completeWorkerDispatch(config, job, providerJob.promptId);
    await deleteDispatchJournal(config, job.renderJobId);
    return {
      outcome: "dispatched" as const,
      renderJobId: job.renderJobId,
      promptId: providerJob.promptId,
      queueDepthBeforeSubmission: providerJob.queueDepthBeforeSubmission,
      queueLimit: providerJob.queueLimit,
    };
  } catch (error) {
    const safe = safeDispatchError(error);
    if (acceptedPromptId) {
      throw new VideoWorkerError(safe.code, safe.message, safe.status);
    }
    await failWorkerDispatch(config, job, {
      retryable: retryable(safe.status),
      errorCode: safe.code,
      errorMessage: safe.message,
    });
    return {
      outcome: retryable(safe.status) ? ("deferred" as const) : ("failed" as const),
      renderJobId: job.renderJobId,
      error: safe,
    };
  }
}
