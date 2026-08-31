import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  createProposalToken,
  getMarketPaymentReadiness,
  verifyProposalToken,
  verifyStripeWebhookSignature,
} from "@/lib/market/proposal";

const secret = "market-proposal-test-secret-that-is-long-enough-123456";

describe("market proposal and payment handoff", () => {
  it("signs and verifies bounded proposal links", () => {
    const token = createProposalToken(
      { intakeId: "intake-123", publicId: "GEM-ENT-20260831-ABC", ttlSeconds: 600 },
      secret,
    );
    expect(verifyProposalToken(token, secret)).toMatchObject({
      v: 1,
      intakeId: "intake-123",
      publicId: "GEM-ENT-20260831-ABC",
    });
    expect(verifyProposalToken(`${token}tampered`, secret)).toBeNull();
  });

  it("keeps production checkout fail closed until a live verified GEM merchant is pinned", () => {
    const blocked = getMarketPaymentReadiness({
      VERCEL_ENV: "production",
      MARKET_PROPOSAL_SECRET: secret,
      GEM_STRIPE_SECRET_KEY: "sk_test_example",
      GEM_STRIPE_WEBHOOK_SECRET: "whsec_example",
      GEM_STRIPE_ACCOUNT_ID: "acct_example",
      GEM_STRIPE_ACCOUNT_VERIFIED: "true",
      GEM_STRIPE_MODE: "test",
    });
    expect(blocked.checkoutReady).toBe(false);
    expect(blocked.blockers).toContain("Production checkout requires GEM_STRIPE_MODE=live.");

    const ready = getMarketPaymentReadiness({
      VERCEL_ENV: "production",
      MARKET_PROPOSAL_SECRET: secret,
      GEM_STRIPE_SECRET_KEY: "sk_live_example",
      GEM_STRIPE_WEBHOOK_SECRET: "whsec_example",
      GEM_STRIPE_ACCOUNT_ID: "acct_gem",
      GEM_STRIPE_ACCOUNT_VERIFIED: "true",
      GEM_STRIPE_MODE: "live",
    });
    expect(ready.checkoutReady).toBe(true);
  });

  it("verifies Stripe webhook signatures with timestamp tolerance", () => {
    const payload = JSON.stringify({ id: "evt_123", type: "checkout.session.completed" });
    const timestamp = 1_788_211_200;
    const webhookSecret = "whsec_test_secret";
    const signature = createHmac("sha256", webhookSecret)
      .update(`${timestamp}.${payload}`)
      .digest("hex");

    expect(
      verifyStripeWebhookSignature({
        payload,
        header: `t=${timestamp},v1=${signature}`,
        secret: webhookSecret,
        nowSeconds: timestamp + 30,
      }),
    ).toBe(true);
    expect(
      verifyStripeWebhookSignature({
        payload,
        header: `t=${timestamp},v1=${signature}`,
        secret: webhookSecret,
        nowSeconds: timestamp + 1_000,
      }),
    ).toBe(false);
  });

  it("locks checkout to approved intake and pins the merchant account before session creation", () => {
    const checkout = readFileSync("src/app/api/market/checkout/route.ts", "utf8");
    const webhook = readFileSync("src/app/api/market/stripe/webhook/route.ts", "utf8");
    expect(checkout).toContain('result.submission.status !== "APPROVED"');
    expect(checkout).toContain('account.id !== process.env.GEM_STRIPE_ACCOUNT_ID');
    expect(checkout).toContain('"Idempotency-Key"');
    expect(webhook).toContain("verifyStripeWebhookSignature");
    expect(webhook).toContain("amountMatches");
    expect(webhook).toContain("convertApprovedIntakeAfterVerifiedPayment");
  });

  it("never turns a Stripe webhook directly into workspace access", () => {
    const webhook = readFileSync("src/app/api/market/stripe/webhook/route.ts", "utf8");
    const onboarding = readFileSync("src/components/market/ConvertedClientOnboarding.tsx", "utf8");
    const invitationRoute = readFileSync("src/app/api/admin/workspace-invitations/route.ts", "utf8");

    expect(webhook).not.toContain("workspace-invitations");
    expect(webhook).not.toContain("workspaceOwnerInvitationGateway");
    expect(onboarding).toContain('viewerRole === "super_admin"');
    expect(onboarding).toContain('/api/admin/workspace-invitations');
    expect(onboarding).toContain("Confirm owner email exactly");
    expect(invitationRoute).toContain("requirePlatformOwner");
  });
});
