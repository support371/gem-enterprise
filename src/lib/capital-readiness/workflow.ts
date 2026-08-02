export const CAPITAL_WORKSTREAM_WEIGHTS = {
  CORPORATE: 0.15,
  FINANCIAL: 0.2,
  COMMERCIAL: 0.1,
  MANAGEMENT: 0.1,
  CYBERSECURITY: 0.15,
  COMPLIANCE: 0.15,
  TRANSACTION: 0.1,
  DATA_ROOM: 0.05,
} as const;

export type CapitalWorkstreamType = keyof typeof CAPITAL_WORKSTREAM_WEIGHTS;

export type CapitalAssessmentStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "READY"
  | "CONDITIONALLY_READY"
  | "REMEDIATION_REQUIRED"
  | "BLOCKED";

export interface CapitalWorkstreamScore {
  type: CapitalWorkstreamType;
  score: number;
  criticalFindings: number;
  openActions: number;
}

export interface CapitalReadinessDecision {
  overallScore: number;
  status: CapitalAssessmentStatus;
  criticalBlocks: number;
  openActions: number;
  completeWorkstreams: number;
  rationale: string;
}

function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

export function calculateCapitalReadiness(
  workstreams: readonly CapitalWorkstreamScore[],
): CapitalReadinessDecision {
  const byType = new Map(workstreams.map((item) => [item.type, item]));
  let weightedScore = 0;
  let criticalBlocks = 0;
  let openActions = 0;
  let completeWorkstreams = 0;

  for (const [type, weight] of Object.entries(CAPITAL_WORKSTREAM_WEIGHTS) as Array<
    [CapitalWorkstreamType, number]
  >) {
    const item = byType.get(type);
    if (!item) continue;
    weightedScore += clampScore(item.score) * weight;
    criticalBlocks += Math.max(0, Math.trunc(item.criticalFindings));
    openActions += Math.max(0, Math.trunc(item.openActions));
    completeWorkstreams += 1;
  }

  const overallScore = Math.round(weightedScore * 100) / 100;

  if (criticalBlocks > 0) {
    return {
      overallScore,
      status: "BLOCKED",
      criticalBlocks,
      openActions,
      completeWorkstreams,
      rationale: "One or more unresolved critical findings override the numerical readiness score.",
    };
  }

  if (completeWorkstreams === 0) {
    return {
      overallScore: 0,
      status: "NOT_STARTED",
      criticalBlocks: 0,
      openActions: 0,
      completeWorkstreams: 0,
      rationale: "No readiness workstream has been scored.",
    };
  }

  if (completeWorkstreams < Object.keys(CAPITAL_WORKSTREAM_WEIGHTS).length) {
    return {
      overallScore,
      status: "IN_PROGRESS",
      criticalBlocks: 0,
      openActions,
      completeWorkstreams,
      rationale: "The readiness assessment is incomplete because one or more required workstreams are missing.",
    };
  }

  if (overallScore >= 80) {
    return {
      overallScore,
      status: "READY",
      criticalBlocks: 0,
      openActions,
      completeWorkstreams,
      rationale: "All required workstreams are complete, the weighted score is at least 80, and no critical block is open.",
    };
  }

  if (overallScore >= 65) {
    return {
      overallScore,
      status: "CONDITIONALLY_READY",
      criticalBlocks: 0,
      openActions,
      completeWorkstreams,
      rationale: "The matter may proceed only with recorded conditions and remediation ownership.",
    };
  }

  return {
    overallScore,
    status: "REMEDIATION_REQUIRED",
    criticalBlocks: 0,
    openActions,
    completeWorkstreams,
    rationale: "The weighted readiness score is below the minimum conditional threshold.",
  };
}

