export type VideoScriptCategory = "leadership" | "services" | "operations" | "support";

export interface VideoScript {
  id: string;
  title: string;
  speaker: string;
  role: string;
  durationSeconds: number;
  script: string;
  category: VideoScriptCategory;
  avatarId: string;
  voiceId: string;
  backgroundStyle: string;
  tags: string[];
  disclosure: string;
}

export const videoScripts: VideoScript[] = [
  {
    id: "ceo-intro",
    title: "Founder Introduction Script",
    speaker: "Leonard Diana",
    role: "CEO & Founder",
    durationSeconds: 60,
    category: "leadership",
    script: `Hello, I'm Leonard Diana, CEO and Founder of GEM Enterprise.

GEM is an access-controlled platform for enterprise clients who need coordinated support across cybersecurity, compliance, financial-security documentation, and property-risk workflows.

What makes GEM different is our commitment to controlled, audited operations. We do not activate sensitive services until eligibility, scope, provider capability, jurisdictional requirements, and contractual terms are reviewed. We are built to fail closed—not open.

Our operating model is designed for clear ownership, human review, and documented escalation. Sensitive and high-impact decisions remain reviewable and auditable.

We believe enterprise support should be designed to integrate with existing governance frameworks instead of bypassing them.

At GEM, our public promise is simple: we help clients understand scope, risks, dependencies, and next steps before activation.`,
    avatarId: "avatar_professional_male_1",
    voiceId: "voice_professional_male_us",
    backgroundStyle: "corporate_office",
    tags: ["leadership", "company-mission", "enterprise"],
    disclosure: "AI-avatar production requires owner approval, provider terms review, and configured credentials.",
  },
  {
    id: "cybersecurity-services",
    title: "Cybersecurity Services Script",
    speaker: "Cybersecurity Services Lead",
    role: "Security Operations Representative",
    durationSeconds: 45,
    category: "services",
    script: `GEM cybersecurity services are presented with controlled scope and clear activation gates.

Potential work may include security assessments, exposure reviews, incident-response coordination, and monitoring support when provider coverage, staffing, access, and contractual terms are confirmed.

We do not describe planned or provider-dependent capabilities as live until they are verified. Each service must be scoped, staffed, authorized, and documented before activation.

Clients should understand what is being reviewed, which systems are in scope, which providers are involved, and what escalation path applies.

That is GEM's approach: cybersecurity support with transparency, controlled activation, and human review.`,
    avatarId: "avatar_professional_female_1",
    voiceId: "voice_professional_female_us",
    backgroundStyle: "security_operations_center",
    tags: ["services", "cybersecurity", "scope"],
    disclosure: "Avoid claims of continuous monitoring or quantified outcomes unless independently verified for the specific client engagement.",
  },
  {
    id: "compliance-financial-security",
    title: "Compliance & Financial-Security Coordination Script",
    speaker: "Compliance Coordination Lead",
    role: "Compliance Operations Representative",
    durationSeconds: 45,
    category: "services",
    script: `GEM financial-security coordination helps clients organize risk reviews, documentation, specialist referrals, and compliance-support workflows.

We are careful about what this service is not. GEM does not promise custody, recovery, investment returns, automatic approvals, or regulated financial services through a public page.

Our role is to coordinate intake, document scope, route enquiries, support control reviews, and help clients understand manual dependencies.

Provider-dependent and jurisdiction-sensitive work remains disabled until the right authorization, contracts, credentials, and specialist support are in place.

GEM's compliance coordination is built around transparent records, auditable workflow, and conservative activation gates.`,
    avatarId: "avatar_professional_male_2",
    voiceId: "voice_professional_male_us",
    backgroundStyle: "corporate_office",
    tags: ["services", "compliance", "financial-security"],
    disclosure: "Scripts must not claim certifications, findings, or savings unless supported by approved evidence.",
  },
  {
    id: "support-operations",
    title: "Support Operations Script",
    speaker: "Support Operations Lead",
    role: "Support Operations Representative",
    durationSeconds: 45,
    category: "operations",
    script: `Welcome to GEM Support Operations.

Public enquiries are handled through structured intake, categorization, and routing. Sensitive requests require additional review before any protected workflow is activated.

Our support model emphasizes documented procedures, clear escalation paths, and transparent communication about what GEM can and cannot do.

Clients receive status information appropriate to their request, but response targets and dedicated contacts are defined only in approved agreements.

GEM support is designed to help clients navigate service options, clarify dependencies, and escalate appropriately when manual review is required.`,
    avatarId: "avatar_professional_male_3",
    voiceId: "voice_professional_male_us",
    backgroundStyle: "support_center",
    tags: ["operations", "support", "client-service"],
    disclosure: "Do not describe support as always-on or dedicated unless the signed service agreement confirms it.",
  },
  {
    id: "company-mission",
    title: "Company Mission Script",
    speaker: "Leonard Diana",
    role: "CEO & Founder",
    durationSeconds: 60,
    category: "leadership",
    script: `GEM Enterprise was designed around one operating principle: built to be merged.

Every workflow should be able to fit into existing enterprise governance instead of creating shadow processes. We aim to work alongside your tools, teams, authorization paths, and reporting expectations.

The platform brings together cybersecurity, compliance coordination, financial-security support, and property-risk intake under controlled access.

Every sensitive service is scoped before activation. Every high-impact decision remains subject to human review. Every provider-dependent capability must be verified before it is described as operational.

GEM is not just a public catalogue. It is a controlled operating model for clients who need clarity, escalation, and documentation.

That is the GEM difference: controlled scope, conservative activation, and enterprise-aware coordination.`,
    avatarId: "avatar_professional_male_1",
    voiceId: "voice_professional_male_us",
    backgroundStyle: "corporate_office",
    tags: ["leadership", "company-mission", "governance"],
    disclosure: "Mission videos must preserve the fail-closed operating model and avoid unverified operational claims.",
  },
  {
    id: "vip-management",
    title: "VIP Client Management Script",
    speaker: "VIP Board Desk Representative",
    role: "VIP Account Representative",
    durationSeconds: 45,
    category: "operations",
    script: `GEM's VIP Board Desk is a proposed premium support path for approved clients whose agreements define relationship coverage, escalation channels, and service boundaries.

VIP handling may include executive visibility, strategic account reviews, and coordinated escalation when those terms are approved.

We do not imply priority coverage, fixed response commitments or direct leadership access until eligibility, staffing, and contractual terms are confirmed.

The goal is to give qualified clients a clearer operating rhythm: documented communication, appropriate escalation, and aligned planning.

If your organization needs a higher-touch support model, GEM can discuss requirements through a controlled enquiry process.`,
    avatarId: "avatar_professional_male_4",
    voiceId: "voice_professional_male_us",
    backgroundStyle: "executive_office",
    tags: ["operations", "vip", "premium-service"],
    disclosure: "VIP claims remain request-only until agreement terms and staffing are approved.",
  },
  {
    id: "property-risk",
    title: "Property & Asset Risk Script",
    speaker: "Property Risk Representative",
    role: "Property-Risk Coordination Representative",
    durationSeconds: 45,
    category: "services",
    script: `GEM property and asset-risk support focuses on controlled intake, documentation support, fraud awareness, and authorized specialist referrals.

We do not assume property rights, ownership, legal authority, or jurisdictional eligibility. Those items must be verified through appropriate records, authorizations, and qualified professionals.

Depending on scope, GEM may help organize property-risk reviews, coordinate documentation, and route requests to specialists.

The process is conservative by design. If authority, provider capability, or jurisdictional requirements are unclear, the workflow remains paused until reviewed.

GEM bridges cybersecurity, compliance, and property-risk coordination while keeping high-impact decisions reviewable.`,
    avatarId: "avatar_professional_male_5",
    voiceId: "voice_professional_male_us",
    backgroundStyle: "corporate_office",
    tags: ["services", "property", "risk"],
    disclosure: "Property-risk videos must not imply brokerage, legal, custody, or ownership determinations unless separately approved.",
  },
  {
    id: "business-development",
    title: "Sales & Business Development Script",
    speaker: "Business Development Representative",
    role: "Business Development Lead",
    durationSeconds: 45,
    category: "operations",
    script: `GEM business development starts with listening and scope clarification.

We help organizations understand which GEM service paths may fit their needs across cybersecurity, compliance coordination, financial-security support, and property-risk workflows.

The sales process is intentionally transparent. We explain what can be reviewed publicly, what requires eligibility checks, what depends on providers, and what must wait for signed terms.

We do not activate paid, regulated, or sensitive services from a public script or automated video.

If GEM may be a fit for your organization, the next step is a controlled enquiry so scope, risks, dependencies, and exclusions can be documented.`,
    avatarId: "avatar_professional_male_6",
    voiceId: "voice_professional_male_us",
    backgroundStyle: "corporate_office",
    tags: ["operations", "sales", "business-development"],
    disclosure: "Sales videos must preserve request-only positioning and avoid activating paid services.",
  },
];

export const homepageVideoScripts = videoScripts.slice(0, 3);
