import { describe, expect, it } from "vitest";
import { evaluateTransactionAction } from "@/lib/capital-readiness/policy";

describe("capital readiness transaction policy", () => {
  it("allows ordinary non-regulated readiness work", () => {
    expect(
      evaluateTransactionAction({
        action: "PREPARE_READINESS_ASSESSMENT",
        classification: "GREEN_NON_REGULATED",
        actorRole: "GEM_ANALYST",
      }),
    ).toMatchObject({ allowed: true, blockCode: null });
  });

  it("blocks every action while a compliance hold is active", () => {
    expect(
      evaluateTransactionAction({
        action: "PREPARE_FINANCIAL_MODEL",
        classification: "GREEN_NON_REGULATED",
        actorRole: "GEM_ANALYST",
        complianceHold: true,
      }),
    ).toMatchObject({ allowed: false, blockCode: "COMPLIANCE_HOLD_ACTIVE" });
  });

  it("requires compliance and human approval for amber activities", () => {
    const denied = evaluateTransactionAction({
      action: "APPROVE_MARKETING_MATERIAL",
      classification: "AMBER_REVIEW_REQUIRED",
      actorRole: "GEM_COMPLIANCE_OFFICER",
    });

    expect(denied).toMatchObject({
      allowed: false,
      blockCode: "COMPLIANCE_APPROVAL_REQUIRED",
    });

    expect(
      evaluateTransactionAction({
        action: "APPROVE_MARKETING_MATERIAL",
        classification: "AMBER_REVIEW_REQUIRED",
        actorRole: "GEM_COMPLIANCE_OFFICER",
        complianceApproved: true,
        humanApproved: true,
      }),
    ).toMatchObject({ allowed: true, blockCode: null });
  });

  it("prevents GEM-only users from performing licensed-partner actions", () => {
    expect(
      evaluateTransactionAction({
        action: "SEND_INVESTOR_OUTREACH",
        classification: "RED_LICENSED_PARTNER_ONLY",
        actorRole: "GEM_TRANSACTION_DIRECTOR",
        complianceApproved: true,
        humanApproved: true,
        licensedPartnerApproved: true,
      }),
    ).toMatchObject({ allowed: false, blockCode: "LICENSED_PARTNER_REQUIRED" });
  });

  it("allows a regulated action only after partner, compliance and human approval", () => {
    expect(
      evaluateTransactionAction({
        action: "SEND_INVESTOR_OUTREACH",
        classification: "RED_LICENSED_PARTNER_ONLY",
        actorRole: "LICENSED_PARTNER",
        complianceApproved: true,
        humanApproved: true,
        licensedPartnerApproved: true,
      }),
    ).toMatchObject({ allowed: true, blockCode: null });
  });

  it("blocks custody and guaranteed-return claims unconditionally", () => {
    expect(
      evaluateTransactionAction({
        action: "HANDLE_CLIENT_OR_INVESTOR_FUNDS",
        classification: "GREEN_NON_REGULATED",
        actorRole: "GEM_SUPER_ADMIN",
      }),
    ).toMatchObject({ allowed: false, blockCode: "PROHIBITED_ACTIVITY" });

    expect(
      evaluateTransactionAction({
        action: "PUBLISH_GUARANTEED_RETURN_CLAIM",
        classification: "AMBER_REVIEW_REQUIRED",
        actorRole: "GEM_TRANSACTION_DIRECTOR",
        complianceApproved: true,
        humanApproved: true,
      }),
    ).toMatchObject({ allowed: false, blockCode: "PROHIBITED_ACTIVITY" });
  });

  it("keeps transaction-based fees disabled until every required gate is satisfied", () => {
    expect(
      evaluateTransactionAction({
        action: "CREATE_TRANSACTION_BASED_FEE",
        classification: "AMBER_REVIEW_REQUIRED",
        actorRole: "GEM_COMPLIANCE_OFFICER",
      }),
    ).toMatchObject({ allowed: false, blockCode: "TRANSACTION_FEE_DISABLED" });

    expect(
      evaluateTransactionAction({
        action: "CREATE_TRANSACTION_BASED_FEE",
        classification: "AMBER_REVIEW_REQUIRED",
        actorRole: "GEM_COMPLIANCE_OFFICER",
        transactionBasedFeesEnabled: true,
        counselApproved: true,
        licensedPartnerApproved: true,
        complianceApproved: true,
        humanApproved: true,
      }),
    ).toMatchObject({ allowed: true, blockCode: null });
  });

  it("requires human approval before an AI agent sends external communication", () => {
    expect(
      evaluateTransactionAction({
        action: "AI_SEND_EXTERNAL_COMMUNICATION",
        classification: "GREEN_NON_REGULATED",
        actorRole: "AI_AGENT",
      }),
    ).toMatchObject({ allowed: false, blockCode: "HUMAN_APPROVAL_REQUIRED" });

    expect(
      evaluateTransactionAction({
        action: "AI_SEND_EXTERNAL_COMMUNICATION",
        classification: "GREEN_NON_REGULATED",
        actorRole: "AI_AGENT",
        humanApproved: true,
      }),
    ).toMatchObject({ allowed: true, blockCode: null });
  });
});
