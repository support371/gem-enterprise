import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getRequestContext, requireAdmin } from "@/lib/api/auth-helpers";
import { evaluateEvidenceDeletionEligibility } from "@/lib/kyc/evidence-retention";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type EvidenceRow = {
  id: string;
  status: string;
  quarantine_status: string;
  validation_status: string;
  reviewer_status: string;
  legal_hold: boolean;
  retention_until: Date | string | null;
  deletion_requested_at: Date | string | null;
  deleted_at: Date | string | null;
};

type RequestRow = {
  id: string;
  status: string;
  requested_at: Date | string;
};

const requestSchema = z
  .object({
    reason: z.string().trim().min(10).max(1000),
  })
  .strict();

function iso(value: Date | string) {
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  const { id } = await params;
  if (!id || id.length > 128) {
    return json({ error: "Evidence identifier is invalid." }, 400);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Request body must be valid JSON." }, 400);
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return json(
      {
        error: "Evidence deletion request is invalid.",
        details: parsed.error.flatten().fieldErrors,
      },
      400,
    );
  }

  const { reason } = parsed.data;
  const { ipAddress, userAgent } = getRequestContext(request);

  try {
    const result = await db.$transaction(async (tx) => {
      const evidenceRows = await tx.$queryRaw<EvidenceRow[]>`
        SELECT
          id,
          status,
          quarantine_status,
          validation_status,
          reviewer_status,
          legal_hold,
          retention_until,
          deletion_requested_at,
          deleted_at
        FROM public.gem_verify_evidence_items
        WHERE id = ${id}
        FOR UPDATE
      `;
      const evidence = evidenceRows[0];
      if (!evidence) return { kind: "not_found" as const };

      const existing = await tx.$queryRaw<RequestRow[]>`
        SELECT id, status, requested_at
        FROM public.gem_verify_evidence_deletion_requests
        WHERE evidence_id = ${evidence.id}
          AND status IN ('requested','approved')
        ORDER BY requested_at DESC
        LIMIT 1
      `;
      if (existing[0]) {
        return {
          kind: "existing" as const,
          request: existing[0],
        };
      }

      const eligibility = evaluateEvidenceDeletionEligibility({
        status: evidence.status,
        quarantineStatus: evidence.quarantine_status,
        validationStatus: evidence.validation_status,
        reviewerStatus: evidence.reviewer_status,
        legalHold: evidence.legal_hold,
        retentionUntil: evidence.retention_until,
        deletionRequestedAt: evidence.deletion_requested_at,
        deletedAt: evidence.deleted_at,
      });
      if (!eligibility.eligible) {
        return {
          kind: "blocked" as const,
          blockers: eligibility.blockers,
        };
      }

      const snapshot = {
        evaluatedAt: new Date().toISOString(),
        status: evidence.status,
        quarantineStatus: evidence.quarantine_status,
        validationStatus: evidence.validation_status,
        reviewerStatus: evidence.reviewer_status,
        legalHold: evidence.legal_hold,
        retentionUntil: evidence.retention_until,
        retentionExpired: eligibility.retentionExpired,
      };
      const requestRows = await tx.$queryRaw<RequestRow[]>`
        INSERT INTO public.gem_verify_evidence_deletion_requests (
          evidence_id,
          requested_by_user_id,
          status,
          reason,
          eligibility_snapshot
        ) VALUES (
          ${evidence.id},
          ${gate.session.userId},
          'requested',
          ${reason},
          ${JSON.stringify(snapshot)}::jsonb
        )
        RETURNING id, status, requested_at
      `;
      const created = requestRows[0];
      if (!created) throw new Error("Deletion request was not returned.");

      await tx.$executeRaw`
        UPDATE public.gem_verify_evidence_items
        SET deletion_requested_at = now(),
            updated_at = now()
        WHERE id = ${evidence.id}
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
          ${evidence.id},
          ${gate.session.userId},
          'deletion_requested',
          'retention_schedule_enforcement',
          'pending_independent_approval',
          ${ipAddress},
          ${userAgent},
          ${JSON.stringify({ deletionRequestId: created.id, reason })}::jsonb
        )
      `;

      return { kind: "created" as const, request: created };
    });

    if (result.kind === "not_found") {
      return json({ error: "Evidence item not found." }, 404);
    }
    if (result.kind === "blocked") {
      return json(
        {
          error: "Evidence is not eligible for deletion.",
          code: "EVIDENCE_DELETION_NOT_ELIGIBLE",
          blockers: result.blockers,
        },
        409,
      );
    }
    if (result.kind === "existing") {
      return json({
        ok: true,
        deletionRequest: {
          id: result.request.id,
          status: result.request.status,
          requestedAt: iso(result.request.requested_at),
        },
        idempotent: true,
        deletionPerformed: false,
      });
    }

    return json(
      {
        ok: true,
        deletionRequest: {
          id: result.request.id,
          status: result.request.status,
          requestedAt: iso(result.request.requested_at),
        },
        independentApprovalRequired: true,
        deletionPerformed: false,
      },
      201,
    );
  } catch (error) {
    console.error("[POST /api/verify/evidence/:id/deletion-request]", error);
    return json(
      {
        error: "Evidence deletion request could not be created.",
        code: "EVIDENCE_DELETION_REQUEST_UNAVAILABLE",
        deletionPerformed: false,
      },
      503,
    );
  }
}
