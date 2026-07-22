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
import {
  parseSocialOAuthProvider,
  validateSocialOAuthProviderConfig,
} from "@/lib/social-media/oauth/config";
import { createSocialNonce, createSocialPkcePair } from "@/lib/social-media/oauth/crypto";
import { buildSocialAuthorizationUrl } from "@/lib/social-media/oauth/client";
import { encodeSocialOAuthState } from "@/lib/social-media/oauth/state";
import { createSocialOAuthAuthorizationAttempt } from "@/lib/social-media/oauth/store";

const querySchema = z.object({
  workspaceId: z.string().trim().min(1),
  redirectAfter: z.string().trim().max(500).optional(),
});

type RouteContext = { params: Promise<{ provider: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const cid = correlationId(request);
  try {
    const session = await requireTokMetricSession(request);
    const { provider: rawProvider } = await context.params;
    const provider = parseSocialOAuthProvider(rawProvider);
    const params = querySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const membership = await requireWorkspaceAccess(params.workspaceId, session);
    requirePermission(membership, "manage", "connectors");
    await enforceEmergencyLocks(params.workspaceId, "connector");

    const { config, missing, ok } = validateSocialOAuthProviderConfig(provider);
    if (!ok) {
      throw new TokMetricError(
        503,
        "SOCIAL_OAUTH_NOT_CONFIGURED",
        `${config.displayName} OAuth is not configured: ${missing.join(", ")}`,
      );
    }

    const pkce = config.usePkce ? createSocialPkcePair() : undefined;
    const nonce = createSocialNonce();
    const attempt = await createSocialOAuthAuthorizationAttempt({
      nonce,
      workspaceId: params.workspaceId,
      actorId: session.userId,
      provider,
      codeVerifier: pkce?.verifier,
      requestedScopes: config.scopes,
      redirectUri: config.redirectUri,
      redirectAfter: params.redirectAfter,
    });
    const state = encodeSocialOAuthState({
      nonce: attempt.nonce,
      workspaceId: params.workspaceId,
      actorId: session.userId,
      provider,
      createdAt: Date.now(),
    });
    const authorizationUrl = buildSocialAuthorizationUrl({
      config,
      state,
      codeChallenge: pkce?.challenge,
    });

    await emitTokMetricAudit({
      workspaceId: params.workspaceId,
      actorId: session.userId,
      action: "social.connector.authorization_started",
      entityType: "connector",
      correlationId: cid,
      outcome: "success",
      sourceChannel: "website",
      metadata: {
        provider,
        scopeCount: config.scopes.length,
        pkce: config.usePkce,
        externalActionTaken: false,
      },
    });
    return NextResponse.redirect(authorizationUrl);
  } catch (error) {
    return tokMetricErrorResponse(error, cid);
  }
}
