import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("trusted video worker reliability contract", () => {
  it("quarantines legacy empty dispatch rows and provisions bounded finalization retries", () => {
    const migration = source(
      "prisma/migrations/20260726062000_video_worker_dispatch/migration.sql",
    );
    expect(migration).toContain("VIDEO_RENDER_LEGACY_DISPATCH_QUARANTINED");
    expect(migration).toContain("finalization_attempt_count");
    expect(migration).toContain("finalization_next_attempt_at");
    expect(migration).toContain(
      "video_render_jobs_finalization_attempt_count_check",
    );
  });

  it("makes prompt completion idempotent and serializes required evidence", () => {
    const reliability = source("src/lib/video/worker-reliability.ts");
    const route = source(
      "src/app/api/video/worker/dispatch/[renderJobId]/complete/route.ts",
    );
    expect(reliability).toContain("bindWorkerPromptIdempotently");
    expect(reliability).toContain("external_prompt_id = ${input.promptId}");
    expect(reliability).toContain("FOR UPDATE");
    expect(reliability).toContain("ensureWorkerQueuedEvidence");
    expect(route).toContain("bindWorkerPromptIdempotently");
    expect(route).toContain("ensureWorkerQueuedEvidence");
  });

  it("reauthorizes the original actor and bounds automatic finalization failures", () => {
    const reliability = source("src/lib/video/worker-reliability.ts");
    const route = source("src/app/api/video/worker/finalize/route.ts");
    expect(reliability).toContain("VIDEO_FINALIZATION_PERMISSION_DENIED");
    expect(reliability).toContain("VIDEO_FINALIZATION_WORKSPACE_FORBIDDEN");
    expect(reliability).toContain("finalization_attempt_count + 1");
    expect(reliability).toContain("finalizeTrustedWorkerContentRender");
    expect(route).toContain("finalizeVerifiedWorkerRendersReliably");
    expect(route).not.toContain("finalizeVerifiedWorkerRenders }");
  });

  it("creates a fresh idempotency generation after a failed campaign render", () => {
    const campaign = source("src/lib/video/campaign-rendering.ts");
    expect(campaign).toContain("latestVideoRenderJobForContent");
    expect(campaign).toContain('latestRender.state === "FAILED"');
    expect(campaign).toContain("retryGeneration");
  });

  it("reports running and terminal render status back to the durable GEM job", () => {
    const worker = source("scripts/video-render-worker.ts");
    const runtimeIndex = source("src/lib/video/worker-runtime/index.ts");
    expect(worker).toContain("reportWorkerRenderStatus");
    expect(worker).toContain('state: "RUNNING"');
    expect(worker).toContain('state: "FAILED"');
    expect(runtimeIndex).toContain("reportWorkerRenderStatus");
  });
});
