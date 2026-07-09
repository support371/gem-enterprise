export type DatabaseKycStatus =
  | "not_started"
  | "started"
  | "in_progress"
  | "documents_uploaded"
  | "under_review"
  | "manual_review"
  | "approved"
  | "rejected"
  | "expired";

export type VerificationState =
  | "draft"
  | "consented"
  | "submitted"
  | "under_review"
  | "needs_information"
  | "approved"
  | "rejected"
  | "closed";

export type VerificationRole =
  | "client"
  | "analyst"
  | "admin"
  | "super_admin"
  | "internal";

export type VerificationReviewAction =
  | "assign"
  | "start_review"
  | "request_information"
  | "approve"
  | "reject"
  | "close";

const DATABASE_TO_STATE: Record<DatabaseKycStatus, VerificationState> = {
  not_started: "draft",
  started: "consented",
  in_progress: "submitted",
  documents_uploaded: "submitted",
  under_review: "under_review",
  manual_review: "needs_information",
  approved: "approved",
  rejected: "rejected",
  expired: "closed",
};

const STATE_TO_DATABASE: Record<VerificationState, DatabaseKycStatus> = {
  draft: "not_started",
  consented: "started",
  submitted: "in_progress",
  under_review: "under_review",
  needs_information: "manual_review",
  approved: "approved",
  rejected: "rejected",
  closed: "expired",
};

const ALLOWED_TRANSITIONS: Record<VerificationState, readonly VerificationState[]> = {
  draft: ["consented"],
  consented: ["submitted"],
  submitted: ["under_review"],
  under_review: ["needs_information", "approved", "rejected"],
  needs_information: ["submitted", "closed"],
  approved: ["closed"],
  rejected: ["closed"],
  closed: [],
};

const ADMIN_REVIEW_ROLES: readonly VerificationRole[] = [
  "admin",
  "super_admin",
  "internal",
];

const ANALYST_ACTIONS: readonly VerificationReviewAction[] = [
  "assign",
  "start_review",
  "request_information",
];

const ADMIN_ACTIONS: readonly VerificationReviewAction[] = [
  ...ANALYST_ACTIONS,
  "approve",
  "reject",
  "close",
];

export class VerificationWorkflowError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode = 409,
  ) {
    super(message);
    this.name = "VerificationWorkflowError";
  }
}

export function toVerificationState(status: string): VerificationState {
  const state = DATABASE_TO_STATE[status as DatabaseKycStatus];
  if (!state) {
    throw new VerificationWorkflowError(
      "UNKNOWN_VERIFICATION_STATUS",
      `Unsupported verification status: ${status}`,
      500,
    );
  }
  return state;
}

export function toDatabaseKycStatus(state: VerificationState): DatabaseKycStatus {
  return STATE_TO_DATABASE[state];
}

export function canTransition(
  current: VerificationState,
  target: VerificationState,
): boolean {
  return ALLOWED_TRANSITIONS[current].includes(target);
}

export function assertTransition(
  current: VerificationState,
  target: VerificationState,
): void {
  if (!canTransition(current, target)) {
    throw new VerificationWorkflowError(
      "INVALID_VERIFICATION_TRANSITION",
      `Verification cannot move from ${current} to ${target}.`,
    );
  }
}

export function isAdminReviewRole(role: string): role is VerificationRole {
  return ADMIN_REVIEW_ROLES.includes(role as VerificationRole);
}

export function canPerformReviewAction(
  role: string,
  action: VerificationReviewAction,
): boolean {
  if (role === "analyst") return ANALYST_ACTIONS.includes(action);
  if (isAdminReviewRole(role)) return ADMIN_ACTIONS.includes(action);
  return false;
}

export function getAllowedReviewActions(role: string): VerificationReviewAction[] {
  return ADMIN_ACTIONS.filter((action) => canPerformReviewAction(role, action));
}

export function canWorkOnAssignedCase(
  role: string,
  actorId: string,
  assignedReviewerId: string | null | undefined,
): boolean {
  return (
    !assignedReviewerId ||
    assignedReviewerId === actorId ||
    isAdminReviewRole(role)
  );
}

export function targetStateForReviewAction(
  action: Exclude<VerificationReviewAction, "assign">,
): VerificationState {
  switch (action) {
    case "start_review":
      return "under_review";
    case "request_information":
      return "needs_information";
    case "approve":
      return "approved";
    case "reject":
      return "rejected";
    case "close":
      return "closed";
  }
}

export function reviewActionRequiresNotes(
  action: VerificationReviewAction,
): boolean {
  return ["request_information", "reject", "close"].includes(action);
}

export function assertNoExistingDecision(hasDecision: boolean): void {
  if (hasDecision) {
    throw new VerificationWorkflowError(
      "DUPLICATE_VERIFICATION_DECISION",
      "A final decision has already been recorded for this application.",
    );
  }
}
