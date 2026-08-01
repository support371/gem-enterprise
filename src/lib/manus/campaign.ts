import { z } from "zod";

export const manusCampaignChannels = [
  "EMAIL",
  "LINKEDIN",
  "FACEBOOK",
  "INSTAGRAM",
  "X",
  "TIKTOK",
  "YOUTUBE",
  "NEXTDOOR",
] as const;

export const ManusCampaignBriefSchema = z.object({
  objective: z.string().trim().min(10).max(2_000),
  service: z.string().trim().min(2).max(300),
  audience: z.string().trim().min(5).max(1_000),
  location: z.string().trim().max(300).optional(),
  channels: z.array(z.enum(manusCampaignChannels)).min(1).max(manusCampaignChannels.length),
  offer: z.string().trim().max(1_000).optional(),
  callToAction: z.string().trim().min(2).max(500),
  constraints: z.string().trim().max(2_000).optional(),
});

export type ManusCampaignBrief = z.infer<typeof ManusCampaignBriefSchema>;

const SocialPostSchema = z.object({
  channel: z.enum(manusCampaignChannels),
  content: z.string().min(1).max(10_000),
  callToAction: z.string().min(1).max(1_000),
});

export const ManusCampaignOutputSchema = z.object({
  campaignTitle: z.string().min(1).max(300),
  campaignSummary: z.string().min(1).max(5_000),
  audienceSummary: z.string().min(1).max(5_000),
  valueProposition: z.string().min(1).max(5_000),
  emailSubject: z.string().min(1).max(200),
  previewText: z.string().min(1).max(300),
  emailBody: z.string().min(1).max(100_000),
  landingPageHeadline: z.string().min(1).max(300),
  landingPageBody: z.string().min(1).max(20_000),
  socialPosts: z.array(SocialPostSchema).max(40),
  complianceFindings: z.array(z.string().max(2_000)).max(50),
  requiredDisclosures: z.array(z.string().max(2_000)).max(50),
  prohibitedClaimsDetected: z.array(z.string().max(2_000)).max(50),
  recommendedMetrics: z.array(z.string().max(500)).max(30),
});

export type ManusCampaignOutput = z.infer<typeof ManusCampaignOutputSchema>;

export const manusCampaignStructuredOutputSchema = {
  type: "object",
  properties: {
    campaignTitle: { type: "string" },
    campaignSummary: { type: "string" },
    audienceSummary: { type: "string" },
    valueProposition: { type: "string" },
    emailSubject: { type: "string" },
    previewText: { type: "string" },
    emailBody: { type: "string" },
    landingPageHeadline: { type: "string" },
    landingPageBody: { type: "string" },
    socialPosts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          channel: { type: "string", enum: [...manusCampaignChannels] },
          content: { type: "string" },
          callToAction: { type: "string" },
        },
        required: ["channel", "content", "callToAction"],
        additionalProperties: false,
      },
    },
    complianceFindings: { type: "array", items: { type: "string" } },
    requiredDisclosures: { type: "array", items: { type: "string" } },
    prohibitedClaimsDetected: { type: "array", items: { type: "string" } },
    recommendedMetrics: { type: "array", items: { type: "string" } },
  },
  required: [
    "campaignTitle",
    "campaignSummary",
    "audienceSummary",
    "valueProposition",
    "emailSubject",
    "previewText",
    "emailBody",
    "landingPageHeadline",
    "landingPageBody",
    "socialPosts",
    "complianceFindings",
    "requiredDisclosures",
    "prohibitedClaimsDetected",
    "recommendedMetrics",
  ],
  additionalProperties: false,
} as const;

export function buildManusCampaignPrompt(input: ManusCampaignBrief): string {
  const location = input.location || "United States, unless the brief requires a narrower lawful jurisdiction";
  const offer = input.offer || "Use the approved GEM service value proposition without inventing pricing, guarantees, certifications, or results";
  const constraints = input.constraints || "No additional constraints supplied";

  return `You are preparing a governed marketing campaign draft for GEM Cybersecurity & Monitoring Assist and gemcybersecurityassist.com.

Campaign objective:
${input.objective}

Service or product:
${input.service}

Target audience:
${input.audience}

Location or jurisdiction:
${location}

Requested channels:
${input.channels.join(", ")}

Offer guidance:
${offer}

Call to action:
${input.callToAction}

Additional constraints:
${constraints}

Mandatory governance rules:
1. Produce drafts only. Do not send email, publish content, buy advertising, contact prospects, create accounts, or perform any external action.
2. Use permission-based marketing language. Do not recommend scraped, purchased, or non-consensual contact lists.
3. Do not invent licences, certifications, customer counts, partnerships, regulatory status, guarantees, savings, security outcomes, or performance claims.
4. Do not expose operational security details, credentials, private architecture, client data, or sensitive implementation information.
5. Clearly identify any statement that requires human verification, legal review, compliance review, or supporting evidence.
6. Use a professional, credible enterprise tone. Avoid fear-based manipulation, deceptive urgency, spam language, and unsupported superlatives.
7. Keep the campaign aligned with a controlled intake model: the call to action should lead to request access, book a consultation, contact GEM, or begin an eligibility review—not automatic service activation.
8. Return the complete campaign package using the required structured output schema.

The result will enter GEM as an unapproved draft and remain subject to separate compliance review and human approval.`;
}
