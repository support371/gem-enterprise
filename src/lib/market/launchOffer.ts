export const foundingBusinessReviewOffer = {
  code: "founding-business-review-199",
  name: "GEM Business Security & Operations Review",
  shortName: "Business Review",
  priceUsd: 199,
  priceLabel: "$199 founding review",
  audience: "Small and growing businesses preparing to improve security and operating resilience.",
  promise:
    "A structured review of business security, access, operational risks, and immediate priorities with a clear action plan.",
  includes: [
    "One business and one primary domain",
    "Initial review for teams up to 10 people",
    "Structured security and operations intake",
    "Identity and access risk review",
    "Public-facing website and exposure review",
    "Business operations and incident-readiness review",
    "Prioritized written findings and 30-day action plan",
    "One findings review meeting",
  ],
  notIncluded: [
    "Penetration testing or destructive security testing",
    "Unlimited remediation work",
    "Legal, tax, or regulated professional advice",
    "Automatic account, service, or workspace activation",
  ],
  nextStepHref: "/enterprise/apply",
} as const;

export const marketPipeline = [
  { key: "RECEIVED", label: "New Lead", description: "Request received and awaiting first review." },
  { key: "TRIAGE", label: "Contacted / Triage", description: "Initial fit, urgency, and next action are being checked." },
  { key: "NEEDS_INFORMATION", label: "Needs Information", description: "Waiting for information required to qualify the opportunity." },
  { key: "QUALIFIED", label: "Qualified", description: "A real opportunity is ready for review, proposal, or scheduling." },
  { key: "APPROVED", label: "Approved", description: "Scope is approved and ready for commercial conversion." },
  { key: "CONVERTED", label: "Won / Onboarding", description: "The opportunity has converted into a client relationship." },
  { key: "DECLINED", label: "Lost / Declined", description: "The request is not proceeding under the current scope." },
  { key: "CLOSED", label: "Closed", description: "The record is complete and retained for history." },
] as const;

export type MarketPipelineStatus = (typeof marketPipeline)[number]["key"];

export function marketLabelForStatus(status: string): string {
  return marketPipeline.find((stage) => stage.key === status)?.label ?? status;
}
