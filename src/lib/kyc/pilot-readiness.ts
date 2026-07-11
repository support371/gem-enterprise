import {
  assertNoExistingDecision,
  canTransition,
  VerificationWorkflowError,
} from "@/lib/kyc/workflow";

export interface PilotAccountSnapshot {
  id: string;
  role: string;
  status: string;
  isActive: boolean;
  isEmailVerified: boolean;
}

export interface PilotReadinessCheck {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
}

function isActiveVerified(account: PilotAccountSnapshot) {
  return (
    account.isActive &&
    account.status === "active" &&
    account.isEmailVerified
  );
}

function duplicateDecisionGuardIsActive() {
  try {
    assertNoExistingDecision(true);
    return false;
  } catch (error) {
    return (
      error instanceof VerificationWorkflowError &&
      error.code === "DUPLICATE_VERIFICATION_DECISION"
    );
  }
}

export function evaluatePilotReadiness(input: {
  accounts: PilotAccountSnapshot[];
  documentUploadActive: boolean;
}) {
  const analysts = input.accounts.filter(
    (account) => account.role === "analyst" && isActiveVerified(account),
  );
  const decisionMakers = input.accounts.filter(
    (account) =>
      ["admin", "super_admin", "internal"].includes(account.role) &&
      isActiveVerified(account),
  );

  const expectedWorkflowPath =
    canTransition("draft", "consented") &&
    canTransition("consented", "submitted") &&
    canTransition("submitted", "under_review") &&
    canTransition("under_review", "needs_information") &&
    canTransition("needs_information", "submitted") &&
    canTransition("under_review", "approved") &&
    canTransition("under_review", "rejected") &&
    canTransition("approved", "closed") &&
    canTransition("rejected", "closed") &&
    !canTransition("submitted", "approved") &&
    !canTransition("closed", "submitted");

  const checks: PilotReadinessCheck[] = [
    {
      id: "document-intake-disabled",
      label: "Sensitive document intake disabled",
      passed: !input.documentUploadActive,
      detail: input.documentUploadActive
        ? "Document intake is active and must be disabled before the limited-data pilot."
        : "Identity and financial document upload remains fail closed.",
    },
    {
      id: "analyst-coverage",
      label: "Active verified analyst assigned",
      passed: analysts.length > 0,
      detail:
        analysts.length > 0
          ? `${analysts.length} active verified analyst account${analysts.length === 1 ? "" : "s"} available.`
          : "Assign at least one active, email-verified analyst account.",
    },
    {
      id: "decision-maker-coverage",
      label: "Active verified decision maker available",
      passed: decisionMakers.length > 0,
      detail:
        decisionMakers.length > 0
          ? `${decisionMakers.length} active verified administrator-level account${decisionMakers.length === 1 ? "" : "s"} available.`
          : "At least one active, email-verified administrator-level account is required.",
    },
    {
      id: "role-separation",
      label: "Review and decision roles separated",
      passed: analysts.length > 0 && decisionMakers.length > 0,
      detail:
        analysts.length > 0 && decisionMakers.length > 0
          ? "Analyst review and administrator decision responsibilities are held by separate role classes."
          : "Both analyst and administrator-level coverage are required.",
    },
    {
      id: "workflow-policy",
      label: "Controlled workflow transitions enforced",
      passed: expectedWorkflowPath,
      detail: expectedWorkflowPath
        ? "The manual workflow permits only the expected forward, information-request, decision, and closure transitions."
        : "The workflow transition policy does not match the Phase 1 pilot specification.",
    },
    {
      id: "duplicate-decision-guard",
      label: "Duplicate final decisions rejected",
      passed: duplicateDecisionGuardIsActive(),
      detail: duplicateDecisionGuardIsActive()
        ? "A second approval or rejection is rejected by the workflow policy."
        : "The duplicate-decision guard is not active.",
    },
  ];

  return {
    ready: checks.every((check) => check.passed),
    checks,
    counts: {
      totalAccounts: input.accounts.length,
      activeVerifiedAnalysts: analysts.length,
      activeVerifiedDecisionMakers: decisionMakers.length,
    },
  };
}