export const CAPITAL_MATTER_STATUSES = [
  "INTAKE",
  "KYB_AND_CONFLICT_REVIEW",
  "ENGAGEMENT_EXECUTION",
  "READINESS_ASSESSMENT",
  "REMEDIATION",
  "INTERNAL_COMMITTEE",
  "LICENSED_PARTNER_REVIEW",
  "CONTROLLED_MARKET_PROCESS",
  "DILIGENCE_AND_PROPOSALS",
  "TERM_SHEET",
  "PRE_CLOSING",
  "CLOSING_IN_PROGRESS",
  "CLOSED",
  "FAILED_TO_CLOSE",
  "TERMINATED",
] as const;

export type CapitalMatterStatus = (typeof CAPITAL_MATTER_STATUSES)[number];

const TERMINAL_STATES = new Set<CapitalMatterStatus>(["CLOSED", "FAILED_TO_CLOSE", "TERMINATED"]);

const ALLOWED_TRANSITIONS: Readonly<Record<CapitalMatterStatus, readonly CapitalMatterStatus[]>> = {
  INTAKE: ["KYB_AND_CONFLICT_REVIEW", "TERMINATED"],
  KYB_AND_CONFLICT_REVIEW: ["ENGAGEMENT_EXECUTION", "TERMINATED"],
  ENGAGEMENT_EXECUTION: ["READINESS_ASSESSMENT", "TERMINATED"],
  READINESS_ASSESSMENT: ["REMEDIATION", "INTERNAL_COMMITTEE", "TERMINATED"],
  REMEDIATION: ["READINESS_ASSESSMENT", "INTERNAL_COMMITTEE", "TERMINATED"],
  INTERNAL_COMMITTEE: ["REMEDIATION", "LICENSED_PARTNER_REVIEW", "TERMINATED"],
  LICENSED_PARTNER_REVIEW: ["REMEDIATION", "CONTROLLED_MARKET_PROCESS", "TERMINATED"],
  CONTROLLED_MARKET_PROCESS: ["DILIGENCE_AND_PROPOSALS", "TERMINATED"],
  DILIGENCE_AND_PROPOSALS: ["TERM_SHEET", "CONTROLLED_MARKET_PROCESS", "TERMINATED"],
  TERM_SHEET: ["PRE_CLOSING", "DILIGENCE_AND_PROPOSALS", "TERMINATED"],
  PRE_CLOSING: ["CLOSING_IN_PROGRESS", "DILIGENCE_AND_PROPOSALS", "TERMINATED"],
  CLOSING_IN_PROGRESS: ["CLOSED", "FAILED_TO_CLOSE"],
  CLOSED: [],
  FAILED_TO_CLOSE: [],
  TERMINATED: [],
};

export interface CapitalTransitionContext {
  activeComplianceHold?: boolean;
  activeLegalHold?: boolean;
  engagementSigned?: boolean;
  kybApproved?: boolean;
  readinessStatus?: CapitalAssessmentStatus;
  committeeApproved?: boolean;
  licensedPartnerAccepted?: boolean;
  partnerAndComplianceApprovedOutreach?: boolean;
  approvedProposalOrTermSheet?: boolean;
  closingGatesSatisfied?: boolean;
}

export interface CapitalTransitionDecision {
  allowed: boolean;
  code:
    | "ALLOWED"
    | "INVALID_TRANSITION"
    | "TERMINAL_STATE"
    | "HOLD_ACTIVE"
    | "KYB_REQUIRED"
    | "SIGNED_ENGAGEMENT_REQUIRED"
    | "READINESS_REQUIRED"
    | "COMMITTEE_APPROVAL_REQUIRED"
    | "LICENSED_PARTNER_REQUIRED"
    | "OUTREACH_APPROVAL_REQUIRED"
    | "PROPOSAL_REQUIRED"
    | "CLOSING_GATES_REQUIRED";
  reason: string;
}

