import { z } from "zod";
import { ACTIVITY_CLASSIFICATIONS } from "@/lib/capital-readiness/policy";

const id = z.string().trim().min(1).max(240);
const text = (min = 1, max = 5000) => z.string().trim().min(min).max(max);
const money = z.number().finite().min(0).max(1_000_000_000_000);
const optionalDate = z.coerce.date().optional();

const base = {
  workspaceId: id,
  idempotencyKey: z.string().trim().min(16).max(240),
  approvalRequestId: id.optional(),
};

export const CAPITAL_COMMANDS = [
  "CREATE_KYB_CASE",
  "ADD_BENEFICIAL_OWNER",
  "RECORD_SCREENING_RESULT",
  "IMPOSE_HOLD",
  "RELEASE_HOLD",
  "CREATE_ENGAGEMENT",
  "ADD_ENGAGEMENT_FEE",
  "ACTIVATE_ENGAGEMENT",
  "CREATE_MATTER",
  "SAVE_READINESS_ASSESSMENT",
  "CREATE_FINDING",
  "RESOLVE_FINDING",
  "SUBMIT_COMMITTEE_REVIEW",
  "CAST_COMMITTEE_VOTE",
  "REGISTER_LICENSED_PARTNER",
  "ADD_PARTNER_LICENSE",
  "ROUTE_TO_PARTNER",
  "CREATE_TARGET_UNIVERSE",
  "ADD_TARGET_ENTRY",
  "APPROVE_CONTROLLED_OUTREACH",
  "CREATE_DATA_ROOM",
  "REGISTER_DOCUMENT_VERSION",
  "RELEASE_DOCUMENT",
  "GRANT_DATA_ROOM_ACCESS",
  "CREATE_DILIGENCE_QUESTION",
  "ADD_DILIGENCE_RESPONSE",
  "RECORD_PROPOSAL",
  "ADD_CLOSING_CONDITION",
  "CREATE_CLOSING",
  "AUTHORIZE_CLOSING",
  "CREATE_SERVICE_CONTRACT",
  "RECORD_REVENUE_EVENT",
  "REGISTER_GOVERNED_AGENT",
  "RECORD_GOVERNED_AGENT_RUN",
] as const;

export type CapitalCommandName = (typeof CAPITAL_COMMANDS)[number];

const createKybCase = z.object({
  ...base,
  command: z.literal("CREATE_KYB_CASE"),
  payload: z.object({
    opportunityId: id,
    riskLevel: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  }),
});

const addBeneficialOwner = z.object({
  ...base,
  command: z.literal("ADD_BENEFICIAL_OWNER"),
  payload: z.object({
    kybCaseId: id,
    fullName: text(2, 240),
    nationality: text(1, 120).optional(),
    countryOfResidence: text(1, 120).optional(),
    ownershipPercent: z.number().finite().min(0).max(100).optional(),
    controlPerson: z.boolean().default(false),
    documentRef: text(1, 1000).optional(),
  }),
});

const recordScreening = z.object({
  ...base,
  command: z.literal("RECORD_SCREENING_RESULT"),
  payload: z.object({
    kybCaseId: id,
    screeningType: z.enum([
      "ENTITY",
      "BENEFICIAL_OWNER",
      "SANCTIONS",
      "PEP",
      "ADVERSE_MEDIA",
      "LITIGATION",
      "INSOLVENCY",
      "REGULATORY_LICENSE",
      "SOURCE_OF_FUNDS",
    ]),
    subjectRef: id,
    provider: text(1, 160).optional(),
    providerCaseRef: text(1, 240).optional(),
    result: z.enum(["CLEAR", "POSSIBLE_MATCH", "CONFIRMED_MATCH", "REVIEW_REQUIRED", "UNAVAILABLE"]),
    evidenceRef: text(1, 1000).optional(),
    expiresAt: optionalDate,
  }),
});

