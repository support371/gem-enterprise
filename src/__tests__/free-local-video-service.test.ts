import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cancelVideoJob,
  findVideoPromptIdByClientId,
  getVideoJob,
  getVideoReadiness,
  probeComfyUi,
  queueVideoJob,
} from "@/lib/video/comfyui";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const workflow = {
  "3": { class_type: "KSampler", inputs: { seed: 1 } },
  "6": { class_type: "CLIPTextEncode", inputs: { text: "placeholder" } },
  "7": { class_type: "CLIPTextEncode", inputs: { text: "placeholder" } },
};

describe("free local video provider", () => {
  beforeEach(() => {
    vi.stubEnv("COMFYUI_BASE_URL", "http://comfy.test");
    vi.stubEnv("COMFYUI_MAX_QUEUE_ITEMS", "4");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("fails closed when the local worker and workflow are not configured", () => {
    vi.stubEnv("COMFYUI_BASE_URL", "");
    vi.stubEnv("COMFYUI_WORKFLOW_JSON", "");
    vi.stubEnv("COMFYUI_PROMPT_NODE_ID", "");
    expect(getVideoReadiness()).toMatchObject({ configured: false });
  });

  it("supports worker dispatch without exposing ComfyUI to the application", () => {
    vi.stubEnv("VIDEO_RENDER_DISPATCH_MODE", "worker");
    vi.stubEnv("COMFYUI_BASE_URL", "");
    vi.stubEnv("COMFYUI_WORKFLOW_JSON", JSON.stringify(workflow));
    vi.stubEnv("COMFYUI_PROMPT_NODE_ID", "6");

    expect(getVideoReadiness()).toMatchObject({
      configured: true,
      directWorkerReady: false,
      contentRenderingReady: true,
      dispatchMode: "worker",
      missingConfiguration: [],
    });
  });

  it("rejects submissions when the configured queue boundary is reached", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        queue_running: [[1, "running-1"]],
        queue_pending: [[2, "pending-1"], [3, "pending-2"], [4, "pending-3"]],
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      queueVideoJob({
        prompt: "A realistic cybersecurity operations centre scene",
        workflow,
        promptNodeId: "6",
      }),
    ).rejects.toThrow("COMFYUI_QUEUE_FULL");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("injects validated prompt inputs and queues a render", async () => {
    const fetchMock = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
      const value = String(url);
      if (value.endsWith("/queue") && !init?.method) {
        return jsonResponse({ queue_running: [], queue_pending: [] });
      }
      if (value.endsWith("/prompt")) {
        const body = JSON.parse(String(init?.body)) as {
          prompt: Record<string, { inputs: Record<string, unknown> }>;
        };
        expect(body.prompt["6"].inputs.text).toBe(
          "A realistic cybersecurity operations centre scene",
        );
        expect(body.prompt["7"].inputs.text).toBe("logos, distorted faces");
        expect(body.prompt["3"].inputs.seed).toBe(42);
        return jsonResponse({ prompt_id: "prompt-1" });
      }
      throw new Error(`Unexpected URL: ${value}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await queueVideoJob({
      prompt: "A realistic cybersecurity operations centre scene",
      negativePrompt: "logos, distorted faces",
      workflow,
      promptNodeId: "6",
      negativePromptNodeId: "7",
      seedNodeId: "3",
      seed: 42,
    });

    expect(result).toMatchObject({ promptId: "prompt-1", status: "queued" });
  });

  it("recovers a queued provider prompt from the stable client ID", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        queue_running: [],
        queue_pending: [
          [
            1,
            "prompt-recovered",
            workflow,
            { client_id: "client-stable" },
            ["9"],
          ],
        ],
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(findVideoPromptIdByClientId("client-stable")).resolves.toBe(
      "prompt-recovered",
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("recovers a completed provider prompt from history by client ID", async () => {
    const fetchMock = vi.fn(async (url: string | URL | Request) => {
      const value = String(url);
      if (value.endsWith("/queue")) {
        return jsonResponse({ queue_running: [], queue_pending: [] });
      }
      if (value.includes("/history?max_items=200")) {
        return jsonResponse({
          "prompt-history": {
            prompt: [
              1,
              "prompt-history",
              workflow,
              { client_id: "client-history" },
              ["9"],
            ],
            outputs: {},
          },
        });
      }
      throw new Error(`Unexpected URL: ${value}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(findVideoPromptIdByClientId("client-history")).resolves.toBe(
      "prompt-history",
    );
  });

  it("preserves terminal execution failures", async () => {
    const fetchMock = vi.fn(async (url: string | URL | Request) => {
      const value = String(url);
      if (value.includes("/history/prompt-failed")) {
        return jsonResponse({
          "prompt-failed": {
            status: {
              status_str: "error",
              completed: false,
              messages: [
                [
                  "execution_error",
                  {
                    exception_type: "OOMError",
                    exception_message: "GPU memory exhausted",
                    node_id: "12",
                  },
                ],
              ],
            },
            outputs: {},
          },
        });
      }
      if (value.endsWith("/queue")) {
        return jsonResponse({ queue_running: [], queue_pending: [] });
      }
      throw new Error(`Unexpected URL: ${value}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await getVideoJob("prompt-failed");
    expect(result.status).toBe("failed");
    expect(result.error).toMatchObject({ type: "OOMError", nodeId: "12" });
  });

  it("deletes only the requested pending prompt", async () => {
    const fetchMock = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
      const value = String(url);
      if (value.endsWith("/queue") && !init?.method) {
        return jsonResponse({ queue_running: [], queue_pending: [[1, "prompt-2"]] });
      }
      if (value.endsWith("/queue") && init?.method === "POST") {
        expect(JSON.parse(String(init.body))).toEqual({ delete: ["prompt-2"] });
        return jsonResponse({});
      }
      throw new Error(`Unexpected URL: ${value}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await cancelVideoJob("prompt-2");
    expect(result).toMatchObject({ cancelled: true, promptId: "prompt-2" });
  });

  it("preserves provider status for non-JSON readiness responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("upstream authentication failed", { status: 401 }),
      ),
    );

    const result = await probeComfyUi();
    expect(result).toMatchObject({
      ok: false,
      status: 401,
      responseFormat: "text",
      diagnostic: "upstream authentication failed",
    });
  });
});
