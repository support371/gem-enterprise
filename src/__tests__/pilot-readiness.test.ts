import { describe, expect, it } from "vitest";
import { evaluatePilotReadiness } from "@/lib/kyc/pilot-readiness";

const analyst = {
  id: "analyst-1",
  role: "analyst",
  status: "active",
  isActive: true,
  isEmailVerified: true,
};

const administrator = {
  id: "admin-1",
  role: "admin",
  status: "active",
  isActive: true,
  isEmailVerified: true,
};

describe("GEM Verify pilot readiness", () => {
  it("passes with separated active verified reviewer and decision roles", () => {
    const report = evaluatePilotReadiness({
      accounts: [analyst, administrator],
      documentUploadActive: false,
    });

    expect(report.ready).toBe(true);
    expect(report.checks.every((check) => check.passed)).toBe(true);
    expect(report.counts.activeVerifiedAnalysts).toBe(1);
    expect(report.counts.activeVerifiedDecisionMakers).toBe(1);
  });

  it("fails when no analyst is designated", () => {
    const report = evaluatePilotReadiness({
      accounts: [administrator],
      documentUploadActive: false,
    });
    expect(report.ready).toBe(false);
    expect(report.checks.find((check) => check.id === "analyst-coverage")?.passed).toBe(false);
  });

  it("fails when document upload is active", () => {
    const report = evaluatePilotReadiness({
      accounts: [analyst, administrator],
      documentUploadActive: true,
    });
    expect(report.ready).toBe(false);
    expect(report.checks.find((check) => check.id === "document-intake-disabled")?.passed).toBe(false);
  });

  it("does not count suspended or unverified reviewers", () => {
    const report = evaluatePilotReadiness({
      accounts: [
        { ...analyst, status: "suspended" },
        { ...administrator, isEmailVerified: false },
      ],
      documentUploadActive: false,
    });
    expect(report.counts.activeVerifiedAnalysts).toBe(0);
    expect(report.counts.activeVerifiedDecisionMakers).toBe(0);
    expect(report.ready).toBe(false);
  });
});
