import { db } from "@/lib/db";
import { queueContentRender } from "@/lib/video/content-rendering";
import { latestVideoRenderJobForContent } from "@/lib/video/store";
import {
  queueContentRenderForWorker,
  videoRenderDispatchMode,
} from "@/lib/video/worker-dispatch";
import { TokMetricError } from "@/lib/tokmetric/security";

export async function queueCampaignVideoRenders(input: {
  workspaceId: string;
  campaignId: string;
  actorId: string;
  correlationId: string;
  limit?: number;
}) {
  const limit = Math.min(Math.max(Math.trunc(input.limit ?? 25), 1), 100);
  const campaign = await db.campaign.findFirst({
    where: { id: input.campaignId, workspaceId: input.workspaceId },
    select: {
      id: true,
      title: true,
      contents: {
        orderBy: { createdAt: "asc" },
        take: limit,
        select: {
          id: true,
          currentVersionId: true,
        },
      },
    },
  });
  if (!campaign) {
    throw new TokMetricError(
      404,
      "CAMPAIGN_NOT_FOUND",
      "The requested campaign was not found in this workspace.",
    );
  }

  const dispatchMode = videoRenderDispatchMode();
  const results: Array<Record<string, unknown>> = [];
  for (const content of campaign.contents) {
    if (!content.currentVersionId) {
      results.push({
        contentId: content.id,
        status: "skipped",
        code: "CONTENT_VERSION_MISSING",
      });
      continue;
    }
    const latestRender = await latestVideoRenderJobForContent({
      workspaceId: input.workspaceId,
      contentId: content.id,
    });
    const retryGeneration =
      latestRender?.contentVersionId === content.currentVersionId &&
      latestRender.state === "FAILED"
        ? latestRender.id
        : null;
    const idempotencyKey = [
      "campaign-video",
      campaign.id,
      content.id,
      content.currentVersionId,
      dispatchMode,
      retryGeneration && `retry-${retryGeneration}`,
    ]
      .filter(Boolean)
      .join(":");
    try {
      const render =
        dispatchMode === "worker"
          ? await queueContentRenderForWorker({
              workspaceId: input.workspaceId,
              contentId: content.id,
              actorId: input.actorId,
              correlationId: input.correlationId,
              idempotencyKey,
            })
          : await queueContentRender({
              workspaceId: input.workspaceId,
              contentId: content.id,
              actorId: input.actorId,
              correlationId: input.correlationId,
              idempotencyKey,
            });
      results.push({
        contentId: content.id,
        status: render.reused ? "reused" : "queued",
        renderJobId: render.renderJobId,
        promptId: render.promptId,
      });
    } catch (error) {
      if (error instanceof TokMetricError) {
        const skipped = new Set([
          "CONTENT_NOT_VIDEO_RENDERABLE",
          "CONTENT_RENDER_IMMUTABLE",
          "VIDEO_RENDER_COMPLIANCE_REQUIRED",
          "CONTENT_VERSION_MISSING",
        ]).has(error.code);
        results.push({
          contentId: content.id,
          status: skipped ? "skipped" : "failed",
          code: error.code,
        });
        continue;
      }
      results.push({
        contentId: content.id,
        status: "failed",
        code: "VIDEO_RENDER_BATCH_ITEM_FAILED",
      });
    }
  }

  return {
    campaignId: campaign.id,
    campaignTitle: campaign.title,
    dispatchMode,
    inspected: campaign.contents.length,
    queued: results.filter((result) => result.status === "queued").length,
    reused: results.filter((result) => result.status === "reused").length,
    skipped: results.filter((result) => result.status === "skipped").length,
    failed: results.filter((result) => result.status === "failed").length,
    results,
    externalPublicationTaken: false,
  };
}
