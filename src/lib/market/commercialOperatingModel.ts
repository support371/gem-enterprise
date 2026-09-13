export type CommercialCapabilityStatus =
  | "READY"
  | "PARTIAL"
  | "EXTERNAL"
  | "GAP"
  | "HUMAN_GATE";

export interface CommercialLifecycleStage {
  key: string;
  label: string;
  objective: string;
  systemOfRecord: string;
  existingSurface: string;
  status: CommercialCapabilityStatus;
}

export interface CommercialCapability {
  capability: string;
  existingGemImplementation: string;
  systemOfRecord: string;
  externalToolPolicy: string;
  status: CommercialCapabilityStatus;
  nextAction: string;
}

export const commercialOperatingPrinciples = [
  "GEM Enterprise remains the system of record for eligibility, scope, entitlement, workspace access, approvals, audit evidence, and service activation.",
  "Existing GEM market, campaign, social, support, meeting, billing, analytics, and workspace capabilities are extended before any parallel SaaS system is introduced.",
  "External tools may enrich research, delivery, analytics, or communications only when they solve a verified capability gap and preserve the authoritative GEM customer record.",
  "High-impact actions including qualification approval, contract execution, payment authorization, workspace access, bulk campaign delivery, and regulated scope changes remain human-gated.",
] as const;

export const commercialLifecycle: CommercialLifecycleStage[] = [
  {
    key: "DISCOVER",
    label: "Discover",
    objective: "Create qualified awareness through search, referrals, content, social, and direct research.",
    systemOfRecord: "GEM public website + governed campaign attribution",
    existingSurface: "/, /services, /resources, /news, /business-review",
    status: "READY",
  },
  {
    key: "ATTRACT",
    label: "Attract",
    objective: "Move a relevant visitor or referred business to a controlled commercial entry point.",
    systemOfRecord: "GEM public website",
    existingSurface: "/business-review, /request-access",
    status: "READY",
  },
  {
    key: "CAPTURE",
    label: "Capture",
    objective: "Record consented business context, source, campaign, and request details without granting entitlement.",
    systemOfRecord: "Enterprise Intake Governance",
    existingSurface: "/enterprise/apply, /api/admin/intake",
    status: "READY",
  },
  {
    key: "QUALIFY",
    label: "Qualify",
    objective: "Check fit, jurisdiction, urgency, evidence, and the appropriate bounded scope.",
    systemOfRecord: "Enterprise Intake Governance",
    existingSurface: "/app/admin/intake, /app/admin/market",
    status: "HUMAN_GATE",
  },
  {
    key: "PROPOSE",
    label: "Propose",
    objective: "Prepare the approved commercial scope and customer-facing proposal.",
    systemOfRecord: "GEM Market Pipeline",
    existingSurface: "/app/admin/market/proposal",
    status: "HUMAN_GATE",
  },
  {
    key: "CONVERT",
    label: "Convert",
    objective: "Reconcile approval and payment evidence before client activation.",
    systemOfRecord: "GEM Market Pipeline + governed payment reconciliation",
    existingSurface: "/app/admin/market",
    status: "HUMAN_GATE",
  },
  {
    key: "ONBOARD",
    label: "Onboard",
    objective: "Create the approved client organization, workspace, project, and one-time owner access path.",
    systemOfRecord: "Organization Workspace OS",
    existingSurface: "/app/workspace",
    status: "HUMAN_GATE",
  },
  {
    key: "DELIVER",
    label: "Deliver",
    objective: "Execute the signed scope using assigned project environments, meetings, requests, documents, and approved tools.",
    systemOfRecord: "Organization → Workspace → Project",
    existingSurface: "/app/workspace, /app/requests, /app/meetings, /app/documents",
    status: "READY",
  },
  {
    key: "SUPPORT",
    label: "Support",
    objective: "Resolve customer questions through self-service, governed AI, durable tickets, and human escalation.",
    systemOfRecord: "GEM Support",
    existingSurface: "/app/support, /app/support/operations",
    status: "READY",
  },
  {
    key: "SUCCESS",
    label: "Customer Success",
    objective: "Track outcome completion, open actions, health, satisfaction, and post-delivery follow-up.",
    systemOfRecord: "GEM customer-success profile linked to canonical workspace/project identity",
    existingSurface: "/app/admin/customer-success",
    status: "PARTIAL",
  },
  {
    key: "EXPAND",
    label: "Expand",
    objective: "Record justified expansion planning without auto-authorizing a new scope, then route approved new work through the normal Market Pipeline.",
    systemOfRecord: "GEM customer-success action + Market Pipeline",
    existingSurface: "/app/admin/customer-success (EXPANSION) → governed proposal/approval flow",
    status: "PARTIAL",
  },
  {
    key: "RENEW",
    label: "Renew / Follow up",
    objective: "Track review, renewal, and win-back actions without automatically extending entitlement or charging a customer.",
    systemOfRecord: "GEM customer-success lifecycle",
    existingSurface: "/app/admin/customer-success (RENEWAL / WIN_BACK)",
    status: "PARTIAL",
  },
  {
    key: "REFER",
    label: "Refer / Advocate",
    objective: "Plan referral or testimonial follow-up only after verified outcomes and explicit evidence/consent.",
    systemOfRecord: "GEM customer-success lifecycle + communication/consent evidence",
    existingSurface: "/app/admin/customer-success (REFERRAL)",
    status: "PARTIAL",
  },
  {
    key: "LEARN",
    label: "Learn",
    objective: "Feed attribution, delivery outcomes, support patterns, revenue, and customer feedback back into market decisions.",
    systemOfRecord: "GEM commercial event contract + approved analytics provider",
    existingSurface: "src/lib/analytics/commercialEvents.ts + connected analytics when instrumented",
    status: "PARTIAL",
  },
];

