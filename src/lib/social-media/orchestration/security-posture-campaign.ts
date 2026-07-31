import type { SocialMediaProviderId } from "../providers";

export const securityPostureCampaignKey = "security-posture";

export const securityPostureCampaignProviders = [
  "TIKTOK",
  "FACEBOOK_PAGE",
  "INSTAGRAM_PROFESSIONAL",
  "X",
  "NEXTDOOR",
] as const satisfies readonly SocialMediaProviderId[];

const sourceReference = "https://www.gemcybersecurityassist.com/";

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
    approvedSources: [
      {
        id: "gem-approved:cybersecurity-assessment-monitoring",
        title: "Cybersecurity Assessment and Monitoring Services",
        summary:
          "GEM Cybersecurity & Monitoring Assist provides structured cybersecurity assessments and continuous monitoring designed to help organizations better understand their security environment, identify potential areas for improvement, and support informed cybersecurity decisions.",
        callToAction: `Request a security consultation: ${sourceReference}`,
        sourceReference,
        approvedAt: timestamp,
        approved: true as const,
        providers: [...securityPostureCampaignProviders],
      },
    ],
    useGemCatalog: false,
    ...(localContext ? { localContext } : {}),
    minimumTikTokItems: 20,
    maxItemsPerOtherProvider: 1,
    freshnessWindowDays: null,
    requestApprovals: true,
    forceRegenerate: false,
  };
}