const imposeHold = z.object({
  ...base,
  command: z.literal("IMPOSE_HOLD"),
  payload: z
    .object({
      kybCaseId: id.optional(),
      matterId: id.optional(),
      holdType: z.enum(["COMPLIANCE", "LEGAL", "SECURITY", "PAYMENT", "DOCUMENT_INTEGRITY"]),
      reason: text(10, 2000),
      expiresAt: optionalDate,
    })
    .refine((value) => Boolean(value.kybCaseId || value.matterId), "A KYB case or matter is required."),
});

const releaseHold = z.object({
  ...base,
  command: z.literal("RELEASE_HOLD"),
  payload: z.object({ holdId: id, releaseReason: text(10, 2000) }),
});

const createEngagement = z.object({
  ...base,
  command: z.literal("CREATE_ENGAGEMENT"),
  payload: z.object({
    opportunityId: id,
    title: text(3, 240),
    scope: z.record(z.unknown()),
    excludedActivities: z.array(text(1, 240)).max(100).default([]),
    jurisdictions: z.array(text(1, 120)).max(50).default([]),
    noCustodyAccepted: z.literal(true),
    noGuaranteeAccepted: z.literal(true),
    licensedPartnerRequired: z.boolean().default(false),
  }),
});

const addEngagementFee = z.object({
  ...base,
  command: z.literal("ADD_ENGAGEMENT_FEE"),
  payload: z.object({
    engagementId: id,
    feeType: z.enum([
      "FIXED_PROJECT_FEE",
      "MILESTONE_FEE",
      "HOURLY_FEE",
      "MONTHLY_RETAINER",
      "ANNUAL_SUBSCRIPTION",
      "IMPLEMENTATION_FEE",
      "SECURITY_MONITORING_FEE",
      "TRANSACTION_BASED_FEE",
    ]),
    description: text(3, 1000),
    amount: money.optional(),
    currency: z.string().trim().regex(/^[A-Z]{3}$/).default("USD"),
    hourlyRate: money.optional(),
  }),
});

const activateEngagement = z.object({
  ...base,
  command: z.literal("ACTIVATE_ENGAGEMENT"),
  payload: z.object({
    engagementId: id,
    signedAt: z.coerce.date(),
    effectiveAt: z.coerce.date(),
    expiresAt: optionalDate,
  }),
});

const createMatter = z.object({
  ...base,
  command: z.literal("CREATE_MATTER"),
  payload: z.object({
    opportunityId: id,
    engagementId: id,
    title: text(3, 240),
    transactionType: text(2, 160),
    targetAmount: money.optional(),
    currency: z.string().trim().regex(/^[A-Z]{3}$/).default("USD"),
    useOfProceeds: text(10, 5000),
  }),
});

const workstream = z.object({
  type: z.enum([
    "CORPORATE",
    "FINANCIAL",
    "COMMERCIAL",
    "MANAGEMENT",
    "CYBERSECURITY",
    "COMPLIANCE",
    "TRANSACTION",
    "DATA_ROOM",
  ]),
  score: z.number().finite().min(0).max(100),
  criticalFindings: z.number().int().min(0).max(10000),
  openActions: z.number().int().min(0).max(10000),
  evidenceQuality: z.enum(["LOW", "MEDIUM", "HIGH"]),
  reviewerConfidence: z.enum(["LOW", "MEDIUM", "HIGH"]),
});

const saveAssessment = z.object({
  ...base,
  command: z.literal("SAVE_READINESS_ASSESSMENT"),
  payload: z.object({
    matterId: id,
    workstreams: z.array(workstream).length(8),
    methodologyVersion: text(1, 64).default("1.0"),
  }),
});

const createFinding = z.object({
  ...base,
  command: z.literal("CREATE_FINDING"),
  payload: z.object({
    matterId: id,
    workstreamType: workstream.shape.type,
    severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
    title: text(3, 240),
    description: text(10, 5000),
    evidenceRefs: z.array(text(1, 1000)).max(100).default([]),
    requiredRemediation: text(10, 5000),
    ownerId: id.optional(),
    dueAt: optionalDate,
  }),
});

