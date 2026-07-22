import type { SocialOAuthProvider } from "./config";
import type { StoredSocialCredential } from "./store";

export const socialConnectorLifecycleVersion = "2026-07-22.1" as const;

export type SocialConnectorHealthState =
  | "UNKNOWN"
  | "HEALTHY"
  | "DEGRADED"
  | "EXPIRED"
  | "REVOKED"
  | "ERROR";

export interface DiscoveredSocialAccount {
  externalAccountId: string;
  displayName: string;
  accountType: string;
  safeMetadata: Record<string, string | number | boolean | null>;
}

export interface SocialConnectorHealthEvidence {
  provider: SocialOAuthProvider;
  state: SocialConnectorHealthState;
  checkedAt: string;
  tokenExpiresAt: string | null;
  refreshAvailable: boolean;
  requiredScopesPresent: boolean;
  externalAccountVisible: boolean;
  externalPublishingEnabled: false;
  externalWriteAttempted: false;
  errorCode?: string;
}

export interface SocialProviderLifecycleAdapter {
  provider: SocialOAuthProvider;
  discoverAccounts(input: {
    credential: StoredSocialCredential;
    signal?: AbortSignal;
  }): Promise<DiscoveredSocialAccount[]>;
  refreshCredential(input: {
    credential: StoredSocialCredential;
    signal?: AbortSignal;
  }): Promise<StoredSocialCredential>;
  checkHealth(input: {
    credential: StoredSocialCredential;
    requiredScopes: string[];
    signal?: AbortSignal;
  }): Promise<SocialConnectorHealthEvidence>;
  revokeCredential(input: {
    credential: StoredSocialCredential;
    signal?: AbortSignal;
  }): Promise<{ revoked: boolean; externalPublishingEnabled: false }>;
}

export function hasAllRequiredScopes(granted: string[], required: string[]) {
  const normalized = new Set(granted.map((scope) => scope.trim()).filter(Boolean));
  return required.every((scope) => normalized.has(scope));
}

export function tokenExpiryState(expiresAt?: string, now = Date.now()) {
  if (!expiresAt) return "UNKNOWN" as const;
  const timestamp = Date.parse(expiresAt);
  if (!Number.isFinite(timestamp)) return "ERROR" as const;
  if (timestamp <= now) return "EXPIRED" as const;
  if (timestamp - now <= 15 * 60 * 1000) return "DEGRADED" as const;
  return "HEALTHY" as const;
}

export function buildLocalHealthEvidence(input: {
  provider: SocialOAuthProvider;
  credential: StoredSocialCredential;
  requiredScopes: string[];
  externalAccountVisible: boolean;
  now?: number;
}): SocialConnectorHealthEvidence {
  const expiryState = tokenExpiryState(input.credential.expiresAt, input.now);
  const requiredScopesPresent = hasAllRequiredScopes(
    input.credential.grantedScopes,
    input.requiredScopes,
  );

  let state: SocialConnectorHealthState = expiryState;
  if (!requiredScopesPresent || !input.externalAccountVisible) state = "DEGRADED";

  return {
    provider: input.provider,
    state,
    checkedAt: new Date(input.now ?? Date.now()).toISOString(),
    tokenExpiresAt: input.credential.expiresAt ?? null,
    refreshAvailable: Boolean(input.credential.refreshToken),
    requiredScopesPresent,
    externalAccountVisible: input.externalAccountVisible,
    externalPublishingEnabled: false,
    externalWriteAttempted: false,
  };
}
