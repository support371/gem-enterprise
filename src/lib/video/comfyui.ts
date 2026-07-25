import { z } from "zod";

const DEFAULT_TIMEOUT_MS = 15_000;
const DEFAULT_QUEUE_LIMIT = 4;
const MAX_QUEUE_LIMIT = 20;

export const videoJobInputSchema = z.object({
  prompt: z.string().trim().min(10).max(4_000),
  negativePrompt: z.string().trim().max(2_000).optional(),
  workflow: z.record(z.unknown()),
  promptNodeId: z.string().trim().min(1).default("6"),
  negativePromptNodeId: z.string().trim().min(1).optional(),
  seedNodeId: z.string().trim().min(1).optional(),
  seed: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER).optional(),
});

export type VideoJobInput = z.infer<typeof videoJobInputSchema>;
export type VideoJobState = "queued" | "running" | "completed" | "failed" | "unknown";
export type VideoQueueOptions = {
  clientId?: string;
  extraData?: Record<string, unknown>;
};

type JsonRecord = Record<string, unknown>;
type ComfyRequestResult<T> = {
  ok: boolean;
  status: number;
  text: string;
  json: T | null;
};

function getBaseUrl(): string | null {
  const raw = process.env.COMFYUI_BASE_URL?.trim();
  return raw ? raw.replace(/\/$/, "") : null;
}

function getHeaders(): HeadersInit {
  const token = process.env.COMFYUI_BEARER_TOKEN?.trim();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function getQueueLimit() {
  const parsed = Number.parseInt(process.env.COMFYUI_MAX_QUEUE_ITEMS ?? "", 10);
  if (!Number.isFinite(parsed)) return DEFAULT_QUEUE_LIMIT;
  return Math.min(MAX_QUEUE_LIMIT, Math.max(1, parsed));
}

function parseJson<T>(text: string): T | null {
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

async function comfyRequest<T>(path: string, init?: RequestInit): Promise<ComfyRequestResult<T>> {
  const baseUrl = getBaseUrl();
  if (!baseUrl) throw new Error("COMFYUI_NOT_CONFIGURED");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      ...init,
      cache: "no-store",
      headers: {
        ...getHeaders(),
        ...(init?.headers ?? {}),
      },
      signal: controller.signal,
    });
    const text = await response.text();
    return {
      ok: response.ok,
      status: response.status,
      text,
      json: parseJson<T>(text),
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("COMFYUI_TIMEOUT");
    }
    throw error;
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

function queuePromptIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (typeof entry === "string") return [entry];
    if (Array.isArray(entry) && typeof entry[1] === "string") return [entry[1]];
    return [];
  });
}

function object(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : {};
}

function executionFailure(entry: JsonRecord) {
  const status = object(entry.status);
  const messages = Array.isArray(status.messages) ? status.messages : [];
  const errorEvent = messages.find(
    (message) => Array.isArray(message) && message[0] === "execution_error",
  );
  const details = Array.isArray(errorEvent) ? object(errorEvent[1]) : {};
  const statusString = typeof status.status_str === "string" ? status.status_str : "";
  const failed = statusString === "error" || Boolean(errorEvent);
  return {
    failed,
    error: failed
      ? {
          type:
            typeof details.exception_type === "string"
              ? details.exception_type
              : "EXECUTION_ERROR",
          message:
            typeof details.exception_message === "string"
              ? details.exception_message.slice(0, 500)
              : "The render failed during execution.",
          nodeId: typeof details.node_id === "string" ? details.node_id : undefined,
        }
      : undefined,
  };
}

export function getVideoReadiness() {
  const baseUrl = getBaseUrl();
  const workflowJsonConfigured = Boolean(process.env.COMFYUI_WORKFLOW_JSON?.trim());
  const promptNodeConfigured = Boolean(process.env.COMFYUI_PROMPT_NODE_ID?.trim());
  const missingConfiguration = [
    !baseUrl && "COMFYUI_BASE_URL",
    !workflowJsonConfigured && "COMFYUI_WORKFLOW_JSON",
    !promptNodeConfigured && "COMFYUI_PROMPT_NODE_ID",
  ].filter((value): value is string => Boolean(value));
  return {
    configured: Boolean(baseUrl),
    directWorkerReady: Boolean(baseUrl),
    contentRenderingReady:
      Boolean(baseUrl) && workflowJsonConfigured && promptNodeConfigured,
    provider: "comfyui-local",
    costModel: "self-hosted-no-api-fee",
    baseUrlConfigured: Boolean(baseUrl),
    workflowJsonConfigured,
    promptNodeConfigured,
    bearerTokenConfigured: Boolean(process.env.COMFYUI_BEARER_TOKEN?.trim()),
    queueLimit: getQueueLimit(),
    missingConfiguration,
  };
}

