export type EvidenceDeletionEligibilityInput = {
  status: string;
  quarantineStatus: string;
  validationStatus: string;
  reviewerStatus: string;
  legalHold: boolean;
  retentionUntil: Date | string | null;
  deletionRequestedAt?: Date | string | null;
  deletedAt?: Date | string | null;
};

export type EvidenceDeletionEligibility = {
  eligible: boolean;
  blockers: string[];
  retentionExpired: boolean;
};

export function evaluateEvidenceDeletionEligibility(
  input: EvidenceDeletionEligibilityInput,
  now = new Date(),
): EvidenceDeletionEligibility {
  const blockers: string[] = [];
  const retentionTime = input.retentionUntil
    ? new Date(input.retentionUntil).getTime()
    : null;
  const retentionExpired =
    retentionTime !== null &&
    Number.isFinite(retentionTime) &&
    retentionTime <= now.getTime();

  if (input.deletedAt || input.status === "deleted") {
    blockers.push("already_deleted");
  }
  if (retentionTime === null || !Number.isFinite(retentionTime)) {
    blockers.push("retention_date_missing");
  } else if (!retentionExpired) {
    blockers.push("retention_not_expired");
  }
  if (input.legalHold) blockers.push("legal_hold");
  if (input.deletionRequestedAt) blockers.push("deletion_already_requested");
  if (["pending", "scanning", "manual_hold"].includes(input.quarantineStatus)) {
    blockers.push("quarantine_incomplete");
  }
  if (["pending", "in_progress", "needs_information"].includes(input.validationStatus)) {
    blockers.push("validation_incomplete");
  }
  if (["pending", "assigned", "under_review"].includes(input.reviewerStatus)) {
    blockers.push("review_incomplete");
  }
  if (!["released", "rejected"].includes(input.status)) {
    blockers.push("evidence_state_not_terminal");
  }

  return {
    eligible: blockers.length === 0,
    blockers,
    retentionExpired,
  };
}
