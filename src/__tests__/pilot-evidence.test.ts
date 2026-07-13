import { describe, expect, it } from "vitest";
import { evaluatePilotEvidence } from "@/lib/kyc/pilot-evidence";

const applicant = {
  id: "applicant-1",
  role: "client",
  status: "active",
  isActive: true,
  isEmailVerified: true,
};
const analyst = {
  id: "analyst-1",
  role: "analyst",
  status: "active",
  isActive: true,
  isEmailVerified: true,
};
const decisionMaker = {
  id: "admin-1",
  role: "admin",
  status: "active",
  isActive: true,
  isEmailVerified: true,
};

const reviewActions = [
  "application_created",
  "consent_recorded",
  "application_submitted",
  "reviewer_assigned",
  "review_started",
  "information_requested",
  "information_resubmitted",
  "review_started",
  "application_approved",
];

function audit(
  action: string,
  resource: string,
  resourceId: string,
  userId: string,
  metadata: Record<string, string>,
  minute: number,
) {
  return {
    action,
    resource,
    resourceId,
    userId,
    metadata,
    createdAt: new Date(Date.UTC(2026, 6, 13, 9, minute)).toISOString(),
  };
}

function completeInput() {
  return {
    application: {
      id: "application-1",
      userId: applicant.id,
      status: "approved",
      reviewerId: analyst.id,
      formData: {
        legalName: "GEM Verify Synthetic Applicant",
        _verificationPilot: {
          synthetic: true,
          scenario: "gem-verify-phase-1b",
          version: 1,
        },
      },
      submittedAt: "2026-07-13T10:02:00.000Z",
      reviewedAt: "2026-07-13T10:08:00.000Z",
      completedAt: "2026-07-13T10:09:00.000Z",
      reviews: reviewActions.map((actionName, index) => ({
        id: `review-${index}`,
        reviewerId:
          actionName === "application_created" ||
          actionName === "consent_recorded" ||
          actionName === "application_submitted" ||
          actionName === "information_resubmitted"
            ? applicant.id
            : analyst.id,
        action: actionName,
        createdAt: new Date(Date.UTC(2026, 6, 13, 10, index)).toISOString(),
      })),
      decision: {
        decision: "approved",
        decisionBy: decisionMaker.id,
        decisionAt: "2026-07-13T10:09:00.000Z",
      },
      documentCount: 0,
    },
    applicant,
    analyst,
    decisionMaker,
    audits: [
      audit("role_change", "user", analyst.id, decisionMaker.id, {
        previousRole: "client",
        newRole: "analyst",
      }, 1),
      audit("login", "user", applicant.id, applicant.id, {}, 2),
      audit("login", "user", analyst.id, analyst.id, {}, 3),
      audit("login", "user", decisionMaker.id, decisionMaker.id, {}, 4),
      audit("case_created", "verification_application", "application-1", applicant.id, {
        stage: "draft_created",
      }, 5),
      audit("kyc_submit", "verification_application", "application-1", applicant.id, {
        stage: "consent_recorded",
      }, 6),
      audit("kyc_submit", "verification_application", "application-1", applicant.id, {
        stage: "submitted_for_manual_review",
      }, 7),
      audit("admin_action", "verification_application", "application-1", analyst.id, {
        reviewAction: "assign",
      }, 8),
      audit("kyc_flag", "verification_application", "application-1", analyst.id, {
        reviewAction: "start_review",
      }, 9),
      audit("kyc_flag", "verification_application", "application-1", analyst.id, {
        reviewAction: "request_information",
      }, 10),
      audit("kyc_submit", "verification_application", "application-1", applicant.id, {
        stage: "submitted_for_manual_review",
      }, 11),
      audit("kyc_flag", "verification_application", "application-1", analyst.id, {
        reviewAction: "start_review",
      }, 12),
      audit("kyc_approve", "verification_application", "application-1", decisionMaker.id, {
        reviewAction: "approve",
      }, 13),
    ],
  };
}

describe("evaluatePilotEvidence", () => {
  it("completes only a fully evidenced synthetic pilot", () => {
    const report = evaluatePilotEvidence(completeInput());

    expect(report.completed).toBe(true);
    expect(report.outcome).toBe("approved");
    expect(report.checks.every((check) => check.passed)).toBe(true);
    expect(report.counts).toEqual({
      reviewEvents: reviewActions.length,
      auditEvents: 13,
      documents: 0,
    });
  });

  it("rejects an application without the explicit synthetic marker", () => {
    const input = completeInput();
    input.application.formData = {
      legalName: "Ordinary Applicant",
      _verificationPilot: {
        synthetic: false,
        scenario: "gem-verify-phase-1b",
        version: 1,
      },
    };

    const report = evaluatePilotEvidence(input);
    expect(report.completed).toBe(false);
    expect(report.checks.find((check) => check.id === "synthetic-marker")?.passed).toBe(false);
  });

  it("rejects missing information round-trip and attached documents", () => {
    const input = completeInput();
    input.application.reviews = input.application.reviews.filter(
      (review) => !["information_requested", "information_resubmitted"].includes(review.action),
    );
    input.application.documentCount = 1;

    const report = evaluatePilotEvidence(input);
    expect(report.completed).toBe(false);
    expect(report.checks.find((check) => check.id === "information-round-trip")?.passed).toBe(false);
    expect(report.checks.find((check) => check.id === "sensitive-documents-disabled")?.passed).toBe(false);
  });

  it("rejects a decision made by the assigned analyst", () => {
    const input = completeInput();
    input.application.decision = {
      decision: "approved",
      decisionBy: analyst.id,
      decisionAt: "2026-07-13T10:09:00.000Z",
    };
    input.decisionMaker = analyst;
    input.audits[input.audits.length - 1].userId = analyst.id;

    const report = evaluatePilotEvidence(input);
    expect(report.completed).toBe(false);
    expect(report.checks.find((check) => check.id === "final-decision")?.passed).toBe(false);
  });

  it("rejects missing controlled login evidence", () => {
    const input = completeInput();
    input.audits = input.audits.filter(
      (entry) => !(entry.action === "login" && entry.userId === analyst.id),
    );

    const report = evaluatePilotEvidence(input);
    expect(report.completed).toBe(false);
    expect(report.checks.find((check) => check.id === "authenticated-sessions")?.passed).toBe(false);
  });
});
