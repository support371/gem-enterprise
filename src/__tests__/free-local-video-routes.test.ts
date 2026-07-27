import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";

const authMocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
}));
const videoMocks = vi.hoisted(() => ({
  queueVideoJob: vi.fn(),
  getVideoJob: vi.fn(),
  cancelVideoJob: vi.fn(),
  probeComfyUi: vi.fn(),
  getVideoReadiness: vi.fn(),
}));
const auditMocks = vi.hoisted(() => ({
  emitAuditLog: vi.fn(),
}));

vi.mock("@/lib/api/auth-helpers", () => ({
  requireAdmin: authMocks.requireAdmin,
  getRequestContext: () => ({ ipAddress: "127.0.0.1", userAgent: "vitest" }),
  badRequest: (message: string) =>
    NextResponse.json({ error: message }, { status: 400 }),
}));
vi.mock("@/lib/audit", () => ({ emitAuditLog: auditMocks.emitAuditLog }));
vi.mock("@/lib/video/comfyui", async () => {
  const actual = await vi.importActual<typeof import("@/lib/video/comfyui")>(
    "@/lib/video/comfyui",
  );
  return {
    ...actual,
    queueVideoJob: videoMocks.queueVideoJob,
    getVideoJob: videoMocks.getVideoJob,
    cancelVideoJob: videoMocks.cancelVideoJob,
    probeComfyUi: videoMocks.probeComfyUi,
    getVideoReadiness: videoMocks.getVideoReadiness,
  };
});

import { POST as queuePost } from "@/app/api/video/jobs/route";
import {
  DELETE as jobDelete,
  GET as jobGet,
} from "@/app/api/video/jobs/[promptId]/route";
import { GET as readinessGet } from "@/app/api/video/readiness/route";

function activeAdmin() {
  return {
    ok: true,
    session: { userId: "admin-1", role: "admin" },
    accountStatus: "active",
    claimsChanged: false,
  };
}

function queueRequest(body: BodyInit) {
  return new NextRequest("http://localhost/api/video/jobs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
}

const validInput = {
  prompt: "A governed cybersecurity awareness video scene",
  workflow: {
    "6": { class_type: "CLIPTextEncode", inputs: { text: "placeholder" } },
  },
  promptNodeId: "6",
};

describe("free local video routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.requireAdmin.mockResolvedValue(activeAdmin());
    videoMocks.getVideoReadiness.mockReturnValue({
      configured: true,
      directWorkerReady: true,
      contentRenderingReady: true,
      dispatchMode: "server",
      provider: "comfyui-local",
      queueLimit: 4,
      missingConfiguration: [],
    });
  });

  it("returns the authoritative admin gate response", async () => {
    authMocks.requireAdmin.mockResolvedValue({
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    });

    const response = await queuePost(queueRequest(JSON.stringify(validInput)));
    expect(response.status).toBe(401);
    expect(videoMocks.queueVideoJob).not.toHaveBeenCalled();
  });

  it("treats malformed JSON as a client error", async () => {
    const response = await queuePost(queueRequest("{"));
    expect(response.status).toBe(400);
    expect(videoMocks.queueVideoJob).not.toHaveBeenCalled();
  });

  it("audits a successful render submission", async () => {
    videoMocks.queueVideoJob.mockResolvedValue({
      promptId: "prompt-1",
      clientId: "client-1",
      status: "queued",
      queueDepthBeforeSubmission: 0,
      queueLimit: 4,
    });

    const response = await queuePost(queueRequest(JSON.stringify(validInput)));
    expect(response.status).toBe(202);
    expect(auditMocks.emitAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "admin-1",
        resource: "video_render_job",
        resourceId: "prompt-1",
      }),
    );
  });

  it("restricts job history to active administrators", async () => {
    authMocks.requireAdmin.mockResolvedValue({
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    });

    const response = await jobGet(
      new NextRequest("http://localhost/api/video/jobs/prompt-1"),
      { params: Promise.resolve({ promptId: "prompt-1" }) },
    );
    expect(response.status).toBe(403);
    expect(videoMocks.getVideoJob).not.toHaveBeenCalled();
  });

  it("cancels and audits only the requested pending job", async () => {
    videoMocks.cancelVideoJob.mockResolvedValue({
      promptId: "prompt-2",
      cancelled: true,
      status: "cancelled",
    });

    const response = await jobDelete(
      new NextRequest("http://localhost/api/video/jobs/prompt-2", {
        method: "DELETE",
      }),
      { params: Promise.resolve({ promptId: "prompt-2" }) },
    );
    expect(response.status).toBe(200);
    expect(videoMocks.cancelVideoJob).toHaveBeenCalledWith("prompt-2");
    expect(auditMocks.emitAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ resourceId: "prompt-2" }),
    );
  });

  it("returns only redacted server-mode readiness information", async () => {
    videoMocks.probeComfyUi.mockResolvedValue({
      ok: false,
      status: 401,
      responseFormat: "text",
      diagnostic: "authentication failed",
    });

    const response = await readinessGet();
    const payload = await response.json();
    expect(response.status).toBe(502);
    expect(payload).toMatchObject({
      providerStatus: 401,
      responseFormat: "text",
      diagnostic: "authentication failed",
    });
    expect(payload.system).toBeUndefined();
  });

  it("delegates worker-mode provider readiness without probing from Vercel", async () => {
    videoMocks.getVideoReadiness.mockReturnValue({
      configured: true,
      directWorkerReady: false,
      contentRenderingReady: true,
      dispatchMode: "worker",
      provider: "comfyui-local",
      queueLimit: 4,
      missingConfiguration: [],
    });

    const response = await readinessGet();
    const payload = await response.json();
    expect(response.status).toBe(200);
    expect(payload).toMatchObject({
      ok: true,
      dispatchMode: "worker",
      providerProbe: "delegated-to-trusted-worker",
    });
    expect(videoMocks.probeComfyUi).not.toHaveBeenCalled();
  });

  it("reports missing content workflow configuration even when the worker is reachable", async () => {
    videoMocks.getVideoReadiness.mockReturnValue({
      configured: true,
      directWorkerReady: true,
      contentRenderingReady: false,
      dispatchMode: "server",
      provider: "comfyui-local",
      queueLimit: 4,
      missingConfiguration: ["COMFYUI_WORKFLOW_JSON"],
    });
    videoMocks.probeComfyUi.mockResolvedValue({
      ok: true,
      status: 200,
      responseFormat: "json",
    });

    const response = await readinessGet();
    const payload = await response.json();
    expect(response.status).toBe(503);
    expect(payload).toMatchObject({
      ok: false,
      code: "VIDEO_RENDER_WORKFLOW_NOT_CONFIGURED",
      contentRenderingReady: false,
    });
  });
});