const resolveFinding = z.object({
  ...base,
  command: z.literal("RESOLVE_FINDING"),
  payload: z.object({
    findingId: id,
    resolution: z.enum(["VERIFIED", "RISK_ACCEPTED", "REJECTED"]),
    residualRisk: text(1, 2000).optional(),
    evidenceRefs: z.array(text(1, 1000)).max(100).default([]),
  }),
});

const submitCommitteeReview = z.object({
  ...base,
  command: z.literal("SUBMIT_COMMITTEE_REVIEW"),
  payload: z.object({ matterId: id, conditions: z.record(z.unknown()).default({}) }),
});

const castCommitteeVote = z.object({
  ...base,
  command: z.literal("CAST_COMMITTEE_VOTE"),
  payload: z.object({
    reviewId: id,
    decision: z.enum([
      "APPROVED_FOR_PARTNER_REVIEW",
      "APPROVED_WITH_CONDITIONS",
      "RETURNED_FOR_REMEDIATION",
      "DECLINED",
      "ESCALATED_TO_COUNSEL",
    ]),
    rationale: text(10, 2000),
  }),
});

const registerPartner = z.object({
  ...base,
  command: z.literal("REGISTER_LICENSED_PARTNER"),
  payload: z.object({
    legalName: text(2, 240),
    regulatoryEntityName: text(2, 240),
    regulatoryReference: text(2, 240),
    jurisdictions: z.array(text(1, 120)).min(1).max(100),
    authorizedInstruments: z.array(text(1, 160)).min(1).max(100),
    minimumTransaction: money.optional(),
    maximumTransaction: money.optional(),
    industryRestrictions: z.array(text(1, 240)).max(100).default([]),
    geographicRestrictions: z.array(text(1, 240)).max(100).default([]),
    complianceContact: text(1, 254).optional(),
    conflictContact: text(1, 254).optional(),
    agreementExpiresAt: optionalDate,
    insuranceExpiresAt: optionalDate,
    verificationEvidenceRef: text(1, 1000),
  }),
});

const addPartnerLicense = z.object({
  ...base,
  command: z.literal("ADD_PARTNER_LICENSE"),
  payload: z.object({
    partnerId: id,
    jurisdiction: text(1, 120),
    regulator: text(1, 240),
    licenseType: text(1, 240),
    licenseReference: text(1, 240),
    authorizedActivities: z.array(text(1, 240)).min(1).max(100),
    verifiedAt: z.coerce.date(),
    expiresAt: optionalDate,
    evidenceRef: text(1, 1000),
  }),
});

const routePartner = z.object({
  ...base,
  command: z.literal("ROUTE_TO_PARTNER"),
  payload: z.object({
    matterId: id,
    partnerId: id,
    jurisdiction: text(1, 120),
    instrument: text(1, 160),
    conflictCleared: z.literal(true),
  }),
});

const createUniverse = z.object({
  ...base,
  command: z.literal("CREATE_TARGET_UNIVERSE"),
  payload: z.object({
    matterId: id,
    name: text(3, 240),
    objective: text(10, 2000),
    confidentialityPosture: text(3, 1000),
    clientApproved: z.boolean().default(false),
  }),
});

const addTargetEntry = z.object({
  ...base,
  command: z.literal("ADD_TARGET_ENTRY"),
  payload: z.object({
    universeId: id,
    organizationName: text(2, 240),
    organizationType: text(2, 160),
    jurisdiction: text(1, 120).optional(),
    sectorPreference: text(1, 240).optional(),
    stagePreference: text(1, 240).optional(),
    typicalTransactionMin: money.optional(),
    typicalTransactionMax: money.optional(),
    instrumentPreference: text(1, 240).optional(),
    strategicRationale: text(10, 3000),
    capacityEvidenceRef: text(1, 1000).optional(),
    relationshipPath: text(1, 1000).optional(),
    conflictStatus: text(1, 120).default("NOT_CHECKED"),
    confidentialityRisk: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
    regulatoryRestrictions: z.array(text(1, 240)).max(100).default([]),
    proposedWave: z.number().int().min(1).max(20).optional(),
    sourceRef: text(1, 1000).optional(),
    sourceAsOf: optionalDate,
    confidence: z.enum(["LOW", "MEDIUM", "HIGH"]).default("LOW"),
    nextAction: text(1, 1000).optional(),
  }),
});

