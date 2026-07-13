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

function record(value: unknown): Record<string, unknown> {
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

function auditValue(audit: PilotEvidenceAudit, key: string) {
  const value = record(audit.metadata)[key];
  return typeof value === "string" ? value : "";
}

export function evaluatePilotEvidence(input: {
  application: PilotEvidenceApplication;
  applicant: PilotEvidenceAccount | null;
  analyst: PilotEvidenceAccount | null;
  decisionMaker: PilotEvidenceAccount | null;
  audits: PilotEvidenceAudit[];
}) {
  const { application, applicant, analyst, decisionMaker, audits } = input;
  const marker = record(record(application.formData)._verificationPilot);
  const syntheticMarkerValid =
    marker.synthetic === true &&
    marker.scenario === "gem-verify-phase-1b" &&
    marker.version === 1;

  const reviews = [...application.reviews].sort(
    (left, right) => timestamp(left.createdAt) - timestamp(right.createdAt),
  );
  const reviewActions = reviews.map((review) => review.action);
  const outcome = application.decision?.decision ?? null;
  const decisionEvent =
    outcome === "approved"
      ? "application_approved"
      : outcome === "rejected"
        ? "application_rejected"
        : null;
  const decisionAuditAction = outcome === "approved" ? "kyc_approve" : "kyc_reject";
  const decisionReviewAction = outcome === "approved" ? "approve" : "reject";
  const requiredPath = [
    "application_created",
    "consent_recorded",
    "application_submitted",
    "reviewer_assigned",
    "review_started",
    "information_requested",
    "information_resubmitted",
    "review_started",
    ...(decisionEvent ? [decisionEvent] : []),
  ];

  const orderedHistory =
    decisionEvent !== null && hasOrderedActions(reviewActions, requiredPath);
  const uniqueHistory =
    new Set(reviews.map((review) => review.id)).size === reviews.length;
  const chronologicalHistory = reviews.every(
    (review, index) =>
      index === 0 ||
      timestamp(reviews[index - 1].createdAt) <= timestamp(review.createdAt),
  );

  const roleChangeAudit = audits.some(
    (audit) =>
      audit.action === "role_change" &&
      audit.resource === "user" &&
      audit.resourceId === analyst?.id &&
      auditValue(audit, "newRole") === "analyst",
  );
  const controlledIds = [applicant?.id, analyst?.id, decisionMaker?.id].filter(
    (value): value is string => Boolean(value),
  );
  const authenticatedSessions =
    controlledIds.length === 3 &&
    new Set(controlledIds).size === 3 &&
    controlledIds.every((id) =>
      audits.some(
        (audit) =>
          audit.action === "login" &&
          audit.resource === "user" &&
          audit.resourceId === id &&
          audit.userId === id,
      ),
    );
  const creationAudit = audits.some(
    (audit) =>
      audit.action === "case_created" &&
      audit.resource === "verification_application" &&
      audit.resourceId === application.id &&
      audit.userId === applicant?.id &&
      auditValue(audit, "stage") === "draft_created",
  );
  const consentAudit = audits.some(
    (audit) =>
      audit.action === "kyc_submit" &&
      audit.resource === "verification_application" &&
      audit.resourceId === application.id &&
      audit.userId === applicant?.id &&
      auditValue(audit, "stage") === "consent_recorded",
  );
  const submissionAudits = audits.filter(
    (audit) =>
      audit.action === "kyc_submit" &&
      audit.resource === "verification_application" &&
      audit.resourceId === application.id &&
      audit.userId === applicant?.id &&
      auditValue(audit, "stage") === "submitted_for_manual_review",
  );
  const assignmentAudit = audits.some(
    (audit) =>
      audit.action === "admin_action" &&
      audit.resource === "verification_application" &&
      audit.resourceId === application.id &&
      audit.userId === analyst?.id &&
      auditValue(audit, "reviewAction") === "assign",
  );
  const startReviewAudits = audits.filter(
    (audit) =>
      audit.action === "kyc_flag" &&
      audit.resource === "verification_application" &&
      audit.resourceId === application.id &&
      audit.userId === analyst?.id &&
      auditValue(audit, "reviewAction") === "start_review",
  );
  const informationRequestAudit = audits.some(
    (audit) =>
      audit.action === "kyc_flag" &&
      audit.resource === "verification_application" &&
      audit.resourceId === application.id &&
      audit.userId === analyst?.id &&
      auditValue(audit, "reviewAction") === "request_information",
  );
  const decisionAudit = Boolean(
    application.decision &&
      audits.some(
        (audit) =>
          audit.action === decisionAuditAction &&
          audit.resource === "verification_application" &&
          audit.resourceId === application.id &&
          audit.userId === application.decision?.decisionBy &&
          auditValue(audit, "reviewAction") === decisionReviewAction,
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
  const informationRoundTrip =
    reviewActions.includes("information_requested") &&
    reviewActions.includes("information_resubmitted") &&
    reviewActions.indexOf("information_requested") <
      reviewActions.indexOf("information_resubmitted") &&
    submissionAudits.length >= 2;
  const reviewAuditChain =
    creationAudit &&
    assignmentAudit &&
    startReviewAudits.length >= 2 &&
    informationRequestAudit;
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
      isActiveVerified(decisionMaker) &&
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
      passed:
        isActiveVerified(analyst) && analyst?.role === "analyst" && roleChangeAudit,
      detail:
        isActiveVerified(analyst) && analyst?.role === "analyst" && roleChangeAudit
          ? "The selected reviewer is an active verified analyst and the designation has a matching role-change audit event."
          : "The analyst account or its role-change audit evidence is incomplete.",
    },
    {
      id: "authenticated-sessions",
      label: "Controlled identities authenticated",
      passed: authenticatedSessions,
      detail: authenticatedSessions
        ? "Login audit events exist for the applicant, analyst, and administrator-level decision maker."
        : "One or more controlled identities do not have a matching successful-login audit event.",
    },
    {
      id: "consent-and-submission",
      label: "Consent and two submissions recorded",
      passed: Boolean(
        application.submittedAt && consentAudit && submissionAudits.length >= 2,
      ),
      detail:
        application.submittedAt && consentAudit && submissionAudits.length >= 2
          ? "Consent, initial submission, and information resubmission are present in audit evidence."
          : "Consent, submission timestamp, initial submission, or resubmission audit evidence is incomplete.",
    },
    {
      id: "analyst-assignment",
      label: "Case assigned to the selected analyst",
      passed: analystAssigned && assignmentAudit,
      detail:
        analystAssigned && assignmentAudit
          ? "The application, workflow history, and audit evidence identify the selected analyst."
          : "The selected analyst assignment or matching audit event is incomplete.",
    },
    {
      id: "information-round-trip",
      label: "Information-request round trip",
      passed: informationRoundTrip && informationRequestAudit,
      detail:
        informationRoundTrip && informationRequestAudit
          ? "An audited information request was followed by an applicant resubmission."
          : "The information-request, audit event, and resubmission sequence is incomplete.",
    },
    {
      id: "review-audit-chain",
      label: "Review actions audited",
      passed: reviewAuditChain,
      detail: reviewAuditChain
        ? "Case creation, assignment, both review starts, and the information request have matching audit evidence."
        : "One or more required review actions do not have matching audit evidence.",
    },
    {
      id: "final-decision",
      label: "Controlled final decision",
      passed: finalDecisionValid && decisionAudit && decisionRoleSeparated,
      detail:
        finalDecisionValid && decisionAudit && decisionRoleSeparated
          ? "A final decision, active administrator-level decision maker, timestamps, role separation, and matching audit event are present."
          : "The final decision, role separation, timestamps, decision-maker status, or matching audit evidence is incomplete.",
    },
    {
      id: "ordered-history",
      label: "Ordered append-only evidence chain",
      passed: orderedHistory && uniqueHistory && chronologicalHistory,
      detail:
        orderedHistory && uniqueHistory && chronologicalHistory
          ? "Required workflow events, including the second review start, are unique and appear in chronological order."
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
    outcome,
    checks,
    counts: {
      reviewEvents: reviews.length,
      auditEvents: audits.length,
      documents: application.documentCount,
    },
  };
}
