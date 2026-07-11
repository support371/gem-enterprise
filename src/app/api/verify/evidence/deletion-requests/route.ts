import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/api/auth-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type DeletionRequestRow = {
  id: string;
  evidence_id: string;
  application_id: string;
  document_type: string;
  evidence_status: string;
  legal_hold: boolean;
  retention_until: Date | string | null;
  requested_by_user_id: string | null;
  approved_by_user_id: string | null;
  rejected_by_user_id: string | null;
  status: string;
  reason: string;
  rejection_reason: string | null;
  eligibility_snapshot: unknown;
  requested_at: Date | string;
  approved_at: Date | string | null;
  rejected_at: Date | string | null;
  executed_at: Date | string | null;
  execution_error: string | null;
  updated_at: Date | string;
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

  const status = request.nextUrl.searchParams.get("status")?.trim();
  const allowedStatuses = new Set([
    "requested",
    "approved",
    "rejected",
    "executed",
    "cancelled",
    "failed",
  ]);
  if (status && !allowedStatuses.has(status)) {
    return json({ error: "Deletion-request status filter is invalid." }, 400);
  }

  try {
    const rows = status
      ? await db.$queryRaw<DeletionRequestRow[]>`
          SELECT
            r.id,
            r.evidence_id,
            e.application_id,
            e.document_type,
            e.status AS evidence_status,
            e.legal_hold,
            e.retention_until,
            r.requested_by_user_id,
            r.approved_by_user_id,
            r.rejected_by_user_id,
            r.status,
            r.reason,
            r.rejection_reason,
            r.eligibility_snapshot,
            r.requested_at,
            r.approved_at,
            r.rejected_at,
            r.executed_at,
            r.execution_error,
            r.updated_at
          FROM public.gem_verify_evidence_deletion_requests r
          JOIN public.gem_verify_evidence_items e ON e.id = r.evidence_id
          WHERE r.status = ${status}
          ORDER BY r.requested_at ASC
          LIMIT 500
        `
      : await db.$queryRaw<DeletionRequestRow[]>`
          SELECT
            r.id,
            r.evidence_id,
            e.application_id,
            e.document_type,
            e.status AS evidence_status,
            e.legal_hold,
            e.retention_until,
            r.requested_by_user_id,
            r.approved_by_user_id,
            r.rejected_by_user_id,
            r.status,
            r.reason,
            r.rejection_reason,
            r.eligibility_snapshot,
            r.requested_at,
            r.approved_at,
            r.rejected_at,
            r.executed_at,
            r.execution_error,
            r.updated_at
          FROM public.gem_verify_evidence_deletion_requests r
          JOIN public.gem_verify_evidence_items e ON e.id = r.evidence_id
          ORDER BY
            CASE r.status
              WHEN 'requested' THEN 0
              WHEN 'approved' THEN 1
              ELSE 2
            END,
            r.requested_at ASC
          LIMIT 500
        `;

    return json({
      ok: true,
      viewerRole: gate.session.role,
      deletionRequests: rows.map((row) => ({
        id: row.id,
        evidenceId: row.evidence_id,
        applicationId: row.application_id,
        documentType: row.document_type,
        evidenceStatus: row.evidence_status,
        legalHold: row.legal_hold,
        retentionUntil: iso(row.retention_until),
        requestedByUserId: row.requested_by_user_id,
        approvedByUserId: row.approved_by_user_id,
        rejectedByUserId: row.rejected_by_user_id,
        status: row.status,
        reason: row.reason,
        rejectionReason: row.rejection_reason,
        eligibilitySnapshot: row.eligibility_snapshot,
        requestedAt: iso(row.requested_at),
        approvedAt: iso(row.approved_at),
        rejectedAt: iso(row.rejected_at),
        executedAt: iso(row.executed_at),
        executionError: row.execution_error,
        updatedAt: iso(row.updated_at),
      })),
      safeguards: {
        storagePathsExposed: false,
        independentApprovalRequired: true,
        executionEndpointAvailable: false,
      },
    });
  } catch (error) {
    console.error("[GET /api/verify/evidence/deletion-requests]", error);
    return json(
      {
        error: "Deletion request queue could not be loaded.",
        code: "EVIDENCE_DELETION_QUEUE_UNAVAILABLE",
      },
      503,
    );
  }
}
