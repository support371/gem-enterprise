import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  createProposalToken,
  GEM_MARKET_PAYMENT_LINK_ID,
  GEM_MARKET_PAYMENT_LINK_URL,
  GEM_MARKET_STRIPE_ACCOUNT_ID,
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

  it("derives proposal signing from JWT_SECRET and requires only webhook readiness in production", () => {
    const preview = getMarketPaymentReadiness({
      VERCEL_ENV: "preview",
      JWT_SECRET: secret,
      GEM_STRIPE_WEBHOOK_SECRET: "whsec_example",
    });
    expect(preview.proposalSigningReady).toBe(true);
    expect(preview.checkoutReady).toBe(false);
    expect(preview.blockers).toContain("Live market checkout is available only in production.");

    const ready = getMarketPaymentReadiness({
      VERCEL_ENV: "production",
      JWT_SECRET: secret,
      GEM_STRIPE_WEBHOOK_SECRET: "whsec_example",
    });
    expect(ready.checkoutReady).toBe(true);
    expect(ready.stripeWebhookReady).toBe(true);
    expect(ready.stripeAccountPinned).toBe(true);
    expect(ready.stripeAccountVerified).toBe(true);
    expect(ready.paymentLinkPinned).toBe(true);
    expect(ready.stripeMode).toBe("live");
  });

  it("rejects contradictory merchant configuration", () => {
    const blocked = getMarketPaymentReadiness({
      VERCEL_ENV: "production",
      JWT_SECRET: secret,
      GEM_STRIPE_WEBHOOK_SECRET: "whsec_example",
      GEM_STRIPE_ACCOUNT_ID: "acct_wrong",
      GEM_STRIPE_MODE: "test",
      GEM_STRIPE_ACCOUNT_VERIFIED: "false",
    });
    expect(blocked.checkoutReady).toBe(false);
    expect(blocked.blockers).toContain(
      "GEM_STRIPE_ACCOUNT_ID conflicts with the authorized live merchant account.",
    );
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

  it("locks checkout to approved intake and routes only to the pinned live Payment Link", () => {
    const checkout = readFileSync("src/app/api/market/checkout/route.ts", "utf8");
    const webhook = readFileSync("src/app/api/market/stripe/webhook/route.ts", "utf8");
    expect(checkout).toContain('result.submission.status !== "APPROVED"');
    expect(checkout).toContain("GEM_MARKET_PAYMENT_LINK_URL");
    expect(checkout).toContain('paymentUrl.searchParams.set("client_reference_id"');
    expect(checkout).not.toContain("GEM_STRIPE_SECRET_KEY");
    expect(GEM_MARKET_STRIPE_ACCOUNT_ID).toBe("acct_1TkrtxCKnPeVL2Jw");
    expect(GEM_MARKET_PAYMENT_LINK_ID).toBe("plink_1UAeuoCKnPeVL2JwrLMswd31");
    expect(GEM_MARKET_PAYMENT_LINK_URL).toBe("https://buy.stripe.com/eVqfZgeQ58DX9wC7I9b3q00");
    expect(webhook).toContain("GEM_MARKET_PAYMENT_LINK_ID");
    expect(webhook).toContain("paymentLinkMatches");
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