export async function probeComfyUi() {
  const result = await comfyRequest<JsonRecord>("/system_stats");
  return {
    ok: result.ok,
    status: result.status,
    responseFormat: result.json ? "json" : result.text ? "text" : "empty",
    diagnostic: result.ok ? undefined : result.text.slice(0, 300) || undefined,
  };
}

export async function getVideoQueue() {
  const result = await comfyRequest<JsonRecord>("/queue");
  if (!result.ok) throw new Error(`COMFYUI_QUEUE_STATUS_FAILED:${result.status}`);
  const payload = object(result.json);
  const running = queuePromptIds(payload.queue_running);
  const pending = queuePromptIds(payload.queue_pending);
  return {
    running,
    pending,
    total: running.length + pending.length,
    limit: getQueueLimit(),
  };
}

async function enforceQueueCapacity() {
  const queue = await getVideoQueue();
  if (queue.total >= queue.limit) throw new Error("COMFYUI_QUEUE_FULL");
  return queue;
}

export async function queueVideoJob(
  input: VideoJobInput,
  options: VideoQueueOptions = {},
) {
  const parsed = videoJobInputSchema.parse(input);
  const workflow = cloneWorkflow(parsed.workflow);

  setNodeText(workflow, parsed.promptNodeId, parsed.prompt);
  if (parsed.negativePromptNodeId && parsed.negativePrompt) {
    setNodeText(workflow, parsed.negativePromptNodeId, parsed.negativePrompt);
  }
  if (parsed.seedNodeId && parsed.seed !== undefined) {
    setNodeSeed(workflow, parsed.seedNodeId, parsed.seed);
  }

  const queue = await enforceQueueCapacity();
  const clientId = options.clientId ?? crypto.randomUUID();
  const result = await comfyRequest<{ prompt_id?: string; error?: string }>("/prompt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: workflow,
      client_id: clientId,
      extra_data: options.extraData ?? {},
    }),
  });

  if (!result.ok || !result.json?.prompt_id) {
    throw new Error(
      result.json?.error || result.text.slice(0, 300) || `COMFYUI_QUEUE_FAILED:${result.status}`,
    );
  }

  return {
    promptId: result.json.prompt_id,
    clientId,
    status: "queued" as const,
    queueDepthBeforeSubmission: queue.total,
    queueLimit: queue.limit,
  };
}

export async function getVideoJob(promptId: string) {
  const [history, queue] = await Promise.all([
    comfyRequest<JsonRecord>(`/history/${encodeURIComponent(promptId)}`),
    getVideoQueue(),
  ]);
  if (!history.ok) throw new Error(`COMFYUI_HISTORY_FAILED:${history.status}`);

  const entry = object(object(history.json)[promptId]);
  const hasEntry = Object.keys(entry).length > 0;
  const failure = executionFailure(entry);
  const statusRecord = object(entry.status);
  const completed = statusRecord.completed === true || statusRecord.status_str === "success";

  let status: VideoJobState = "unknown";
  if (failure.failed) status = "failed";
  else if (completed) status = "completed";
  else if (queue.running.includes(promptId)) status = "running";
  else if (queue.pending.includes(promptId)) status = "queued";
  else if (!hasEntry) status = "unknown";

  return {
    promptId,
    status,
    outputs: hasEntry ? object(entry.outputs) : {},
    error: failure.error,
    queue: {
      position: queue.pending.indexOf(promptId),
      running: queue.running.includes(promptId),
    },
  };
}

export async function cancelVideoJob(promptId: string) {
  const queue = await getVideoQueue();
  if (queue.running.includes(promptId)) {
    return {
      promptId,
      cancelled: false,
      status: "running" as const,
      reason: "CURRENT_EXECUTION_NOT_INTERRUPTED",
    };
  }
  if (!queue.pending.includes(promptId)) {
    const job = await getVideoJob(promptId);
    return {
      promptId,
      cancelled: false,
      status: job.status,
      reason: "JOB_NOT_PENDING",
    };
  }

  const result = await comfyRequest<JsonRecord>("/queue", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ delete: [promptId] }),
  });
  if (!result.ok) throw new Error(`COMFYUI_CANCEL_FAILED:${result.status}`);

  return {
    promptId,
    cancelled: true,
    status: "cancelled" as const,
  };
}
