export interface PilotEvidenceAccount {
  id: string;
  role: string;
  status: string;
  isActive: boolean;
  isEmailVerified: boolean;
}

export interface PilotEvidenceReview {
  id: string;
  reviewerId: string;
  action: string;
  createdAt: Date | string;
}

export interface PilotEvidenceDecision {
  decision: string;
  decisionBy: string;
  decisionAt: Date | string;
}

export interface PilotEvidenceAudit {
  action: string;
  resource: string | null;
  resourceId: string | null;
  userId: string | null;
  metadata: unknown;
  createdAt: Date | string;
}

export interface PilotEvidenceApplication {
  id: string;
  userId: string;
  status: string;
  reviewerId: string | null;
  formData: unknown;
  submittedAt: Date | string | null;
  reviewedAt: Date | string | null;
  completedAt: Date | string | null;
  reviews: PilotEvidenceReview[];
  decision: PilotEvidenceDecision | null;
  documentCount: number;
}

export interface PilotEvidenceCheck {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function isActiveVerified(account: PilotEvidenceAccount | null) {
  return Boolean(
    account &&
      account.isActive &&
      account.status === "active" &&
      account.isEmailVerified,
  );
}

function timestamp(value: Date | string) {
  return value instanceof Date ? value.getTime() : new Date(value).getTime();
}

function hasOrderedActions(actions: string[], expected: string[]) {
  let cursor = 0;
  for (const action of actions) {
    if (action === expected[cursor]) cursor += 1;
    if (cursor === expected.length) return true;
  }
  return false;
}

function auditStage(audit: PilotEvidenceAudit) {
  const stage = asRecord(audit.metadata).stage;
  return typeof stage === "string" ? stage : "";
}

export function evaluatePilotEvidence(input: {
  application: PilotEvidenceApplication;
  applicant: PilotEvidenceAccount | null;
  analyst: PilotEvidenceAccount | null;
  decisionMaker: PilotEvidenceAccount | null;
  audits: PilotEvidenceAudit[];
}) {
  const { application, applicant, analyst, decisionMaker } = input;
  const marker = asRecord(asRecord(application.formData)._verificationPilot);
  const syntheticMarkerValid =
    marker.synthetic === true &&
    marker.scenario === "gem-verify-phase-1b" &&
    marker.version === 1;

  const reviews = [...application.reviews].sort(
    (left, right) => timestamp(left.createdAt) - timestamp(right.createdAt),
  );
  const reviewActions = reviews.map((review) => review.action);
  const decisionEvent =
    application.decision?.decision === "approved"
      ? "application_approved"
      : application.decision?.decision === "rejected"
        ? "application_rejected"
        : null;

  const requiredPath = [
    "application_created",
    "consent_recorded",
    "application_submitted",
    "reviewer_assigned",
    "review_started",
    "information_requested",
    "information_resubmitted",
    ...(decisionEvent ? [decisionEvent] : []),
  ];

  const orderedHistory =
    decisionEvent !== null && hasOrderedActions(reviewActions, requiredPath);
  const uniqueHistory = new Set(reviews.map((review) => review.id)).size === reviews.length;
  const chronologicalHistory = reviews.every(
    (review, index) =>
      index === 0 || timestamp(reviews[index - 1].createdAt) <= timestamp(review.createdAt),
  );

  const roleChangeAudit = input.audits.some(
    (audit) =>
      audit.action === "role_change" &&
      audit.resource === "user" &&
      audit.resourceId === analyst?.id,
  );
  const consentAudit = input.audits.some(
    (audit) =>
      audit.action === "kyc_submit" &&
      audit.resource === "verification_application" &&
      audit.resourceId === application.id &&
      auditStage(audit) === "consent_recorded",
  );
  const submissionAudit = input.audits.some(
    (audit) =>
      audit.action === "kyc_submit" &&
      audit.resource === "verification_application" &&
      audit.resourceId === application.id &&
      auditStage(audit) === "submitted_for_manual_review",
  );
  const expectedDecisionAudit =
    application.decision?.decision === "approved" ? "kyc_approve" : "kyc_reject";
  const decisionAudit = Boolean(
    application.decision &&
      input.audits.some(
        (audit) =>
          audit.action === expectedDecisionAudit &&
          audit.resource === "verification_application" &&
          audit.resourceId === application.id &&
          audit.userId === application.decision?.decisionBy,
      ),
  );

  const analystAssigned = Boolean(
    analyst &&
      application.reviewerId === analyst.id &&
      reviews.some(
        (review) =>
          review.action === "reviewer_assigned" && review.reviewerId === analyst.id,
      ),
  );
  const finalDecisionValid = Boolean(
    application.decision &&
      ["approved", "rejected"].includes(application.decision.decision) &&
      ["approved", "rejected", "expired"].includes(application.status) &&
      application.reviewedAt &&
      application.completedAt,
  );
  const decisionRoleSeparated = Boolean(
    applicant &&
      analyst &&
      decisionMaker &&
      applicant.id !== analyst.id &&
      applicant.id !== decisionMaker.id &&
      analyst.id !== decisionMaker.id &&
      ["admin", "super_admin", "internal"].includes(decisionMaker.role) &&
      application.decision?.decisionBy === decisionMaker.id,
  );

  const checks: PilotEvidenceCheck[] = [
    {
      id: "synthetic-marker",
      label: "Explicit synthetic pilot marker",
      passed: syntheticMarkerValid,
      detail: syntheticMarkerValid
        ? "The selected application is explicitly marked as the GEM Verify Phase 1B synthetic scenario."
        : "The application is not eligible for pilot evidence because the explicit synthetic marker is missing or invalid.",
    },
    {
      id: "applicant-account",
      label: "Active verified applicant account",
      passed: isActiveVerified(applicant) && applicant?.role === "client",
      detail:
        isActiveVerified(applicant) && applicant?.role === "client"
          ? "The applicant is an active, email-verified client account."
          : "The applicant must be an active, email-verified client account.",
    },
    {
      id: "analyst-account",
      label: "Active verified analyst designation",
      passed: isActiveVerified(analyst) && analyst?.role === "analyst" && roleChangeAudit,
      detail:
        isActiveVerified(analyst) && analyst?.role === "analyst" && roleChangeAudit
          ? "The selected reviewer is an active verified analyst and the designation has an audit event."
          : "The analyst account or its role-change audit evidence is incomplete.",
    },
    {
      id: "consent-and-submission",
      label: "Consent and submission recorded",
      passed: Boolean(application.submittedAt && consentAudit && submissionAudit),
      detail:
        application.submittedAt && consentAudit && submissionAudit
          ? "Consent and manual-review submission are present in both workflow history and audit evidence."
          : "Consent, submission timestamp, or the corresponding audit stages are incomplete.",
    },
    {
      id: "analyst-assignment",
      label: "Case assigned to the selected analyst",
      passed: analystAssigned,
      detail: analystAssigned
        ? "The application and assignment history identify the selected analyst."
        : "The selected analyst is not the recorded reviewer for this case.",
    },
    {
      id: "information-round-trip",
      label: "Information-request round trip",
      passed:
        reviewActions.includes("information_requested") &&
        reviewActions.includes("information_resubmitted") &&
        reviewActions.indexOf("information_requested") <
          reviewActions.indexOf("information_resubmitted"),
      detail:
        reviewActions.includes("information_requested") &&
        reviewActions.includes("information_resubmitted") &&
        reviewActions.indexOf("information_requested") <
          reviewActions.indexOf("information_resubmitted")
          ? "An information request was followed by an applicant resubmission."
          : "The information-request and resubmission sequence is incomplete.",
    },
    {
      id: "final-decision",
      label: "Controlled final decision",
      passed: finalDecisionValid && decisionAudit && decisionRoleSeparated,
      detail:
        finalDecisionValid && decisionAudit && decisionRoleSeparated
          ? "A final decision, administrator-level decision maker, timestamps, and matching audit event are present."
          : "The final decision, role separation, timestamps, or matching audit evidence is incomplete.",
    },
    {
      id: "ordered-history",
      label: "Ordered append-only evidence chain",
      passed: orderedHistory && uniqueHistory && chronologicalHistory,
      detail:
        orderedHistory && uniqueHistory && chronologicalHistory
          ? "Required workflow events are unique and appear in chronological order."
          : "Required events are missing, duplicated, or out of order.",
    },
    {
      id: "sensitive-documents-disabled",
      label: "No sensitive documents attached",
      passed: application.documentCount === 0,
      detail:
        application.documentCount === 0
          ? "The synthetic pilot contains no uploaded identity or financial documents."
          : "Pilot evidence is rejected because documents are attached to the selected application.",
    },
  ];

  return {
    completed: checks.every((check) => check.passed),
    outcome: application.decision?.decision ?? null,
    checks,
    counts: {
      reviewEvents: reviews.length,
      auditEvents: input.audits.length,
      documents: application.documentCount,
    },
  };
}