const approveOutreach = z.object({
  ...base,
  command: z.literal("APPROVE_CONTROLLED_OUTREACH"),
  payload: z.object({
    targetEntryId: id,
    licensedPartnerId: id,
    approvedMessageHash: z.string().regex(/^[a-f0-9]{64}$/),
    approvedSender: text(3, 254),
    approvedRecipient: text(3, 254),
    jurisdictionCheckRef: text(1, 1000),
    eligibilityCheckRef: text(1, 1000),
    materialVersionRef: text(1, 1000),
  }),
});

const createDataRoom = z.object({
  ...base,
  command: z.literal("CREATE_DATA_ROOM"),
  payload: z.object({
    matterId: id,
    name: text(3, 240),
    watermarkRequired: z.boolean().default(true),
    downloadDisabledByDefault: z.boolean().default(true),
  }),
});

const registerDocumentVersion = z.object({
  ...base,
  command: z.literal("REGISTER_DOCUMENT_VERSION"),
  payload: z.object({
    dataRoomId: id,
    documentId: id.optional(),
    category: text(1, 240),
    title: text(2, 240),
    confidentialityLevel: z.enum([
      "INTERNAL",
      "CLIENT_CONFIDENTIAL",
      "PARTNER_CONFIDENTIAL",
      "CLEAN_TEAM_ONLY",
      "INVESTOR_APPROVED",
      "COUNSEL_ONLY",
      "BOARD_ONLY",
    ]),
    storageRef: text(1, 1000),
    fileName: text(1, 500),
    mimeType: text(1, 200),
    fileSize: z.number().int().positive().max(5_000_000_000),
    checksum: z.string().regex(/^[a-fA-F0-9]{64}$/),
    sourceRef: text(1, 1000).optional(),
    redactionStatus: text(1, 120).default("NOT_REVIEWED"),
  }),
});

const releaseDocument = z.object({
  ...base,
  command: z.literal("RELEASE_DOCUMENT"),
  payload: z.object({
    documentId: id,
    version: z.number().int().positive(),
    downloadAllowed: z.boolean().default(false),
  }),
});

const grantDataRoomAccess = z.object({
  ...base,
  command: z.literal("GRANT_DATA_ROOM_ACCESS"),
  payload: z.object({
    dataRoomId: id,
    granteeType: text(1, 120),
    granteeRef: text(1, 240),
    confidentialityLevel: z.enum([
      "INTERNAL",
      "CLIENT_CONFIDENTIAL",
      "PARTNER_CONFIDENTIAL",
      "CLEAN_TEAM_ONLY",
      "INVESTOR_APPROVED",
      "COUNSEL_ONLY",
      "BOARD_ONLY",
    ]),
    canDownload: z.boolean().default(false),
    expiresAt: z.coerce.date(),
  }),
});

const createDiligenceQuestion = z.object({
  ...base,
  command: z.literal("CREATE_DILIGENCE_QUESTION"),
  payload: z.object({
    matterId: id,
    category: text(1, 240),
    question: text(10, 5000),
    disclosureRestriction: z
      .enum([
        "INTERNAL",
        "CLIENT_CONFIDENTIAL",
        "PARTNER_CONFIDENTIAL",
        "CLEAN_TEAM_ONLY",
        "INVESTOR_APPROVED",
        "COUNSEL_ONLY",
        "BOARD_ONLY",
      ])
      .default("CLIENT_CONFIDENTIAL"),
    raisedByRef: text(1, 240).optional(),
    assignedToId: id.optional(),
    dueAt: optionalDate,
    riskRef: text(1, 1000).optional(),
  }),
});

