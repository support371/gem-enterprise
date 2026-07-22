import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest, type SessionPayload } from "@/lib/auth";
import {
  correlationId,
  emitTokMetricAudit,
  enforceEmergencyLocks,
  requirePermission,
  requireWorkspaceAccess,
  TokMetricError,
  tokMetricErrorResponse,
} from "@/lib/tokmetric/security";
import {
  getSocialOAuthProviderConfig,
  parseSocialOAuthProvider,
  validateSocialOAuthProviderConfig,
} from "@/lib/social-media/oauth/config";
import { exchangeSocialAuthorizationCode } from "@/lib/social-media/oauth/client";
import { decodeSocialOAuthState } from "@/lib/social-media/oauth/state";
import {
  consumeSocialOAuthAuthorizationAttempt,
  persistSocialConnector,
} from "@/lib/social-media/oauth/store";

async function sessionFromStateActor(request: NextRequest, actorId: string): Promise<SessionPayload> {
  const session = await getSessionFromRequest(request);
  if (!session || session.userId !== actorId) {
    throw new TokMetricError(
      401,
      "UNAUTHENTICATED",
      "Social OAuth callback requires the initiating authenticated session.",
    );
  }
  return session;
}

function safeCallbackRedirect(request: NextRequest, redirectAfter: string, provider: string, state: string) {
  const redirect = new URL(redirectAfter, request.url);
  redirect.searchParams.set("provider", provider);
  redirect.searchParams.set("connectionState", state);
  return redirect;
}

type RouteContext = { params: Promise<{ provider: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const cid = correlationId(request);
  let workspaceId: string | undefined;
  let actorId: string | undefined;
  let providerForAudit: string | undefined;

  try {
    const { provider: rawProvider } = await context.params;
    const provider = parseSocialOAuthProvider(rawProvider);
    providerForAudit = provider;
    const denied = request.nextUrl.searchParams.get("error");
    if (denied) {
      throw new TokMetricError(
        400,
        "SOCIAL_AUTHORIZATION_DENIED",
        `${getSocialOAuthProviderConfig(provider).displayName} authorization was not completed.`,
      );
    }
    const code = request.nextUrl.searchParams.get("code");
    if (!code) {
      throw new TokMetricError(
        400,
        "MISSING_AUTHORIZATION_CODE",
        "Social OAuth callback did not include an authorization code.",
      );
    }
    const stateValue = request.nextUrl.searchParams.get("state");
    if (!stateValue) {
      throw new TokMetricError(401, "SOCIAL_OAUTH_STATE_MISSING", "Social OAuth state is missing.");
    }

    const state = decodeSocialOAuthState(stateValue);
    if (state.provider !== provider) {
      throw new TokMetricError(
        401,
        "SOCIAL_OAUTH_PROVIDER_MISMATCH",
        "Social OAuth callback provider does not match the authorization request.",
      );
    }
    workspaceId = state.workspaceId;
    actorId = state.actorId;
    const session = await sessionFromStateActor(request, state.actorId);
    const membership = await requireWorkspaceAccess(state.workspaceId, session);
    requirePermission(membership, "manage", "connectors");
    await enforceEmergencyLocks(state.workspaceId, "connector");
    const consumed = await consumeSocialOAuthAuthorizationAttempt(state);

    const { config, missing, ok } = validateSocialOAuthProviderConfig(provider);
    if (!ok || consumed.attempt.redirectUri !== config.redirectUri) {
      throw new TokMetricError(
        503,
        "SOCIAL_OAUTH_CONFIGURATION_CHANGED",
        `${config.displayName} OAuth configuration changed before authorization completed: ${missing.join(", ")}`,
      );
    }

    const exchanged = await exchangeSocialAuthorizationCode({
      config,
      code,
      codeVerifier: consumed.codeVerifier,
      requestedScopes: consumed.attempt.requestedScopes,
    });
    const connector = await persistSocialConnector({
      workspaceId: state.workspaceId,
      provider,
      displayName: config.displayName,
      credential: exchanged.credential,
      safeMetadata: exchanged.safeMetadata,
    });

    await emitTokMetricAudit({
      workspaceId: state.workspaceId,
      actorId: session.userId,
      action: "social.connector.authorized",
      entityType: "connector",
      entityId: connector.id,
      correlationId: cid,
      outcome: "success",
      sourceChannel: "website",
      metadata: {
        provider,
        grantedScopeCount: exchanged.credential.grantedScopes.length,
        externalAccountIdPresent: Boolean(exchanged.credential.externalAccountId),
        externalPublishingEnabled: false,
      },
    });

    const response = NextResponse.redirect(
      safeCallbackRedirect(request, consumed.attempt.redirectAfter, provider, "connected"),
    );
    response.headers.set("Cache-Control", "no-store, max-age=0");
    response.headers.set("Pragma", "no-cache");
    return response;
  } catch (error) {
    if (workspaceId) {
      await emitTokMetricAudit({
        workspaceId,
        actorId,
        action: "social.connector.authorization_failed",
        entityType: "connector",
        correlationId: cid,
        outcome: "failure",
        sourceChannel: "website",
        metadata: { provider: providerForAudit, externalPublishingEnabled: false },
      }).catch(() => undefined);
    }
    return tokMetricErrorResponse(error, cid);
  }
}
