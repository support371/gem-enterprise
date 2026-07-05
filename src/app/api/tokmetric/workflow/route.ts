import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  correlationId,
  parseJson,
  requirePermission,
  requireTokMetricSession,
  requireWorkspaceAccess,
  tokMetricErrorResponse,
  withIdempotency,
} from "@/lib/tokmetric/security";
import {
  createContentDraft,
  createContentVersion,
  decideApproval,
  registerMediaAsset,
  requestContentApproval,
  runComplianceReview,
} from "@/lib/tokmetric/workflow";

const baseSchema = z.object({
  action: z.enum([
    "create_draft",
    "create_version",
    "run_review",
    "request_approval",
    "decide_approval",
    "register_media",
  ]),
  workspaceId: z.string().min(1),
  payload: z.record(z.unknown()),
});

const draftSchema = z.object({
  title: z.string().min(1).max(200),
  campaignId: z.string().min(1).optional(),
  script: z.string().max(10000).optional(),
  caption: z.string().max(2200).optional(),
  hashtags: z.array(z.string().max(100)).max(50).optional(),
  settings: z.record(z.unknown()).optional(),
  mediaAssetIds: z.array(z.string().min(1)).max(20).optional(),
});

const versionSchema = draftSchema.omit({ title: true, campaignId: true }).extend({ contentId: z.string().min(1) });
const reviewSchema = z.object({ contentId: z.string().min(1), policyVersionId: z.string().min(1).optional() });
const approvalRequestSchema = z.object({ contentId: z.string().min(1), requiredRole: z.string().min(1).max(100).optional(), expiresAt: z.string().datetime().optional() });
const approvalDecisionSchema = z.object({ approvalId: z.string().min(1), decision: z.enum(["approve", "reject", "revoke"]), reason: z.string().max(2000).optional() });
const mediaSchema = z.object({ fileName: z.string().min(1).max(255), mimeType: z.string().min(1).max(100), fileSize: z.number().int().positive(), checksum: z.string().min(16).max(256), storageRef: z.string().min(1).max(2000), metadata: z.record(z.unknown()).optional() });

export async function POST(request: NextRequest) {
  const cid = correlationId(request);
  try {
    const session = await requireTokMetricSession(request);
    const input = await parseJson(request, baseSchema);
    const membership = await requireWorkspaceAccess(input.workspaceId, session);
    const idempotencyKey = request.headers.get("idempotency-key") ?? undefined;

    const result = await withIdempotency(
      input.workspaceId,
      idempotencyKey,
      input,
      async () => {
        if (input.action === "create_draft") {
          requirePermission(membership, "create", "content");
          const payload = draftSchema.parse(input.payload);
          return { statusCode: 201, response: await createContentDraft({ workspaceId: input.workspaceId, ...payload }, session.userId, cid) };
        }
        if (input.action === "create_version") {
          requirePermission(membership, "edit", "content");
          const payload = versionSchema.parse(input.payload);
          return { statusCode: 200, response: await createContentVersion(payload.contentId, input.workspaceId, session.userId, cid, payload) };
        }
        if (input.action === "run_review") {
          requirePermission(membership, "review", "content");
          const payload = reviewSchema.parse(input.payload);
          return { statusCode: 200, response: await runComplianceReview({ workspaceId: input.workspaceId, contentId: payload.contentId, policyVersionId: payload.policyVersionId, actorId: session.userId, correlationId: cid }) };
        }
        if (input.action === "request_approval") {
          requirePermission(membership, "request", "approvals");
          const payload = approvalRequestSchema.parse(input.payload);
          return { statusCode: 201, response: await requestContentApproval({ workspaceId: input.workspaceId, contentId: payload.contentId, actorId: session.userId, requiredRole: payload.requiredRole, expiresAt: payload.expiresAt ? new Date(payload.expiresAt) : undefined, correlationId: cid }) };
        }
        if (input.action === "decide_approval") {
          requirePermission(membership, "decide", "approvals");
          const payload = approvalDecisionSchema.parse(input.payload);
          return { statusCode: 200, response: await decideApproval({ workspaceId: input.workspaceId, approvalId: payload.approvalId, actorId: session.userId, decision: payload.decision, reason: payload.reason, correlationId: cid }) };
        }
        requirePermission(membership, "create", "media");
        const payload = mediaSchema.parse(input.payload);
        return { statusCode: 201, response: await registerMediaAsset({ workspaceId: input.workspaceId, actorId: session.userId, ...payload }) };
      },
      { action: input.action, workspaceId: input.workspaceId, payload: input.payload },
    );

    return NextResponse.json({ ok: result.statusCode < 400, correlationId: cid, data: result.response }, { status: result.statusCode });
  } catch (error) {
    return tokMetricErrorResponse(error, cid);
  }
}