const addDiligenceResponse = z.object({
  ...base,
  command: z.literal("ADD_DILIGENCE_RESPONSE"),
  payload: z.object({
    questionId: id,
    response: text(10, 10000),
    evidenceRefs: z.array(text(1, 1000)).max(100).default([]),
  }),
});

const recordProposal = z.object({
  ...base,
  command: z.literal("RECORD_PROPOSAL"),
  payload: z.object({
    matterId: id,
    targetEntryId: id.optional(),
    status: z.enum([
      "INDICATION",
      "NON_BINDING_PROPOSAL",
      "TERM_SHEET",
      "UNDER_DILIGENCE",
      "APPROVED",
      "REJECTED",
      "EXPIRED",
      "WITHDRAWN",
      "SUPERSEDED",
    ]),
    instrument: text(1, 240),
    proposedAmount: money.optional(),
    currency: z.string().trim().regex(/^[A-Z]{3}$/).default("USD"),
    valuationOrPricing: text(1, 1000).optional(),
    interestOrReturnTerms: text(1, 1000).optional(),
    maturity: text(1, 500).optional(),
    security: text(1, 1000).optional(),
    covenants: z.record(z.unknown()).default({}),
    conditions: z.record(z.unknown()).default({}),
    fees: z.record(z.unknown()).default({}),
    exclusivity: text(1, 1000).optional(),
    expiresAt: optionalDate,
    fundingCertainty: z.enum(["LOW", "MEDIUM", "HIGH"]).default("LOW"),
    sourceLabel: z.enum([
      "SOURCE_BACKED",
      "CLIENT_PROVIDED",
      "PARTNER_PROVIDED",
      "ANALYST_CALCULATED",
      "ILLUSTRATIVE_ASSUMPTION",
      "NEEDS_VERIFICATION",
    ]),
    sourceRef: text(1, 1000).optional(),
    partnerAssessment: text(1, 3000).optional(),
  }),
});

const addClosingCondition = z.object({
  ...base,
  command: z.literal("ADD_CLOSING_CONDITION"),
  payload: z.object({
    matterId: id,
    category: text(1, 240),
    description: text(10, 3000),
    ownerId: id.optional(),
    dueAt: optionalDate,
    evidenceRef: text(1, 1000).optional(),
  }),
});

const createClosing = z.object({
  ...base,
  command: z.literal("CREATE_CLOSING"),
  payload: z.object({ matterId: id, scheduledAt: optionalDate }),
});

const authorizeClosing = z.object({
  ...base,
  command: z.literal("AUTHORIZE_CLOSING"),
  payload: z.object({
    closingId: id,
    finalKybRefreshAt: z.coerce.date(),
    finalSanctionsRefreshAt: z.coerce.date(),
    partnerConfirmationRef: text(1, 1000),
    counselConfirmationRef: text(1, 1000),
    feeApprovalRef: text(1, 1000),
    fundsFlowVerifiedExternally: z.literal(true),
    noGemCustodyConfirmed: z.literal(true),
    authorizedSignatoriesConfirmed: z.literal(true),
  }),
});

const createServiceContract = z.object({
  ...base,
  command: z.literal("CREATE_SERVICE_CONTRACT"),
  payload: z.object({
    matterId: id.optional(),
    title: text(3, 240),
    serviceTypes: z
      .array(
        z.enum([
          "READINESS_ASSESSMENT",
          "CAPITAL_READINESS_PACKAGE",
          "CYBERSECURITY_ASSESSMENT",
          "COMPLIANCE_ASSESSMENT",
          "FINANCIAL_MODEL",
          "VALUATION_SUPPORT",
          "DATA_ROOM_SETUP",
          "DUE_DILIGENCE_SUPPORT",
          "TRANSACTION_PROJECT_MANAGEMENT",
          "POST_CLOSE_IMPLEMENTATION",
          "MONTHLY_MONITORING",
          "ANNUAL_CERTIFICATION",
          "LICENSED_PARTNER_REVENUE",
        ]),
      )
      .min(1),
    monthlyAmount: money.optional(),
    annualAmount: money.optional(),
    currency: z.string().trim().regex(/^[A-Z]{3}$/).default("USD"),
    startAt: optionalDate,
    endAt: optionalDate,
  }),
});

