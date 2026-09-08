import { NextRequest, NextResponse } from "next/server";
import { correlationId, emitTokMetricAudit, requireWorkspaceAccess, TokMetricError, tokMetricErrorResponse } from "@/lib/tokmetric/security";
import { verifySession, type SessionPayload } from "@/lib/auth";
import { decodeOAuthState } from "@/lib/tokmetric/oauth/state";
import { consumeTikTokShopAuthorizationAttempt } from "@/lib/tokmetric/oauth/attempts";
import { exchangeTikTokShopAuthorizationCode } from "@/lib/tokmetric/shop/client";
import { persistTikTokShopSellerConnector } from "@/lib/tokmetric/shop/connectors";

async function sessionFromStateActor(request: NextRequest, actorId: string): Promise<SessionPayload> {
  const cookie = request.cookies.get("gem_session")?.value;
  const session = cookie ? await verifySession(cookie) : null;
  if (!session || session.userId !== actorId) throw new TokMetricError(401, "UNAUTHENTICATED", "TikTok Shop callback requires the initiating session.");
  return session;
}

export async function GET(request: NextRequest) {
  const cid = correlationId(request);
  let workspaceId: string | undefined;
  let actorId: string | undefined;
  try {
    if (request.nextUrl.searchParams.get("error")) throw new TokMetricError(400, "TIKTOK_SHOP_AUTHORIZATION_DENIED", "TikTok Shop authorization was not completed.");
    const authCode = request.nextUrl.searchParams.get("auth_code") || request.nextUrl.searchParams.get("code");
    const stateValue = request.nextUrl.searchParams.get("state");
    if (!authCode) throw new TokMetricError(400, "MISSING_AUTHORIZATION_CODE", "TikTok Shop callback did not include an authorization code.");
    if (!stateValue) throw new TokMetricError(401, "OAUTH_STATE_MISSING", "OAuth state is missing.");
    const state = decodeOAuthState(stateValue);
    workspaceId = state.workspaceId;
    actorId = state.actorId;
    const session = await sessionFromStateActor(request, state.actorId);
    await requireWorkspaceAccess(state.workspaceId, session);
    await consumeTikTokShopAuthorizationAttempt(state);
    const token = await exchangeTikTokShopAuthorizationCode(authCode);
    const connector = await persistTikTokShopSellerConnector({ workspaceId: state.workspaceId, actorId: session.userId, token, correlationId: cid });
    return NextResponse.redirect(new URL(`/tokmetric/accounts?shopConnector=${connector.id}&state=connected`, request.url));
  } catch (error) {
    if (workspaceId) await emitTokMetricAudit({ workspaceId, actorId, action: "tokmetric.shop.authorization_failed", entityType: "connector", correlationId: cid, outcome: "failure", sourceChannel: "website" }).catch(() => undefined);
    return tokMetricErrorResponse(error, cid);
  }
}
