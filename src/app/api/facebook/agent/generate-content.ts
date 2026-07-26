import { NextRequest, NextResponse } from "next/server";

/**
 * Legacy hard-coded content generation is disabled. It contained unsupported
 * product, certification, availability, discount, customer-count, and service
 * claims and wrote drafts outside the shared evidence/compliance workflow.
 *
 * Content generation must use approved GEM source material in the shared
 * Content Studio, where unsupported and regulated claims are flagged for human
 * review before an exact content version can be approved.
 */
export async function POST(_request: NextRequest) {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code: "LEGACY_AUTOMATED_CONTENT_GENERATION_DISABLED",
        message:
          "Use the shared Content Studio with approved source material, compliance review, and human approval.",
      },
      externalActionTaken: false,
    },
    {
      status: 409,
      headers: { "Cache-Control": "no-store, max-age=0" },
    },
  );
}
