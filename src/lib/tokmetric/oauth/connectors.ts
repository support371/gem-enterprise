import { db } from "@/lib/db";
import { TokMetricError, emitTokMetricAudit, enforceEmergencyLocks } from "@/lib/tokmetric/security";
import { decryptCredential, encryptCredential } from "./crypto";
import { getTikTokOAuthConfig, isPlatformApprovalRequired, providerScopes, validateTikTokOAuthConfig, type TokMetricConnectorProvider } from "./config";
import { refreshTikTokToken, revokeTikTokToken, safeTokenMetadata, type TikTokTokenResponse } from "./client";

interface StoredTikTokCredential {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
  refreshExpiresAt?: string;
  environment: "sandbox" | "production";
  provider: TokMetricConnectorProvider;
  grantedScopes: string[];
  externalAccountId?: string;
}

export function connectorDefaults() {
  const { ok, missing, config } = validateTikTokOAuthConfig();
  return (Object.keys(providerScopes) as TokMetricConnectorProvider[]).map((provider) => ({
    provider,
    displayName: providerDisplayName(provider),
    requiredScopes: providerScopes[provider],
    environment: config.environment,
    state: isPlatformApprovalRequired(provider) ? "PLATFORM_APPROVAL_REQUIRED" : ok ? "AUTHORIZATION_REQUIRED" : "NOT_CONFIGURED",
    configurationMissing: isPlatformApprovalRequired(provider) ? [] : missing,
  }));
}

export function providerDisplayName(provider: TokMetricConnectorProvider) {
  return {
    TIKTOK_LOGIN_KIT: "TikTok Organic / Login Kit",
    TIKTOK_DISPLAY_API: "TikTok Display API",
    TIKTOK_CONTENT_POSTING_API: "TikTok Content Posting API",
    TIKTOK_BUSINESS_API: "TikTok Business API",
    TIKTOK_SHOP_SELLER: "TikTok Shop Seller",
    TIKTOK_SHOP_CREATOR: "TikTok Shop Creator/Affiliate",
  }[provider];
}

export async function listWorkspaceConnectors(workspaceId: string) {
  const persisted = await db.connector.findMany({ where: { workspaceId }, include: { credentialReferences: true }, orderBy: { createdAt: "asc" } });
  const defaults = connectorDefaults();
  return defaults.map((item) => {
    const matches = persisted.filter((connector) => connector.provider === item.provider);
    if (matches.length === 0) return { ...item, id: null, accounts: [] };
    return {
      ...item,
      state: matches.some((connector) => connector.state === "CONNECTED") ? "CONNECTED" : matches[0].state,
      accounts: matches.map((connector) => ({
        id: connector.id,
        displayName: connector.displayName,
        state: connector.state,
        externalAccountId: connector.externalAccountId,
        grantedScopes: connector.grantedScopes,
        lastHealthAt: connector.lastHealthAt,
        disabledAt: connector.disabledAt,
      })),
    };
  });
}

export async function persistAuthorizedConnector(input: { workspaceId: string; actorId?: string; provider: TokMetricConnectorProvider; token: TikTokTokenResponse; correlationId: string }) {
  await enforceEmergencyLocks(input.workspaceId, "connector");
  const config = getTikTokOAuthConfig();
  const metadata = safeTokenMetadata(input.token, input.provider, config.environment);
  const encrypted = encryptCredential({
    accessToken: input.token.access_token,
    refreshToken: input.token.refresh_token,
    expiresAt: input.token.expires_in ? new Date(Date.now() + input.token.expires_in * 1000).toISOString() : undefined,
    refreshExpiresAt: input.token.refresh_expires_in ? new Date(Date.now() + input.token.refresh_expires_in * 1000).toISOString() : undefined,
    environment: config.environment,
    provider: input.provider,
    grantedScopes: metadata.grantedScopes,
    externalAccountId: metadata.externalAccountId ?? undefined,
  } satisfies StoredTikTokCredential);

  const connector = await db.connector.upsert({
    where: { workspaceId_provider_externalAccountId: { workspaceId: input.workspaceId, provider: input.provider, externalAccountId: metadata.externalAccountId ?? "default" } },
    update: { state: "CONNECTED", displayName: providerDisplayName(input.provider), grantedScopes: metadata.grantedScopes, lastHealthAt: new Date(), disabledAt: null },
    create: { workspaceId: input.workspaceId, provider: input.provider, state: "CONNECTED", displayName: providerDisplayName(input.provider), externalAccountId: metadata.externalAccountId ?? "default", grantedScopes: metadata.grantedScopes, lastHealthAt: new Date() },
  });

  await db.connectorCredentialReference.upsert({
    where: { connectorId_referenceType: { connectorId: connector.id, referenceType: `oauth:${config.environment}` } },
    update: { secretRef: encrypted, expiresAt: metadata.expiresAt ? new Date(metadata.expiresAt) : undefined, rotatedAt: new Date() },
    create: { connectorId: connector.id, referenceType: `oauth:${config.environment}`, secretRef: encrypted, expiresAt: metadata.expiresAt ? new Date(metadata.expiresAt) : undefined },
  });
  await emitTokMetricAudit({ workspaceId: input.workspaceId, actorId: input.actorId, action: "tokmetric.connector.authorized", entityType: "connector", entityId: connector.id, correlationId: input.correlationId, outcome: "success", sourceChannel: "website", metadata });
  return connector;
}

