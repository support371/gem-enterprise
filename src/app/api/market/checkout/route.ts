import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getIntakeSubmission, IntakeStoreUnavailableError } from "@/lib/intake/repository";
import { foundingBusinessReviewOffer } from "@/lib/market/launchOffer";
import {
  GEM_MARKET_STRIPE_ACCOUNT_ID,
  getMarketPaymentReadiness,
  verifyProposalToken,
} from "@/lib/market/proposal";

const bodySchema = z.object({ token: z.string().trim().min(20).max(4_000) });

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

type StripeAccount = { id?: string };
type StripeCheckoutSession = { id?: string; url?: string; error?: { message?: string } };

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return json({ error: "Invalid proposal token" }, 400);

  const tokenPayload = verifyProposalToken(parsed.data.token);
  if (!tokenPayload) return json({ error: "The proposal link is invalid or expired." }, 401);

  const readiness = getMarketPaymentReadiness();
  if (!readiness.checkoutReady) {
    return json(
      {
        error: "GEM secure checkout is not active yet. No payment has been attempted.",
        code: "GEM_CHECKOUT_NOT_READY",
        blockers: readiness.blockers,
      },
      503,
    );
  }

  const secretKey = process.env.GEM_STRIPE_SECRET_KEY!.trim();
  if (!secretKey.startsWith("sk_live_")) {
    return json(
      { error: "Live checkout is not backed by a live Stripe secret.", code: "STRIPE_MODE_MISMATCH" },
      503,
    );
  }

  try {
    const result = await getIntakeSubmission(tokenPayload.intakeId);
    if (!result || result.submission.publicId !== tokenPayload.publicId || result.submission.kind !== "ENTERPRISE") {
      return json({ error: "The proposal no longer matches an enterprise opportunity." }, 404);
    }
    if (result.submission.status !== "APPROVED") {
      return json(
        {
          error: "Payment remains locked until GEM completes human scope approval.",
          code: "OPPORTUNITY_NOT_APPROVED",
        },
        409,
      );
    }

    const stripeHeaders = { Authorization: `Bearer ${secretKey}` };
    const accountResponse = await fetch("https://api.stripe.com/v1/account", {
      headers: stripeHeaders,
      cache: "no-store",
    });
    if (!accountResponse.ok) {
      return json({ error: "The configured GEM payment account could not be verified.", code: "STRIPE_ACCOUNT_UNAVAILABLE" }, 503);
    }
    const account = (await accountResponse.json()) as StripeAccount;
    if (!account.id || account.id !== GEM_MARKET_STRIPE_ACCOUNT_ID) {
      return json(
        {
          error: "The connected Stripe account does not match the pinned GEM Enterprise merchant account.",
          code: "STRIPE_ACCOUNT_MISMATCH",
        },
        503,
      );
    }

    const origin = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || request.nextUrl.origin).replace(/\/$/, "");
    const params = new URLSearchParams();
    params.set("mode", "payment");
    params.set("success_url", `${origin}/business-review/payment/success?session_id={CHECKOUT_SESSION_ID}`);
    params.set("cancel_url", `${origin}/business-review/proposal?token=${encodeURIComponent(parsed.data.token)}`);
    params.set("customer_email", result.submission.email);
    params.set("client_reference_id", result.submission.publicId);
    params.set("line_items[0][price_data][currency]", "usd");
    params.set("line_items[0][price_data][unit_amount]", String(foundingBusinessReviewOffer.priceUsd * 100));
    params.set("line_items[0][price_data][product_data][name]", foundingBusinessReviewOffer.name);
    params.set("line_items[0][price_data][product_data][description]", foundingBusinessReviewOffer.promise);
    params.set("line_items[0][quantity]", "1");
    params.set("metadata[intakeId]", result.submission.id);
    params.set("metadata[publicId]", result.submission.publicId);
    params.set("metadata[offerCode]", foundingBusinessReviewOffer.code);
    params.set("payment_intent_data[metadata][intakeId]", result.submission.id);
    params.set("payment_intent_data[metadata][publicId]", result.submission.publicId);
    params.set("payment_intent_data[metadata][offerCode]", foundingBusinessReviewOffer.code);

    const checkoutResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        ...stripeHeaders,
        "Content-Type": "application/x-www-form-urlencoded",
        "Idempotency-Key": `gem-business-review-${result.submission.id}`,
      },
      body: params,
      cache: "no-store",
    });
    const checkout = (await checkoutResponse.json()) as StripeCheckoutSession;
    if (!checkoutResponse.ok || !checkout.url) {
      console.error("[POST /api/market/checkout] Stripe rejected session", checkout.error?.message);
      return json({ error: "Secure checkout could not be created. No payment has been taken." }, 502);
    }

    return json({ ok: true, url: checkout.url, sessionId: checkout.id });
  } catch (error) {
    if (error instanceof IntakeStoreUnavailableError) {
      return json({ error: error.message, code: "INTAKE_STORAGE_NOT_READY" }, 503);
    }
    console.error("[POST /api/market/checkout]", error);
    return json({ error: "Secure checkout is temporarily unavailable. No payment has been taken." }, 500);
  }
}
