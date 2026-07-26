import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";

const VIDEO_MIME_TYPES = new Map([
  [".mp4", "video/mp4"],
  [".webm", "video/webm"],
  [".mov", "video/quicktime"],
  [".qt", "video/quicktime"],
]);

export function object(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

export function redactUrl(value) {
  try {
    const url = new URL(value);
    return `${url.origin}${url.pathname}`;
  } catch {
    return "invalid-url";
  }
}

export function encodeObjectPath(value) {
  return value
    .split("/")
    .filter(Boolean)
    .map((part) => encodeURIComponent(part))
    .join("/");
}

export function safeSegment(value) {
  return String(value)
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180) || "asset";
}

export function collectOutputFiles(value, results = []) {
  if (Array.isArray(value)) {
    for (const entry of value) collectOutputFiles(entry, results);
    return results;
  }
  if (!value || typeof value !== "object") return results;

  if (typeof value.filename === "string") {
    const extension = path.extname(value.filename).toLowerCase();
    const mimeType = VIDEO_MIME_TYPES.get(extension);
    if (mimeType) {
      results.push({
        fileName: value.filename,
        subfolder: typeof value.subfolder === "string" ? value.subfolder : "",
        outputType: typeof value.type === "string" ? value.type : "output",
        mimeType,
      });
    }
  }
  for (const entry of Object.values(value)) collectOutputFiles(entry, results);
  return results;
}

export function resolveOutputPath(outputDirectory, descriptor) {
  const root = path.resolve(outputDirectory);
  const resolved = path.resolve(root, descriptor.subfolder, descriptor.fileName);
  if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) {
    throw new Error("OUTPUT_PATH_ESCAPE_BLOCKED");
  }
  return resolved;
}

export async function sha256File(filePath) {
  const digest = createHash("sha256");
  await new Promise((resolve, reject) => {
    const stream = createReadStream(filePath);
    stream.on("data", (chunk) => digest.update(chunk));
    stream.on("error", reject);
    stream.on("end", resolve);
  });
  return digest.digest("hex");
}

export async function inspectOutputFile(outputDirectory, descriptor) {
  const filePath = resolveOutputPath(outputDirectory, descriptor);
  const file = await stat(filePath);
  if (!file.isFile()) throw new Error("OUTPUT_NOT_A_FILE");
  if (file.size <= 0 || file.size > 1024 * 1024 * 1024) {
    throw new Error("OUTPUT_SIZE_INVALID");
  }
  return {
    ...descriptor,
    filePath,
    fileSize: file.size,
    checksumSha256: await sha256File(filePath),
  };
}

export function comfyJobState(historyPayload, promptId, queuePayload) {
  const history = object(historyPayload);
  const entry = object(history[promptId]);
  const status = object(entry.status);
  const messages = Array.isArray(status.messages) ? status.messages : [];
  const errorEvent = messages.find(
    (message) => Array.isArray(message) && message[0] === "execution_error",
  );
  const errorDetails = Array.isArray(errorEvent) ? object(errorEvent[1]) : {};

  if (status.status_str === "error" || errorEvent) {
    return {
      state: "FAILED",
      outputManifest: object(entry.outputs),
      errorCode:
        typeof errorDetails.exception_type === "string"
          ? errorDetails.exception_type.slice(0, 100)
          : "COMFYUI_EXECUTION_ERROR",
      errorMessage:
        typeof errorDetails.exception_message === "string"
          ? errorDetails.exception_message.slice(0, 500)
          : "ComfyUI reported a render execution failure.",
    };
  }
  if (status.completed === true || status.status_str === "success") {
    return { state: "COMPLETED", outputManifest: object(entry.outputs) };
  }

  const queue = object(queuePayload);
  const ids = (value) =>
    Array.isArray(value)
      ? value.flatMap((entryValue) =>
          Array.isArray(entryValue) && typeof entryValue[1] === "string"
            ? [entryValue[1]]
            : [],
        )
      : [];
  if (ids(queue.queue_running).includes(promptId)) {
    return { state: "RUNNING", outputManifest: {} };
  }
  return { state: "QUEUED", outputManifest: {} };
}

export function buildStorageObjectPath(job, fileName) {
  return [
    safeSegment(job.workspaceId),
    safeSegment(job.contentId),
    safeSegment(job.renderJobId),
    safeSegment(fileName),
  ].join("/");
}
