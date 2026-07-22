import {
  socialOAuthProviders,
  validateSocialOAuthProviderConfig,
  type SocialOAuthProvider,
} from "./config";

export const SOCIAL_AUTHORIZATION_FOUNDATION_VERSION = "2026-07-22.1" as const;

export interface SafeSocialOAuthReadiness {
  provider: SocialOAuthProvider;
  displayName: string;
  readyToAuthorize: boolean;
  missing: string[];
  requestedScopes: string[];
  pkce: boolean;
  authorizationFoundationVersion: typeof SOCIAL_AUTHORIZATION_FOUNDATION_VERSION;
  credentialStoragePolicy: "ENCRYPTED_SERVER_ONLY";
  authorizationStatePolicy: "SIGNED_SINGLE_USE";
  externalPublishingEnabled: false;
}

export function getSafeSocialOAuthReadiness(): SafeSocialOAuthReadiness[] {
  return socialOAuthProviders.map((provider) => {
    const { config, missing, ok } = validateSocialOAuthProviderConfig(provider);
    return {
      provider,
      displayName: config.displayName,
      readyToAuthorize: ok,
      missing,
      requestedScopes: config.scopes,
      pkce: config.usePkce,
      authorizationFoundationVersion: SOCIAL_AUTHORIZATION_FOUNDATION_VERSION,
      credentialStoragePolicy: "ENCRYPTED_SERVER_ONLY",
      authorizationStatePolicy: "SIGNED_SINGLE_USE",
      externalPublishingEnabled: false,
    };
  });
}
