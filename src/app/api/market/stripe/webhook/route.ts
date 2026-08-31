import { NextRequest, NextResponse } from "next/server";
import { createEvidenceItem } from "@/lib/evidence";
import { foundingBusinessReviewOffer } from "@/lib/market/launchOffer";
import { convertApprovedIntakeAfterVerifiedPayment } from "@/lib/market/paymentConversion";
import {
  GEM_MARKET_PAYMENT_LINK_ID,
  getMarketPaymentReadiness,
  verifyStripeWebhookSignature,
} from "@/lib/market/proposal";

type StripeCheckoutSession = {
  id?: string;
  livemode?: boolean;
  payment_status?: string;
  payment_intent?: string | null;
  payment_link?: string | { id?: string } | null;
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

function paymentLinkId(value: StripeCheckoutSession["payment_link"]) {
  if (typeof value === "string") return value;
  return value?.id ?? null;
}

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!verifyStripeWebhookSignature({ payload, header: signature })) {
    return json({ error: "Invalid Stripe webhook signature" }, 400);
  }

  const readiness = getMarketPaymentReadiness();
  if (
    !readiness.stripeWebhookReady ||
    !readiness.stripeAccountPinned ||
    !readiness.stripeAccountVerified ||
    !readiness.paymentLinkPinned
  ) {
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

  if (Boolean(event.livemode ?? session.livemode) !== true) {
    return json({ error: "Stripe event mode does not match GEM checkout mode." }, 409);
  }
  if (session.payment_status !== "paid") return json({ received: true, pending: true });

  const publicId = session.client_reference_id?.trim() || "";
  const offerCode = session.metadata.offerCode;
  const service = session.metadata.service;
  const amountMatches = session.amount_total === foundingBusinessReviewOffer.priceUsd * 100;
  const currencyMatches = session.currency?.toLowerCase() === "usd";
  const paymentLinkMatches = paymentLinkId(session.payment_link) === GEM_MARKET_PAYMENT_LINK_ID;
  const referenceLooksValid = /^GEM-ENT-[A-Z0-9-]+$/.test(publicId) && publicId.length <= 160;

  if (
    !referenceLooksValid ||
    offerCode !== foundingBusinessReviewOffer.code ||
    service !== "gem-enterprise" ||
    !amountMatches ||
    !currencyMatches ||
    !paymentLinkMatches
  ) {
    return json({ error: "Stripe payment metadata does not match the GEM founding offer." }, 409);
  }

  try {
    const conversion = await convertApprovedIntakeAfterVerifiedPayment({
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
        stripePaymentLinkId: GEM_MARKET_PAYMENT_LINK_ID,
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
