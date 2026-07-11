import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  getRequestContext,
  isStaffRole,
  requireSession,
} from "@/lib/api/auth-helpers";
import {
  GEM_VERIFY_ALLOWED_MIME_TYPES,
  GEM_VERIFY_MAX_FILE_BYTES,
  getEvidenceVaultRuntimeReadiness,
  validateEvidenceUploadMetadata,
} from "@/lib/kyc/evidence-vault";
import { toVerificationState } from "@/lib/kyc/workflow";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type UploadIntent = {
  applicationId: string;
  documentType: string;
  fileName: string;
  mimeType: (typeof GEM_VERIFY_ALLOWED_MIME_TYPES)[number];
  fileSizeBytes: number;
};

const uploadIntentSchema = z
  .object({
    applicationId: z.string().min(1).max(128),
    documentType: z.string().trim().min(2).max(80),
    fileName: z.string().trim().min(1).max(180),
    mimeType: z.enum(GEM_VERIFY_ALLOWED_MIME_TYPES),
    fileSizeBytes: z
      .number()
      .int()
      .positive()
      .max(GEM_VERIFY_MAX_FILE_BYTES),
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

export async function POST(request: NextRequest) {
  const gate = await requireSession();
  if (!gate.ok) return gate.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Request body must be valid JSON." }, 400);
  }

  const parsed = uploadIntentSchema.safeParse(body);
  if (!parsed.success) {
    return json(
      {
        error: "Evidence upload metadata is invalid.",
        details: parsed.error.flatten().fieldErrors,
      },
      400,
    );
  }

  const data = parsed.data as UploadIntent;
  const metadataValidation = validateEvidenceUploadMetadata({
    fileName: data.fileName,
    mimeType: data.mimeType,
    fileSizeBytes: data.fileSizeBytes,
  });
  if (!metadataValidation.valid) {
    return json(
      {
        error: "Evidence upload metadata is invalid.",
        details: metadataValidation.errors,
      },
      400,
    );
  }

  try {
    const application = await db.kYCApplication.findUnique({
      where: { id: data.applicationId },
      select: { id: true, userId: true, status: true },
    });

    if (!application) {
      return json({ error: "Verification application not found." }, 404);
    }

    const canAccess =
      application.userId === gate.session.userId ||
      isStaffRole(gate.session.role);
    if (!canAccess) {
      return json({ error: "Forbidden" }, 403);
    }

    const workflowState = toVerificationState(application.status);
    if (!["consented", "needs_information"].includes(workflowState)) {
      return json(
        {
          error: "This verification application is not accepting evidence.",
          code: "EVIDENCE_NOT_ACCEPTED_IN_CURRENT_STATE",
          workflowState,
        },
        409,
      );
    }

    const readiness = getEvidenceVaultRuntimeReadiness();
    if (!readiness.uploadRuntimeReady) {
      const missingControls = [
        !readiness.supabaseUrlConfigured && "supabase_url",
        !readiness.serviceRoleConfigured && "server_storage_credential",
        !readiness.scannerConfigured && "malware_scanner",
        !readiness.retentionApproved && "retention_approval",
        !readiness.operationallyApproved && "operational_approval",
        !readiness.uploadActivationRequested && "upload_activation",
      ].filter(Boolean);
      const { ipAddress, userAgent } = getRequestContext(request);

      console.warn("[verify/evidence/upload-intent] blocked safely", {
        applicationId: application.id,
        actorId: gate.session.userId,
        missingControls,
        ipAddress,
        userAgent,
      });

      return json(
        {
          error: "Secure evidence intake is not active.",
          code: "EVIDENCE_VAULT_NOT_READY",
          failClosed: true,
          missingControls,
        },
        503,
      );
    }

    return json(
      {
        error:
          "Evidence upload authorization is awaiting the signed-upload implementation.",
        code: "SIGNED_UPLOAD_NOT_IMPLEMENTED",
        failClosed: true,
      },
      503,
    );
  } catch (error) {
    console.error("[POST /api/verify/evidence/upload-intent]", error);
    return json(
      {
        error: "Evidence upload authorization could not be evaluated.",
        code: "EVIDENCE_AUTHORIZATION_UNAVAILABLE",
        failClosed: true,
      },
      503,
    );
  }
}
