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
      reviews: reviewActions.map((action, index) => ({
        id: `review-${index}`,
        reviewerId:
          action === "application_created" ||
          action === "consent_recorded" ||
          action === "application_submitted" ||
          action === "information_resubmitted"
            ? applicant.id
            : analyst.id,
        action,
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
      {
        action: "role_change",
        resource: "user",
        resourceId: analyst.id,
        userId: decisionMaker.id,
        metadata: { previousRole: "client", newRole: "analyst" },
        createdAt: "2026-07-13T09:55:00.000Z",
      },
      {
        action: "kyc_submit",
        resource: "verification_application",
        resourceId: "application-1",
        userId: applicant.id,
        metadata: { stage: "consent_recorded" },
        createdAt: "2026-07-13T10:01:00.000Z",
      },
      {
        action: "kyc_submit",
        resource: "verification_application",
        resourceId: "application-1",
        userId: applicant.id,
        metadata: { stage: "submitted_for_manual_review" },
        createdAt: "2026-07-13T10:02:00.000Z",
      },
      {
        action: "kyc_approve",
        resource: "verification_application",
        resourceId: "application-1",
        userId: decisionMaker.id,
        metadata: { reviewAction: "approve" },
        createdAt: "2026-07-13T10:09:00.000Z",
      },
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
      auditEvents: 4,
      documents: 0,
    });
  });

  it("rejects an application without the explicit synthetic marker", () => {
    const input = completeInput();
    input.application.formData = { legalName: "Ordinary Applicant" };

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
});
