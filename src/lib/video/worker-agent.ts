import { createHash, randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import {
  mkdir,
  readFile,
  rename,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { z } from "zod";

const VIDEO_EXTENSIONS = new Set([".mp4", ".webm", ".mov"]);
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DEFAULT_STATE_FILE = ".gem-video-worker/state.json";
const DEFAULT_POLL_INTERVAL_MS = 5_000;
const DEFAULT_STABILITY_DELAY_MS = 1_500;
const DEFAULT_MAX_ATTEMPTS = 12;
const MAX_FILE_SIZE = 1024 * 1024 * 1024;

const configSchema = z.object({
  comfyUiBaseUrl: z.string().url(),
  comfyUiBearerToken: z.string().min(16).optional(),
  comfyUiOutputDir: z.string().min(1),
  gemApiBaseUrl: z.string().url(),
  callbackSecret: z.string().min(32),
  supabaseUrl: z.string().url(),
  supabaseServiceRoleKey: z.string().min(32),
  supabaseBucket: z.string().trim().min(1).max(100).default("media"),
  storagePrefix: z.string().trim().min(1).max(300).default("video-renders"),
  stateFile: z.string().min(1).default(DEFAULT_STATE_FILE),
  pollIntervalMs: z.number().int().min(1_000).max(300_000),
  stabilityDelayMs: z.number().int().min(250).max(30_000),
  maxAttempts: z.number().int().min(1).max(100),
  historyLimit: z.number().int().min(1).max(1_000),
  workerId: z.string().uuid(),
});

export type VideoWorkerConfig = z.infer<typeof configSchema>;

export type ComfyOutputDescriptor = {
  fileName: string;
  subfolder: string;
  outputType: string;
};

export type CompletedRenderCandidate = {
  renderJobId: string;
  promptId: string;
  output: ComfyOutputDescriptor;
};

export type VerifiedUploadManifest = {
  renderJobId: string;
  promptId: string;
  storageRef: string;
  storagePath: string;
  fileName: string;
  mimeType: "video/mp4" | "video/webm" | "video/quicktime";
  fileSize: number;
  checksumSha256: string;
};

type WorkerItemState = {
  status: "processing" | "uploaded" | "verified" | "failed";
  promptId: string;
  attempts: number;
  nextAttemptAt?: string;
  updatedAt: string;
  lastError?: string;
  manifest?: VerifiedUploadManifest;
};

export type VideoWorkerState = {
  version: 1;
  workerId: string;
  items: Record<string, WorkerItemState>;
};

export type WorkerIterationResult = {
  discovered: number;
  processed: number;
  verified: number;
  skipped: number;
  failed: number;
};

type WorkerDependencies = {
  fetchImpl?: typeof fetch;
  sleep?: (milliseconds: number) => Promise<void>;
  now?: () => Date;
};

function integerFromEnv(
  value: string | undefined,
  fallback: number,
): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeBaseUrl(value: string): string {
  return value.replace(/\/$/, "");
}

function defaultWorkerId(env: NodeJS.ProcessEnv): string {
  const configured = env.VIDEO_RENDER_WORKER_ID?.trim();
  if (configured) return configured;
  return randomUUID();
}

export function loadVideoWorkerConfig(
  env: NodeJS.ProcessEnv = process.env,
): VideoWorkerConfig {
  return configSchema.parse({
    comfyUiBaseUrl: normalizeBaseUrl(env.COMFYUI_BASE_URL?.trim() ?? ""),
    comfyUiBearerToken: env.COMFYUI_BEARER_TOKEN?.trim() || undefined,
    comfyUiOutputDir: env.COMFYUI_OUTPUT_DIR?.trim() ?? "",
    gemApiBaseUrl: normalizeBaseUrl(
      env.GEM_VIDEO_WORKER_API_BASE_URL?.trim() ?? "",
    ),
    callbackSecret: env.VIDEO_RENDER_CALLBACK_SECRET?.trim() ?? "",
    supabaseUrl: normalizeBaseUrl(env.SUPABASE_URL?.trim() ?? ""),
    supabaseServiceRoleKey:
      env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "",
    supabaseBucket: env.VIDEO_RENDER_SUPABASE_BUCKET?.trim() || "media",
    storagePrefix:
      env.VIDEO_RENDER_STORAGE_PREFIX?.trim() || "video-renders",
    stateFile: env.VIDEO_RENDER_WORKER_STATE_FILE?.trim() || DEFAULT_STATE_FILE,
    pollIntervalMs: integerFromEnv(
      env.VIDEO_RENDER_WORKER_POLL_INTERVAL_MS,
      DEFAULT_POLL_INTERVAL_MS,
    ),
    stabilityDelayMs: integerFromEnv(
      env.VIDEO_RENDER_WORKER_STABILITY_DELAY_MS,
      DEFAULT_STABILITY_DELAY_MS,
    ),
    maxAttempts: integerFromEnv(
      env.VIDEO_RENDER_WORKER_MAX_ATTEMPTS,
      DEFAULT_MAX_ATTEMPTS,
    ),
    historyLimit: integerFromEnv(
      env.VIDEO_RENDER_WORKER_HISTORY_LIMIT,
      100,
    ),
    workerId: defaultWorkerId(env),
  });
}

function object(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function completed(entry: Record<string, unknown>): boolean {
  const status = object(entry.status);
  return status.completed === true || status.status_str === "success";
}

function findExactStringKey(
  value: unknown,
  key: string,
  visited = new Set<unknown>(),
): string | undefined {
  if (!value || typeof value !== "object" || visited.has(value)) {
    return undefined;
  }
  visited.add(value);
  if (Array.isArray(value)) {
    for (const entry of value) {
      const found = findExactStringKey(entry, key, visited);
      if (found) return found;
    }
    return undefined;
  }
  const record = value as Record<string, unknown>;
  if (typeof record[key] === "string") return record[key];
  for (const entry of Object.values(record)) {
    const found = findExactStringKey(entry, key, visited);
    if (found) return found;
  }
  return undefined;
}

function outputDescriptors(
  value: unknown,
  descriptors: ComfyOutputDescriptor[] = [],
  visited = new Set<unknown>(),
): ComfyOutputDescriptor[] {
  if (!value || typeof value !== "object" || visited.has(value)) {
    return descriptors;
  }
  visited.add(value);
  if (Array.isArray(value)) {
    for (const entry of value) outputDescriptors(entry, descriptors, visited);
    return descriptors;
  }

  const record = value as Record<string, unknown>;
  if (typeof record.filename === "string") {
    const extension = path.extname(record.filename).toLowerCase();
    if (VIDEO_EXTENSIONS.has(extension)) {
      descriptors.push({
        fileName: path.basename(record.filename),
        subfolder:
          typeof record.subfolder === "string" ? record.subfolder : "",
        outputType: typeof record.type === "string" ? record.type : "output",
      });
    }
  }
  for (const entry of Object.values(record)) {
    outputDescriptors(entry, descriptors, visited);
  }
  return descriptors;
}

function preferredOutput(
  descriptors: ComfyOutputDescriptor[],
): ComfyOutputDescriptor | undefined {
  const priority = new Map([
    [".mp4", 0],
    [".webm", 1],
    [".mov", 2],
  ]);
  return [...descriptors]
    .filter((descriptor) => descriptor.outputType !== "temp")
    .sort((left, right) => {
      const extensionDifference =
        (priority.get(path.extname(left.fileName).toLowerCase()) ?? 99) -
        (priority.get(path.extname(right.fileName).toLowerCase()) ?? 99);
      if (extensionDifference !== 0) return extensionDifference;
      return `${left.subfolder}/${left.fileName}`.localeCompare(
        `${right.subfolder}/${right.fileName}`,
      );
    })[0];
}

export function discoverCompletedRenderCandidates(
  history: unknown,
): CompletedRenderCandidate[] {
  const candidates: CompletedRenderCandidate[] = [];
  for (const [promptId, rawEntry] of Object.entries(object(history))) {
    const entry = object(rawEntry);
    if (!completed(entry)) continue;
    const renderJobId = findExactStringKey(entry, "gemRenderJobId");
    if (!renderJobId || !UUID_PATTERN.test(renderJobId)) continue;
    const output = preferredOutput(outputDescriptors(entry.outputs));
    if (!output) continue;
    candidates.push({ renderJobId, promptId, output });
  }
  return candidates.sort((left, right) =>
    left.renderJobId.localeCompare(right.renderJobId),
  );
}

export function resolveComfyOutputPath(
  outputRoot: string,
  descriptor: ComfyOutputDescriptor,
): string {
  const root = path.resolve(outputRoot);
  const candidate = path.resolve(
    root,
    descriptor.subfolder || ".",
    descriptor.fileName,
  );
  const relative = path.relative(root, candidate);
  if (
    !relative ||
    relative.startsWith("..") ||
    path.isAbsolute(relative)
  ) {
    throw new Error("VIDEO_WORKER_OUTPUT_PATH_INVALID");
  }
  return candidate;
}

export function mimeTypeForFile(
  fileName: string,
): VerifiedUploadManifest["mimeType"] {
  const extension = path.extname(fileName).toLowerCase();
  if (extension === ".mp4") return "video/mp4";
  if (extension === ".webm") return "video/webm";
  if (extension === ".mov") return "video/quicktime";
  throw new Error("VIDEO_WORKER_OUTPUT_TYPE_UNSUPPORTED");
}

async function waitForStableFile(
  filePath: string,
  delayMs: number,
  sleep: (milliseconds: number) => Promise<void>,
) {
  const first = await stat(filePath);
  if (!first.isFile() || first.size <= 0 || first.size > MAX_FILE_SIZE) {
    throw new Error("VIDEO_WORKER_OUTPUT_FILE_INVALID");
  }
  await sleep(delayMs);
  const second = await stat(filePath);
  if (
    !second.isFile() ||
    second.size !== first.size ||
    second.mtimeMs !== first.mtimeMs
  ) {
    throw new Error("VIDEO_WORKER_OUTPUT_FILE_NOT_STABLE");
  }
  return second;
}

export async function sha256File(filePath: string): Promise<string> {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(filePath)) {
    hash.update(chunk as Buffer);
  }
  return hash.digest("hex");
}

function safeStorageSegment(value: string): string {
  const normalized = value
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);
  if (!normalized || normalized === "." || normalized === "..") {
    throw new Error("VIDEO_WORKER_STORAGE_PATH_INVALID");
  }
  return normalized;
}

function encodeStoragePath(value: string): string {
  return value
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function publicStorageUrl(
  config: VideoWorkerConfig,
  storagePath: string,
): string {
  return `${config.supabaseUrl}/storage/v1/object/public/${encodeURIComponent(
    config.supabaseBucket,
  )}/${encodeStoragePath(storagePath)}`;
}

async function uploadToSupabase(
  config: VideoWorkerConfig,
  manifest: Omit<VerifiedUploadManifest, "storageRef" | "storagePath">,
  filePath: string,
  fetchImpl: typeof fetch,
): Promise<VerifiedUploadManifest> {
  const fileName = safeStorageSegment(manifest.fileName);
  const prefix = config.storagePrefix
    .split("/")
    .map(safeStorageSegment)
    .join("/");
  const storagePath = `${prefix}/${manifest.renderJobId}/${manifest.checksumSha256.slice(
    0,
    16,
  )}-${fileName}`;
  const endpoint = `${config.supabaseUrl}/storage/v1/object/${encodeURIComponent(
    config.supabaseBucket,
  )}/${encodeStoragePath(storagePath)}`;
  const stream = Readable.toWeb(createReadStream(filePath)) as ReadableStream;
  const response = await fetchImpl(endpoint, {
    method: "POST",
    headers: {
      apikey: config.supabaseServiceRoleKey,
      Authorization: `Bearer ${config.supabaseServiceRoleKey}`,
      "Content-Type": manifest.mimeType,
      "Content-Length": String(manifest.fileSize),
      "x-upsert": "false",
      "x-client-info": "gem-video-render-worker/1.0",
    },
    body: stream,
    duplex: "half",
  } as RequestInit & { duplex: "half" });

  if (!response.ok && response.status !== 409) {
    const detail = (await response.text()).slice(0, 500);
    throw new Error(
      `VIDEO_WORKER_UPLOAD_FAILED:${response.status}:${detail || "unknown"}`,
    );
  }

  const storageRef = publicStorageUrl(config, storagePath);
  const head = await fetchImpl(storageRef, {
    method: "HEAD",
    cache: "no-store",
  });
  if (!head.ok) {
    throw new Error(`VIDEO_WORKER_UPLOAD_HEAD_FAILED:${head.status}`);
  }
  const uploadedLength = Number(head.headers.get("content-length"));
  const uploadedType = head.headers.get("content-type")?.split(";")[0]?.trim();
  if (uploadedLength !== manifest.fileSize) {
    throw new Error("VIDEO_WORKER_UPLOAD_SIZE_MISMATCH");
  }
  if (uploadedType !== manifest.mimeType) {
    throw new Error("VIDEO_WORKER_UPLOAD_TYPE_MISMATCH");
  }

  return {
    ...manifest,
    storagePath,
    storageRef,
  };
}

async function verifyWithGem(
  config: VideoWorkerConfig,
  manifest: VerifiedUploadManifest,
  fetchImpl: typeof fetch,
) {
  const response = await fetchImpl(
    `${config.gemApiBaseUrl}/api/video/uploads/verify`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.callbackSecret}`,
        "Content-Type": "application/json",
        "X-Correlation-ID": `video-worker:${config.workerId}:${manifest.renderJobId}`,
        "X-GEM-Video-Worker-ID": config.workerId,
      },
      body: JSON.stringify({
        renderJobId: manifest.renderJobId,
        storageRef: manifest.storageRef,
        fileName: manifest.fileName,
        mimeType: manifest.mimeType,
        fileSize: manifest.fileSize,
        checksumSha256: manifest.checksumSha256,
      }),
    },
  );
  const text = await response.text();
  if (!response.ok) {
    throw new Error(
      `VIDEO_WORKER_CALLBACK_FAILED:${response.status}:${text.slice(0, 500)}`,
    );
  }
  return text ? (JSON.parse(text) as unknown) : null;
}

export async function loadVideoWorkerState(
  config: VideoWorkerConfig,
): Promise<VideoWorkerState> {
  try {
    const raw = await readFile(config.stateFile, "utf8");
    const parsed = JSON.parse(raw) as VideoWorkerState;
    if (parsed.version !== 1 || typeof parsed.items !== "object") {
      throw new Error("VIDEO_WORKER_STATE_INVALID");
    }
    return {
      ...parsed,
      workerId: config.workerId,
    };
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return { version: 1, workerId: config.workerId, items: {} };
    }
    throw error;
  }
}

export async function saveVideoWorkerState(
  config: VideoWorkerConfig,
  state: VideoWorkerState,
) {
  const directory = path.dirname(config.stateFile);
  await mkdir(directory, { recursive: true });
  const temporary = `${config.stateFile}.${process.pid}.tmp`;
  await writeFile(
    temporary,
    `${JSON.stringify(state, null, 2)}\n`,
    { mode: 0o600 },
  );
  await rename(temporary, config.stateFile);
}

async function fetchComfyHistory(
  config: VideoWorkerConfig,
  fetchImpl: typeof fetch,
) {
  const response = await fetchImpl(
    `${config.comfyUiBaseUrl}/history?max_items=${config.historyLimit}`,
    {
      cache: "no-store",
      headers: config.comfyUiBearerToken
        ? { Authorization: `Bearer ${config.comfyUiBearerToken}` }
        : undefined,
    },
  );
  if (!response.ok) {
    throw new Error(`VIDEO_WORKER_HISTORY_FAILED:${response.status}`);
  }
  return response.json() as Promise<unknown>;
}

function nextAttemptDate(
  attempts: number,
  now: Date,
): Date {
  const delaySeconds = Math.min(15 * 60, 2 ** Math.min(attempts, 9));
  return new Date(now.getTime() + delaySeconds * 1_000);
}

function due(item: WorkerItemState | undefined, now: Date): boolean {
  if (!item) return true;
  if (item.status === "verified") return false;
  if (!item.nextAttemptAt) return true;
  return new Date(item.nextAttemptAt).getTime() <= now.getTime();
}

function truncateError(error: unknown): string {
  return (error instanceof Error ? error.message : String(error)).slice(0, 1_000);
}

async function processCandidate(
  config: VideoWorkerConfig,
  candidate: CompletedRenderCandidate,
  state: VideoWorkerState,
  dependencies: Required<WorkerDependencies>,
): Promise<"verified" | "skipped" | "failed"> {
  const existing = state.items[candidate.renderJobId];
  const now = dependencies.now();
  if (!due(existing, now)) return "skipped";
  if ((existing?.attempts ?? 0) >= config.maxAttempts) return "failed";

  const attempts = (existing?.attempts ?? 0) + 1;
  state.items[candidate.renderJobId] = {
    ...existing,
    status: "processing",
    promptId: candidate.promptId,
    attempts,
    updatedAt: now.toISOString(),
    nextAttemptAt: undefined,
    lastError: undefined,
  };
  await saveVideoWorkerState(config, state);

  try {
    let manifest = existing?.manifest;
    if (!manifest) {
      const filePath = resolveComfyOutputPath(
        config.comfyUiOutputDir,
        candidate.output,
      );
      const file = await waitForStableFile(
        filePath,
        config.stabilityDelayMs,
        dependencies.sleep,
      );
      const checksumSha256 = await sha256File(filePath);
      manifest = await uploadToSupabase(
        config,
        {
          renderJobId: candidate.renderJobId,
          promptId: candidate.promptId,
          fileName: candidate.output.fileName,
          mimeType: mimeTypeForFile(candidate.output.fileName),
          fileSize: file.size,
          checksumSha256,
        },
        filePath,
        dependencies.fetchImpl,
      );
      state.items[candidate.renderJobId] = {
        status: "uploaded",
        promptId: candidate.promptId,
        attempts,
        updatedAt: dependencies.now().toISOString(),
        manifest,
      };
      await saveVideoWorkerState(config, state);
    }

    await verifyWithGem(config, manifest, dependencies.fetchImpl);
    state.items[candidate.renderJobId] = {
      status: "verified",
      promptId: candidate.promptId,
      attempts,
      updatedAt: dependencies.now().toISOString(),
      manifest,
    };
    await saveVideoWorkerState(config, state);
    return "verified";
  } catch (error) {
    state.items[candidate.renderJobId] = {
      ...state.items[candidate.renderJobId],
      status: "failed",
      promptId: candidate.promptId,
      attempts,
      updatedAt: dependencies.now().toISOString(),
      nextAttemptAt: nextAttemptDate(attempts, dependencies.now()).toISOString(),
      lastError: truncateError(error),
    };
    await saveVideoWorkerState(config, state);
    return "failed";
  }
}

export async function runVideoWorkerIteration(
  config: VideoWorkerConfig,
  dependencies: WorkerDependencies = {},
): Promise<WorkerIterationResult> {
  const required: Required<WorkerDependencies> = {
    fetchImpl: dependencies.fetchImpl ?? fetch,
    sleep:
      dependencies.sleep ??
      ((milliseconds) =>
        new Promise((resolve) => setTimeout(resolve, milliseconds))),
    now: dependencies.now ?? (() => new Date()),
  };
  const state = await loadVideoWorkerState(config);
  const history = await fetchComfyHistory(config, required.fetchImpl);
  const candidates = discoverCompletedRenderCandidates(history);
  const result: WorkerIterationResult = {
    discovered: candidates.length,
    processed: 0,
    verified: 0,
    skipped: 0,
    failed: 0,
  };

  for (const candidate of candidates) {
    const outcome = await processCandidate(
      config,
      candidate,
      state,
      required,
    );
    if (outcome === "skipped") {
      result.skipped += 1;
      continue;
    }
    result.processed += 1;
    if (outcome === "verified") result.verified += 1;
    else result.failed += 1;
  }
  return result;
}

export async function videoWorkerDoctor(
  config: VideoWorkerConfig,
  fetchImpl: typeof fetch = fetch,
) {
  const output = await stat(config.comfyUiOutputDir);
  if (!output.isDirectory()) {
    throw new Error("VIDEO_WORKER_OUTPUT_DIR_INVALID");
  }
  const response = await fetchImpl(`${config.comfyUiBaseUrl}/system_stats`, {
    cache: "no-store",
    headers: config.comfyUiBearerToken
      ? { Authorization: `Bearer ${config.comfyUiBearerToken}` }
      : undefined,
  });
  if (!response.ok) {
    throw new Error(`VIDEO_WORKER_COMFYUI_UNREACHABLE:${response.status}`);
  }
  return {
    ok: true,
    workerId: config.workerId,
    outputDirectoryReady: true,
    comfyUiReachable: true,
    gemApiOrigin: new URL(config.gemApiBaseUrl).origin,
    storageOrigin: new URL(config.supabaseUrl).origin,
    bucket: config.supabaseBucket,
  };
}
