import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { emitTokMetricAudit, TokMetricError } from "@/lib/tokmetric/security";
import { getAuthorizedTikTokCredential } from "@/lib/tokmetric/oauth/connectors";

const TIKTOK_CANCEL_URL = "https://open.tiktokapis.com/v2/post/publish/cancel/";

function sourceFromMetadata(value: Prisma.JsonValue): string | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const source = (value as Record<string, Prisma.JsonValue>)["source"];
  return typeof source === "string" ? source : null;
}

async function cancelTikTokPull(accessToken: string, publishId: string) {
  const response = await fetch(TIKTOK_CANCEL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify({ publish_id: publishId }),
    cache: "no-store",
    signal: AbortSignal.timeout(30_000),
  }).catch(() => {
    throw new TokMetricError(502, "TIKTOK_NETWORK_ERROR", "TikTok could not be reached to cancel the URL download.");
  });

  const payload = await response.json().catch(() => null) as {
    error?: { code?: string; message?: string };
  } | null;
  const code = payload?.error?.code;
  if (!response.ok || code !== "ok") {
    const status = response.status === 401 ? 401 : response.status === 429 ? 429 : 409;
    throw new TokMetricError(
      status,
      `TIKTOK_${(code || "CANCEL_FAILED").toUpperCase()}`,
      payload?.error?.message || "TikTok could not cancel this URL download. It may already be processing or complete.",
    );
  }
}

export async function cancelPullFromUrlPublish(input: {
  workspaceId: string;
  jobId: string;
  actorId: string;
  correlationId: string;
}) {
  const job = await db.publishJob.findFirst({
    where: { id: input.jobId, workspaceId: input.workspaceId },
    include: {
      attempts: {
        orderBy: { attempt: "asc" },
        take: 1,
        select: { safeMetadata: true },
      },
    },
  });
  if (!job?.connectorId || !job.externalRequestId) {
    throw new TokMetricError(404, "PUBLISH_JOB_NOT_FOUND", "Publishing job or TikTok request ID was not found.");
  }

  const source = sourceFromMetadata(job.attempts[0]?.safeMetadata ?? null);
  if (source !== "PULL_FROM_URL") {
    throw new TokMetricError(
      409,
      "PUBLISH_NOT_CANCELLABLE",
      "Only an ongoing PULL_FROM_URL download can be cancelled. Local file uploads and processing posts must be monitored to a final status.",
    );
  }
  if (["COMPLETED", "FAILED", "CANCELLED"].includes(job.internalState)) {
    throw new TokMetricError(409, "PUBLISH_NOT_CANCELLABLE", "This publishing job is already in a final state.");
  }

  const credential = await getAuthorizedTikTokCredential({
    workspaceId: input.workspaceId,
    connectorId: job.connectorId,
    requiredScope: "video.publish",
    actorId: input.actorId,
    correlationId: input.correlationId,
  });
  await cancelTikTokPull(credential.accessToken, job.externalRequestId);

  const updated = await db.publishJob.update({
    where: { id: job.id },
    data: { internalState: "CANCELLED", externalState: "UNKNOWN" },
  });
  const attempt = await db.jobAttempt.count({ where: { publishJobId: job.id } }) + 1;
  await db.jobAttempt.create({
    data: {
      publishJobId: job.id,
      attempt,
      state: "CANCELLED",
      safeMetadata: { event: "pull_from_url_cancel_requested", source },
    },
  });
  await emitTokMetricAudit({
    workspaceId: input.workspaceId,
    actorId: input.actorId,
    action: "tokmetric.tiktok.pull_cancelled",
    entityType: "publish_job",
    entityId: job.id,
    correlationId: input.correlationId,
    outcome: "success",
    sourceChannel: "website",
    metadata: { source },
  });
  return updated;
}
