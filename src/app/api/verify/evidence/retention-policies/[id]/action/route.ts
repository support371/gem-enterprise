import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/api/auth-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PolicyRow = {
  id: string;
  document_type: string;
  version: number;
  status: string;
  is_active: boolean;
  created_by_user_id: string | null;
};

type SupersededRow = { id: string; version: number };

const actionSchema = z
  .object({
    action: z.enum(["submit", "approve", "reject", "deactivate"]),
    reason: z.string().trim().min(10).max(1000).optional(),
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

function requiresIndependentDecision(action: string) {
  return action === "approve" || action === "reject" || action === "deactivate";
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  const { id } = await params;
  if (!id || id.length > 128) {
    return json({ error: "Retention policy identifier is invalid." }, 400);
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
        error: "Retention policy action is invalid.",
        details: parsed.error.flatten().fieldErrors,
      },
      400,
    );
  }

  const { action, reason } = parsed.data;
  if ((action === "reject" || action === "deactivate") && !reason) {
    return json({ error: "A documented reason is required for this action." }, 400);
  }
  if (requiresIndependentDecision(action) && gate.session.role !== "super_admin") {
    return json(
      {
        error: "Only a super administrator may make the final retention-policy decision.",
        code: "RETENTION_DECISION_ROLE_REQUIRED",
      },
      403,
    );
  }

  try {
    const result = await db.$transaction(async (tx) => {
      const rows = await tx.$queryRaw<PolicyRow[]>`
        SELECT
          id,
          document_type,
          version,
          status,
          is_active,
          created_by_user_id
        FROM public.gem_verify_retention_policies
        WHERE id = ${id}
        FOR UPDATE
      `;
      const policy = rows[0];
      if (!policy) return { kind: "not_found" as const };

      await tx.$executeRaw`
        SELECT pg_advisory_xact_lock(
          hashtext(${`gem-verify-retention:${policy.document_type.toLowerCase()}`})
        )
      `;

      if (
        requiresIndependentDecision(action) &&
        policy.created_by_user_id === gate.session.userId
      ) {
        return { kind: "separation_violation" as const };
      }

      if (action === "submit") {
        if (policy.status !== "draft") {
          return { kind: "invalid_state" as const, status: policy.status };
        }
        await tx.$executeRaw`
          UPDATE public.gem_verify_retention_policies
          SET status = 'pending_approval',
              updated_at = now()
          WHERE id = ${policy.id}
        `;
        await tx.$executeRaw`
          INSERT INTO public.gem_verify_retention_policy_events (
            policy_id, actor_user_id, action, from_status, to_status, reason
          ) VALUES (
            ${policy.id}, ${gate.session.userId}, 'submitted',
            'draft', 'pending_approval', ${reason ?? null}
          )
        `;
        return {
          kind: "ok" as const,
          status: "pending_approval",
          isActive: false,
          superseded: [] as SupersededRow[],
        };
      }

      if (action === "approve") {
        if (policy.status !== "pending_approval") {
          return { kind: "invalid_state" as const, status: policy.status };
        }

        const superseded = await tx.$queryRaw<SupersededRow[]>`
          UPDATE public.gem_verify_retention_policies
          SET is_active = false,
              status = 'superseded',
              superseded_at = now(),
              updated_at = now()
          WHERE lower(document_type) = lower(${policy.document_type})
            AND is_active = true
            AND id <> ${policy.id}
          RETURNING id, version
        `;

        for (const prior of superseded) {
          await tx.$executeRaw`
            INSERT INTO public.gem_verify_retention_policy_events (
              policy_id,
              actor_user_id,
              action,
              from_status,
              to_status,
              reason,
              metadata
            ) VALUES (
              ${prior.id},
              ${gate.session.userId},
              'superseded',
              'approved',
              'superseded',
              ${`Superseded by policy ${policy.id} version ${policy.version}.`},
              ${JSON.stringify({ replacementPolicyId: policy.id, replacementVersion: policy.version })}::jsonb
            )
          `;
        }

        await tx.$executeRaw`
          UPDATE public.gem_verify_retention_policies
          SET status = 'approved',
              is_active = true,
              approved_by_user_id = ${gate.session.userId},
              approved_at = now(),
              effective_at = now(),
              rejected_by_user_id = NULL,
              rejected_at = NULL,
              rejection_reason = NULL,
              superseded_at = NULL,
              updated_at = now()
          WHERE id = ${policy.id}
        `;
        await tx.$executeRaw`
          INSERT INTO public.gem_verify_retention_policy_events (
            policy_id, actor_user_id, action, from_status, to_status, reason,
            metadata
          ) VALUES (
            ${policy.id}, ${gate.session.userId}, 'approved',
            'pending_approval', 'approved', ${reason ?? null},
            ${JSON.stringify({ activated: true, environmentGateStillRequired: true })}::jsonb
          )
        `;
        return {
          kind: "ok" as const,
          status: "approved",
          isActive: true,
          superseded,
        };
      }

      if (action === "reject") {
        if (policy.status !== "pending_approval") {
          return { kind: "invalid_state" as const, status: policy.status };
        }
        await tx.$executeRaw`
          UPDATE public.gem_verify_retention_policies
          SET status = 'rejected',
              is_active = false,
              rejected_by_user_id = ${gate.session.userId},
              rejected_at = now(),
              rejection_reason = ${reason ?? null},
              updated_at = now()
          WHERE id = ${policy.id}
        `;
        await tx.$executeRaw`
          INSERT INTO public.gem_verify_retention_policy_events (
            policy_id, actor_user_id, action, from_status, to_status, reason
          ) VALUES (
            ${policy.id}, ${gate.session.userId}, 'rejected',
            'pending_approval', 'rejected', ${reason ?? null}
          )
        `;
        return {
          kind: "ok" as const,
          status: "rejected",
          isActive: false,
          superseded: [] as SupersededRow[],
        };
      }

      if (!policy.is_active || policy.status !== "approved") {
        return { kind: "invalid_state" as const, status: policy.status };
      }
      await tx.$executeRaw`
        UPDATE public.gem_verify_retention_policies
        SET status = 'superseded',
            is_active = false,
            superseded_at = now(),
            updated_at = now()
        WHERE id = ${policy.id}
      `;
      await tx.$executeRaw`
        INSERT INTO public.gem_verify_retention_policy_events (
          policy_id, actor_user_id, action, from_status, to_status, reason
        ) VALUES (
          ${policy.id}, ${gate.session.userId}, 'deactivated',
          'approved', 'superseded', ${reason ?? null}
        )
      `;
      return {
        kind: "ok" as const,
        status: "superseded",
        isActive: false,
        superseded: [] as SupersededRow[],
      };
    });

    if (result.kind === "not_found") {
      return json({ error: "Retention policy not found." }, 404);
    }
    if (result.kind === "separation_violation") {
      return json(
        {
          error: "The policy creator cannot make the independent final decision.",
          code: "RETENTION_SEPARATION_OF_DUTIES",
        },
        409,
      );
    }
    if (result.kind === "invalid_state") {
      return json(
        {
          error: "Retention policy action is not allowed in its current state.",
          code: "RETENTION_POLICY_INVALID_STATE",
          currentStatus: result.status,
        },
        409,
      );
    }

    return json({
      ok: true,
      policyId: id,
      status: result.status,
      isActive: result.isActive,
      supersededPolicies: result.superseded,
      runtimeActivationStillRequired: result.isActive,
    });
  } catch (error) {
    console.error("[POST /api/verify/evidence/retention-policies/:id/action]", error);
    return json(
      {
        error: "Retention policy action could not be completed.",
        code: "RETENTION_POLICY_ACTION_UNAVAILABLE",
      },
      503,
    );
  }
}
