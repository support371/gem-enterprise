import { describe, expect, it } from "vitest";
import { evaluateEvidenceDeletionEligibility } from "@/lib/kyc/evidence-retention";

const now = new Date("2026-07-12T00:00:00.000Z");

function eligibleInput() {
  return {
    status: "released",
    quarantineStatus: "passed",
    validationStatus: "passed",
    reviewerStatus: "accepted",
    legalHold: false,
    retentionUntil: "2026-07-11T00:00:00.000Z",
    deletionRequestedAt: null,
    deletedAt: null,
  };
}

describe("GEM Verify evidence deletion eligibility", () => {
  it("allows only terminal evidence after retention expires", () => {
    const result = evaluateEvidenceDeletionEligibility(eligibleInput(), now);

    expect(result.eligible).toBe(true);
    expect(result.retentionExpired).toBe(true);
    expect(result.blockers).toEqual([]);
  });

  it("blocks deletion while a legal hold is active", () => {
    const result = evaluateEvidenceDeletionEligibility(
      { ...eligibleInput(), legalHold: true },
      now,
    );

    expect(result.eligible).toBe(false);
    expect(result.blockers).toContain("legal_hold");
  });

  it("blocks deletion before the retention date", () => {
    const result = evaluateEvidenceDeletionEligibility(
      { ...eligibleInput(), retentionUntil: "2026-08-01T00:00:00.000Z" },
      now,
    );

    expect(result.eligible).toBe(false);
    expect(result.retentionExpired).toBe(false);
    expect(result.blockers).toContain("retention_not_expired");
  });

  it("blocks deletion while scanning, validation or review is unfinished", () => {
    const result = evaluateEvidenceDeletionEligibility(
      {
        ...eligibleInput(),
        quarantineStatus: "scanning",
        validationStatus: "in_progress",
        reviewerStatus: "under_review",
      },
      now,
    );

    expect(result.eligible).toBe(false);
    expect(result.blockers).toEqual(
      expect.arrayContaining([
        "quarantine_incomplete",
        "validation_incomplete",
        "review_incomplete",
      ]),
    );
  });

  it("blocks duplicate deletion requests", () => {
    const result = evaluateEvidenceDeletionEligibility(
      {
        ...eligibleInput(),
        deletionRequestedAt: "2026-07-11T12:00:00.000Z",
      },
      now,
    );

    expect(result.eligible).toBe(false);
    expect(result.blockers).toContain("deletion_already_requested");
  });

  it("blocks non-terminal or already deleted evidence", () => {
    const nonTerminal = evaluateEvidenceDeletionEligibility(
      { ...eligibleInput(), status: "quarantined" },
      now,
    );
    const deleted = evaluateEvidenceDeletionEligibility(
      {
        ...eligibleInput(),
        status: "deleted",
        deletedAt: "2026-07-11T10:00:00.000Z",
      },
      now,
    );

    expect(nonTerminal.blockers).toContain("evidence_state_not_terminal");
    expect(deleted.blockers).toEqual(
      expect.arrayContaining(["already_deleted", "evidence_state_not_terminal"]),
    );
  });
});
