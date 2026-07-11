import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/api/auth-helpers";

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

function classify(row: CandidateRow, now: number) {
  const retentionTime = row.retention_until
    ? new Date(row.retention_until).getTime()
    : null;
  const reasons: string[] = [];

  if (row.deleted_at || row.status === "deleted") reasons.push("already_deleted");
  if (!retentionTime) reasons.push("retention_date_missing");
  if (retentionTime !== null && retentionTime > now) reasons.push("retention_not_expired");
  if (row.legal_hold) reasons.push("legal_hold");
  if (["pending", "scanning", "manual_hold"].includes(row.quarantine_status)) {
    reasons.push("quarantine_incomplete");
  }
  if (["pending", "in_progress", "needs_information"].includes(row.validation_status)) {
    reasons.push("validation_incomplete");
  }
  if (["pending", "assigned", "under_review"].includes(row.reviewer_status)) {
    reasons.push("review_incomplete");
  }
  if (!["released", "rejected"].includes(row.status)) {
    reasons.push("evidence_state_not_terminal");
  }

  return {
    eligible: reasons.length === 0,
    blockers: reasons,
  };
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

    const now = Date.now();
    const evaluated = rows.map((row) => {
      const result = classify(row, now);
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
      evaluatedAt: new Date(now).toISOString(),
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
