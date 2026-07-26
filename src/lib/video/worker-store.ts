import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { TokMetricError } from "@/lib/tokmetric/security";
import type { VideoRenderJobState } from "@/lib/video/store";

export type WorkerVideoJob = {
  id: string;
  workspaceId: string;
  contentId: string;
  contentVersionId: string;
  externalPromptId: string;
  state: VideoRenderJobState;
  createdAt: Date;
  updatedAt: Date;
};

type WorkerVideoJobRow = WorkerVideoJob;

function isMissingStore(error: unknown) {
  if (!(error instanceof Error)) return false;
  const text = `${error.name} ${error.message}`.toLowerCase();
  return (
    (text.includes("video_render_jobs") || text.includes("video_render_uploads")) &&
    (text.includes("does not exist") ||
      text.includes("42p01") ||
      text.includes("p2010"))
  );
}

export async function listWorkerVideoJobs(limit = 10) {
  const boundedLimit = Math.min(Math.max(limit, 1), 50);
  try {
    return await db.$queryRaw<WorkerVideoJobRow[]>(Prisma.sql`
      SELECT
        jobs.id,
        jobs.workspace_id AS "workspaceId",
        jobs.content_id AS "contentId",
        jobs.content_version_id AS "contentVersionId",
        jobs.external_prompt_id AS "externalPromptId",
        jobs.state,
        jobs.created_at AS "createdAt",
        jobs.updated_at AS "updatedAt"
      FROM video_render_jobs jobs
      LEFT JOIN video_render_uploads uploads
        ON uploads.render_job_id = jobs.id
      WHERE jobs.external_prompt_id IS NOT NULL
        AND jobs.state IN ('QUEUED', 'RUNNING', 'COMPLETED')
        AND uploads.id IS NULL
      ORDER BY jobs.created_at ASC
      LIMIT ${boundedLimit}
    `);
  } catch (error) {
    if (isMissingStore(error)) {
      throw new TokMetricError(
        503,
        "VIDEO_RENDER_STORE_NOT_PROVISIONED",
        "The durable video render store has not been provisioned.",
      );
    }
    throw error;
  }
}
