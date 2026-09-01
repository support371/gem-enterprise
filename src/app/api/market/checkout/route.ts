import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getIntakeSubmission, IntakeStoreUnavailableError } from "@/lib/intake/repository";
import {
  GEM_MARKET_PAYMENT_LINK_URL,
  getMarketPaymentReadiness,
  verifyProposalToken,
} from "@/lib/market/proposal";

const bodySchema = z.object({ token: z.string().trim().min(20).max(4_000) });

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

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

  try {
    const result = await getIntakeSubmission(tokenPayload.intakeId);
    if (
      !result ||
      result.submission.publicId !== tokenPayload.publicId ||
      result.submission.kind !== "ENTERPRISE"
    ) {
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

    const paymentUrl = new URL(GEM_MARKET_PAYMENT_LINK_URL);
    paymentUrl.searchParams.set("client_reference_id", result.submission.publicId);
    paymentUrl.searchParams.set("utm_source", "gem_proposal");
    paymentUrl.searchParams.set("utm_medium", "approved_review");
    paymentUrl.searchParams.set("utm_campaign", "founding_business_review");

    return json({ ok: true, url: paymentUrl.toString() });
  } catch (error) {
    if (error instanceof IntakeStoreUnavailableError) {
      return json({ error: error.message, code: "INTAKE_STORAGE_NOT_READY" }, 503);
    }
    console.error("[POST /api/market/checkout]", error);
    return json({ error: "Secure checkout is temporarily unavailable. No payment has been taken." }, 500);
  }
}
