import { z } from "zod";

const DEFAULT_TIMEOUT_MS = 15_000;

export const videoJobInputSchema = z.object({
  prompt: z.string().trim().min(10).max(4_000),
  negativePrompt: z.string().trim().max(2_000).optional(),
  workflow: z.record(z.unknown()),
  promptNodeId: z.string().trim().min(1).default("6"),
  negativePromptNodeId: z.string().trim().min(1).optional(),
  seedNodeId: z.string().trim().min(1).optional(),
  seed: z.number().int().nonnegative().optional(),
});

export type VideoJobInput = z.infer<typeof videoJobInputSchema>;

type ComfyHistory = Record<string, unknown>;

function getBaseUrl(): string | null {
  const raw = process.env.COMFYUI_BASE_URL?.trim();
  return raw ? raw.replace(/\/$/, "") : null;
}

function getHeaders(): HeadersInit {
  const token = process.env.COMFYUI_BEARER_TOKEN?.trim();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function comfyFetch(path: string, init?: RequestInit): Promise<Response> {
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    throw new Error("COMFYUI_NOT_CONFIGURED");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    return await fetch(`${baseUrl}${path}`, {
      ...init,
      cache: "no-store",
      headers: {
        ...getHeaders(),
        ...(init?.headers ?? {}),
      },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

function cloneWorkflow(workflow: Record<string, unknown>): Record<string, unknown> {
  return JSON.parse(JSON.stringify(workflow)) as Record<string, unknown>;
}

function setNodeText(workflow: Record<string, unknown>, nodeId: string, text: string): void {
  const node = workflow[nodeId] as { inputs?: Record<string, unknown> } | undefined;
  if (!node?.inputs || typeof node.inputs !== "object") {
    throw new Error(`WORKFLOW_NODE_NOT_FOUND:${nodeId}`);
  }
  node.inputs.text = text;
}

function setNodeSeed(workflow: Record<string, unknown>, nodeId: string, seed: number): void {
  const node = workflow[nodeId] as { inputs?: Record<string, unknown> } | undefined;
  if (!node?.inputs || typeof node.inputs !== "object") {
    throw new Error(`WORKFLOW_NODE_NOT_FOUND:${nodeId}`);
  }
  node.inputs.seed = seed;
}

export function getVideoReadiness() {
  const baseUrl = getBaseUrl();
  return {
    configured: Boolean(baseUrl),
    provider: "comfyui-local",
    costModel: "self-hosted-no-api-fee",
    baseUrlConfigured: Boolean(baseUrl),
    bearerTokenConfigured: Boolean(process.env.COMFYUI_BEARER_TOKEN?.trim()),
  };
}

export async function probeComfyUi() {
  const response = await comfyFetch("/system_stats");
  const body = await response.text();
  return {
    ok: response.ok,
    status: response.status,
    body: body ? JSON.parse(body) : null,
  };
}

export async function queueVideoJob(input: VideoJobInput) {
  const parsed = videoJobInputSchema.parse(input);
  const workflow = cloneWorkflow(parsed.workflow);

  setNodeText(workflow, parsed.promptNodeId, parsed.prompt);
  if (parsed.negativePromptNodeId && parsed.negativePrompt) {
    setNodeText(workflow, parsed.negativePromptNodeId, parsed.negativePrompt);
  }
  if (parsed.seedNodeId && parsed.seed !== undefined) {
    setNodeSeed(workflow, parsed.seedNodeId, parsed.seed);
  }

  const clientId = crypto.randomUUID();
  const response = await comfyFetch("/prompt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: workflow, client_id: clientId }),
  });

  const body = await response.json().catch(() => null) as
    | { prompt_id?: string; error?: string }
    | null;

  if (!response.ok || !body?.prompt_id) {
    throw new Error(body?.error || `COMFYUI_QUEUE_FAILED:${response.status}`);
  }

  return {
    promptId: body.prompt_id,
    clientId,
    status: "queued" as const,
  };
}

export async function getVideoJob(promptId: string) {
  const response = await comfyFetch(`/history/${encodeURIComponent(promptId)}`);
  const body = await response.json().catch(() => null) as ComfyHistory | null;

  if (!response.ok) {
    throw new Error(`COMFYUI_HISTORY_FAILED:${response.status}`);
  }

  const job = body?.[promptId] as Record<string, unknown> | undefined;
  return {
    promptId,
    status: job ? "completed" as const : "pending" as const,
    result: job ?? null,
  };
}

export async function cancelVideoJobs() {
  const response = await comfyFetch("/queue", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clear: true }),
  });

  if (!response.ok) {
    throw new Error(`COMFYUI_CANCEL_FAILED:${response.status}`);
  }

  return { cancelled: true };
}