export function validateCapitalMatterTransition(
  current: CapitalMatterStatus,
  next: CapitalMatterStatus,
  context: CapitalTransitionContext,
): CapitalTransitionDecision {
  if (TERMINAL_STATES.has(current)) {
    return { allowed: false, code: "TERMINAL_STATE", reason: "Terminal matters cannot transition to another state." };
  }

  if (!ALLOWED_TRANSITIONS[current].includes(next)) {
    return { allowed: false, code: "INVALID_TRANSITION", reason: `${current} cannot transition directly to ${next}.` };
  }

  if (context.activeComplianceHold || context.activeLegalHold) {
    return { allowed: false, code: "HOLD_ACTIVE", reason: "An active compliance or legal hold blocks progression." };
  }

  if (next === "ENGAGEMENT_EXECUTION" && !context.kybApproved) {
    return { allowed: false, code: "KYB_REQUIRED", reason: "KYB and conflict review must be approved before engagement execution." };
  }

  if (next === "READINESS_ASSESSMENT" && !context.engagementSigned) {
    return { allowed: false, code: "SIGNED_ENGAGEMENT_REQUIRED", reason: "A signed engagement is required before readiness work begins." };
  }

  if (next === "INTERNAL_COMMITTEE" && !["READY", "CONDITIONALLY_READY"].includes(context.readinessStatus ?? "")) {
    return { allowed: false, code: "READINESS_REQUIRED", reason: "The matter must be ready or conditionally ready before committee submission." };
  }

  if (next === "LICENSED_PARTNER_REVIEW" && !context.committeeApproved) {
    return { allowed: false, code: "COMMITTEE_APPROVAL_REQUIRED", reason: "Internal committee approval is required before partner routing." };
  }

  if (next === "CONTROLLED_MARKET_PROCESS" && !context.licensedPartnerAccepted) {
    return { allowed: false, code: "LICENSED_PARTNER_REQUIRED", reason: "An eligible licensed partner must accept the mandate." };
  }

  if (next === "DILIGENCE_AND_PROPOSALS" && !context.partnerAndComplianceApprovedOutreach) {
    return { allowed: false, code: "OUTREACH_APPROVAL_REQUIRED", reason: "Partner and compliance approval must exist before the controlled external process." };
  }

  if (next === "PRE_CLOSING" && !context.approvedProposalOrTermSheet) {
    return { allowed: false, code: "PROPOSAL_REQUIRED", reason: "An approved proposal or term sheet is required before pre-closing." };
  }

  if (next === "CLOSING_IN_PROGRESS" && !context.closingGatesSatisfied) {
    return { allowed: false, code: "CLOSING_GATES_REQUIRED", reason: "Every mandatory closing gate must be satisfied before closing begins." };
  }

  return { allowed: true, code: "ALLOWED", reason: "The requested transition satisfies the controlled matter workflow." };
}

export interface CapitalPartnerEligibilityInput {
  status: "PENDING_VERIFICATION" | "ACTIVE" | "RESTRICTED" | "SUSPENDED" | "EXPIRED" | "TERMINATED";
  jurisdiction: string;
  approvedJurisdictions: readonly string[];
  instrument: string;
  authorizedInstruments: readonly string[];
  transactionAmount?: number | null;
  minimumTransaction?: number | null;
  maximumTransaction?: number | null;
  agreementExpiresAt?: Date | null;
  licenseExpiresAt?: Date | null;
  conflictCleared: boolean;
  verificationEvidenceRef?: string | null;
  asOf?: Date;
}

export interface CapitalPartnerEligibilityDecision {
  eligible: boolean;
  blockers: string[];
}