const recordRevenue = z.object({
  ...base,
  command: z.literal("RECORD_REVENUE_EVENT"),
  payload: z.object({
    contractId: id.optional(),
    revenueType: z.enum([
      "READINESS_ASSESSMENT",
      "CAPITAL_READINESS_PACKAGE",
      "CYBERSECURITY_ASSESSMENT",
      "COMPLIANCE_ASSESSMENT",
      "FINANCIAL_MODEL",
      "VALUATION_SUPPORT",
      "DATA_ROOM_SETUP",
      "DUE_DILIGENCE_SUPPORT",
      "TRANSACTION_PROJECT_MANAGEMENT",
      "POST_CLOSE_IMPLEMENTATION",
      "MONTHLY_MONITORING",
      "ANNUAL_CERTIFICATION",
      "LICENSED_PARTNER_REVENUE",
    ]),
    amount: money,
    currency: z.string().trim().regex(/^[A-Z]{3}$/).default("USD"),
    status: z.enum(["PLANNED", "CONTRACTED", "INVOICED", "COLLECTED", "RECOGNIZED", "REVERSED"]),
    trigger: text(3, 1000),
    invoiceRef: text(1, 500).optional(),
    paymentRef: text(1, 500).optional(),
    occurredAt: optionalDate,
  }),
});

const registerAgent = z.object({
  ...base,
  command: z.literal("REGISTER_GOVERNED_AGENT"),
  payload: z.object({
    name: text(2, 240),
    purpose: text(10, 2000),
    configuration: z.record(z.unknown()).default({}),
  }),
});

const recordAgentRun = z.object({
  ...base,
  command: z.literal("RECORD_GOVERNED_AGENT_RUN"),
  payload: z.object({
    agentId: id,
    matterId: id.optional(),
    activityClassification: z.enum(ACTIVITY_CLASSIFICATIONS),
    inputHash: z.string().regex(/^[a-f0-9]{64}$/),
    outputHash: z.string().regex(/^[a-f0-9]{64}$/).optional(),
    evidenceRefs: z.array(text(1, 1000)).max(100).default([]),
    confidence: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
    status: z.enum(["QUEUED", "RUNNING", "WAITING_FOR_APPROVAL", "COMPLETED", "FAILED", "CANCELLED", "BLOCKED"]),
    errorCode: text(1, 240).optional(),
    safeErrorMessage: text(1, 1000).optional(),
  }),
});

export const capitalCommandSchema = z.union([
  createKybCase,
  addBeneficialOwner,
  recordScreening,
  imposeHold,
  releaseHold,
  createEngagement,
  addEngagementFee,
  activateEngagement,
  createMatter,
  saveAssessment,
  createFinding,
  resolveFinding,
  submitCommitteeReview,
  castCommitteeVote,
  registerPartner,
  addPartnerLicense,
  routePartner,
  createUniverse,
  addTargetEntry,
  approveOutreach,
  createDataRoom,
  registerDocumentVersion,
  releaseDocument,
  grantDataRoomAccess,
  createDiligenceQuestion,
  addDiligenceResponse,
  recordProposal,
  addClosingCondition,
  createClosing,
  authorizeClosing,
  createServiceContract,
  recordRevenue,
  registerAgent,
  recordAgentRun,
]);

export type CapitalCommandInput = z.infer<typeof capitalCommandSchema>;
