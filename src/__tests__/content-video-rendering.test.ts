import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({
  contentFindFirst: vi.fn(),
  versionFindUnique: vi.fn(),
  complianceFindFirst: vi.fn(),
  transaction: vi.fn(),
}));
const comfyMocks = vi.hoisted(() => ({
  queueVideoJob: vi.fn(),
  getVideoJob: vi.fn(),
  cancelVideoJob: vi.fn(),
}));
const storeMocks = vi.hoisted(() => ({
  createVideoRenderJob: vi.fn(),
  getVerifiedVideoUpload: vi.fn(),
  getVideoRenderJobById: vi.fn(),
  getVideoRenderJobByPromptId: vi.fn(),
  latestVideoRenderJobForContent: vi.fn(),
  markVideoRenderQueued: vi.fn(),
  recordVerifiedVideoUpload: vi.fn(),
  updateVideoRenderState: vi.fn(),
}));
const securityMocks = vi.hoisted(() => ({
  emitDomainEvent: vi.fn(),
  emitTokMetricAudit: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    content: { findFirst: dbMocks.contentFindFirst },
    contentVersion: { findUnique: dbMocks.versionFindUnique },
    complianceReview: { findFirst: dbMocks.complianceFindFirst },
    $transaction: dbMocks.transaction,
  },
}));
vi.mock("@/lib/video/comfyui", () => ({
  queueVideoJob: comfyMocks.queueVideoJob,
  getVideoJob: comfyMocks.getVideoJob,
  cancelVideoJob: comfyMocks.cancelVideoJob,
}));
vi.mock("@/lib/video/store", () => ({
  createVideoRenderJob: storeMocks.createVideoRenderJob,
  getVerifiedVideoUpload: storeMocks.getVerifiedVideoUpload,
  getVideoRenderJobById: storeMocks.getVideoRenderJobById,
  getVideoRenderJobByPromptId: storeMocks.getVideoRenderJobByPromptId,
  latestVideoRenderJobForContent: storeMocks.latestVideoRenderJobForContent,
  markVideoRenderQueued: storeMocks.markVideoRenderQueued,
  recordVerifiedVideoUpload: storeMocks.recordVerifiedVideoUpload,
  updateVideoRenderState: storeMocks.updateVideoRenderState,
}));
vi.mock("@/lib/tokmetric/security", async () => {
  const actual = await vi.importActual<typeof import("@/lib/tokmetric/security")>(
    "@/lib/tokmetric/security",
  );
  return {
    ...actual,
    emitDomainEvent: securityMocks.emitDomainEvent,
    emitTokMetricAudit: securityMocks.emitTokMetricAudit,
  };
});

import {
  finalizeContentRender,
  queueContentRender,
  verifyRenderedUpload,
} from "@/lib/video/content-rendering";

const content = {
  id: "content-1",
  workspaceId: "workspace-1",
  currentVersionId: "version-1",
  state: "APPROVAL_REQUIRED",
};
const version = {
  id: "version-1",
  contentId: "content-1",
  version: 1,
  objectHash: "hash-1",
  script: "Explain how a structured security review can improve visibility.",
  caption: "Know your exposure before an incident.",
  hashtags: ["#Cybersecurity"],
  mediaAssetIds: [],
  settings: {
    orchestrator: {
      provider: "TIKTOK",
      contentType: "SHORT_VIDEO",
      fingerprint: "fingerprint-1",
    },
    videoRecipe: {
      aspectRatio: "9:16",
      cameraDirection: "Natural handheld documentary movement",
      voiceDirection: "Calm human presenter",
      scenes: [
        {
          visualDirection: "A professional analyst reviewing a high-level dashboard",
          narration: "Security starts with understanding exposure.",
          onScreenText: "Know your exposure",
        },
      ],
    },
  },
};
const passingReview = {
  id: "review-1",
  contentVersionId: "version-1",
  policyVersionId: null,
  result: "PASS",
  findings: [],
};
const dispatchingRecord = {
  id: "11111111-1111-4111-8111-111111111111",
  workspaceId: "workspace-1",
  contentId: "content-1",
  contentVersionId: "version-1",
  complianceReviewId: "review-1",
  requestedById: "admin-1",
  provider: "comfyui-local" as const,
  clientId: "11111111-1111-4111-8111-111111111111",
  externalPromptId: null,
  idempotencyKey: "render-key-1",
  requestHash: "request-hash",
  state: "DISPATCHING" as const,
  errorCode: null,
  errorMessage: null,
  outputManifest: {},
  createdAt: new Date("2026-07-25T00:00:00.000Z"),
  updatedAt: new Date("2026-07-25T00:00:00.000Z"),
  completedAt: null,
  finalizedAt: null,
};
const completedRecord = {
  ...dispatchingRecord,
  externalPromptId: "prompt-1",
  state: "COMPLETED" as const,
  outputManifest: { "19": { videos: [{ filename: "render.mp4" }] } },
  completedAt: new Date("2026-07-25T00:05:00.000Z"),
};

