import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  correlationId,
  requireActiveTokMetricSession,
  requireWorkspaceAccess,
  TokMetricError,
  tokMetricErrorResponse,
} from "@/lib/tokmetric/security";

const querySchema = z.object({
  workspaceId: z.string().trim().min(1),
  limit: z.coerce.number().int().min(1).max(100).default(30),
});

const VIDEO_MIME_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

export async function GET(request: NextRequest) {
  const cid = correlationId(request);

  try {
    const session = await requireActiveTokMetricSession(request);
    const parsed = querySchema.safeParse({
      workspaceId: request.nextUrl.searchParams.get("workspaceId"),
      limit: request.nextUrl.searchParams.get("limit") ?? undefined,
    });
    if (!parsed.success) {
      throw new TokMetricError(400, "VALIDATION_ERROR", "A valid workspaceId and limit from 1 to 100 are required.");
    }

    const { workspaceId, limit } = parsed.data;
    await requireWorkspaceAccess(workspaceId, session);

    const contents = await db.content.findMany({
      where: { workspaceId, currentVersionId: { not: null } },
      orderBy: { updatedAt: "desc" },
      take: Math.min(limit * 4, 400),
      select: { id: true, title: true, state: true, currentVersionId: true },
    });
    const versionIds = contents.flatMap((content) => content.currentVersionId ? [content.currentVersionId] : []);
    const versions = versionIds.length
      ? await db.contentVersion.findMany({
          where: { id: { in: versionIds } },
          select: { id: true, contentId: true, version: true, objectHash: true, mediaAssetIds: true },
        })
      : [];
    const assetIds = [...new Set(versions.flatMap((version) => version.mediaAssetIds))];
    const contentIds = contents.map((content) => content.id);

    const [assets, reviews, approvals] = await Promise.all([
      assetIds.length
        ? db.mediaAsset.findMany({
            where: {
              workspaceId,
              id: { in: assetIds },
              mimeType: { in: VIDEO_MIME_TYPES },
            },
            select: {
              id: true,
              fileName: true,
              mimeType: true,
              fileSize: true,
              checksum: true,
              storageRef: true,
              createdAt: true,
            },
          })
        : Promise.resolve([]),
      versionIds.length
        ? db.complianceReview.findMany({
            where: { workspaceId, contentVersionId: { in: versionIds } },
            orderBy: { createdAt: "desc" },
            select: { id: true, contentVersionId: true, result: true },
          })
        : Promise.resolve([]),
      versionIds.length
        ? db.approvalRequest.findMany({
            where: {
              workspaceId,
              contentId: { in: contentIds },
              contentVersionId: { in: versionIds },
            },
            orderBy: { createdAt: "desc" },
            select: { id: true, contentVersionId: true, objectHash: true, state: true },
          })
        : Promise.resolve([]),
    ]);

    const versionById = new Map(versions.map((version) => [version.id, version]));
    const assetById = new Map(assets.map((asset) => [asset.id, asset]));
    const latestReviewByVersion = new Map<string, (typeof reviews)[number]>();
    const latestApprovalByVersion = new Map<string, (typeof approvals)[number]>();
    for (const review of reviews) {
      if (review.contentVersionId && !latestReviewByVersion.has(review.contentVersionId)) {
        latestReviewByVersion.set(review.contentVersionId, review);
      }
    }
    for (const approval of approvals) {
      if (approval.contentVersionId && !latestApprovalByVersion.has(approval.contentVersionId)) {
        latestApprovalByVersion.set(approval.contentVersionId, approval);
      }
    }

    const items = contents.flatMap((content) => {
      if (!content.currentVersionId) return [];
      const version = versionById.get(content.currentVersionId);
      if (!version) return [];
      const asset = version.mediaAssetIds.map((id) => assetById.get(id)).find(Boolean);
      if (!asset) return [];
      const review = latestReviewByVersion.get(version.id);
      const candidateApproval = latestApprovalByVersion.get(version.id);
      const approval = candidateApproval?.objectHash === version.objectHash ? candidateApproval : null;

      return [{
        content: { id: content.id, title: content.title, state: content.state },
        version: { id: version.id, number: version.version, objectHash: version.objectHash },
        asset,
        governance: {
          complianceReviewId: review?.id ?? null,
          complianceResult: review?.result ?? null,
          approvalRequestId: approval?.id ?? null,
          approvalState: approval?.state ?? null,
          externalPublicationTaken: false as const,
        },
      }];
    }).slice(0, limit);

    return NextResponse.json(
      {
        ok: true,
        correlationId: cid,
        workspaceId,
        items,
        externalActionTaken: false,
        externalPublicationTaken: false,
      },
      { headers: { "Cache-Control": "private, no-store, max-age=0" } },
    );
  } catch (error) {
    return tokMetricErrorResponse(error, cid);
  }
}
