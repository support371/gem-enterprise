import {
  socialOAuthProviders,
  validateSocialOAuthProviderConfig,
  type SocialOAuthProvider,
} from "./config";

export interface SafeSocialOAuthReadiness {
  provider: SocialOAuthProvider;
  displayName: string;
  readyToAuthorize: boolean;
  missing: string[];
  requestedScopes: string[];
  pkce: boolean;
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
      credentialStoragePolicy: "ENCRYPTED_SERVER_ONLY",
      authorizationStatePolicy: "SIGNED_SINGLE_USE",
      externalPublishingEnabled: false,
    };
  });
}
