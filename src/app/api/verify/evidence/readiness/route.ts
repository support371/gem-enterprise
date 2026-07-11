import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/api/auth-helpers";
import {
  GEM_VERIFY_ALLOWED_MIME_TYPES,
  GEM_VERIFY_MAX_FILE_BYTES,
  getEvidenceVaultRuntimeReadiness,
} from "@/lib/kyc/evidence-vault";
import { toVerificationState } from "@/lib/kyc/workflow";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PolicyRow = {
  document_type: string;
  retention_days: number;
};

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
  const gate = await requireSession();
  if (!gate.ok) return gate.response;

  const runtimeReadiness = getEvidenceVaultRuntimeReadiness();

  try {
    const [application, policies] = await Promise.all([
      db.kYCApplication.findFirst({
        where: { userId: gate.session.userId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          status: true,
          submittedAt: true,
          updatedAt: true,
        },
      }),
      db.$queryRaw<PolicyRow[]>`
        SELECT document_type, retention_days
        FROM public.gem_verify_retention_policies
        WHERE is_active = true
        ORDER BY document_type
      `,
    ]);

    const workflowState = application
      ? toVerificationState(application.status)
      : null;
    const applicationAcceptingEvidence =
      workflowState === "consented" || workflowState === "needs_information";
    const retentionReady =
      runtimeReadiness.retentionApproved && policies.length > 0;
    const active =
      runtimeReadiness.uploadRuntimeReady &&
      retentionReady &&
      applicationAcceptingEvidence;

    return json({
      ok: true,
      active,
      failClosed: true,
      application: application
        ? {
            id: application.id,
            workflowState,
            submittedAt: application.submittedAt?.toISOString() ?? null,
            updatedAt: application.updatedAt.toISOString(),
            acceptingEvidence: applicationAcceptingEvidence,
          }
        : null,
      uploadPolicy: {
        maxFileBytes: GEM_VERIFY_MAX_FILE_BYTES,
        allowedMimeTypes: GEM_VERIFY_ALLOWED_MIME_TYPES,
        documentTypes: policies.map((policy) => ({
          value: policy.document_type,
          retentionDays: policy.retention_days,
        })),
      },
      state: active
        ? "ready"
        : !application
          ? "application_required"
          : !applicationAcceptingEvidence
            ? "application_not_accepting_evidence"
            : !retentionReady
              ? "retention_policy_unavailable"
              : "vault_controls_incomplete",
    });
  } catch (error) {
    console.error("[GET /api/verify/evidence/readiness]", error);
    return json(
      {
        ok: false,
        active: false,
        failClosed: true,
        state: "readiness_unavailable",
        error: "Secure evidence readiness could not be evaluated.",
      },
      503,
    );
  }
}
