import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/api/auth-helpers";
import { getIntakeSubmission, IntakeStoreUnavailableError } from "@/lib/intake/repository";
import { createProposalToken, getMarketPaymentReadiness } from "@/lib/market/proposal";

const bodySchema = z.object({
  intakeId: z.string().trim().min(1).max(128),
});

function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: NextRequest) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return json({ error: "Invalid proposal request" }, 400);

  try {
    const result = await getIntakeSubmission(parsed.data.intakeId);
    if (!result || result.submission.kind !== "ENTERPRISE") {
      return json({ error: "Enterprise opportunity not found" }, 404);
    }

    if (!["QUALIFIED", "APPROVED"].includes(result.submission.status)) {
      return json(
        {
          error: "A proposal link can be issued only after the opportunity is qualified.",
          code: "OPPORTUNITY_NOT_QUALIFIED",
        },
        409,
      );
    }

    const readiness = getMarketPaymentReadiness();
    if (!readiness.proposalSigningReady) {
      return json(
        {
          error: "Secure proposal links are not configured yet.",
          code: "PROPOSAL_SIGNING_NOT_READY",
          readiness,
        },
        503,
      );
    }

    const token = createProposalToken({
      intakeId: result.submission.id,
      publicId: result.submission.publicId,
    });
    const origin = process.env.NEXT_PUBLIC_SITE_URL?.trim() || request.nextUrl.origin;
    const proposalUrl = `${origin.replace(/\/$/, "")}/business-review/proposal?token=${encodeURIComponent(token)}`;

    return json({
      ok: true,
      proposalUrl,
      expiresInSeconds: 7 * 24 * 60 * 60,
      status: result.submission.status,
      paymentReady: readiness.checkoutReady,
      paymentBlockers: readiness.blockers,
    });
  } catch (error) {
    if (error instanceof IntakeStoreUnavailableError) {
      return json({ error: error.message, code: "INTAKE_STORAGE_NOT_READY" }, 503);
    }
    if (error instanceof Error && error.message.includes("MARKET_PROPOSAL_SECRET")) {
      return json({ error: error.message, code: "PROPOSAL_SIGNING_NOT_READY" }, 503);
    }
    console.error("[POST /api/admin/market/proposal-link]", error);
    return json({ error: "Unable to create a secure proposal link" }, 500);
  }
}
