import { beforeEach, describe, expect, it, vi } from "vitest";

const comfyMocks = vi.hoisted(() => ({
  findVideoPromptIdByClientId: vi.fn(),
  queueVideoJob: vi.fn(),
}));
const journalMocks = vi.hoisted(() => ({
  readDispatchJournal: vi.fn(),
  writeDispatchJournal: vi.fn(),
  deleteDispatchJournal: vi.fn(),
}));
const networkMocks = vi.hoisted(() => ({
  completeWorkerDispatch: vi.fn(),
  failWorkerDispatch: vi.fn(),
}));

vi.mock("@/lib/video/comfyui", () => ({
  findVideoPromptIdByClientId: comfyMocks.findVideoPromptIdByClientId,
  queueVideoJob: comfyMocks.queueVideoJob,
}));
vi.mock("@/lib/video/worker-runtime/journal", () => journalMocks);
vi.mock("@/lib/video/worker-runtime/network", () => networkMocks);

import { processVideoWorkerDispatchJob } from "@/lib/video/worker-runtime/dispatch";
import {
  VideoWorkerError,
  type VideoWorkerConfig,
  type VideoWorkerDispatchJob,
} from "@/lib/video/worker-runtime/types";

const config: VideoWorkerConfig = {
  gemBaseUrl: "https://www.gemcybersecurityassist.com",
  callbackSecret: "callback-secret",
  comfyBaseUrl: "http://127.0.0.1:8188",
  storageBaseUrl: "https://project.supabase.co",
  storageKey: "storage-key",
  storageBucket: "gem-video-renders",
  storagePrefix: "renders",
  stateDirectory: "/tmp/gem-video-worker-dispatch-test",
  batchSize: 5,
  dispatchLeaseMs: 120_000,
  pollIntervalMs: 15_000,
  maxFileBytes: 1024 * 1024,
  requestTimeoutMs: 30_000,
  transferTimeoutMs: 60_000,
};

const job: VideoWorkerDispatchJob = {
  renderJobId: "11111111-1111-4111-8111-111111111111",
  workspaceId: "workspace-1",
  contentId: "content-1",
  contentVersionId: "version-1",
  complianceReviewId: "review-1",
  clientId: "22222222-2222-4222-8222-222222222222",
  claimId: "33333333-3333-4333-8333-333333333333",
  claimExpiresAt: "2026-07-26T07:00:00.000Z",
  dispatchAttemptCount: 0,
  dispatch: {
    prompt: "Create a governed GEM cybersecurity awareness video scene.",
    workflow: {
      "6": {
        class_type: "CLIPTextEncode",
        inputs: { text: "placeholder" },
      },
    },
    promptNodeId: "6",
  },
};

