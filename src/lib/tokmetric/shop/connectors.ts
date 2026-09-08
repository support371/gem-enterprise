import { db } from "@/lib/db";
import { TokMetricError, emitTokMetricAudit, enforceEmergencyLocks } from "@/lib/tokmetric/security";
import { decryptCredential, encryptCredential } from "@/lib/tokmetric/oauth/crypto";
import { getTikTokShopConfig } from "./config";
import { refreshTikTokShopToken, type TikTokShopToken } from "./client";

type StoredShopCredential = TikTokShopToken & { environment: "sandbox" | "production" };

function referenceType() {
  return `shop:${getTikTokShopConfig().environment}`;
}

function expiryDate(epochSeconds?: number) {
  return epochSeconds ? new Date(epochSeconds * 1000) : undefined;
}

export async function persistTikTokShopSellerConnector(input: {
  workspaceId: string;
  actorId: string;
  token: TikTokShopToken;
  correlationId: string;
}) {
  await enforceEmergencyLocks(input.workspaceId, "connector");
  const config = getTikTokShopConfig();
  const externalAccountId = input.token.open_id || "seller";
  const connector = await db.connector.upsert({
    where: {
      workspaceId_provider_externalAccountId: {
        workspaceId: input.workspaceId,
        provider: "TIKTOK_SHOP_SELLER",
        externalAccountId,
      },
    },
    update: {
      state: "CONNECTED",
      displayName: input.token.seller_name || "TikTok Shop Seller",
      grantedScopes: input.token.granted_scopes || [],
      lastHealthAt: new Date(),
      disabledAt: null,
    },
    create: {
      workspaceId: input.workspaceId,
      provider: "TIKTOK_SHOP_SELLER",
      state: "CONNECTED",
      displayName: input.token.seller_name || "TikTok Shop Seller",
      externalAccountId,
      grantedScopes: input.token.granted_scopes || [],
      lastHealthAt: new Date(),
    },
  });
  const stored: StoredShopCredential = { ...input.token, environment: config.environment };
  await db.connectorCredentialReference.upsert({
    where: { connectorId_referenceType: { connectorId: connector.id, referenceType: referenceType() } },
    update: {
      secretRef: encryptCredential(stored),
      expiresAt: expiryDate(input.token.access_token_expire_in),
      rotatedAt: new Date(),
    },
    create: {
      connectorId: connector.id,
      referenceType: referenceType(),
      secretRef: encryptCredential(stored),
      expiresAt: expiryDate(input.token.access_token_expire_in),
    },
  });
  await emitTokMetricAudit({
    workspaceId: input.workspaceId,
    actorId: input.actorId,
    action: "tokmetric.shop.seller_authorized",
    entityType: "connector",
    entityId: connector.id,
    correlationId: input.correlationId,
    outcome: "success",
    sourceChannel: "website",
    metadata: {
      provider: "TIKTOK_SHOP_SELLER",
      sellerBaseRegion: input.token.seller_base_region,
      grantedScopes: input.token.granted_scopes || [],
    },
  });
  return connector;
}

export async function getTikTokShopSellerCredential(workspaceId: string) {
  const connector = await db.connector.findFirst({
    where: { workspaceId, provider: "TIKTOK_SHOP_SELLER", state: "CONNECTED", disabledAt: null },
  });
  if (!connector) {
    throw new TokMetricError(409, "TIKTOK_SHOP_NOT_CONNECTED", "Connect an approved TikTok Shop seller first.");
  }
  const reference = await db.connectorCredentialReference.findUnique({
    where: { connectorId_referenceType: { connectorId: connector.id, referenceType: referenceType() } },
  });
  if (!reference) throw new TokMetricError(409, "TIKTOK_SHOP_REAUTHORIZATION_REQUIRED", "TikTok Shop requires reauthorization.");
  let stored = decryptCredential<StoredShopCredential>(reference.secretRef);
  if (reference.expiresAt && reference.expiresAt.getTime() <= Date.now() + 60_000) {
    if (!stored.refresh_token) throw new TokMetricError(409, "TIKTOK_SHOP_REAUTHORIZATION_REQUIRED", "TikTok Shop authorization expired.");
    stored = { ...(await refreshTikTokShopToken(stored.refresh_token)), environment: getTikTokShopConfig().environment };
    await db.connectorCredentialReference.update({
      where: { id: reference.id },
      data: { secretRef: encryptCredential(stored), expiresAt: expiryDate(stored.access_token_expire_in), rotatedAt: new Date() },
    });
  }
  return { connector, credential: stored };
}
