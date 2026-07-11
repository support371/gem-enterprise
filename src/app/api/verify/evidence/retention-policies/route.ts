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
  policy_name: string | null;
  purpose: string | null;
  retention_days: number;
  legal_basis: string;
  jurisdiction: string | null;
  status: string;
  is_active: boolean;
  created_by_user_id: string | null;
  approved_by_user_id: string | null;
  approved_at: Date | string | null;
  rejected_by_user_id: string | null;
  rejected_at: Date | string | null;
  rejection_reason: string | null;
  effective_at: Date | string | null;
  superseded_at: Date | string | null;
  review_due_at: Date | string | null;
  created_at: Date | string;
  updated_at: Date | string;
};

const createPolicySchema = z
  .object({
    documentType: z
      .string()
      .trim()
      .min(2)
      .max(80)
      .regex(/^[a-zA-Z0-9_* -]+$/),
    policyName: z.string().trim().min(3).max(120),
    purpose: z.string().trim().min(10).max(1000),
    retentionDays: z.number().int().min(1).max(3650),
    legalBasis: z.string().trim().min(10).max(1000),
    jurisdiction: z.string().trim().min(2).max(120).optional(),
    reviewDueAt: z.string().datetime().optional(),
  })
  .strict();

function iso(value: Date | string | null) {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function view(policy: PolicyRow) {
  return {
    id: policy.id,
    documentType: policy.document_type,
    version: policy.version,
    policyName: policy.policy_name,
    purpose: policy.purpose,
    retentionDays: policy.retention_days,
    legalBasis: policy.legal_basis,
    jurisdiction: policy.jurisdiction,
    status: policy.status,
    isActive: policy.is_active,
    createdByUserId: policy.created_by_user_id,
    approvedByUserId: policy.approved_by_user_id,
    approvedAt: iso(policy.approved_at),
    rejectedByUserId: policy.rejected_by_user_id,
    rejectedAt: iso(policy.rejected_at),
    rejectionReason: policy.rejection_reason,
    effectiveAt: iso(policy.effective_at),
    supersededAt: iso(policy.superseded_at),
    reviewDueAt: iso(policy.review_due_at),
    createdAt: iso(policy.created_at),
    updatedAt: iso(policy.updated_at),
  };
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

export async function GET() {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  try {
    const policies = await db.$queryRaw<PolicyRow[]>`
      SELECT
        id,
        document_type,
        version,
        policy_name,
        purpose,
        retention_days,
        legal_basis,
        jurisdiction,
        status,
        is_active,
        created_by_user_id,
        approved_by_user_id,
        approved_at,
        rejected_by_user_id,
        rejected_at,
        rejection_reason,
        effective_at,
        superseded_at,
        review_due_at,
        created_at,
        updated_at
      FROM public.gem_verify_retention_policies
      ORDER BY document_type, version DESC
    `;

    return json({
      ok: true,
      viewerRole: gate.session.role,
      policies: policies.map(view),
      governance: {
        versioned: true,
        independentApprovalRequired: true,
        activationEnvironmentGateRequired: true,
        automaticDeletionEnabled: false,
      },
    });
  } catch (error) {
    console.error("[GET /api/verify/evidence/retention-policies]", error);
    return json(
      {
        error: "Retention policies could not be loaded.",
        code: "RETENTION_POLICY_LIST_UNAVAILABLE",
      },
      503,
    );
  }
}

export async function POST(request: NextRequest) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Request body must be valid JSON." }, 400);
  }

  const parsed = createPolicySchema.safeParse(body);
  if (!parsed.success) {
    return json(
      {
        error: "Retention policy draft is invalid.",
        details: parsed.error.flatten().fieldErrors,
      },
      400,
    );
  }

  const data = parsed.data;
  const documentType = data.documentType
    .trim()
    .toLowerCase()
    .replace(/[ -]+/g, "_");
  const reviewDueAt = data.reviewDueAt ? new Date(data.reviewDueAt) : null;
  if (reviewDueAt && reviewDueAt.getTime() <= Date.now()) {
    return json({ error: "Policy review date must be in the future." }, 400);
  }

  try {
    const policy = await db.$transaction(async (tx) => {
      await tx.$queryRaw<Array<{ locked: null }>>`
        SELECT pg_advisory_xact_lock(
          hashtext(${`gem-verify-retention:${documentType}`})
        ) AS locked
      `;
      const versions = await tx.$queryRaw<Array<{ next_version: number }>>`
        SELECT COALESCE(max(version), 0)::integer + 1 AS next_version
        FROM public.gem_verify_retention_policies
        WHERE lower(document_type) = ${documentType}
      `;
      const nextVersion = versions[0]?.next_version ?? 1;
      const rows = await tx.$queryRaw<PolicyRow[]>`
        INSERT INTO public.gem_verify_retention_policies (
          document_type,
          version,
          policy_name,
          purpose,
          retention_days,
          legal_basis,
          jurisdiction,
          status,
          is_active,
          created_by_user_id,
          review_due_at
        ) VALUES (
          ${documentType},
          ${nextVersion},
          ${data.policyName},
          ${data.purpose},
          ${data.retentionDays},
          ${data.legalBasis},
          ${data.jurisdiction ?? null},
          'draft',
          false,
          ${gate.session.userId},
          ${reviewDueAt}
        )
        RETURNING
          id,
          document_type,
          version,
          policy_name,
          purpose,
          retention_days,
          legal_basis,
          jurisdiction,
          status,
          is_active,
          created_by_user_id,
          approved_by_user_id,
          approved_at,
          rejected_by_user_id,
          rejected_at,
          rejection_reason,
          effective_at,
          superseded_at,
          review_due_at,
          created_at,
          updated_at
      `;
      const created = rows[0];
      if (!created) throw new Error("Retention policy draft was not returned.");

      await tx.$executeRaw`
        INSERT INTO public.gem_verify_retention_policy_events (
          policy_id,
          actor_user_id,
          action,
          to_status,
          metadata
        ) VALUES (
          ${created.id},
          ${gate.session.userId},
          'created',
          'draft',
          ${JSON.stringify({ documentType, version: nextVersion })}::jsonb
        )
      `;
      return created;
    });

    return json(
      {
        ok: true,
        policy: view(policy),
        activated: false,
        nextAction: "submit_for_independent_approval",
      },
      201,
    );
  } catch (error) {
    console.error("[POST /api/verify/evidence/retention-policies]", error);
    return json(
      {
        error: "Retention policy draft could not be created.",
        code: "RETENTION_POLICY_CREATE_UNAVAILABLE",
      },
      503,
    );
  }
}
