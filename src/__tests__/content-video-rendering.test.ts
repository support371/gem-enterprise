import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({
  contentFindFirst: vi.fn(),
  versionFindUnique: vi.fn(),
  complianceFindFirst: vi.fn(),
  auditFindFirst: vi.fn(),
}));
const comfyMocks = vi.hoisted(() => ({
  queueVideoJob: vi.fn(),
  getVideoJob: vi.fn(),
}));
const workflowMocks = vi.hoisted(() => ({
  createContentVersion: vi.fn(),
  registerMediaAsset: vi.fn(),
  requestContentApproval: vi.fn(),
  runComplianceReview: vi.fn(),
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
    auditEvent: { findFirst: dbMocks.auditFindFirst },
  },
}));
vi.mock("@/lib/video/comfyui", () => ({
  queueVideoJob: comfyMocks.queueVideoJob,
  getVideoJob: comfyMocks.getVideoJob,
}));
vi.mock("@/lib/tokmetric/workflow", () => ({
  createContentVersion: workflowMocks.createContentVersion,
  registerMediaAsset: workflowMocks.registerMediaAsset,
  requestContentApproval: workflowMocks.requestContentApproval,
  runComplianceReview: workflowMocks.runComplianceReview,
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
  result: "PASS",
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
    comfyMocks.queueVideoJob.mockResolvedValue({
      promptId: "prompt-1",
      clientId: "client-1",
      status: "queued",
      queueDepthBeforeSubmission: 0,
      queueLimit: 4,
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("queues only an exact video version with passing compliance evidence", async () => {
    const result = await queueContentRender({
      workspaceId: "workspace-1",
      contentId: "content-1",
      actorId: "admin-1",
      correlationId: "correlation-1",
      seed: 42,
    });

    expect(comfyMocks.queueVideoJob).toHaveBeenCalledWith(
      expect.objectContaining({
        promptNodeId: "6",
        seed: 42,
        prompt: expect.stringContaining("Know your exposure"),
      }),
    );
    expect(securityMocks.emitTokMetricAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: "workspace-1",
        entityId: "prompt-1",
        metadata: expect.objectContaining({
          contentId: "content-1",
          contentVersionId: "version-1",
          complianceReviewId: "review-1",
        }),
      }),
    );
    expect(result).toMatchObject({
      promptId: "prompt-1",
      contentVersionId: "version-1",
      externalPublicationTaken: false,
    });
  });

  it("blocks rendering when the exact content version lacks passing compliance", async () => {
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
      }),
    ).rejects.toMatchObject({ code: "VIDEO_RENDER_COMPLIANCE_REQUIRED" });
    expect(comfyMocks.queueVideoJob).not.toHaveBeenCalled();
  });

  it("fails closed when the completed file is outside approved storage", async () => {
    await expect(
      finalizeContentRender({
        workspaceId: "workspace-1",
        contentId: "content-1",
        promptId: "prompt-1",
        actorId: "admin-1",
        correlationId: "correlation-3",
        fileName: "render.mp4",
        mimeType: "video/mp4",
        fileSize: 1024,
        checksum: "a".repeat(64),
        storageRef: "https://unapproved.example.com/render.mp4",
      }),
    ).rejects.toMatchObject({ code: "VIDEO_STORAGE_ORIGIN_NOT_APPROVED" });
  });

  it("registers completed media, creates a new version, reruns review, and requests fresh approval", async () => {
    dbMocks.auditFindFirst.mockResolvedValue({
      entityId: "prompt-1",
      safeMetadata: {
        contentId: "content-1",
        contentVersionId: "version-1",
      },
    });
    comfyMocks.getVideoJob.mockResolvedValue({
      promptId: "prompt-1",
      status: "completed",
      outputs: { "19": { videos: [{ filename: "render.mp4" }] } },
    });
    workflowMocks.registerMediaAsset.mockResolvedValue({ id: "asset-1" });
    workflowMocks.createContentVersion.mockResolvedValue({
      version: { id: "version-2" },
    });
    workflowMocks.runComplianceReview.mockResolvedValue({
      id: "review-2",
      result: "PASS",
    });
    workflowMocks.requestContentApproval.mockResolvedValue({ id: "approval-2" });

    const result = await finalizeContentRender({
      workspaceId: "workspace-1",
      contentId: "content-1",
      promptId: "prompt-1",
      actorId: "admin-1",
      correlationId: "correlation-4",
      fileName: "render.mp4",
      mimeType: "video/mp4",
      fileSize: 2048,
      checksum: "b".repeat(64),
      storageRef: "https://assets.example.com/render.mp4",
    });

    expect(workflowMocks.registerMediaAsset).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: "workspace-1",
        checksum: "b".repeat(64),
        storageRef: "https://assets.example.com/render.mp4",
      }),
    );
    expect(workflowMocks.createContentVersion).toHaveBeenCalledWith(
      "content-1",
      "workspace-1",
      "admin-1",
      "correlation-4",
      expect.objectContaining({ mediaAssetIds: ["asset-1"] }),
    );
    expect(workflowMocks.runComplianceReview).toHaveBeenCalled();
    expect(workflowMocks.requestContentApproval).toHaveBeenCalledWith(
      expect.objectContaining({ action: "publish_tiktok_content" }),
    );
    expect(result).toMatchObject({
      mediaAssetId: "asset-1",
      contentVersionId: "version-2",
      approvalRequestId: "approval-2",
      state: "AWAITING_HUMAN_APPROVAL",
      externalPublicationTaken: false,
    });
  });
});
