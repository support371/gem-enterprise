export const commercialEventNames = [
  "commercial_visit",
  "business_review_viewed",
  "request_access_started",
  "intake_submitted",
  "lead_qualified",
  "proposal_created",
  "proposal_approved",
  "payment_reconciled",
  "client_onboarding_started",
  "workspace_activated",
  "delivery_started",
  "delivery_completed",
  "customer_review_recorded",
  "expansion_opportunity_created",
  "renewal_due",
  "referral_consent_recorded",
] as const;

export type CommercialEventName = (typeof commercialEventNames)[number];

export type CommercialFunnelPhase =
  | "ACQUISITION"
  | "QUALIFICATION"
  | "CONVERSION"
  | "ONBOARDING"
  | "DELIVERY"
  | "SUCCESS"
  | "EXPANSION";

export interface CommercialEventDefinition {
  name: CommercialEventName;
  phase: CommercialFunnelPhase;
  description: string;
  authoritativeSource: string;
  allowedProperties: readonly string[];
}

const commonAttribution = [
  "source",
  "medium",
  "campaign",
  "content",
  "term",
  "landingPath",
] as const;

export const commercialEventDefinitions: readonly CommercialEventDefinition[] = [
  {
    name: "commercial_visit",
    phase: "ACQUISITION",
    description: "A public visit reaches a governed commercial landing surface.",
    authoritativeSource: "Public website analytics",
    allowedProperties: [...commonAttribution, "path", "referrerHost"],
  },
  {
    name: "business_review_viewed",
    phase: "ACQUISITION",
    description: "A visitor views the bounded founding Business Security & Operations Review offer.",
    authoritativeSource: "/business-review",
    allowedProperties: [...commonAttribution, "offerCode", "priceUsd"],
  },
  {
    name: "request_access_started",
    phase: "ACQUISITION",
    description: "A visitor begins a governed access or business-review intake flow.",
    authoritativeSource: "Public intake form",
    allowedProperties: [...commonAttribution, "intakeKind"],
  },
  {
    name: "intake_submitted",
    phase: "QUALIFICATION",
    description: "A durable intake submission is accepted by the canonical GEM intake system.",
    authoritativeSource: "IntakeSubmission",
    allowedProperties: ["intakeId", "intakeKind", "source", "campaign", "status"],
  },
  {
    name: "lead_qualified",
    phase: "QUALIFICATION",
    description: "An authorized reviewer records a qualified commercial opportunity.",
    authoritativeSource: "IntakeSubmission status history",
    allowedProperties: ["intakeId", "offerCode", "reviewQueue", "source", "campaign"],
  },
  {
    name: "proposal_created",
    phase: "CONVERSION",
    description: "A bounded proposal is created for an approved scope candidate.",
    authoritativeSource: "GEM Market Pipeline",
    allowedProperties: ["intakeId", "offerCode", "proposalReference", "amountUsd"],
  },
  {
    name: "proposal_approved",
    phase: "CONVERSION",
    description: "The commercial proposal reaches its governed approved state.",
    authoritativeSource: "GEM Market Pipeline",
    allowedProperties: ["intakeId", "proposalReference", "amountUsd"],
  },
  {
    name: "payment_reconciled",
    phase: "CONVERSION",
    description: "Payment evidence is reconciled to an approved proposal; this event does not grant entitlement by itself.",
    authoritativeSource: "Governed payment reconciliation",
    allowedProperties: ["intakeId", "proposalReference", "paymentReference", "amountUsd", "provider"],
  },
  {
    name: "client_onboarding_started",
    phase: "ONBOARDING",
    description: "An authorized operator starts conversion into the Organization → Workspace → Project structure.",
    authoritativeSource: "Platform Owner onboarding controls",
    allowedProperties: ["intakeId", "organizationId", "workspaceId", "projectId"],
  },
  {
    name: "workspace_activated",
    phase: "ONBOARDING",
    description: "The approved organization workspace becomes available to the entitled client owner.",
    authoritativeSource: "Organization Workspace OS",
    allowedProperties: ["organizationId", "workspaceId", "projectId", "plan"],
  },
  {
    name: "delivery_started",
    phase: "DELIVERY",
    description: "Work begins against a signed and authorized project scope.",
    authoritativeSource: "OrganizationProject",
    allowedProperties: ["organizationId", "workspaceId", "projectId", "serviceCode"],
  },
  {
    name: "delivery_completed",
    phase: "DELIVERY",
    description: "A contracted delivery scope reaches verified completion.",
    authoritativeSource: "OrganizationProject + completion evidence",
    allowedProperties: ["organizationId", "workspaceId", "projectId", "serviceCode", "outcomeStatus"],
  },
  {
    name: "customer_review_recorded",
    phase: "SUCCESS",
    description: "An authorized operator records a post-delivery health/outcome review.",
    authoritativeSource: "CustomerSuccessProfile",
    allowedProperties: ["organizationId", "workspaceId", "projectId", "healthStatus", "outcomeStatus", "satisfactionScore"],
  },
  {
    name: "expansion_opportunity_created",
    phase: "EXPANSION",
    description: "A planning action records a potential separately scoped next engagement without activating it.",
    authoritativeSource: "CustomerSuccessAction",
    allowedProperties: ["organizationId", "workspaceId", "projectId", "actionId", "actionType"],
  },
  {
    name: "renewal_due",
    phase: "SUCCESS",
    description: "A governed follow-up or renewal review reaches its due window; no recurring charge is implied.",
    authoritativeSource: "CustomerSuccessAction",
    allowedProperties: ["organizationId", "workspaceId", "projectId", "actionId", "dueAt"],
  },
  {
    name: "referral_consent_recorded",
    phase: "EXPANSION",
    description: "Explicit referral/testimonial consent evidence is recorded after a successful customer outcome.",
    authoritativeSource: "CustomerSuccessAction + consent evidence",
    allowedProperties: ["organizationId", "workspaceId", "projectId", "actionId", "consentReference"],
  },
];

export const prohibitedCommercialAnalyticsProperties = [
  "password",
  "passwordHash",
  "accessToken",
  "refreshToken",
  "apiKey",
  "secret",
  "fullPaymentCard",
  "governmentId",
  "rawKycDocument",
  "privateSupportTranscript",
] as const;

export function getCommercialEventDefinition(name: CommercialEventName) {
  return commercialEventDefinitions.find((definition) => definition.name === name) ?? null;
}
