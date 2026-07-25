import {
  ManusCampaignOutputSchema,
  buildManusCampaignPrompt,
  manusCampaignStructuredOutputSchema,
  type ManusCampaignBrief,
  type ManusCampaignOutput,
} from "@/lib/manus/campaign";

const MANUS_API_BASE_URL = "https://api.manus.ai/v2";
const MANUS_TIMEOUT_MS = 30_000;
const FREE_TIER_AGENT_PROFILE = "manus-1.6-lite";

export class ManusConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ManusConfigurationError";
  }
}

export class ManusApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ManusApiError";
    this.status = status;
    this.code = code;
  }
}

function getConfig() {
  const apiKey = process.env.MANUS_API_KEY?.trim();
  if (!apiKey) {
    throw new ManusConfigurationError("Manus is not configured. Add MANUS_API_KEY to the server environment.");
  }

  return {
    apiKey,
    projectId: process.env.MANUS_PROJECT_ID?.trim() || undefined,
    agentProfile: FREE_TIER_AGENT_PROFILE,
  };
}

async function parseApiResponse(response: Response): Promise<Record<string, unknown>> {
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new ManusApiError(response.status, "MANUS_INVALID_RESPONSE", "Manus returned an invalid response.");
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new ManusApiError(response.status, "MANUS_INVALID_RESPONSE", "Manus returned an invalid response.");
  }

  const record = payload as Record<string, unknown>;
  if (!response.ok || record.ok === false) {
    const error = record.error && typeof record.error === "object"
      ? (record.error as Record<string, unknown>)
      : undefined;
    const code = typeof error?.code === "string" ? error.code : "MANUS_REQUEST_FAILED";
    const message = typeof error?.message === "string"
      ? error.message
      : "Manus could not process the request.";
    throw new ManusApiError(response.status || 502, code, message);
  }

  return record;
}

export async function createManusCampaignTask(input: ManusCampaignBrief) {
  const config = getConfig();
  const body: Record<string, unknown> = {
    message: {
      content: `${buildManusCampaignPrompt(input)}\n\nFree-tier execution constraint: complete this as one concise generation task. Do not browse the web, open a virtual machine, execute code, manipulate files, call premium data sources, or perform exploratory research. Use only the supplied brief and general writing capability. Keep the result compact while satisfying the structured output schema.`,
    },
    locale: "en-US",
    interactive_mode: false,
    hide_in_task_list: false,
    share_visibility: "private",
    agent_profile: config.agentProfile,
    title: `GEM campaign draft: ${input.service}`,
    structured_output_schema: manusCampaignStructuredOutputSchema,
  };

  if (config.projectId) body.project_id = config.projectId;

  const response = await fetch(`${MANUS_API_BASE_URL}/task.create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-manus-api-key": config.apiKey,
    },
    body: JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(MANUS_TIMEOUT_MS),
  });

  const payload = await parseApiResponse(response);
  const taskId = typeof payload.task_id === "string" ? payload.task_id : undefined;
  if (!taskId) {
    throw new ManusApiError(502, "MANUS_TASK_ID_MISSING", "Manus did not return a task identifier.");
  }

  return {
    taskId,
    taskTitle: typeof payload.task_title === "string" ? payload.task_title : `GEM campaign draft: ${input.service}`,
    taskUrl: typeof payload.task_url === "string" ? payload.task_url : undefined,
    agentProfile: config.agentProfile,
  };
}

type ManusTaskState =
  | { status: "running" | "waiting"; result: null; message?: string }
  | { status: "complete"; result: ManusCampaignOutput; message?: string }
  | { status: "error"; result: null; message: string };

export async function getManusCampaignTask(taskId: string): Promise<ManusTaskState> {
  const config = getConfig();
  const url = new URL(`${MANUS_API_BASE_URL}/task.listMessages`);
  url.searchParams.set("task_id", taskId);
  url.searchParams.set("order", "asc");
  url.searchParams.set("limit", "200");

  const response = await fetch(url, {
    headers: { "x-manus-api-key": config.apiKey },
    cache: "no-store",
    signal: AbortSignal.timeout(MANUS_TIMEOUT_MS),
  });
  const payload = await parseApiResponse(response);
  const messages = Array.isArray(payload.messages) ? payload.messages : [];

  let agentStatus: string | undefined;
  let errorMessage: string | undefined;

  for (const item of messages) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const event = item as Record<string, unknown>;

    if (event.type === "structured_output_result") {
      const structured = event.structured_output_result;
      if (!structured || typeof structured !== "object" || Array.isArray(structured)) continue;
      const structuredRecord = structured as Record<string, unknown>;
      if (structuredRecord.success !== true) {
        errorMessage = typeof structuredRecord.error === "string"
          ? structuredRecord.error
          : "Manus could not produce the required campaign structure.";
        continue;
      }

      const parsed = ManusCampaignOutputSchema.safeParse(structuredRecord.value);
      if (!parsed.success) {
        return {
          status: "error",
          result: null,
          message: "Manus completed the task, but the campaign result did not match GEM's required contract.",
        };
      }
      return { status: "complete", result: parsed.data };
    }

    if (event.type === "status_update") {
      const statusUpdate = event.status_update;
      if (statusUpdate && typeof statusUpdate === "object" && !Array.isArray(statusUpdate)) {
        const status = (statusUpdate as Record<string, unknown>).agent_status;
        if (typeof status === "string") agentStatus = status;
      }
    }

    if (event.type === "error_message") {
      const error = event.error_message;
      if (error && typeof error === "object" && !Array.isArray(error)) {
        const message = (error as Record<string, unknown>).message;
        if (typeof message === "string") errorMessage = message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
    }
  }

  if (agentStatus === "error" || errorMessage) {
    return {
      status: "error",
      result: null,
      message: errorMessage || "The Manus task failed.",
    };
  }
  if (agentStatus === "waiting") {
    return {
      status: "waiting",
      result: null,
      message: "Manus requires input. Open the private Manus task to continue.",
    };
  }

  return { status: "running", result: null };
}
