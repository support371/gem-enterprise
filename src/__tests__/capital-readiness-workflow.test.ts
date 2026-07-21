import { describe, expect, it } from "vitest";
import {
  buildPostCloseServiceRecommendations,
  calculateCapitalReadiness,
  evaluateCapitalClosingGates,
  evaluateCapitalPartnerEligibility,
  validateCapitalMatterTransition,
} from "@/lib/capital-readiness/workflow";

const readyWorkstreams = [
  { type: "CORPORATE" as const, score: 90, criticalFindings: 0, openActions: 1 },
  { type: "FINANCIAL" as const, score: 86, criticalFindings: 0, openActions: 2 },
  { type: "COMMERCIAL" as const, score: 82, criticalFindings: 0, openActions: 0 },
  { type: "MANAGEMENT" as const, score: 85, criticalFindings: 0, openActions: 0 },
  { type: "CYBERSECURITY" as const, score: 84, criticalFindings: 0, openActions: 3 },
  { type: "COMPLIANCE" as const, score: 88, criticalFindings: 0, openActions: 1 },
  { type: "TRANSACTION" as const, score: 80, criticalFindings: 0, openActions: 2 },
  { type: "DATA_ROOM" as const, score: 92, criticalFindings: 0, openActions: 0 },
];

describe("capital readiness scoring", () => {
  it("calculates weighted readiness across all required workstreams", () => {
    const result = calculateCapitalReadiness(readyWorkstreams);
    expect(result.status).toBe("READY");
    expect(result.overallScore).toBeGreaterThanOrEqual(80);
    expect(result.completeWorkstreams).toBe(8);
  });

  it("allows a critical finding to override a high numerical score", () => {
    const result = calculateCapitalReadiness(
      readyWorkstreams.map((item) =>
        item.type === "COMPLIANCE" ? { ...item, score: 100, criticalFindings: 1 } : item,
      ),
    );
    expect(result.status).toBe("BLOCKED");
    expect(result.criticalBlocks).toBe(1);
  });

  it("does not label an incomplete assessment ready", () => {
    const result = calculateCapitalReadiness(readyWorkstreams.slice(0, 4));
    expect(result.status).toBe("IN_PROGRESS");
    expect(result.completeWorkstreams).toBe(4);
  });
});

describe("capital matter transitions", () => {
  it("blocks progression under an active hold", () => {
    expect(
      validateCapitalMatterTransition("INTAKE", "KYB_AND_CONFLICT_REVIEW", {
        activeComplianceHold: true,
      }),
    ).toMatchObject({ allowed: false, code: "HOLD_ACTIVE" });
  });

  it("requires KYB approval before engagement execution", () => {
    expect(
      validateCapitalMatterTransition("KYB_AND_CONFLICT_REVIEW", "ENGAGEMENT_EXECUTION", {}),
    ).toMatchObject({ allowed: false, code: "KYB_REQUIRED" });
  });

  it("requires readiness before internal committee", () => {
    expect(
      validateCapitalMatterTransition("READINESS_ASSESSMENT", "INTERNAL_COMMITTEE", {
        readinessStatus: "REMEDIATION_REQUIRED",
      }),
    ).toMatchObject({ allowed: false, code: "READINESS_REQUIRED" });
  });

  it("allows the controlled route after all relevant gates are met", () => {
    expect(
      validateCapitalMatterTransition("LICENSED_PARTNER_REVIEW", "CONTROLLED_MARKET_PROCESS", {
        licensedPartnerAccepted: true,
      }),
    ).toMatchObject({ allowed: true, code: "ALLOWED" });
  });
});

describe("partner eligibility", () => {
  it("rejects an expired or unauthorized partner", () => {
    const result = evaluateCapitalPartnerEligibility({
      status: "EXPIRED",
      jurisdiction: "US",
      approvedJurisdictions: ["UK"],
      instrument: "PRIVATE_PLACEMENT",
      authorizedInstruments: ["DEBT"],
      transactionAmount: 5_000_000,
      minimumTransaction: 10_000_000,
      maximumTransaction: 100_000_000,
      agreementExpiresAt: new Date("2025-01-01"),
      licenseExpiresAt: new Date("2025-01-01"),
      conflictCleared: false,
      verificationEvidenceRef: null,
      asOf: new Date("2026-07-17"),
    });
    expect(result.eligible).toBe(false);
    expect(result.blockers.length).toBeGreaterThan(5);
  });

  it("accepts a verified partner within scope", () => {
    const result = evaluateCapitalPartnerEligibility({
      status: "ACTIVE",
      jurisdiction: "US",
      approvedJurisdictions: ["US", "UK"],
      instrument: "PRIVATE_PLACEMENT",
      authorizedInstruments: ["PRIVATE_PLACEMENT", "DEBT"],
      transactionAmount: 5_000_000,
      minimumTransaction: 1_000_000,
      maximumTransaction: 20_000_000,
      agreementExpiresAt: new Date("2027-12-31"),
      licenseExpiresAt: new Date("2027-12-31"),
      conflictCleared: true,
      verificationEvidenceRef: "evidence/partner-license.pdf",
      asOf: new Date("2026-07-17"),
    });
    expect(result).toEqual({ eligible: true, blockers: [] });
  });
});

describe("closing and post-close conversion", () => {
  it("blocks closing until every mandatory gate passes", () => {
    const result = evaluateCapitalClosingGates({
      finalKybRefresh: true,
      finalSanctionsRefresh: true,
      ownershipConfirmed: true,
      documentsApproved: true,
      partnerConfirmed: true,
      counselConfirmed: true,
      finalFeeApproved: true,
      conditionsPrecedentComplete: false,
      signatoriesConfirmed: true,
      fundsFlowVerifiedExternally: true,
      noGemCustodyConfirmed: true,
      postCloseOwnersAssigned: true,
    });
    expect(result.readyToClose).toBe(false);
    expect(result.blockers).toContain("CONDITIONS_PRECEDENT_COMPLETE");
  });

  it("creates recurring-service recommendations from real post-close obligations", () => {
    const recommendations = buildPostCloseServiceRecommendations({
      cybersecurityFindings: 2,
      complianceFindings: 1,
      reportingObligations: true,
      useOfProceedsMonitoring: true,
      vendorRiskExposure: true,
      realEstateProject: true,
    });
    expect(recommendations).toContain("MONTHLY_MONITORING");
    expect(recommendations).toContain("POST_CLOSE_IMPLEMENTATION");
    expect(recommendations).toContain("REAL_ESTATE_PROJECT_MONITORING");
  });
});
