/**
 * GEM Community Hub — Mock data layer.
 *
 * Centralised, type-safe mock data used by public-preview hub pages.
 * Real data will be sourced from the database (Neon) in a future pass;
 * this keeps the route map and UI deterministic today.
 */

export type MemberTier = "Partner" | "Operator" | "Investor" | "Client" | "Advisor";
export type VerificationStatus = "Verified" | "Pending" | "Archived";
export type OpportunityStage = "Sourcing" | "Active" | "Due Diligence" | "Closing" | "Closed";
export type OpportunityType =
  | "Capital"
  | "Acquisition"
  | "Partnership"
  | "Mandate"
  | "Secondary";

// ─── Member Types ──────────────────────────────────────────────────────────────

export interface MemberType {
  tier: MemberTier;
  tagline: string;
  description: string;
  count: string;
}

export const MEMBER_TYPES: MemberType[] = [
  {
    tier: "Partner",
    tagline: "Strategic alliance operators",
    description:
      "Principals and firms deploying capital and services alongside GEM across jurisdictions.",
    count: "64 firms",
  },
  {
    tier: "Operator",
    tagline: "Cross-border execution specialists",
    description:
      "Verified operators executing on logistics, real estate, compliance, and payment flows.",
    count: "180+",
  },
  {
    tier: "Investor",
    tagline: "Institutional & family capital",
    description:
      "Institutional allocators, family offices, and accredited principals within the network.",
    count: "210+",
  },
  {
    tier: "Client",
    tagline: "Enterprise mandates",
    description:
      "Corporates and institutions engaging GEM for services, mandates, and secure execution.",
    count: "500+",
  },
  {
    tier: "Advisor",
    tagline: "Domain expert counsel",
    description:
      "Legal, regulatory, and strategic advisors attached to GEM mandates on demand.",
    count: "75+",
  },
];

// ─── Trust Pillars ─────────────────────────────────────────────────────────────

export const TRUST_PILLARS = [
  { label: "Private", detail: "Invitation-only, curated membership" },
  { label: "Verified", detail: "KYC + entitlement checks on every member" },
  { label: "Compliance-aware", detail: "SOC 2, ISO 27001, GDPR-aligned controls" },
  { label: "Cross-border", detail: "Coordinated execution across jurisdictions" },
] as const;

// ─── Opportunities ─────────────────────────────────────────────────────────────

export interface Opportunity {
  id: string;
  title: string;
  sector: string;
  region: string;
  stage: OpportunityStage;
  type: OpportunityType;
  ticket: string;
  summary: string;
  verified: boolean;
  featured?: boolean;
  postedBy: string;
  postedAt: string;
  closesIn?: string;
}

export const OPPORTUNITIES: Opportunity[] = [
  {
    id: "op-2601",
    title: "Class A logistics platform — GCC + East Africa corridor",
    sector: "Logistics",
    region: "GCC · East Africa",
    stage: "Active",
    type: "Capital",
    ticket: "USD 45–75M",
    summary:
      "Operator-led roll-up of Tier-1 bonded warehousing and last-mile operators across a three-country corridor. Co-invest tranche open to verified members.",
    verified: true,
    featured: true,
    postedBy: "Meridian Capital",
    postedAt: "3 days ago",
    closesIn: "14 days",
  },
  {
    id: "op-2602",
    title: "Institutional real estate mandate — Northeast US multi-family",
    sector: "Real Estate",
    region: "United States",
    stage: "Due Diligence",
    type: "Mandate",
    ticket: "USD 120M",
    summary:
      "Qualified operator sought for stabilised multi-family portfolio acquisition with long-dated institutional capital behind it.",
    verified: true,
    postedBy: "Northstar Realty",
    postedAt: "6 days ago",
    closesIn: "21 days",
  },
  {
    id: "op-2603",
    title: "Regulatory technology — payment rails compliance overlay",
    sector: "Compliance",
    region: "EMEA",
    stage: "Sourcing",
    type: "Partnership",
    ticket: "Strategic",
    summary:
      "GEM-backed regtech platform seeking regulated distribution partners for payment-rail compliance and sanctions screening module.",
    verified: true,
    postedBy: "GEM Capital Markets",
    postedAt: "10 days ago",
  },
  {
    id: "op-2604",
    title: "Secondary position — Tier-1 private credit vehicle",
    sector: "Private Credit",
    region: "Global",
    stage: "Closing",
    type: "Secondary",
    ticket: "USD 18M",
    summary:
      "Motivated LP offering secondary position in performing senior-secured credit vehicle. Discount to NAV. Verified members only.",
    verified: true,
    postedBy: "Apex Financial",
    postedAt: "1 day ago",
    closesIn: "5 days",
  },
  {
    id: "op-2605",
    title: "Family office co-investment — critical infrastructure",
    sector: "Infrastructure",
    region: "Southeast Asia",
    stage: "Active",
    type: "Capital",
    ticket: "USD 25–40M",
    summary:
      "Co-invest alongside anchor family office in a permitted-path infrastructure platform with contracted government offtake.",
    verified: true,
    postedBy: "Sovereign Risk",
    postedAt: "2 weeks ago",
    closesIn: "30 days",
  },
  {
    id: "op-2606",
    title: "Cross-border acquisition — specialty distribution",
    sector: "Distribution",
    region: "LATAM · US",
    stage: "Sourcing",
    type: "Acquisition",
    ticket: "USD 60M",
    summary:
      "Acquirer seeking specialty distribution targets with USD-denominated receivables and established compliance track record.",
    verified: false,
    postedBy: "Crestview Legal",
    postedAt: "3 weeks ago",
  },
];