export async function refreshConnector(input: { workspaceId: string; connectorId: string; actorId?: string; correlationId: string }) {
  const connector = await db.connector.findFirst({ where: { id: input.connectorId, workspaceId: input.workspaceId }, include: { credentialReferences: true } });
  if (!connector) throw new TokMetricError(404, "CONNECTOR_NOT_FOUND", "Connector was not found.");
  const ref = connector.credentialReferences[0];
  if (!ref) throw new TokMetricError(409, "REAUTHORIZATION_REQUIRED", "Connector credential reference is missing.");
  const stored = decryptCredential<StoredTikTokCredential>(ref.secretRef);
  if (!stored.refreshToken) throw new TokMetricError(409, "REAUTHORIZATION_REQUIRED", "Connector does not have a refresh token.");
  try {
    const token = await refreshTikTokToken(stored.refreshToken);
    await persistAuthorizedConnector({ workspaceId: input.workspaceId, actorId: input.actorId, provider: connector.provider, token, correlationId: input.correlationId });
    await emitTokMetricAudit({ workspaceId: input.workspaceId, actorId: input.actorId, action: "tokmetric.connector.refresh", entityType: "connector", entityId: connector.id, correlationId: input.correlationId, outcome: "success", sourceChannel: "website" });
  } catch (error) {
    await db.connector.update({ where: { id: connector.id }, data: { state: "REAUTHORIZATION_REQUIRED" } });
    await emitTokMetricAudit({ workspaceId: input.workspaceId, actorId: input.actorId, action: "tokmetric.connector.refresh", entityType: "connector", entityId: connector.id, correlationId: input.correlationId, outcome: "failure", sourceChannel: "website" });
    throw error;
  }
}

export async function disconnectConnector(input: { workspaceId: string; connectorId: string; actorId: string; correlationId: string; revoke?: boolean }) {
  const connector = await db.connector.findFirst({ where: { id: input.connectorId, workspaceId: input.workspaceId }, include: { credentialReferences: true } });
  if (!connector) throw new TokMetricError(404, "CONNECTOR_NOT_FOUND", "Connector was not found.");
  if (input.revoke && connector.credentialReferences[0]) {
    const stored = decryptCredential<StoredTikTokCredential>(connector.credentialReferences[0].secretRef);
    await revokeTikTokToken(stored.accessToken);
  }
  await db.connector.update({ where: { id: connector.id }, data: { state: input.revoke ? "DISCONNECTED" : "AUTHORIZATION_REQUIRED", disabledAt: new Date() } });
  await db.connectorCredentialReference.deleteMany({ where: { connectorId: connector.id } });
  await emitTokMetricAudit({ workspaceId: input.workspaceId, actorId: input.actorId, action: input.revoke ? "tokmetric.connector.revoked" : "tokmetric.connector.disconnected", entityType: "connector", entityId: connector.id, correlationId: input.correlationId, outcome: "success", sourceChannel: "website" });
}

export async function updateConnectorHealth(workspaceId: string) {
  const now = new Date();
  const connectors = await db.connector.findMany({ where: { workspaceId }, include: { credentialReferences: true } });
  for (const connector of connectors) {
    const ref = connector.credentialReferences[0];
    if (ref?.expiresAt && ref.expiresAt.getTime() < now.getTime()) {
      await db.connector.update({ where: { id: connector.id }, data: { state: "TOKEN_EXPIRED", lastHealthAt: now } });
      continue;
    }
    await db.connector.update({ where: { id: connector.id }, data: { lastHealthAt: now } });
  }
}