describe("governed content video rendering", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv(
      "COMFYUI_WORKFLOW_JSON",
      JSON.stringify({
        "6": { class_type: "CLIPTextEncode", inputs: { text: "placeholder" } },
      }),
    );
    vi.stubEnv("COMFYUI_PROMPT_NODE_ID", "6");
    vi.stubEnv("VIDEO_ASSET_ALLOWED_ORIGINS", "https://assets.example.com");
    dbMocks.contentFindFirst.mockResolvedValue(content);
    dbMocks.versionFindUnique.mockResolvedValue(version);
    dbMocks.complianceFindFirst.mockResolvedValue(passingReview);
    storeMocks.createVideoRenderJob.mockResolvedValue({
      record: dispatchingRecord,
      reused: false,
    });
    comfyMocks.queueVideoJob.mockResolvedValue({
      promptId: "prompt-1",
      clientId: dispatchingRecord.clientId,
      status: "queued",
      queueDepthBeforeSubmission: 0,
      queueLimit: 4,
    });
    storeMocks.markVideoRenderQueued.mockResolvedValue({
      ...dispatchingRecord,
      externalPromptId: "prompt-1",
      state: "QUEUED",
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("persists exact render ownership before dispatch", async () => {
    const result = await queueContentRender({
      workspaceId: "workspace-1",
      contentId: "content-1",
      actorId: "admin-1",
      correlationId: "correlation-1",
      idempotencyKey: "render-key-1",
      seed: 42,
    });

    expect(storeMocks.createVideoRenderJob).toHaveBeenCalledBefore(
      comfyMocks.queueVideoJob,
    );
    expect(comfyMocks.queueVideoJob).toHaveBeenCalledWith(
      expect.objectContaining({
        promptNodeId: "6",
        seed: 42,
        prompt: expect.stringContaining("Know your exposure"),
      }),
      expect.objectContaining({
        clientId: dispatchingRecord.clientId,
        extraData: expect.objectContaining({
          contentId: "content-1",
          contentVersionId: "version-1",
        }),
      }),
    );
    expect(storeMocks.markVideoRenderQueued).toHaveBeenCalledWith({
      id: dispatchingRecord.id,
      promptId: "prompt-1",
    });
    expect(result).toMatchObject({
      renderJobId: dispatchingRecord.id,
      promptId: "prompt-1",
      contentVersionId: "version-1",
      externalPublicationTaken: false,
    });
  });

  it("blocks rendering without passing compliance", async () => {
    dbMocks.complianceFindFirst.mockResolvedValue({
      id: "review-blocked",
      result: "HUMAN_REVIEW_REQUIRED",
    });

    await expect(
      queueContentRender({
        workspaceId: "workspace-1",
        contentId: "content-1",
        actorId: "admin-1",
        correlationId: "correlation-2",
        idempotencyKey: "render-key-2",
      }),
    ).rejects.toMatchObject({ code: "VIDEO_RENDER_COMPLIANCE_REQUIRED" });
    expect(storeMocks.createVideoRenderJob).not.toHaveBeenCalled();
  });

  it("blocks immutable approved content before dispatch", async () => {
    dbMocks.contentFindFirst.mockResolvedValue({ ...content, state: "APPROVED" });

    await expect(
      queueContentRender({
        workspaceId: "workspace-1",
        contentId: "content-1",
        actorId: "admin-1",
        correlationId: "correlation-3",
        idempotencyKey: "render-key-3",
      }),
    ).rejects.toMatchObject({ code: "CONTENT_RENDER_IMMUTABLE" });
    expect(comfyMocks.queueVideoJob).not.toHaveBeenCalled();
  });

  it("verifies a trusted worker upload against provider output and storage headers", async () => {
    storeMocks.getVideoRenderJobById.mockResolvedValue(completedRecord);
    comfyMocks.getVideoJob.mockResolvedValue({
      promptId: "prompt-1",
      status: "completed",
      outputs: completedRecord.outputManifest,
    });
    storeMocks.updateVideoRenderState.mockResolvedValue(completedRecord);
    storeMocks.recordVerifiedVideoUpload.mockResolvedValue({
      id: "upload-1",
      renderJobId: completedRecord.id,
      storageRef: "https://assets.example.com/render.mp4",
      fileName: "render.mp4",
      mimeType: "video/mp4",
      fileSize: 2048,
      checksumSha256: "b".repeat(64),
      safeMetadata: {},
      verifiedAt: new Date("2026-07-25T00:06:00.000Z"),
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(null, {
          status: 200,
          headers: {
            "content-length": "2048",
            "content-type": "video/mp4",
            etag: "etag-1",
          },
        }),
      ),
    );

    const result = await verifyRenderedUpload({
      renderJobId: completedRecord.id,
      storageRef: "https://assets.example.com/render.mp4",
      fileName: "render.mp4",
      mimeType: "video/mp4",
      fileSize: 2048,
      checksumSha256: "b".repeat(64),
      correlationId: "correlation-4",
    });

    expect(storeMocks.recordVerifiedVideoUpload).toHaveBeenCalledWith(
      expect.objectContaining({
        renderJobId: completedRecord.id,
        fileName: "render.mp4",
        fileSize: 2048,
      }),
    );
    expect(result).toMatchObject({ uploadId: "upload-1", contentId: "content-1" });
  });

  it("requires a verified worker upload before finalization", async () => {
    storeMocks.getVideoRenderJobByPromptId.mockResolvedValue(completedRecord);
    comfyMocks.getVideoJob.mockResolvedValue({
      promptId: "prompt-1",
      status: "completed",
      outputs: completedRecord.outputManifest,
    });
    storeMocks.updateVideoRenderState.mockResolvedValue(completedRecord);
    storeMocks.getVerifiedVideoUpload.mockResolvedValue(null);

    await expect(
      finalizeContentRender({
        workspaceId: "workspace-1",
        contentId: "content-1",
        promptId: "prompt-1",
        actorId: "admin-1",
        correlationId: "correlation-5",
      }),
    ).rejects.toMatchObject({ code: "VIDEO_UPLOAD_VERIFICATION_REQUIRED" });
  });

  it("atomically registers media, versions content, copies review evidence, and requests approval", async () => {
    storeMocks.getVideoRenderJobByPromptId.mockResolvedValue(completedRecord);
    comfyMocks.getVideoJob.mockResolvedValue({
      promptId: "prompt-1",
      status: "completed",
      outputs: completedRecord.outputManifest,
    });
    storeMocks.updateVideoRenderState.mockResolvedValue(completedRecord);
    storeMocks.getVerifiedVideoUpload.mockResolvedValue({
      id: "upload-1",
      renderJobId: completedRecord.id,
      storageRef: "https://assets.example.com/render.mp4",
      fileName: "render.mp4",
      mimeType: "video/mp4",
      fileSize: 2048,
      checksumSha256: "b".repeat(64),
      safeMetadata: {},
      verifiedAt: new Date(),
    });

    const transaction = {
      mediaAsset: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({
          id: "asset-1",
          storageRef: "https://assets.example.com/render.mp4",
        }),
      },
      contentVersion: {
        findFirst: vi.fn().mockResolvedValue(null),
        aggregate: vi.fn().mockResolvedValue({ _max: { version: 1 } }),
        create: vi.fn().mockResolvedValue({
          id: "version-2",
          objectHash: "hash-2",
        }),
      },
      complianceReview: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: "review-2", result: "PASS" }),
      },
      approvalRequest: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: "approval-2" }),
      },
      content: { update: vi.fn().mockResolvedValue({}) },
      auditEvent: { create: vi.fn().mockResolvedValue({}) },
      domainEvent: { create: vi.fn().mockResolvedValue({}) },
      $executeRaw: vi.fn().mockResolvedValue(1),
    };
    dbMocks.transaction.mockImplementation(async (work) => work(transaction));

    const result = await finalizeContentRender({
      workspaceId: "workspace-1",
      contentId: "content-1",
      promptId: "prompt-1",
      actorId: "admin-1",
      correlationId: "correlation-6",
    });

    expect(transaction.mediaAsset.create).toHaveBeenCalled();
    expect(transaction.contentVersion.create).toHaveBeenCalled();
    expect(transaction.complianceReview.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ contentVersionId: "version-2", result: "PASS" }),
      }),
    );
    expect(transaction.approvalRequest.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: "publish_tiktok_content" }),
      }),
    );
    expect(transaction.auditEvent.create).toHaveBeenCalled();
    expect(transaction.domainEvent.create).toHaveBeenCalled();
    expect(result).toMatchObject({
      renderJobId: completedRecord.id,
      mediaAssetId: "asset-1",
      contentVersionId: "version-2",
      approvalRequestId: "approval-2",
      state: "AWAITING_HUMAN_APPROVAL",
    });
  });
});
