import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getRequestContext, requireAdmin } from "@/lib/api/auth-helpers";
import { evaluateEvidenceDeletionEligibility } from "@/lib/kyc/evidence-retention";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RequestRow = {
  id: string;
  evidence_id: string;
  requested_by_user_id: string | null;
  request_status: string;
  evidence_status: string;
  quarantine_status: string;
  validation_status: string;
  reviewer_status: string;
  legal_hold: boolean;
  retention_until: Date | string | null;
  deleted_at: Date | string | null;
};

const actionSchema = z
  .object({
    action: z.enum(["approve", "reject"]),
    reason: z.string().trim().min(10).max(1000),
  })
  .strict();

function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;
  if (gate.session.role !== "super_admin") {
    return json(
      {
        error: "Only a super administrator may decide an evidence deletion request.",
        code: "EVIDENCE_DELETION_DECISION_ROLE_REQUIRED",
      },
      403,
    );
  }

  const { id } = await params;
  if (!id || id.length > 128) {
    return json({ error: "Deletion request identifier is invalid." }, 400);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Request body must be valid JSON." }, 400);
  }

  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) {
    return json(
      {
        error: "Deletion request decision is invalid.",
        details: parsed.error.flatten().fieldErrors,
      },
      400,
    );
  }

  const { action, reason } = parsed.data;
  const { ipAddress, userAgent } = getRequestContext(request);

  try {
    const result = await db.$transaction(async (tx) => {
      const rows = await tx.$queryRaw<RequestRow[]>`
        SELECT
          r.id,
          r.evidence_id,
          r.requested_by_user_id,
          r.status AS request_status,
          e.status AS evidence_status,
          e.quarantine_status,
          e.validation_status,
          e.reviewer_status,
          e.legal_hold,
          e.retention_until,
          e.deleted_at
        FROM public.gem_verify_evidence_deletion_requests r
        JOIN public.gem_verify_evidence_items e ON e.id = r.evidence_id
        WHERE r.id = ${id}
        FOR UPDATE OF r, e
      `;
      const record = rows[0];
      if (!record) return { kind: "not_found" as const };
      if (record.request_status !== "requested") {
        return {
          kind: "invalid_state" as const,
          status: record.request_status,
        };
      }
      if (record.requested_by_user_id === gate.session.userId) {
        return { kind: "separation_violation" as const };
      }

      if (action === "reject") {
        await tx.$executeRaw`
          UPDATE public.gem_verify_evidence_deletion_requests
          SET status = 'rejected',
              rejected_by_user_id = ${gate.session.userId},
              rejected_at = now(),
              rejection_reason = ${reason},
              updated_at = now()
          WHERE id = ${record.id}
        `;
        await tx.$executeRaw`
          UPDATE public.gem_verify_evidence_items
          SET deletion_requested_at = NULL,
              updated_at = now()
          WHERE id = ${record.evidence_id}
        `;
        await tx.$executeRaw`
          INSERT INTO public.gem_verify_evidence_access_events (
            evidence_id,
            actor_user_id,
            action,
            purpose,
            result,
            ip_address,
            user_agent,
            metadata
          ) VALUES (
            ${record.evidence_id},
            ${gate.session.userId},
            'deletion_rejected',
            'retention_deletion_review',
            'rejected',
            ${ipAddress},
            ${userAgent},
            ${JSON.stringify({ deletionRequestId: record.id, reason })}::jsonb
          )
        `;
        return {
          kind: "ok" as const,
          status: "rejected",
          approved: false,
        };
      }

      const eligibility = evaluateEvidenceDeletionEligibility({
        status: record.evidence_status,
        quarantineStatus: record.quarantine_status,
        validationStatus: record.validation_status,
        reviewerStatus: record.reviewer_status,
        legalHold: record.legal_hold,
        retentionUntil: record.retention_until,
        deletionRequestedAt: null,
        deletedAt: record.deleted_at,
      });
      if (!eligibility.eligible) {
        return {
          kind: "blocked" as const,
          blockers: eligibility.blockers,
        };
      }

      await tx.$executeRaw`
        UPDATE public.gem_verify_evidence_deletion_requests
        SET status = 'approved',
            approved_by_user_id = ${gate.session.userId},
            approved_at = now(),
            eligibility_snapshot = eligibility_snapshot || ${JSON.stringify({
              independentlyApprovedAt: new Date().toISOString(),
              approvalBlockers: eligibility.blockers,
              retentionExpired: eligibility.retentionExpired,
            })}::jsonb,
            updated_at = now()
        WHERE id = ${record.id}
      `;
      await tx.$executeRaw`
        INSERT INTO public.gem_verify_evidence_access_events (
          evidence_id,
          actor_user_id,
          action,
          purpose,
          result,
          ip_address,
          user_agent,
          metadata
        ) VALUES (
          ${record.evidence_id},
          ${gate.session.userId},
          'deletion_approved',
          'retention_deletion_review',
          'approved_execution_unavailable',
          ${ipAddress},
          ${userAgent},
          ${JSON.stringify({ deletionRequestId: record.id, reason })}::jsonb
        )
      `;

      return {
        kind: "ok" as const,
        status: "approved",
        approved: true,
      };
    });

    if (result.kind === "not_found") {
      return json({ error: "Deletion request not found." }, 404);
    }
    if (result.kind === "invalid_state") {
      return json(
        {
          error: "Deletion request has already received a decision.",
          code: "EVIDENCE_DELETION_REQUEST_INVALID_STATE",
          currentStatus: result.status,
        },
        409,
      );
    }
    if (result.kind === "separation_violation") {
      return json(
        {
          error: "The deletion requester cannot make the independent decision.",
          code: "EVIDENCE_DELETION_SEPARATION_OF_DUTIES",
        },
        409,
      );
    }
    if (result.kind === "blocked") {
      return json(
        {
          error: "Evidence is no longer eligible for deletion approval.",
          code: "EVIDENCE_DELETION_APPROVAL_BLOCKED",
          blockers: result.blockers,
        },
        409,
      );
    }

    return json({
      ok: true,
      deletionRequestId: id,
      status: result.status,
      approved: result.approved,
      deletionPerformed: false,
      executionEndpointAvailable: false,
    });
  } catch (error) {
    console.error("[POST /api/verify/evidence/deletion-requests/:id/action]", error);
    return json(
      {
        error: "Deletion request decision could not be completed.",
        code: "EVIDENCE_DELETION_DECISION_UNAVAILABLE",
        deletionPerformed: false,
      },
      503,
    );
  }
}
