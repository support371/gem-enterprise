import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  correlationId,
  emitTokMetricAudit,
  enforceEmergencyLocks,
  requirePermission,
  requireTokMetricSession,
  requireWorkspaceAccess,
  TokMetricError,
  tokMetricErrorResponse,
} from "@/lib/tokmetric/security";
import { createOAuthAuthorizationAttempt } from "@/lib/tokmetric/oauth/attempts";
import { encodeOAuthState } from "@/lib/tokmetric/oauth/state";
import { buildTikTokShopAuthorizationUrl } from "@/lib/tokmetric/shop/client";
import { validateTikTokShopConfig } from "@/lib/tokmetric/shop/config";

const querySchema = z.object({ workspaceId: z.string().trim().min(1) });

export async function GET(request: NextRequest) {
  const cid = correlationId(request);
  try {
    if (request.headers.get("sec-fetch-site") === "cross-site") {
      throw new TokMetricError(403, "CROSS_SITE_AUTHORIZATION_BLOCKED", "TikTok Shop authorization must start from TokMetric.");
    }
    const session = await requireTokMetricSession(request);
    const { workspaceId } = querySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const membership = await requireWorkspaceAccess(workspaceId, session);
    requirePermission(membership, "manage", "connectors");
    await enforceEmergencyLocks(workspaceId, "connector");
    const { config, missing, ok } = validateTikTokShopConfig();
    if (!ok) throw new TokMetricError(503, "TIKTOK_SHOP_OAUTH_NOT_CONFIGURED", `TikTok Shop OAuth is not ready: ${missing.join(", ")}`);
    const attempt = await createOAuthAuthorizationAttempt({
      workspaceId,
      actorId: session.userId,
      provider: "TIKTOK_SHOP_SELLER",
      environment: config.environment,
      codeVerifier: "tiktok-shop-no-pkce",
    });
    const state = encodeOAuthState({ nonce: attempt.nonce, workspaceId, actorId: session.userId, provider: "TIKTOK_SHOP_SELLER", environment: config.environment, createdAt: Date.now() });
    await emitTokMetricAudit({ workspaceId, actorId: session.userId, action: "tokmetric.shop.authorization_started", entityType: "connector", correlationId: cid, outcome: "success", sourceChannel: "website", metadata: { provider: "TIKTOK_SHOP_SELLER", externalActionTaken: false } });
    return NextResponse.redirect(buildTikTokShopAuthorizationUrl(state));
  } catch (error) {
    return tokMetricErrorResponse(error, cid);
  }
}
