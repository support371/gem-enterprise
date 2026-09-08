import type { SocialMediaProviderId } from "../providers";

export const securityPostureCampaignKey = "security-posture";

export const securityPostureCampaignProviders = [
  "TIKTOK",
  "FACEBOOK_PAGE",
  "INSTAGRAM_PROFESSIONAL",
  "X",
  "NEXTDOOR",
] as const satisfies readonly SocialMediaProviderId[];

export const securityPostureCampaignProductSlugs = [
  "security-posture-assessment",
  "24-7-threat-monitoring",
] as const;

const sourceReference =
  "https://www.gemcybersecurityassist.com/store/security-posture-assessment";

export function buildSecurityPostureCampaignRequest(input: {
  workspaceId: string;
  planDate: string;
  localContext?: string;
}) {
  const planDate = input.planDate.slice(0, 10);
  const timestamp = `${planDate}T12:00:00.000Z`;
  const localContext = input.localContext?.trim();

  return {
    workspaceId: input.workspaceId.trim(),
    planDate: timestamp,
    campaignKey: securityPostureCampaignKey,
    enabledProviders: [...securityPostureCampaignProviders],
    marketSignals: [
      {
        id: `gem-campaign:${securityPostureCampaignKey}:${planDate}`,
        topic: "Know Your Security Posture Before an Incident",
        summary:
          "Cybersecurity risks continue to evolve. Proactive assessment and ongoing monitoring can help organizations improve visibility into their security environment and prioritize informed security decisions.",
        relevance: 1,
        momentum: 0.8,
        observedAt: timestamp,
        sourceReference,
        providers: [...securityPostureCampaignProviders],
      },
    ],
    useGemCatalog: true,
    gemProductSlugs: [...securityPostureCampaignProductSlugs],
    ...(localContext ? { localContext } : {}),
    minimumTikTokItems: 20,
    maxItemsPerOtherProvider: 2,
    freshnessWindowDays: null,
    requestApprovals: true,
    forceRegenerate: false,
  };
}