export function evaluateCapitalPartnerEligibility(
  input: CapitalPartnerEligibilityInput,
): CapitalPartnerEligibilityDecision {
  const asOf = input.asOf ?? new Date();
  const blockers: string[] = [];

  if (input.status !== "ACTIVE") blockers.push("Partner status must be ACTIVE.");
  if (!input.approvedJurisdictions.includes(input.jurisdiction)) blockers.push("Jurisdiction is not approved for this partner.");
  if (!input.authorizedInstruments.includes(input.instrument)) blockers.push("Instrument is outside the partner's verified authorization.");
  if (!input.conflictCleared) blockers.push("Conflict clearance is required.");
  if (!input.verificationEvidenceRef) blockers.push("Current regulatory verification evidence is required.");
  if (input.agreementExpiresAt && input.agreementExpiresAt <= asOf) blockers.push("Partner agreement is expired.");
  if (input.licenseExpiresAt && input.licenseExpiresAt <= asOf) blockers.push("Partner license evidence is expired.");

  if (input.transactionAmount != null) {
    if (input.minimumTransaction != null && input.transactionAmount < input.minimumTransaction) {
      blockers.push("Transaction amount is below the partner's approved minimum.");
    }
    if (input.maximumTransaction != null && input.transactionAmount > input.maximumTransaction) {
      blockers.push("Transaction amount exceeds the partner's approved maximum.");
    }
  }

  return { eligible: blockers.length === 0, blockers };
}

export interface CapitalClosingGateInput {
  finalKybRefresh: boolean;
  finalSanctionsRefresh: boolean;
  ownershipConfirmed: boolean;
  documentsApproved: boolean;
  partnerConfirmed: boolean;
  counselConfirmed: boolean;
  finalFeeApproved: boolean;
  conditionsPrecedentComplete: boolean;
  signatoriesConfirmed: boolean;
  fundsFlowVerifiedExternally: boolean;
  noGemCustodyConfirmed: boolean;
  postCloseOwnersAssigned: boolean;
}

export function evaluateCapitalClosingGates(input: CapitalClosingGateInput) {
  const checks = [
    ["FINAL_KYB_REFRESH", input.finalKybRefresh],
    ["FINAL_SANCTIONS_REFRESH", input.finalSanctionsRefresh],
    ["OWNERSHIP_CONFIRMED", input.ownershipConfirmed],
    ["DOCUMENTS_APPROVED", input.documentsApproved],
    ["PARTNER_CONFIRMED", input.partnerConfirmed],
    ["COUNSEL_CONFIRMED", input.counselConfirmed],
    ["FINAL_FEE_APPROVED", input.finalFeeApproved],
    ["CONDITIONS_PRECEDENT_COMPLETE", input.conditionsPrecedentComplete],
    ["SIGNATORIES_CONFIRMED", input.signatoriesConfirmed],
    ["FUNDS_FLOW_VERIFIED_EXTERNALLY", input.fundsFlowVerifiedExternally],
    ["NO_GEM_CUSTODY_CONFIRMED", input.noGemCustodyConfirmed],
    ["POST_CLOSE_OWNERS_ASSIGNED", input.postCloseOwnersAssigned],
  ] as const;

  const blockers = checks.filter(([, passed]) => !passed).map(([code]) => code);
  return { readyToClose: blockers.length === 0, blockers };
}

export interface PostCloseRecommendationInput {
  cybersecurityFindings: number;
  complianceFindings: number;
  reportingObligations: boolean;
  useOfProceedsMonitoring: boolean;
  vendorRiskExposure: boolean;
  realEstateProject: boolean;
}

export function buildPostCloseServiceRecommendations(input: PostCloseRecommendationInput) {
  const recommendations = new Set<string>();
  if (input.cybersecurityFindings > 0) recommendations.add("MONTHLY_MONITORING");
  if (input.complianceFindings > 0) recommendations.add("ANNUAL_CERTIFICATION");
  if (input.reportingObligations) recommendations.add("BOARD_AND_INVESTOR_REPORTING");
  if (input.useOfProceedsMonitoring) recommendations.add("USE_OF_PROCEEDS_MONITORING");
  if (input.vendorRiskExposure) recommendations.add("VENDOR_RISK_MANAGEMENT");
  if (input.realEstateProject) recommendations.add("REAL_ESTATE_PROJECT_MONITORING");
  recommendations.add("POST_CLOSE_IMPLEMENTATION");
  return [...recommendations];
}