describe("trusted worker dispatch runtime", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    comfyMocks.findVideoPromptIdByClientId.mockResolvedValue(null);
    journalMocks.readDispatchJournal.mockResolvedValue(null);
    journalMocks.writeDispatchJournal.mockResolvedValue(undefined);
    journalMocks.deleteDispatchJournal.mockResolvedValue(undefined);
    networkMocks.completeWorkerDispatch.mockResolvedValue(undefined);
    networkMocks.failWorkerDispatch.mockResolvedValue(undefined);
  });

  it("recovers an accepted provider prompt from the local journal without requeueing", async () => {
    journalMocks.readDispatchJournal.mockResolvedValue({
      renderJobId: job.renderJobId,
      claimId: "44444444-4444-4444-8444-444444444444",
      promptId: "provider-prompt-1",
      recordedAt: "2026-07-26T06:00:00.000Z",
    });

    const result = await processVideoWorkerDispatchJob(config, job);

    expect(result).toMatchObject({
      outcome: "dispatch_recovered",
      promptId: "provider-prompt-1",
    });
    expect(comfyMocks.findVideoPromptIdByClientId).not.toHaveBeenCalled();
    expect(comfyMocks.queueVideoJob).not.toHaveBeenCalled();
    expect(networkMocks.completeWorkerDispatch).toHaveBeenCalledWith(
      config,
      job,
      "provider-prompt-1",
    );
    expect(journalMocks.deleteDispatchJournal).toHaveBeenCalledWith(
      config,
      job.renderJobId,
    );
  });

  it("recovers an accepted prompt from ComfyUI by stable client ID", async () => {
    comfyMocks.findVideoPromptIdByClientId.mockResolvedValue("provider-prompt-recovered");

    const result = await processVideoWorkerDispatchJob(config, job);

    expect(result).toMatchObject({
      outcome: "provider_dispatch_recovered",
      promptId: "provider-prompt-recovered",
    });
    expect(comfyMocks.queueVideoJob).not.toHaveBeenCalled();
    expect(journalMocks.writeDispatchJournal).toHaveBeenCalledWith(
      config,
      expect.objectContaining({
        renderJobId: job.renderJobId,
        promptId: "provider-prompt-recovered",
      }),
    );
    expect(networkMocks.completeWorkerDispatch).toHaveBeenCalledWith(
      config,
      job,
      "provider-prompt-recovered",
    );
  });

  it("journals the accepted prompt before binding it to the durable GEM job", async () => {
    comfyMocks.queueVideoJob.mockResolvedValue({
      promptId: "provider-prompt-2",
      clientId: job.clientId,
      status: "queued",
      queueDepthBeforeSubmission: 1,
      queueLimit: 4,
    });

    const result = await processVideoWorkerDispatchJob(config, job);

    expect(result).toMatchObject({
      outcome: "dispatched",
      promptId: "provider-prompt-2",
    });
    expect(comfyMocks.queueVideoJob).toHaveBeenCalledWith(
      job.dispatch,
      expect.objectContaining({
        clientId: job.clientId,
        extraData: expect.objectContaining({ gemRenderJobId: job.renderJobId }),
      }),
    );
    expect(journalMocks.writeDispatchJournal).toHaveBeenCalledBefore(
      networkMocks.completeWorkerDispatch,
    );
    expect(journalMocks.deleteDispatchJournal).toHaveBeenCalledAfter(
      networkMocks.completeWorkerDispatch,
    );
  });

  it("releases a queue-capacity failure for a later bounded retry", async () => {
    comfyMocks.queueVideoJob.mockRejectedValue(new Error("COMFYUI_QUEUE_FULL"));

    const result = await processVideoWorkerDispatchJob(config, job);

    expect(result).toMatchObject({ outcome: "deferred" });
    expect(networkMocks.failWorkerDispatch).toHaveBeenCalledWith(
      config,
      job,
      expect.objectContaining({
        retryable: true,
        errorCode: "COMFYUI_QUEUE_FULL",
      }),
    );
  });

  it("keeps the journal when GEM cannot bind an already accepted prompt", async () => {
    comfyMocks.queueVideoJob.mockResolvedValue({
      promptId: "provider-prompt-3",
      clientId: job.clientId,
      status: "queued",
      queueDepthBeforeSubmission: 0,
      queueLimit: 4,
    });
    networkMocks.completeWorkerDispatch.mockRejectedValue(
      new VideoWorkerError(
        "VIDEO_WORKER_DISPATCH_CALLBACK_FAILED",
        "The dispatch callback failed.",
        503,
      ),
    );

    await expect(processVideoWorkerDispatchJob(config, job)).rejects.toMatchObject({
      code: "VIDEO_WORKER_DISPATCH_CALLBACK_FAILED",
      status: 503,
    });
    expect(journalMocks.writeDispatchJournal).toHaveBeenCalled();
    expect(journalMocks.deleteDispatchJournal).not.toHaveBeenCalled();
    expect(networkMocks.failWorkerDispatch).not.toHaveBeenCalled();
  });
});
