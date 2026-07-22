import { TokMetricError } from "@/lib/tokmetric/security";
import type { SocialOAuthProviderConfig } from "./config";
import type { StoredSocialCredential } from "./store";

const DISCOVERY_TIMEOUT_MS = 15_000;
const MAX_DISCOVERED_ACCOUNTS = 100;
const LINKEDIN_PUBLISH_ROLES = new Set([
  "ADMINISTRATOR",
  "CONTENT_ADMINISTRATOR",
  "DIRECT_SPONSORED_CONTENT_POSTER",
  "RECRUITING_POSTER",
]);

type JsonRecord = Record<string, unknown>;

export interface DiscoveredSocialAccount {
  externalAccountId: string;
  displayName: string;
  accountType: string;
  username?: string;
  safeMetadata: Record<string, unknown>;
  credential: StoredSocialCredential;
}

function object(value: unknown): JsonRecord | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : undefined;
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function stringList(value: unknown) {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string" && Boolean(entry.trim()))
    : [];
}

function accountCredential(
  credential: StoredSocialCredential,
  externalAccountId: string,
  accessToken?: string,
): StoredSocialCredential {
  return {
    ...credential,
    accessToken: accessToken || credential.accessToken,
    externalAccountId,
  };
}

async function fetchDiscoveryJson(
  config: SocialOAuthProviderConfig,
  credential: StoredSocialCredential,
  url: URL,
  headers?: Record<string, string>,
) {
  let response: Response;
  try {
    response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${credential.accessToken}`,
        ...headers,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(DISCOVERY_TIMEOUT_MS),
    });
  } catch {
    throw new TokMetricError(
      502,
      "SOCIAL_ACCOUNT_DISCOVERY_UNAVAILABLE",
      `${config.displayName} account discovery is unavailable.`,
    );
  }

  let payload: unknown = {};
  try {
    payload = await response.json();
  } catch {
    payload = {};
  }

  if (response.status === 401 || response.status === 403) {
    throw new TokMetricError(
      401,
      "SOCIAL_ACCOUNT_DISCOVERY_UNAUTHORIZED",
      `${config.displayName} did not permit account discovery.`,
    );
  }
  if (response.status === 429) {
    throw new TokMetricError(
      503,
      "SOCIAL_ACCOUNT_DISCOVERY_RATE_LIMITED",
      `${config.displayName} account discovery is temporarily rate limited.`,
    );
  }
  if (!response.ok) {
    throw new TokMetricError(
      502,
      "SOCIAL_ACCOUNT_DISCOVERY_FAILED",
      `${config.displayName} did not return an authorized account inventory.`,
    );
  }
  return payload;
}

async function discoverMetaAccounts(
  config: SocialOAuthProviderConfig,
  credential: StoredSocialCredential,
): Promise<DiscoveredSocialAccount[]> {
  const url = new URL(config.accountDiscoveryUrl);
  url.searchParams.set(
    "fields",
    "id,name,access_token,tasks,instagram_business_account{id,username,name}",
  );
  const payload = object(await fetchDiscoveryJson(config, credential, url));
  const pages = Array.isArray(payload?.data) ? payload.data : [];

  return pages.flatMap((entry) => {
    const page = object(entry);
    const id = stringValue(page?.id);
    const name = stringValue(page?.name);
    const pageAccessToken = stringValue(page?.access_token);
    if (!id || !name || !pageAccessToken) return [];
    const instagram = object(page?.instagram_business_account);
    const instagramId = stringValue(instagram?.id);
    const instagramUsername = stringValue(instagram?.username);
    return [
      {
        externalAccountId: id,
        displayName: name,
        accountType: "META_PAGE",
        safeMetadata: {
          facebookPageId: id,
          tasks: stringList(page?.tasks),
          instagramBusinessAccountId: instagramId || null,
          instagramUsername: instagramUsername || null,
          linkedInstagramAccountPresent: Boolean(instagramId),
        },
        credential: accountCredential(credential, id, pageAccessToken),
      },
    ];
  });
}

async function discoverXAccount(
  config: SocialOAuthProviderConfig,
  credential: StoredSocialCredential,
): Promise<DiscoveredSocialAccount[]> {
  const url = new URL(config.accountDiscoveryUrl);
  url.searchParams.set("user.fields", "username,name,verified,protected,profile_image_url");
  const payload = object(await fetchDiscoveryJson(config, credential, url));
  const data = object(payload?.data);
  const id = stringValue(data?.id);
  const displayName = stringValue(data?.name);
  if (!id || !displayName) return [];
  const username = stringValue(data?.username);
  return [
    {
      externalAccountId: id,
      displayName,
      accountType: "X_USER",
      username,
      safeMetadata: {
        username: username || null,
        verified: typeof data?.verified === "boolean" ? data.verified : null,
        protected: typeof data?.protected === "boolean" ? data.protected : null,
      },
      credential: accountCredential(credential, id),
    },
  ];
}

async function discoverLinkedInOrganizations(
  config: SocialOAuthProviderConfig,
  credential: StoredSocialCredential,
): Promise<DiscoveredSocialAccount[]> {
  const url = new URL(config.accountDiscoveryUrl);
  url.searchParams.set("q", "roleAssignee");
  const payload = object(
    await fetchDiscoveryJson(config, credential, url, {
      "LinkedIn-Version": config.apiVersion || "",
      "X-Restli-Protocol-Version": "2.0.0",
    }),
  );
  const elements = Array.isArray(payload?.elements) ? payload.elements : [];

  return elements.flatMap((entry) => {
    const acl = object(entry);
    const state = stringValue(acl?.state);
    const organizationTarget =
      stringValue(acl?.organizationTarget) || stringValue(acl?.organization);
    if (!organizationTarget || state !== "APPROVED") return [];
    const organizationId = organizationTarget.split(":").at(-1)?.trim();
    if (!organizationId) return [];
    const role = stringValue(acl?.role);
    return [
      {
        externalAccountId: organizationId,
        displayName: `LinkedIn organization ${organizationId}`,
        accountType: "LINKEDIN_ORGANIZATION",
        safeMetadata: {
          organizationUrn: organizationTarget,
          approvedRole: role || null,
          roleState: state,
          publishRoleEligible: role ? LINKEDIN_PUBLISH_ROLES.has(role) : false,
        },
        credential: accountCredential(credential, organizationId),
      },
    ];
  });
}

async function discoverYouTubeChannels(
  config: SocialOAuthProviderConfig,
  credential: StoredSocialCredential,
): Promise<DiscoveredSocialAccount[]> {
  const url = new URL(config.accountDiscoveryUrl);
  url.searchParams.set("part", "id,snippet,status");
  url.searchParams.set("mine", "true");
  const payload = object(await fetchDiscoveryJson(config, credential, url));
  const items = Array.isArray(payload?.items) ? payload.items : [];

  return items.flatMap((entry) => {
    const channel = object(entry);
    const id = stringValue(channel?.id);
    const snippet = object(channel?.snippet);
    const status = object(channel?.status);
    const title = stringValue(snippet?.title);
    if (!id || !title) return [];
    return [
      {
        externalAccountId: id,
        displayName: title,
        accountType: "YOUTUBE_CHANNEL",
        username: stringValue(snippet?.customUrl),
        safeMetadata: {
          customUrl: stringValue(snippet?.customUrl) || null,
          privacyStatus: stringValue(status?.privacyStatus) || null,
          madeForKids: typeof status?.madeForKids === "boolean" ? status.madeForKids : null,
        },
        credential: accountCredential(credential, id),
      },
    ];
  });
}

function nextdoorProfiles(payload: unknown) {
  if (Array.isArray(payload)) return payload;
  const root = object(payload);
  for (const key of ["profiles", "data", "results"]) {
    if (Array.isArray(root?.[key])) return root[key] as unknown[];
  }
  return [];
}

async function discoverNextdoorProfiles(
  config: SocialOAuthProviderConfig,
  credential: StoredSocialCredential,
): Promise<DiscoveredSocialAccount[]> {
  const payload = await fetchDiscoveryJson(
    config,
    credential,
    new URL(config.accountDiscoveryUrl),
  );

  return nextdoorProfiles(payload).flatMap((entry) => {
    const profile = object(entry);
    const entityPage = object(profile?.entity_page);
    const id = stringValue(profile?.id) || stringValue(entityPage?.id);
    const displayName =
      stringValue(entityPage?.name) ||
      stringValue(profile?.business_name) ||
      stringValue(profile?.name);
    if (!id || !displayName) return [];
    const entityProfile = profile?.is_entity_profile === true || Boolean(entityPage);
    return [
      {
        externalAccountId: id,
        displayName,
        accountType: entityProfile ? "NEXTDOOR_ENTITY_PROFILE" : "NEXTDOOR_PROFILE",
        safeMetadata: {
          secureProfileId: id,
          entityProfile,
          entityPageId: stringValue(entityPage?.id) || null,
          publicationUrl: stringValue(entityPage?.publication_url) || null,
          verified: typeof profile?.verified === "boolean" ? profile.verified : null,
        },
        credential: accountCredential(credential, id),
      },
    ];
  });
}

function deduplicateAccounts(accounts: DiscoveredSocialAccount[]) {
  const unique = new Map<string, DiscoveredSocialAccount>();
  for (const account of accounts) {
    if (!unique.has(account.externalAccountId)) unique.set(account.externalAccountId, account);
  }
  return [...unique.values()]
    .sort((left, right) => left.externalAccountId.localeCompare(right.externalAccountId))
    .slice(0, MAX_DISCOVERED_ACCOUNTS);
}

export async function discoverSocialAccounts(input: {
  config: SocialOAuthProviderConfig;
  credential: StoredSocialCredential;
}) {
  const { config, credential } = input;
  let accounts: DiscoveredSocialAccount[];
  switch (config.provider) {
    case "META":
      accounts = await discoverMetaAccounts(config, credential);
      break;
    case "X":
      accounts = await discoverXAccount(config, credential);
      break;
    case "LINKEDIN":
      accounts = await discoverLinkedInOrganizations(config, credential);
      break;
    case "YOUTUBE":
      accounts = await discoverYouTubeChannels(config, credential);
      break;
    case "NEXTDOOR":
      accounts = await discoverNextdoorProfiles(config, credential);
      break;
  }

  const discovered = deduplicateAccounts(accounts);
  if (discovered.length === 0) {
    throw new TokMetricError(
      422,
      "SOCIAL_ACCOUNT_DISCOVERY_EMPTY",
      `${config.displayName} authorization did not expose an eligible managed account.`,
    );
  }
  return discovered;
}
