import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/api/auth-helpers";
import { evaluateEvidenceDeletionEligibility } from "@/lib/kyc/evidence-retention";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CandidateRow = {
  id: string;
  application_id: string;
  document_type: string;
  status: string;
  quarantine_status: string;
  validation_status: string;
  reviewer_status: string;
  legal_hold: boolean;
  retention_until: Date | string | null;
  deletion_requested_at: Date | string | null;
  deleted_at: Date | string | null;
  created_at: Date | string;
};

function iso(value: Date | string | null) {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function GET(request: NextRequest) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  const requestedLimit = Number(request.nextUrl.searchParams.get("limit") ?? 100);
  const limit = Number.isInteger(requestedLimit)
    ? Math.min(Math.max(requestedLimit, 1), 500)
    : 100;

  try {
    const rows = await db.$queryRaw<CandidateRow[]>`
      SELECT
        id,
        application_id,
        document_type,
        status,
        quarantine_status,
        validation_status,
        reviewer_status,
        legal_hold,
        retention_until,
        deletion_requested_at,
        deleted_at,
        created_at
      FROM public.gem_verify_evidence_items
      WHERE deleted_at IS NULL
      ORDER BY retention_until ASC NULLS LAST, created_at ASC
      LIMIT ${limit}
    `;

    const now = new Date();
    const evaluated = rows.map((row) => {
      const result = evaluateEvidenceDeletionEligibility(
        {
          status: row.status,
          quarantineStatus: row.quarantine_status,
          validationStatus: row.validation_status,
          reviewerStatus: row.reviewer_status,
          legalHold: row.legal_hold,
          retentionUntil: row.retention_until,
          deletionRequestedAt: row.deletion_requested_at,
          deletedAt: row.deleted_at,
        },
        now,
      );
      return {
        id: row.id,
        applicationId: row.application_id,
        documentType: row.document_type,
        status: row.status,
        quarantineStatus: row.quarantine_status,
        validationStatus: row.validation_status,
        reviewerStatus: row.reviewer_status,
        legalHold: row.legal_hold,
        retentionUntil: iso(row.retention_until),
        deletionRequestedAt: iso(row.deletion_requested_at),
        createdAt: iso(row.created_at),
        retentionExpired: result.retentionExpired,
        eligible: result.eligible,
        blockers: result.blockers,
      };
    });

    const blockerCounts: Record<string, number> = {};
    for (const item of evaluated) {
      for (const blocker of item.blockers) {
        blockerCounts[blocker] = (blockerCounts[blocker] ?? 0) + 1;
      }
    }

    return json({
      ok: true,
      evaluatedAt: now.toISOString(),
      dryRun: true,
      deletionPerformed: false,
      summary: {
        evaluated: evaluated.length,
        eligible: evaluated.filter((item) => item.eligible).length,
        blocked: evaluated.filter((item) => !item.eligible).length,
        blockerCounts,
      },
      candidates: evaluated,
      safeguards: {
        storagePathsExposed: false,
        legalHoldsRespected: true,
        existingRequestsBlocked: true,
        incompleteReviewsBlocked: true,
        incompleteScansBlocked: true,
        executionEndpointAvailable: false,
      },
    });
  } catch (error) {
    console.error("[GET /api/verify/evidence/retention/dry-run]", error);
    return json(
      {
        error: "Retention deletion eligibility could not be evaluated.",
        code: "RETENTION_DRY_RUN_UNAVAILABLE",
        deletionPerformed: false,
      },
      503,
    );
  }
}
