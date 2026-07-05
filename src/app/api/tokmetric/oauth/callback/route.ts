import { NextRequest, NextResponse } from "next/server";
import { correlationId, emitTokMetricAudit, requireWorkspaceAccess, tokMetricErrorResponse, TokMetricError } from "@/lib/tokmetric/security";
import { exchangeAuthorizationCode } from "@/lib/tokmetric/oauth/client";
import { decodeOAuthState } from "@/lib/tokmetric/oauth/state";
import { persistAuthorizedConnector } from "@/lib/tokmetric/oauth/connectors";
import { consumeOAuthAuthorizationAttempt } from "@/lib/tokmetric/oauth/attempts";
import { verifySession, type SessionPayload } from "@/lib/auth";

async function sessionFromStateActor(request: NextRequest, actorId: string): Promise<SessionPayload> {
  const cookie = request.cookies.get("gem_session")?.value;
  const session = cookie ? await verifySession(cookie) : null;
  if (!session || session.userId !== actorId) throw new TokMetricError(401, "UNAUTHENTICATED", "OAuth callback requires the initiating authenticated session.");
  return session;
}

export async function GET(request: NextRequest) {
  const cid = correlationId(request);
  let workspaceId: string | undefined;
  let actorId: string | undefined;
  try {
    const error = request.nextUrl.searchParams.get("error");
    if (error) throw new TokMetricError(400, "TIKTOK_AUTHORIZATION_DENIED", "TikTok authorization was not completed.");
    const code = request.nextUrl.searchParams.get("code");
    if (!code) throw new TokMetricError(400, "MISSING_AUTHORIZATION_CODE", "TikTok callback did not include an authorization code.");
    const stateValue = request.nextUrl.searchParams.get("state");
    if (!stateValue) throw new TokMetricError(401, "OAUTH_STATE_MISSING", "OAuth state is missing.");
    const state = decodeOAuthState(stateValue);
    workspaceId = state.workspaceId;
    actorId = state.actorId;
    const session = await sessionFromStateActor(request, state.actorId);
    await requireWorkspaceAccess(state.workspaceId, session);
    const consumed = await consumeOAuthAuthorizationAttempt(state);
    const token = await exchangeAuthorizationCode({ code, codeVerifier: consumed.codeVerifier });
    const connector = await persistAuthorizedConnector({ workspaceId: state.workspaceId, actorId: session.userId, provider: state.provider, token, correlationId: cid });
    return NextResponse.redirect(new URL(`/tokmetric/accounts?connector=${connector.id}&state=connected`, request.url));
  } catch (error) {
    if (workspaceId) await emitTokMetricAudit({ workspaceId, actorId, action: "tokmetric.connector.authorization_failed", entityType: "connector", correlationId: cid, outcome: "failure", sourceChannel: "website" }).catch(() => undefined);
    return tokMetricErrorResponse(error, cid);
  }
}
