import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  correlationId,
  requireActiveTokMetricSession,
  requireWorkspaceAccess,
  TokMetricError,
  tokMetricErrorResponse,
} from "@/lib/tokmetric/security";

const VIDEO_MIME_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

type RouteContext = { params: Promise<{ contentId: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const cid = correlationId(request);

  try {
    const session = await requireActiveTokMetricSession(request);
    const workspaceId = request.nextUrl.searchParams.get("workspaceId")?.trim();
    if (!workspaceId) {
      throw new TokMetricError(400, "VALIDATION_ERROR", "workspaceId is required.");
    }

    await requireWorkspaceAccess(workspaceId, session);
    const { contentId } = await context.params;
    const content = await db.content.findFirst({
      where: { id: contentId, workspaceId },
      select: {
        id: true,
        title: true,
        state: true,
        currentVersionId: true,
      },
    });

    if (!content) {
      throw new TokMetricError(
        404,
        "CONTENT_NOT_FOUND",
        "The requested content item was not found in this workspace.",
      );
    }

    if (!content.currentVersionId) {
      return NextResponse.json(
        {
          ok: true,
          correlationId: cid,
          preview: null,
          reason: "CONTENT_VERSION_MISSING",
          externalActionTaken: false,
          externalPublicationTaken: false,
        },
        { headers: { "Cache-Control": "private, no-store, max-age=0" } },
      );
    }

    const version = await db.contentVersion.findUnique({
      where: { id: content.currentVersionId },
      select: {
        id: true,
        version: true,
        objectHash: true,
        mediaAssetIds: true,
      },
    });

    if (!version) {
      throw new TokMetricError(
        409,
        "CONTENT_VERSION_MISSING",
        "The active content version was not found.",
      );
    }

    const [mediaAssets, review, approval] = await Promise.all([
      version.mediaAssetIds.length
        ? db.mediaAsset.findMany({
            where: {
              workspaceId,
              id: { in: version.mediaAssetIds },
              mimeType: { in: VIDEO_MIME_TYPES },
            },
            select: {
              id: true,
              fileName: true,
              mimeType: true,
              fileSize: true,
              checksum: true,
              storageRef: true,
            },
          })
        : Promise.resolve([]),
      db.complianceReview.findFirst({
        where: {
          workspaceId,
          contentId: content.id,
          contentVersionId: version.id,
        },
        orderBy: { createdAt: "desc" },
        select: { id: true, result: true },
      }),
      db.approvalRequest.findFirst({
        where: {
          workspaceId,
          contentId: content.id,
          contentVersionId: version.id,
          objectHash: version.objectHash,
        },
        orderBy: { createdAt: "desc" },
        select: { id: true, state: true },
      }),
    ]);

    const assetsById = new Map(mediaAssets.map((asset) => [asset.id, asset]));
    const asset = version.mediaAssetIds
      .map((assetId) => assetsById.get(assetId))
      .find((candidate) => Boolean(candidate));

    return NextResponse.json(
      {
        ok: true,
        correlationId: cid,
        preview: asset
          ? {
              content: {
                id: content.id,
                title: content.title,
                state: content.state,
              },
              version: {
                id: version.id,
                number: version.version,
                objectHash: version.objectHash,
              },
              asset,
              governance: {
                complianceReviewId: review?.id ?? null,
                complianceResult: review?.result ?? null,
                approvalRequestId: approval?.id ?? null,
                approvalState: approval?.state ?? null,
                externalPublicationTaken: false,
              },
            }
          : null,
        reason: asset ? null : "VIDEO_ASSET_NOT_AVAILABLE",
        externalActionTaken: false,
        externalPublicationTaken: false,
      },
      { headers: { "Cache-Control": "private, no-store, max-age=0" } },
    );
  } catch (error) {
    return tokMetricErrorResponse(error, cid);
  }
}
