import { NextRequest, NextResponse } from "next/server";

type CapitalMutationKind = "ordinary" | "closing_authorization";

function json(body: unknown, status: number) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "Referrer-Policy": "no-referrer",
    },
  });
}

function sameOriginFailure(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) {
    return json(
      {
        error: "An explicit same-origin browser request is required.",
        code: "ORIGIN_REQUIRED",
      },
      403,
    );
  }

  try {
    if (new URL(origin).origin !== request.nextUrl.origin) {
      return json(
        {
          error: "Cross-origin capital-readiness mutations are not allowed.",
          code: "SAME_ORIGIN_REQUIRED",
        },
        403,
      );
    }
  } catch {
    return json(
      {
        error: "The request origin is invalid.",
        code: "ORIGIN_INVALID",
      },
      403,
    );
  }

  return null;
}

export function capitalMutationGate(
  request: NextRequest,
  kind: CapitalMutationKind = "ordinary",
) {
  const originFailure = sameOriginFailure(request);
  if (originFailure) return originFailure;

  if (
    process.env.CAPITAL_READINESS_MUTATIONS_ENABLED !== "true" ||
    process.env.CAPITAL_READINESS_PRODUCTION_APPROVED !== "true"
  ) {
    return json(
      {
        error:
          "Capital-readiness mutations remain disabled until the production owner explicitly approves both activation gates.",
        code: "CAPITAL_READINESS_MUTATIONS_NOT_ACTIVATED",
      },
      423,
    );
  }

  if (kind === "closing_authorization") {
    return json(
      {
        error:
          "Closing authorization remains disabled until every evidence reference is resolved against an approved evidence store and independently verified.",
        code: "CAPITAL_CLOSING_EVIDENCE_VERIFICATION_REQUIRED",
      },
      423,
    );
  }

  return null;
}
