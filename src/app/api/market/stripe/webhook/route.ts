import { NextRequest, NextResponse } from "next/server";
import { createEvidenceItem } from "@/lib/evidence";
import { foundingBusinessReviewOffer } from "@/lib/market/launchOffer";
import { convertApprovedIntakeAfterVerifiedPayment } from "@/lib/market/paymentConversion";
import { getMarketPaymentReadiness, verifyStripeWebhookSignature } from "@/lib/market/proposal";

type StripeCheckoutSession = {
  id?: string;
  livemode?: boolean;
  payment_status?: string;
  payment_intent?: string | null;
  client_reference_id?: string | null;
  amount_total?: number | null;
  currency?: string | null;
  metadata?: Record<string, string> | null;
};

type StripeEvent = {
  id?: string;
  type?: string;
  livemode?: boolean;
  data?: { object?: StripeCheckoutSession };
};

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!verifyStripeWebhookSignature({ payload, header: signature })) {
    return json({ error: "Invalid Stripe webhook signature" }, 400);
  }

  const readiness = getMarketPaymentReadiness();
  if (!readiness.stripeWebhookReady || !readiness.stripeAccountPinned || !readiness.stripeAccountVerified || !readiness.stripeMode) {
    return json({ error: "GEM Stripe webhook processing is not fully configured." }, 503);
  }

  let event: StripeEvent;
  try {
    event = JSON.parse(payload) as StripeEvent;
  } catch {
    return json({ error: "Invalid Stripe webhook payload" }, 400);
  }

  if (!["checkout.session.completed", "checkout.session.async_payment_succeeded"].includes(event.type || "")) {
    return json({ received: true, ignored: true });
  }

  const session = event.data?.object;
  if (!session?.id || !session.metadata) return json({ received: true, ignored: true });

  const expectedLive = readiness.stripeMode === "live";
  if (Boolean(event.livemode ?? session.livemode) !== expectedLive) {
    return json({ error: "Stripe event mode does not match GEM checkout mode." }, 409);
  }
  if (session.payment_status !== "paid") return json({ received: true, pending: true });

  const intakeId = session.metadata.intakeId;
  const publicId = session.metadata.publicId;
  const offerCode = session.metadata.offerCode;
  const amountMatches = session.amount_total === foundingBusinessReviewOffer.priceUsd * 100;
  const currencyMatches = session.currency?.toLowerCase() === "usd";
  const referenceMatches = session.client_reference_id === publicId;

  if (!intakeId || !publicId || offerCode !== foundingBusinessReviewOffer.code || !amountMatches || !currencyMatches || !referenceMatches) {
    return json({ error: "Stripe payment metadata does not match the GEM founding offer." }, 409);
  }

  try {
    const conversion = await convertApprovedIntakeAfterVerifiedPayment({
      intakeId,
      publicId,
      stripeSessionId: session.id,
      stripePaymentIntentId: session.payment_intent ?? null,
    });

    await createEvidenceItem({
      class: "financial",
      action: "gem_market_payment_verified",
      data: {
        stripeEventId: event.id ?? null,
        stripeSessionId: session.id,
        publicId,
        offerCode,
        amountUsd: foundingBusinessReviewOffer.priceUsd,
        outcome: conversion.outcome,
      },
      retentionYears: 7,
    });

    return json({ received: true, outcome: conversion.outcome });
  } catch (error) {
    console.error("[POST /api/market/stripe/webhook]", error);
    return json({ error: "Verified payment could not be reconciled into GEM intake." }, 500);
  }
}
