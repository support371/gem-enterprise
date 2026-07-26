import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";
import {
  VideoWorkerError,
  type VideoWorkerConfig,
  type VideoWorkerDispatchJournal,
} from "./types";

const journalSchema = z.object({
  renderJobId: z.string().uuid(),
  claimId: z.string().uuid(),
  promptId: z.string().trim().min(1).max(300),
  recordedAt: z.string().datetime(),
});

function journalPath(config: VideoWorkerConfig, renderJobId: string) {
  if (!/^[a-f0-9-]{36}$/i.test(renderJobId)) {
    throw new VideoWorkerError(
      "VIDEO_WORKER_JOURNAL_ID_INVALID",
      "The render job ID cannot be used for worker journal storage.",
      400,
    );
  }
  return join(config.stateDirectory, `${renderJobId}.json`);
}

export async function ensureWorkerStateDirectory(config: VideoWorkerConfig) {
  try {
    await mkdir(config.stateDirectory, { recursive: true, mode: 0o700 });
  } catch {
    throw new VideoWorkerError(
      "VIDEO_WORKER_STATE_DIRECTORY_UNAVAILABLE",
      "The worker state directory could not be created or accessed.",
      503,
    );
  }
}

export async function readDispatchJournal(
  config: VideoWorkerConfig,
  renderJobId: string,
): Promise<VideoWorkerDispatchJournal | null> {
  await ensureWorkerStateDirectory(config);
  try {
    const text = await readFile(journalPath(config, renderJobId), "utf8");
    const parsed = journalSchema.safeParse(JSON.parse(text) as unknown);
    if (!parsed.success) {
      throw new VideoWorkerError(
        "VIDEO_WORKER_JOURNAL_INVALID",
        "A worker dispatch journal entry is invalid.",
        409,
      );
    }
    return parsed.data;
  } catch (error) {
    if (error instanceof VideoWorkerError) throw error;
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return null;
    }
    throw new VideoWorkerError(
      "VIDEO_WORKER_JOURNAL_READ_FAILED",
      "The worker dispatch journal could not be read.",
      503,
    );
  }
}

export async function writeDispatchJournal(
  config: VideoWorkerConfig,
  entry: VideoWorkerDispatchJournal,
) {
  await ensureWorkerStateDirectory(config);
  const parsed = journalSchema.parse(entry);
  const path = journalPath(config, parsed.renderJobId);
  const temporaryPath = `${path}.${process.pid}.${Date.now()}.tmp`;
  try {
    await writeFile(temporaryPath, `${JSON.stringify(parsed)}\n`, {
      encoding: "utf8",
      mode: 0o600,
      flag: "wx",
    });
    await rename(temporaryPath, path);
  } catch {
    await rm(temporaryPath, { force: true }).catch(() => undefined);
    throw new VideoWorkerError(
      "VIDEO_WORKER_JOURNAL_WRITE_FAILED",
      "The accepted provider prompt could not be journaled before callback.",
      503,
    );
  }
  return parsed;
}

export async function deleteDispatchJournal(
  config: VideoWorkerConfig,
  renderJobId: string,
) {
  await rm(journalPath(config, renderJobId), { force: true });
}
