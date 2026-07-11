import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getRequestContext, requireAdmin } from "@/lib/api/auth-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type EvidenceHoldRow = {
  id: string;
  legal_hold: boolean;
  legal_hold_applied_by_user_id: string | null;
  deleted_at: Date | string | null;
  status: string;
};

const holdSchema = z
  .object({
    action: z.enum(["apply", "release"]),
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
        error: "Only a super administrator may apply or release a legal hold.",
        code: "LEGAL_HOLD_DECISION_ROLE_REQUIRED",
      },
      403,
    );
  }

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

  const parsed = holdSchema.safeParse(body);
  if (!parsed.success) {
    return json(
      {
        error: "Legal-hold action is invalid.",
        details: parsed.error.flatten().fieldErrors,
      },
      400,
    );
  }

  const { action, reason } = parsed.data;
  const { ipAddress, userAgent } = getRequestContext(request);

  try {
    const result = await db.$transaction(async (tx) => {
      const rows = await tx.$queryRaw<EvidenceHoldRow[]>`
        SELECT
          id,
          legal_hold,
          legal_hold_applied_by_user_id,
          deleted_at,
          status
        FROM public.gem_verify_evidence_items
        WHERE id = ${id}
        FOR UPDATE
      `;
      const evidence = rows[0];
      if (!evidence) return { kind: "not_found" as const };
      if (evidence.deleted_at || evidence.status === "deleted") {
        return { kind: "deleted" as const };
      }

      if (action === "apply") {
        if (evidence.legal_hold) {
          return { kind: "idempotent" as const, legalHold: true };
        }
        await tx.$executeRaw`
          UPDATE public.gem_verify_evidence_items
          SET legal_hold = true,
              legal_hold_reason = ${reason},
              legal_hold_applied_by_user_id = ${gate.session.userId},
              legal_hold_applied_at = now(),
              legal_hold_release_reason = NULL,
              legal_hold_released_by_user_id = NULL,
              legal_hold_released_at = NULL,
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
            'legal_hold_applied',
            'preservation_obligation',
            'applied',
            ${ipAddress},
            ${userAgent},
            ${JSON.stringify({ reason })}::jsonb
          )
        `;
        return { kind: "ok" as const, legalHold: true };
      }

      if (!evidence.legal_hold) {
        return { kind: "idempotent" as const, legalHold: false };
      }
      if (evidence.legal_hold_applied_by_user_id === gate.session.userId) {
        return { kind: "separation_violation" as const };
      }

      await tx.$executeRaw`
        UPDATE public.gem_verify_evidence_items
        SET legal_hold = false,
            legal_hold_release_reason = ${reason},
            legal_hold_released_by_user_id = ${gate.session.userId},
            legal_hold_released_at = now(),
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
          'legal_hold_released',
          'preservation_obligation_review',
          'released',
          ${ipAddress},
          ${userAgent},
          ${JSON.stringify({ reason })}::jsonb
        )
      `;
      return { kind: "ok" as const, legalHold: false };
    });

    if (result.kind === "not_found") {
      return json({ error: "Evidence item not found." }, 404);
    }
    if (result.kind === "deleted") {
      return json(
        {
          error: "A legal hold cannot be changed after evidence deletion.",
          code: "LEGAL_HOLD_EVIDENCE_ALREADY_DELETED",
        },
        409,
      );
    }
    if (result.kind === "separation_violation") {
      return json(
        {
          error: "The administrator who applied the hold cannot release it.",
          code: "LEGAL_HOLD_SEPARATION_OF_DUTIES",
        },
        409,
      );
    }

    return json({
      ok: true,
      evidenceId: id,
      legalHold: result.legalHold,
      idempotent: result.kind === "idempotent",
      deletionBlocked: result.legalHold,
    });
  } catch (error) {
    console.error("[POST /api/verify/evidence/:id/legal-hold]", error);
    return json(
      {
        error: "Legal-hold action could not be completed.",
        code: "LEGAL_HOLD_ACTION_UNAVAILABLE",
      },
      503,
    );
  }
}
