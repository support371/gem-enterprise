import { describe, expect, it } from "vitest";
import {
  assertNoExistingDecision,
  assertTransition,
  canPerformReviewAction,
  canTransition,
  canWorkOnAssignedCase,
  getAllowedReviewActions,
  reviewActionRequiresNotes,
  toDatabaseKycStatus,
  toVerificationState,
  VerificationWorkflowError,
} from "@/lib/kyc/workflow";

describe("GEM Verify workflow", () => {
  it("maps the legacy database statuses to the explicit Phase 1 states", () => {
    expect(toVerificationState("not_started")).toBe("draft");
    expect(toVerificationState("started")).toBe("consented");
    expect(toVerificationState("in_progress")).toBe("submitted");
    expect(toVerificationState("manual_review")).toBe("needs_information");
    expect(toVerificationState("expired")).toBe("closed");
  });

  it("maps explicit states back to database-compatible statuses", () => {
    expect(toDatabaseKycStatus("submitted")).toBe("in_progress");
    expect(toDatabaseKycStatus("needs_information")).toBe("manual_review");
    expect(toDatabaseKycStatus("closed")).toBe("expired");
  });

  it("allows the complete controlled manual-review path", () => {
    expect(canTransition("draft", "consented")).toBe(true);
    expect(canTransition("consented", "submitted")).toBe(true);
    expect(canTransition("submitted", "under_review")).toBe(true);
    expect(canTransition("under_review", "needs_information")).toBe(true);
    expect(canTransition("needs_information", "submitted")).toBe(true);
    expect(canTransition("under_review", "approved")).toBe(true);
    expect(canTransition("approved", "closed")).toBe(true);
  });

  it("rejects direct or backwards state changes", () => {
    expect(() => assertTransition("submitted", "approved")).toThrow(
      VerificationWorkflowError,
    );
    expect(() => assertTransition("closed", "submitted")).toThrow(
      /cannot move/,
    );
  });

  it("rejects a duplicate final decision", () => {
    expect(() => assertNoExistingDecision(true)).toThrow(
      /already been recorded/,
    );
    expect(() => assertNoExistingDecision(false)).not.toThrow();
  });

  it("keeps client accounts out of the review workflow", () => {
    expect(getAllowedReviewActions("client")).toEqual([]);
    expect(canPerformReviewAction("client", "assign")).toBe(false);
  });

  it("allows analysts to review but not decide", () => {
    expect(canPerformReviewAction("analyst", "start_review")).toBe(true);
    expect(canPerformReviewAction("analyst", "request_information")).toBe(true);
    expect(canPerformReviewAction("analyst", "approve")).toBe(false);
    expect(canPerformReviewAction("analyst", "reject")).toBe(false);
  });

  it("allows administrator roles to record final decisions", () => {
    expect(canPerformReviewAction("admin", "approve")).toBe(true);
    expect(canPerformReviewAction("super_admin", "reject")).toBe(true);
    expect(canPerformReviewAction("internal", "close")).toBe(true);
  });

  it("enforces assignment ownership for analysts", () => {
    expect(canWorkOnAssignedCase("analyst", "reviewer-1", null)).toBe(true);
    expect(canWorkOnAssignedCase("analyst", "reviewer-1", "reviewer-1")).toBe(true);
    expect(canWorkOnAssignedCase("analyst", "reviewer-1", "reviewer-2")).toBe(false);
    expect(canWorkOnAssignedCase("admin", "admin-1", "reviewer-2")).toBe(true);
  });

  it("requires explanations for information requests, rejection, and closure", () => {
    expect(reviewActionRequiresNotes("request_information")).toBe(true);
    expect(reviewActionRequiresNotes("reject")).toBe(true);
    expect(reviewActionRequiresNotes("close")).toBe(true);
    expect(reviewActionRequiresNotes("approve")).toBe(false);
  });
});
