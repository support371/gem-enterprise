import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  correlationId,
  parseJson,
  requirePermission,
  requireTokMetricSession,
  requireWorkspaceAccess,
  tokMetricErrorResponse,
} from "@/lib/tokmetric/security";
import {
  initializeVideoPublish,
  type InitializeVideoPublishInput,
} from "@/lib/tokmetric/publishing/service";

const fileSchema = z.object({
  name: z.string().min(1).max(255),
  mimeType: z.enum(["video/mp4", "video/quicktime", "video/webm"]),
  size: z.number().int().positive().max(4 * 1024 * 1024 * 1024),
  durationSec: z.number().positive().max(600).optional(),
});

const schema = z.object({
  workspaceId: z.string().min(1),
  contentId: z.string().min(1),
  connectorId: z.string().min(1),
  title: z.string().max(2200),
  privacyLevel: z.enum(["PUBLIC_TO_EVERYONE", "MUTUAL_FOLLOW_FRIENDS", "FOLLOWER_OF_CREATOR", "SELF_ONLY"]),
  disableComment: z.boolean(),
  disableDuet: z.boolean(),
  disableStitch: z.boolean(),
  videoCoverTimestampMs: z.number().int().nonnegative().optional(),
  brandContentToggle: z.boolean(),
  brandOrganicToggle: z.boolean(),
  isAigc: z.boolean(),
  source: z.enum(["FILE_UPLOAD", "PULL_FROM_URL"]),
  file: fileSchema.optional(),
  videoUrl: z.string().url().max(2048).optional(),
  consentToUpload: z.literal(true),
  rightsConfirmed: z.literal(true),
  musicRightsConfirmed: z.literal(true),
  processingNoticeAccepted: z.literal(true),
});

export async function POST(request: NextRequest) {
  const cid = correlationId(request);
  try {
    const session = await requireTokMetricSession(request);
    const body = await parseJson(request, schema);
    const membership = await requireWorkspaceAccess(body.workspaceId, session);
    requirePermission(membership, "publish", "content");
    const idempotencyKey = request.headers.get("idempotency-key");
    if (!idempotencyKey || idempotencyKey.length > 200) {
      return NextResponse.json(
        { ok: false, error: { code: "IDEMPOTENCY_KEY_REQUIRED", message: "A valid Idempotency-Key header is required.", correlationId: cid } },
        { status: 400 },
      );
    }

    const input: InitializeVideoPublishInput = {
      workspaceId: body.workspaceId,
      contentId: body.contentId,
      connectorId: body.connectorId,
      actorId: session.userId,
      correlationId: cid,
      idempotencyKey,
      title: body.title,
      privacyLevel: body.privacyLevel,
      disableComment: body.disableComment,
      disableDuet: body.disableDuet,
      disableStitch: body.disableStitch,
      videoCoverTimestampMs: body.videoCoverTimestampMs,
      brandContentToggle: body.brandContentToggle,
      brandOrganicToggle: body.brandOrganicToggle,
      isAigc: body.isAigc,
      source: body.source,
      file: body.file as InitializeVideoPublishInput["file"],
      videoUrl: body.videoUrl,
      consentToUpload: true,
      rightsConfirmed: true,
      musicRightsConfirmed: true,
      processingNoticeAccepted: true,
    };

    const result = await initializeVideoPublish(input);
    return NextResponse.json({ ok: true, correlationId: cid, data: result }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return tokMetricErrorResponse(error, cid);
  }
}
