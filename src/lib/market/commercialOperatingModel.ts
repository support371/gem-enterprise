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
    systemOfRecord: "GEM customer lifecycle",
    existingSurface: "No dedicated canonical surface verified",
    status: "GAP",
  },
  {
    key: "EXPAND",
    label: "Expand",
    objective: "Create separately scoped remediation, monitoring, compliance, property-risk, financial-security, or managed-service opportunities when justified by customer need.",
    systemOfRecord: "GEM Market Pipeline linked to existing client organization",
    existingSurface: "No dedicated expansion-opportunity workflow verified",
    status: "GAP",
  },
  {
    key: "RENEW",
    label: "Renew / Follow up",
    objective: "Track contract/service follow-up, renewal dates, re-assessment, and dormant-client reactivation without creating entitlement automatically.",
    systemOfRecord: "GEM customer lifecycle",
    existingSurface: "No dedicated renewal workflow verified",
    status: "GAP",
  },
  {
    key: "REFER",
    label: "Refer / Advocate",
    objective: "Request referrals or approved testimonials only after a verified successful outcome and explicit consent.",
    systemOfRecord: "GEM customer lifecycle + consent evidence",
    existingSurface: "No dedicated referral/testimonial workflow verified",
    status: "GAP",
  },
  {
    key: "LEARN",
    label: "Learn",
    objective: "Feed attribution, delivery outcomes, support patterns, revenue, and customer feedback back into market decisions.",
    systemOfRecord: "GEM analytics + audit evidence",
    existingSurface: "/api/dashboard/summary + connected analytics",
    status: "PARTIAL",
  },
];

export const commercialCapabilities: CommercialCapability[] = [
  {
    capability: "Public acquisition",
    existingGemImplementation: "Canonical GEM website, services, resources, business-review offer, Request Access, campaign attribution.",
    systemOfRecord: "gemcybersecurityassist.com",
    externalToolPolicy: "Use search/market intelligence to inform GEM pages; do not create a second public funnel.",
    status: "READY",
    nextAction: "Improve evidence-backed SEO and conversion using measured demand.",
  },
  {
    capability: "Lead / opportunity pipeline",
    existingGemImplementation: "Enterprise Opportunity Pipeline over the governed intake queue with source and campaign attribution.",
    systemOfRecord: "Enterprise Intake Governance",
    externalToolPolicy: "Do not introduce HubSpot/Copper as the authority unless a specific missing CRM capability is proven.",
    status: "READY",
    nextAction: "Extend the lifecycle after CONVERTED instead of creating a second CRM.",
  },
  {
    capability: "Prospect research",
    existingGemImplementation: "First-20 one-to-one Outreach Workbench and fit criteria.",
    systemOfRecord: "GEM market research records / approved outreach workbench",
    externalToolPolicy: "Public web and authorized prospect-data tools may enrich records; no uncontrolled bulk outreach.",
    status: "PARTIAL",
    nextAction: "Add evidence-qualified prospect dossiers and source references without auto-sending.",
  },
  {
    capability: "Email campaigns",
    existingGemImplementation: "Admin campaigns, branded navy/gold/white renderer, SMTP/Nodemailer delivery, approval-gated send route.",
    systemOfRecord: "GEM campaign system",
    externalToolPolicy: "Use an external ESP only for a verified deliverability/bounce/complaint gap.",
    status: "READY",
    nextAction: "Verify sender-domain authentication, unsubscribe/consent behavior, bounces, and complaints before scale.",
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
    externalToolPolicy: "Cal.com/Calendar tooling may enrich availability only if it writes the meeting reference back to GEM.",
    status: "READY",
    nextAction: "Measure booking-to-attendance and meeting outcome linkage to opportunities/projects.",
  },
  {
    capability: "Support",
    existingGemImplementation: "Durable tickets, governed AI sessions, human escalation, staff case operations.",
    systemOfRecord: "GEM Support",
    externalToolPolicy: "Do not duplicate cases in Intercom/Gorgias unless a documented integration requirement exists.",
    status: "READY",
    nextAction: "Add customer-success metrics without replacing the support case model.",
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
    nextAction: "Add onboarding completion and time-to-first-value measurement.",
  },
  {
    capability: "Customer success / health",
    existingGemImplementation: "No dedicated health, satisfaction, 30/60/90-day, or outcome-completion layer verified on main.",
    systemOfRecord: "Should extend GEM customer lifecycle",
    externalToolPolicy: "Do not adopt a separate customer-success platform until the native lifecycle extension is evaluated.",
    status: "GAP",
    nextAction: "Implement customer health, outcome tracking, follow-up, and satisfaction records linked to organization/workspace/project.",
  },
  {
    capability: "Expansion / renewal",
    existingGemImplementation: "Public offer supports separately scoped next work, but no dedicated expansion/renewal workflow was verified.",
    systemOfRecord: "Should extend GEM Market Pipeline + client organization",
    externalToolPolicy: "External CRM automation may assist only after canonical stages and identifiers are defined.",
    status: "GAP",
    nextAction: "Add linked expansion opportunities, follow-up dates, and renewal/review states.",
  },
  {
    capability: "Referral / testimonial",
    existingGemImplementation: "No dedicated referral or testimonial-consent workflow verified.",
    systemOfRecord: "Should extend GEM customer lifecycle + consent evidence",
    externalToolPolicy: "No public testimonial or partnership language without verified consent/evidence.",
    status: "GAP",
    nextAction: "Add consented referral/testimonial workflow after successful delivery outcomes.",
  },
  {
    capability: "Analytics",
    existingGemImplementation: "Dashboard summary API and an external Amplitude connector are registered; current connected Amplitude project has no verified GEM funnel events yet.",
    systemOfRecord: "GEM event contract + approved analytics provider",
    externalToolPolicy: "Instrument one canonical event taxonomy; do not fragment funnel metrics across unrelated dashboards.",
    status: "PARTIAL",
    nextAction: "Define and instrument discovery → intake → qualified → proposal → paid → onboarding → delivery → expansion events.",
  },
  {
    capability: "Claims governance",
    existingGemImplementation: "Public-claim registry with risk, evidence status, publication action, approved wording, required evidence, owner, and review date.",
    systemOfRecord: "GEM publicClaims registry + audit evidence",
    externalToolPolicy: "Market research may inform claims but cannot override the evidence gate.",
    status: "READY",
    nextAction: "Reconcile stale review dates and audit all market-facing content before scaling distribution.",
  },
];

export const commercialGapPriorities = [
  {
    priority: 1,
    title: "Customer success foundation",
    outcome: "Outcome tracking, health, satisfaction, open actions, and 30/60/90-day follow-up linked to the canonical client record.",
  },
  {
    priority: 2,
    title: "Expansion and renewal workflow",
    outcome: "Create separately scoped post-delivery opportunities and renewal/review dates without auto-activating service.",
  },
  {
    priority: 3,
    title: "Canonical commercial analytics",
    outcome: "One event taxonomy covering acquisition through delivery, retention, expansion, and referral.",
  },
  {
    priority: 4,
    title: "Consent and communications evidence",
    outcome: "Make outreach/campaign channel, lawful basis/consent state, opt-out, sender identity, and contact history auditable.",
  },
  {
    priority: 5,
    title: "Referral and advocacy controls",
    outcome: "Capture referral/testimonial consent and attribution only after verified successful delivery.",
  },
] as const;