// ─── Members ───────────────────────────────────────────────────────────────────

export interface DirectoryMember {
  id: string;
  name: string;
  initials: string;
  title: string;
  company: string;
  location: string;
  sector: string;
  tier: MemberTier;
  verified: VerificationStatus;
  online: boolean;
}

export const DIRECTORY_MEMBERS: DirectoryMember[] = [
  {
    id: "m-1",
    name: "M. Harrington",
    initials: "MH",
    title: "Chief Investment Officer",
    company: "Meridian Capital",
    location: "London, UK",
    sector: "Private Credit",
    tier: "Partner",
    verified: "Verified",
    online: true,
  },
  {
    id: "m-2",
    name: "David Chen",
    initials: "DC",
    title: "Managing Director, Portfolio Risk",
    company: "Apex Financial",
    location: "New York, US",
    sector: "Capital Markets",
    tier: "Investor",
    verified: "Verified",
    online: true,
  },
  {
    id: "m-3",
    name: "Priya Nambiar",
    initials: "PN",
    title: "VP Enterprise Risk",
    company: "Northstar Realty",
    location: "Singapore",
    sector: "Real Estate",
    tier: "Operator",
    verified: "Verified",
    online: false,
  },
  {
    id: "m-4",
    name: "R. Okonkwo",
    initials: "RO",
    title: "Chief Compliance Officer",
    company: "Vanguard Infrastructure",
    location: "Lagos, NG",
    sector: "Infrastructure",
    tier: "Advisor",
    verified: "Verified",
    online: true,
  },
  {
    id: "m-5",
    name: "L. Barnes",
    initials: "LB",
    title: "Partner, Regulatory",
    company: "Crestview Legal",
    location: "Washington DC, US",
    sector: "Legal",
    tier: "Advisor",
    verified: "Verified",
    online: false,
  },
  {
    id: "m-6",
    name: "S. Patel",
    initials: "SP",
    title: "Chief Financial Officer",
    company: "Sovereign Risk",
    location: "Dubai, UAE",
    sector: "Family Office",
    tier: "Investor",
    verified: "Verified",
    online: true,
  },
  {
    id: "m-7",
    name: "A. Nakamura",
    initials: "AN",
    title: "Head of Strategy",
    company: "Kyoto Holdings",
    location: "Tokyo, JP",
    sector: "Diversified",
    tier: "Partner",
    verified: "Verified",
    online: false,
  },
  {
    id: "m-8",
    name: "E. Oyelaran",
    initials: "EO",
    title: "Regional Director",
    company: "GEM West Africa",
    location: "Accra, GH",
    sector: "Logistics",
    tier: "Operator",
    verified: "Verified",
    online: true,
  },
  {
    id: "m-9",
    name: "J. Whitford",
    initials: "JW",
    title: "General Counsel",
    company: "Atlas Industrial",
    location: "Toronto, CA",
    sector: "Industrial",
    tier: "Client",
    verified: "Verified",
    online: false,
  },
];

// ─── Strategic Circles ────────────────────────────────────────────────────────

export interface Circle {
  id: string;
  name: string;
  focus: string;
  description: string;
  memberCount: number;
  private: boolean;
  cadence: string;
  chair: string;
}

export const CIRCLES: Circle[] = [
  {
    id: "c-cross-border",
    name: "Cross-Border Capital",
    focus: "Capital Flows",
    description:
      "Senior principals and structuring counsel working on multi-jurisdiction capital deployments and regulatory optimisation.",
    memberCount: 48,
    private: true,
    cadence: "Monthly briefing",
    chair: "M. Harrington",
  },
  {
    id: "c-regtech",
    name: "Regulatory Technology",
    focus: "Compliance & RegTech",
    description:
      "Compliance officers, regtech operators, and legal advisors sharing patterns on sanctions screening, KYC, and payment-rail controls.",
    memberCount: 62,
    private: true,
    cadence: "Bi-weekly working group",
    chair: "R. Okonkwo",
  },
  {
    id: "c-real-estate",
    name: "Institutional Real Estate",
    focus: "Real Estate",
    description:
      "Operators and allocators focused on stabilised institutional real estate across US, EMEA, and select emerging markets.",
    memberCount: 71,
    private: false,
    cadence: "Quarterly roundtable",
    chair: "Priya Nambiar",
  },
  {
    id: "c-logistics",
    name: "Logistics & Trade Corridors",
    focus: "Logistics",
    description:
      "Operators executing on bonded warehousing, last-mile, and cross-border trade corridors — with a focus on MENA, East Africa, and Asia.",
    memberCount: 54,
    private: true,
    cadence: "Operator huddles",
    chair: "E. Oyelaran",
  },
  {
    id: "c-family-office",
    name: "Family Office Principals",
    focus: "Family Office",
    description:
      "Invitation-only group of single- and multi-family office principals coordinating deployment, governance, and succession.",
    memberCount: 29,
    private: true,
    cadence: "Private summits",
    chair: "S. Patel",
  },
  {
    id: "c-infra",
    name: "Critical Infrastructure",
    focus: "Infrastructure",
    description:
      "Sponsors and operators active in regulated infrastructure platforms with contracted offtake or government concession structures.",
    memberCount: 38,
    private: false,
    cadence: "Monthly deep dive",
    chair: "A. Nakamura",
  },
];