export const commercialCapabilities: CommercialCapability[] = [
  {
    capability: "Public acquisition",
    existingGemImplementation: "Canonical GEM website, services, resources, business-review offer, Request Access, campaign attribution, and a verified Search Console baseline.",
    systemOfRecord: "gemcybersecurityassist.com",
    externalToolPolicy: "Use search/market intelligence to inform GEM pages; do not create a second public funnel.",
    status: "READY",
    nextAction: "Instrument the bounded business-review funnel and improve evidence-backed organic conversion.",
  },
  {
    capability: "Lead / opportunity pipeline",
    existingGemImplementation: "Enterprise Opportunity Pipeline over the governed intake queue with source and campaign attribution.",
    systemOfRecord: "Enterprise Intake Governance",
    externalToolPolicy: "Do not introduce HubSpot/Copper as the authority unless a specific missing CRM capability is proven.",
    status: "READY",
    nextAction: "Link approved post-delivery expansion back into the existing opportunity pipeline rather than creating a second CRM.",
  },
  {
    capability: "Prospect research",
    existingGemImplementation: "Evidence-safe First-20 research queue plus the existing one-to-one Outreach Workbench; research records cannot send messages or create customers.",
    systemOfRecord: "GEM market research records / approved outreach workbench",
    externalToolPolicy: "Public web and authorized prospect-data tools may enrich records; no uncontrolled bulk outreach.",
    status: "READY",
    nextAction: "Manually verify current company facts before any one-to-one outreach and measure qualified responses.",
  },
  {
    capability: "Email campaigns",
    existingGemImplementation: "Admin campaigns, branded renderer, governed marketing preferences, immutable preference events, SMTP preflight, atomic send claiming, signed unsubscribe, and reconciliation-safe partial delivery.",
    systemOfRecord: "GEM campaign + communication-governance system",
    externalToolPolicy: "Use an external ESP only for a verified deliverability/bounce/complaint gap; GEM remains the consent and campaign authority.",
    status: "PARTIAL",
    nextAction: "Verify production sender identity, SPF/DKIM/DMARC, external delivery, bounce handling, complaint handling, and activate governance secrets before scale.",
  },
  {
    capability: "Social publishing",
    existingGemImplementation: "Social Media Command Center, Content Orchestrator, governed queue, provider-specific activation gates, TokMetric for TikTok.",
    systemOfRecord: "GEM Social Media Command Center",
    externalToolPolicy: "Do not introduce a second scheduler/publishing queue when native GEM coverage exists.",
    status: "PARTIAL",
    nextAction: "Complete provider authorization and evidence for channels that remain externally gated.",
  },
  {
    capability: "Meetings",
    existingGemImplementation: "Native meeting-request API and portal workflow.",
    systemOfRecord: "GEM meeting records",
    externalToolPolicy: "Calendar tooling may enrich availability only if the meeting reference is reconciled to GEM.",
    status: "READY",
    nextAction: "Measure booking-to-attendance and meeting outcome linkage to opportunities/projects.",
  },
  {
    capability: "Support",
    existingGemImplementation: "Durable tickets, governed AI sessions, human escalation, and staff case operations.",
    systemOfRecord: "GEM Support",
    externalToolPolicy: "Do not duplicate cases in Intercom/Gorgias unless a documented integration requirement exists.",
    status: "READY",
    nextAction: "Correlate support patterns with customer health without replacing the support case model.",
  },
  {
    capability: "Payments / conversion",
    existingGemImplementation: "Controlled payment-link and manual reconciliation flow tied to approved opportunity state.",
    systemOfRecord: "GEM opportunity + payment evidence",
    externalToolPolicy: "Payment providers remain transaction processors, not entitlement authorities.",
    status: "HUMAN_GATE",
    nextAction: "Keep activation fail-closed until approval and payment evidence reconcile.",
  },
  {
    capability: "Client onboarding",
    existingGemImplementation: "Controlled conversion into organization/workspace/project and owner invitation.",
    systemOfRecord: "Organization Workspace OS",
    externalToolPolicy: "Do not create a parallel onboarding database.",
    status: "HUMAN_GATE",
    nextAction: "Add onboarding completion and time-to-first-value measurement to the commercial event contract.",
  },
  {
    capability: "Customer success / health",
    existingGemImplementation: "Workspace-scoped customer-success profile now tracks lifecycle, health, outcomes, satisfaction, reviews, and explicit lifecycle actions.",
    systemOfRecord: "GEM customer-success profile linked to Organization → Workspace → Project",
    externalToolPolicy: "Do not adopt a separate customer-success platform; extend the native lifecycle unless a verified gap remains.",
    status: "PARTIAL",
    nextAction: "Apply/review production storage, preview the admin workflow, then measure real outcome/review use before expanding automation.",
  },
  {
    capability: "Expansion / renewal",
    existingGemImplementation: "EXPANSION, RENEWAL, and WIN_BACK actions are now explicit customer-success records; they do not authorize scope or payment.",
    systemOfRecord: "GEM customer-success lifecycle + existing Market Pipeline for approved new scope",
    externalToolPolicy: "External CRM automation may assist only after canonical handoff identifiers and stages are preserved.",
    status: "PARTIAL",
    nextAction: "Add an explicit governed handoff from an approved expansion action into the existing Market Pipeline when operational evidence justifies it.",
  },
  {
    capability: "Referral / testimonial",
    existingGemImplementation: "REFERRAL actions are now explicit post-outcome planning records; no request, testimonial, or publication is sent automatically.",
    systemOfRecord: "GEM customer-success lifecycle + communication/consent evidence",
    externalToolPolicy: "No public testimonial, referral message, or partnership language without verified consent/evidence.",
    status: "PARTIAL",
    nextAction: "Define explicit referral/testimonial consent evidence and approved outreach action before any external request is sent.",
  },
  {
    capability: "Analytics",
    existingGemImplementation: "Canonical commercial event vocabulary is defined; Search Console acquisition evidence is verified, but downstream commercial events are not yet instrumented end to end.",
    systemOfRecord: "GEM event contract + approved analytics provider",
    externalToolPolicy: "Instrument one canonical event taxonomy; do not fragment funnel metrics across unrelated dashboards.",
    status: "PARTIAL",
    nextAction: "Instrument public visit → intake → qualification → proposal → payment → onboarding → delivery → success/expansion events in one approved analytics layer.",
  },
  {
    capability: "Claims governance",
    existingGemImplementation: "Public-claim registry with risk, evidence status, publication action, approved wording, required evidence, owner, and review date.",
    systemOfRecord: "GEM publicClaims registry + audit evidence",
    externalToolPolicy: "Market research may inform claims but cannot override the evidence gate.",
    status: "READY",
    nextAction: "Reconcile stronger Resources/Privacy assertions and stale review dates before scaling distribution or paid media.",
  },
];

export const commercialGapPriorities = [
  {
    priority: 1,
    title: "Production schema activation & smoke test",
    outcome: "Review and apply the additive customer-success and communication-governance storage through the established release process, then verify the admin APIs fail closed/open correctly.",
  },
  {
    priority: 2,
    title: "Sender identity & deliverability evidence",
    outcome: "Verify sender mailbox/domain ownership, SPF, DKIM, DMARC, external delivery, bounces, complaints, reply-to behavior, and governance secrets before campaign scale.",
  },
  {
    priority: 3,
    title: "Canonical commercial analytics instrumentation",
    outcome: "Instrument the existing event contract end to end so search/social/email attribution can be reconciled through qualified lead, payment, onboarding, delivery, and expansion.",
  },
  {
    priority: 4,
    title: "Expansion handoff to existing Market Pipeline",
    outcome: "Turn an operator-approved expansion plan into a separately qualified/scoped opportunity without granting entitlement or creating a second customer record.",
  },
  {
    priority: 5,
    title: "Public claims reconciliation",
    outcome: "Resolve high-risk Resources/Privacy capability assertions against current production evidence before larger distribution or paid acquisition.",
  },
] as const;
