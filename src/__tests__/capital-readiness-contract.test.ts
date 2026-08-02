import { afterEach, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { NextRequest } from "next/server";
import { capitalObjectHash } from "@/lib/capital-readiness/approvals";
import { capitalCommandSchema } from "@/lib/capital-readiness/command-schemas";
import { authorizeCapitalClosingSchema } from "@/lib/capital-readiness/closing";
import {
  capitalLifecycleSchema,
  type CapitalLifecycleInput,
} from "@/lib/capital-readiness/lifecycle";
import { capitalMutationGate } from "@/lib/capital-readiness/security";

const workspaceId = "ws_test_capital";
const idempotencyKey = "capital-test-idempotency-key-0001";
const originalMutationGate = process.env.CAPITAL_READINESS_MUTATIONS_ENABLED;
const originalProductionApproval = process.env.CAPITAL_READINESS_PRODUCTION_APPROVED;

afterEach(() => {
  if (originalMutationGate === undefined) {
    delete process.env.CAPITAL_READINESS_MUTATIONS_ENABLED;
  } else {
    process.env.CAPITAL_READINESS_MUTATIONS_ENABLED = originalMutationGate;
  }
  if (originalProductionApproval === undefined) {
    delete process.env.CAPITAL_READINESS_PRODUCTION_APPROVED;
  } else {
    process.env.CAPITAL_READINESS_PRODUCTION_APPROVED = originalProductionApproval;
  }
});

describe("capital mutation activation boundary", () => {
  const sameOriginRequest = () =>
    new NextRequest("https://gem.example/api/capital-readiness/commands", {
      method: "POST",
      headers: { origin: "https://gem.example" },
    });

  it("requires explicit same-origin and both owner-controlled activation gates", async () => {
    const missingOrigin = capitalMutationGate(
      new NextRequest("https://gem.example/api/capital-readiness/commands", {
        method: "POST",
      }),
    );
    expect(missingOrigin?.status).toBe(403);

    delete process.env.CAPITAL_READINESS_MUTATIONS_ENABLED;
    delete process.env.CAPITAL_READINESS_PRODUCTION_APPROVED;
    const disabled = capitalMutationGate(sameOriginRequest());
    expect(disabled).not.toBeNull();
    expect((await disabled!.json()).code).toBe(
      "CAPITAL_READINESS_MUTATIONS_NOT_ACTIVATED",
    );

    process.env.CAPITAL_READINESS_MUTATIONS_ENABLED = "true";
    const oneGate = capitalMutationGate(sameOriginRequest());
    expect(oneGate).not.toBeNull();
    expect((await oneGate!.json()).code).toBe(
      "CAPITAL_READINESS_MUTATIONS_NOT_ACTIVATED",
    );

    process.env.CAPITAL_READINESS_PRODUCTION_APPROVED = "true";
    expect(capitalMutationGate(sameOriginRequest())).toBeNull();
  });

  it("keeps closing authorization blocked even when ordinary mutations are approved", async () => {
    process.env.CAPITAL_READINESS_MUTATIONS_ENABLED = "true";
    process.env.CAPITAL_READINESS_PRODUCTION_APPROVED = "true";

    const response = capitalMutationGate(
      sameOriginRequest(),
      "closing_authorization",
    );
    expect(response?.status).toBe(423);
    expect((await response!.json()).code).toBe(
      "CAPITAL_CLOSING_EVIDENCE_VERIFICATION_REQUIRED",
    );
  });

  it("protects every state-changing capital route with the shared mutation gate", () => {
    const routes = [
      "src/app/api/capital-readiness/approvals/[id]/decision/route.ts",
      "src/app/api/capital-readiness/approvals/route.ts",
      "src/app/api/capital-readiness/closings/[id]/authorize/route.ts",
      "src/app/api/capital-readiness/commands/route.ts",
      "src/app/api/capital-readiness/lifecycle/route.ts",
      "src/app/api/capital-readiness/matters/[id]/transition/route.ts",
      "src/app/api/capital-readiness/opportunities/route.ts",
    ];

    for (const route of routes) {
      expect(readFileSync(route, "utf8")).toContain("capitalMutationGate(request");
    }
  });
});

describe("capital approval object hashing", () => {
  it("is stable across object key ordering", () => {
    const left = capitalObjectHash({ amount: 100, terms: { currency: "USD", maturity: 24 } });
    const right = capitalObjectHash({ terms: { maturity: 24, currency: "USD" }, amount: 100 });
    expect(left).toBe(right);
    expect(left).toMatch(/^[a-f0-9]{64}$/);
  });

  it("changes when the approved object version changes", () => {
    expect(capitalObjectHash({ amount: 100 })).not.toBe(capitalObjectHash({ amount: 101 }));
  });
});

describe("capital command validation", () => {
  it("requires a KYB case or matter when imposing a hold", () => {
    const result = capitalCommandSchema.safeParse({
      workspaceId,
      idempotencyKey,
      command: "IMPOSE_HOLD",
      payload: {
        holdType: "COMPLIANCE",
        reason: "A material compliance concern requires review.",
      },
    });
    expect(result.success).toBe(false);
  });

  it("requires the no-custody and no-guarantee engagement terms", () => {
    const result = capitalCommandSchema.safeParse({
      workspaceId,
      idempotencyKey,
      command: "CREATE_ENGAGEMENT",
      payload: {
        opportunityId: "opp_1",
        title: "Capital readiness engagement",
        scope: { readiness: true },
        excludedActivities: [],
        jurisdictions: ["US"],
        noCustodyAccepted: false,
        noGuaranteeAccepted: true,
        licensedPartnerRequired: true,
      },
    });
    expect(result.success).toBe(false);
  });

  it("requires verified no-custody confirmation in a closing command", () => {
    const result = capitalCommandSchema.safeParse({
      workspaceId,
      idempotencyKey,
      approvalRequestId: "approval_1",
      command: "AUTHORIZE_CLOSING",
      payload: {
        closingId: "closing_1",
        finalKybRefreshAt: new Date().toISOString(),
        finalSanctionsRefreshAt: new Date().toISOString(),
        partnerConfirmationRef: "evidence/partner",
        counselConfirmationRef: "evidence/counsel",
        feeApprovalRef: "evidence/fee",
        fundsFlowVerifiedExternally: true,
        noGemCustodyConfirmed: false,
        authorizedSignatoriesConfirmed: true,
      },
    });
    expect(result.success).toBe(false);
  });

  it("accepts a complete evidence-labeled proposal", () => {
    const result = capitalCommandSchema.safeParse({
      workspaceId,
      idempotencyKey,
      command: "RECORD_PROPOSAL",
      payload: {
        matterId: "matter_1",
        status: "NON_BINDING_PROPOSAL",
        instrument: "Senior secured debt",
        proposedAmount: 5_000_000,
        currency: "USD",
        covenants: {},
        conditions: {},
        fees: {},
        fundingCertainty: "MEDIUM",
        sourceLabel: "PARTNER_PROVIDED",
        sourceRef: "evidence/proposal-v1",
      },
    });
    expect(result.success).toBe(true);
  });
});

describe("capital lifecycle validation", () => {
  it("requires evidence for partner mandate decisions", () => {
    const result = capitalLifecycleSchema.safeParse({
      workspaceId,
      action: "DECIDE_PARTNER_MANDATE",
      payload: {
        mandateId: "mandate_1",
        decision: "ACCEPTED",
        rationale: "The mandate fits the verified license and transaction scope.",
      },
    });
    expect(result.success).toBe(false);
  });

  it("requires independent approval for counsel waivers", () => {
    const parsed = capitalLifecycleSchema.parse({
      workspaceId,
      approvalRequestId: "approval_waiver",
      action: "UPDATE_CLOSING_CONDITION",
      payload: {
        conditionId: "condition_1",
        status: "WAIVED_BY_COUNSEL",
        evidenceRef: "evidence/counsel-waiver",
        rationale: "Counsel approved the documented waiver after reviewing the closing condition.",
      },
    });
    expect((parsed as CapitalLifecycleInput).approvalRequestId).toBe(
      "approval_waiver",
    );
  });
});

describe("dedicated closing authorization contract", () => {
  it("rejects missing post-close owners", () => {
    const result = authorizeCapitalClosingSchema.safeParse({
      workspaceId,
      approvalRequestId: "approval_closing",
      finalKybRefreshAt: new Date().toISOString(),
      finalSanctionsRefreshAt: new Date().toISOString(),
      partnerConfirmationRef: "evidence/partner",
      counselConfirmationRef: "evidence/counsel",
      feeApprovalRef: "evidence/fee",
      signatoryEvidenceRef: "evidence/signatories",
      fundsFlowVerificationRef: "evidence/funds-flow",
      postCloseOwnerRefs: [],
      noGemCustodyConfirmed: true,
      rationale: "All closing gates were reviewed and supported by evidence.",
    });
    expect(result.success).toBe(false);
  });

  it("accepts a complete evidence package", () => {
    const result = authorizeCapitalClosingSchema.safeParse({
      workspaceId,
      approvalRequestId: "approval_closing",
      finalKybRefreshAt: new Date().toISOString(),
      finalSanctionsRefreshAt: new Date().toISOString(),
      partnerConfirmationRef: "evidence/partner",
      counselConfirmationRef: "evidence/counsel",
      feeApprovalRef: "evidence/fee",
      signatoryEvidenceRef: "evidence/signatories",
      fundsFlowVerificationRef: "evidence/funds-flow",
      postCloseOwnerRefs: ["owner_security", "owner_compliance"],
      noGemCustodyConfirmed: true,
      rationale: "All closing gates were reviewed and supported by evidence.",
    });
    expect(result.success).toBe(true);
  });
});