// ─── Events ────────────────────────────────────────────────────────────────────

export interface HubEvent {
  id: string;
  dateLabel: string;
  month: string;
  day: string;
  title: string;
  format: "Private Briefing" | "In-Person" | "Virtual" | "Closed Summit";
  location?: string;
  abstract: string;
  seats?: string;
}

export const EVENTS: HubEvent[] = [
  {
    id: "ev-1",
    dateLabel: "APR 08",
    month: "Apr",
    day: "08",
    title: "Cross-Border Capital Briefing — Q2 2026",
    format: "Private Briefing",
    abstract:
      "Quarterly briefing for Cross-Border Capital Circle covering regulatory developments, deployment themes, and featured opportunities.",
    seats: "42 seats — members only",
  },
  {
    id: "ev-2",
    dateLabel: "APR 22",
    month: "Apr",
    day: "22",
    title: "Financial Crime & Cyber Risk Summit",
    format: "In-Person",
    location: "New York, NY",
    abstract:
      "Closed-door summit with CISOs, chief compliance officers, and regulators on convergence of financial crime and cyber.",
    seats: "80 seats — by invitation",
  },
  {
    id: "ev-3",
    dateLabel: "MAY 14",
    month: "May",
    day: "14",
    title: "Real Estate Fraud Prevention Working Session",
    format: "Virtual",
    abstract:
      "Practitioner working session on institutional-grade title monitoring and portfolio fraud prevention playbooks.",
    seats: "Open to verified operators",
  },
  {
    id: "ev-4",
    dateLabel: "JUN 03",
    month: "Jun",
    day: "03",
    title: "GEM Annual Enterprise Summit",
    format: "Closed Summit",
    location: "Washington, DC",
    abstract:
      "The flagship GEM summit — two days of private sessions, mandate matchmaking, and regulatory dialogue.",
    seats: "200 seats — members + invited guests",
  },
];

// ─── Knowledge Resources ──────────────────────────────────────────────────────

export type ResourceKind =
  | "Intelligence Brief"
  | "Playbook"
  | "Framework"
  | "Regulatory"
  | "Market Report";

export interface HubResource {
  id: string;
  title: string;
  kind: ResourceKind;
  topic: string;
  summary: string;
  date: string;
  pages: number;
  gated: boolean;
  featured?: boolean;
}

export const RESOURCES: HubResource[] = [
  {
    id: "r-1",
    title: "Cross-Border Capital — Q2 2026 Thesis Review",
    kind: "Intelligence Brief",
    topic: "Capital Markets",
    summary:
      "GEM analyst view on deployment themes, regulatory exposure, and opportunity corridors for the quarter.",
    date: "Apr 2026",
    pages: 18,
    gated: true,
    featured: true,
  },
  {
    id: "r-2",
    title: "Institutional Real Estate — Market Report",
    kind: "Market Report",
    topic: "Real Estate",
    summary:
      "Comprehensive market view across multi-family, industrial, and selected commercial assets with fraud-risk overlays.",
    date: "Mar 2026",
    pages: 46,
    gated: true,
  },
  {
    id: "r-3",
    title: "SEC Disclosure Rules — Enterprise Summary",
    kind: "Regulatory",
    topic: "Compliance",
    summary:
      "Executive summary of updated SEC disclosure rules with enterprise impact analysis and reporting workflow implications.",
    date: "Feb 2026",
    pages: 12,
    gated: false,
  },
  {
    id: "r-4",
    title: "Enterprise Risk Framework v4.1",
    kind: "Framework",
    topic: "Risk",
    summary:
      "Updated framework integrating cyber, financial, and real-asset risk classes into a unified board-ready reporting view.",
    date: "Feb 2026",
    pages: 28,
    gated: true,
  },
  {
    id: "r-5",
    title: "Property Fraud Prevention Playbook",
    kind: "Playbook",
    topic: "Real Estate",
    summary:
      "Operational playbook for title monitoring, deed-fraud detection, and verified-recording workflows for portfolios.",
    date: "Jan 2026",
    pages: 22,
    gated: true,
  },
  {
    id: "r-6",
    title: "SOC 2 Audit Preparation Checklist",
    kind: "Playbook",
    topic: "Compliance",
    summary:
      "Audit-readiness checklist used by GEM clients preparing for SOC 2 Type II observation windows.",
    date: "Jan 2026",
    pages: 14,
    gated: false,
  },
];
