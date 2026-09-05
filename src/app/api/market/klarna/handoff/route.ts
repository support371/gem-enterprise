import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getIntakeSubmission, IntakeStoreUnavailableError } from "@/lib/intake/repository";
import { getMarketPaymentReadiness, verifyProposalToken } from "@/lib/market/proposal";

const bodySchema = z.object({ token: z.string().trim().min(20).max(4_000) });

const KLARNA_AMOUNT_CENTS = 29_900;
const KLARNA_CURRENCY = "USD";

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

function getBasicAuthorization() {
  const supplied = process.env.GEM_KLARNA_BASIC_AUTH?.trim();
  if (supplied) return supplied.startsWith("Basic ") ? supplied : `Basic ${supplied}`;

  const username = process.env.GEM_KLARNA_API_USERNAME?.trim();
  const password = process.env.GEM_KLARNA_API_PASSWORD?.trim();
  if (!username || !password) return null;
  return `Basic ${Buffer.from(`${username}:${password}`, "utf8").toString("base64")}`;
}

function getKlarnaConfig() {
  const partnerAccountId = process.env.GEM_KLARNA_PARTNER_ACCOUNT_ID?.trim();
  const authorization = getBasicAuthorization();
  const environment = process.env.GEM_KLARNA_ENV === "live" ? "live" : "test";
  const apiBase = environment === "live" ? "https://api-global.klarna.com" : "https://api-global.test.klarna.com";

  if (!partnerAccountId || !authorization) return null;
  return { partnerAccountId, authorization, apiBase, environment };
}

function isTrustedKlarnaHandoffUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      (url.hostname === "pay.klarna.com" || url.hostname === "pay.test.klarna.com")
    );
  } catch {
    return false;
  }
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

  const marketReadiness = getMarketPaymentReadiness();
  if (!marketReadiness.proposalSigningReady) {
    return json({ error: "GEM secure payment authorization is unavailable." }, 503);
  }

  const klarna = getKlarnaConfig();
  if (!klarna) {
    return json(
      {
        error: "Klarna app handoff is not activated for this merchant yet.",
        code: "KLARNA_APP_HANDOFF_NOT_CONFIGURED",
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

    const returnUrl = new URL("/business-review/payment/success", request.nextUrl.origin);
    returnUrl.searchParams.set("reference", result.submission.publicId);
    returnUrl.searchParams.set("provider", "klarna");

    const appReturnUrl = process.env.GEM_KLARNA_APP_RETURN_URL?.trim();
    const customerInteractionConfig: Record<string, string> = {
      return_url: returnUrl.toString(),
    };
    if (appReturnUrl) customerInteractionConfig.app_return_url = appReturnUrl;

    const paymentTransactionReference = `gem-${result.submission.publicId}`.slice(0, 128);

    const response = await fetch(
      `${klarna.apiBase}/v2/accounts/${encodeURIComponent(klarna.partnerAccountId)}/payment/authorize`,
      {
        method: "POST",
        headers: {
          Authorization: klarna.authorization,
          "Content-Type": "application/json",
          Accept: "application/json",
          "Idempotency-Key": paymentTransactionReference,
        },
        body: JSON.stringify({
          currency: KLARNA_CURRENCY,
          supplementary_purchase_data: {
            purchase_reference: result.submission.publicId,
            line_items: [
              {
                name: "GEM Rapid Security Assessment",
                quantity: 1,
                unit_price: KLARNA_AMOUNT_CENTS,
                total_amount: KLARNA_AMOUNT_CENTS,
              },
            ],
          },
          request_payment_transaction: {
            amount: KLARNA_AMOUNT_CENTS,
            payment_transaction_reference: paymentTransactionReference,
          },
          step_up_config: {
            type: "HANDOVER",
            customer_interaction_config: customerInteractionConfig,
          },
        }),
        cache: "no-store",
      },
    );

    const payload = (await response.json().catch(() => null)) as
      | {
          payment_transaction_response?: { result?: string };
          payment_request?: { payment_request_url?: string };
        }
      | null;

    if (!response.ok || !payload) {
      console.error("[Klarna app handoff] authorization failed", response.status);
      return json(
        {
          error: "Klarna could not start the secure app handoff. No payment has been taken.",
          code: "KLARNA_AUTHORIZATION_FAILED",
        },
        502,
      );
    }

    const outcome = payload.payment_transaction_response?.result;
    if (outcome === "STEP_UP_REQUIRED") {
      const paymentRequestUrl = payload.payment_request?.payment_request_url;
      if (!isTrustedKlarnaHandoffUrl(paymentRequestUrl)) {
        return json(
          {
            error: "Klarna did not return a trusted app-handoff URL. No payment has been taken.",
            code: "KLARNA_HANDOFF_URL_INVALID",
          },
          502,
        );
      }

      // Return Klarna's universal payment_request_url directly. Do not wrap it in a GEM redirect;
      // direct navigation gives iOS/Android the best chance to hand off to the installed Klarna app.
      return json({ ok: true, handoff: "klarna_app", url: paymentRequestUrl });
    }

    if (outcome === "APPROVED") {
      return json({ ok: true, handoff: "complete", url: returnUrl.toString() });
    }

    if (outcome === "DECLINED") {
      return json(
        {
          error: "Klarna did not approve this payment. No alternate payment was attempted.",
          code: "KLARNA_DECLINED",
        },
        402,
      );
    }

    return json(
      {
        error: "Klarna returned an unsupported authorization state. No payment has been taken.",
        code: "KLARNA_UNKNOWN_STATE",
      },
      502,
    );
  } catch (error) {
    if (error instanceof IntakeStoreUnavailableError) {
      return json({ error: error.message, code: "INTAKE_STORAGE_NOT_READY" }, 503);
    }
    console.error("[POST /api/market/klarna/handoff]", error);
    return json(
      {
        error: "Klarna app handoff is temporarily unavailable. No payment has been taken.",
      },
      500,
    );
  }
}
