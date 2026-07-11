import { randomUUID } from "node:crypto";
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
  GEM_VERIFY_EVIDENCE_BUCKET,
  GEM_VERIFY_MAX_FILE_BYTES,
  getEvidenceVaultRuntimeReadiness,
  validateEvidenceUploadMetadata,
} from "@/lib/kyc/evidence-vault";
import {
  createEvidenceStoragePath,
  createSignedEvidenceUpload,
  EvidenceStorageError,
  sha256Hex,
} from "@/lib/kyc/evidence-storage";
import { toVerificationState } from "@/lib/kyc/workflow";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_ACTIVE_RESERVATIONS = 3;

type UploadIntent = {
  applicationId: string;
  documentType: string;
  fileName: string;
  mimeType: (typeof GEM_VERIFY_ALLOWED_MIME_TYPES)[number];
  fileSizeBytes: number;
};

type CountRow = { count: bigint | number | string };
type RetentionRow = {
  id: string;
  retention_days: number;
  document_type: string;
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

function missingRuntimeControls() {
  const readiness = getEvidenceVaultRuntimeReadiness();
  return {
    readiness,
    missingControls: [
      !readiness.supabaseUrlConfigured && "supabase_url",
      !readiness.serviceRoleConfigured && "server_storage_credential",
      !readiness.scannerEndpointConfigured && "malware_scanner_endpoint",
      !readiness.scannerCallbackConfigured && "scanner_callback_authentication",
      !readiness.publicBaseUrlConfigured && "scanner_callback_base_url",
      !readiness.retentionApproved && "retention_approval",
      !readiness.operationallyApproved && "operational_approval",
      !readiness.uploadActivationRequested && "upload_activation",
    ].filter(Boolean),
  };
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

  const { readiness, missingControls } = missingRuntimeControls();
  if (!readiness.uploadRuntimeReady) {
    const { ipAddress, userAgent } = getRequestContext(request);
    console.warn("[verify/evidence/upload-intent] blocked safely", {
      applicationId: data.applicationId,
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

    const normalizedDocumentType = data.documentType.trim().toLowerCase();
    const retentionPolicies = await db.$queryRaw<RetentionRow[]>`
      SELECT id, retention_days, document_type
      FROM public.gem_verify_retention_policies
      WHERE is_active = true
        AND (lower(document_type) = ${normalizedDocumentType} OR document_type = '*')
      ORDER BY CASE WHEN lower(document_type) = ${normalizedDocumentType} THEN 0 ELSE 1 END
      LIMIT 1
    `;
    const retentionPolicy = retentionPolicies[0];
    if (!retentionPolicy) {
      return json(
        {
          error: "No active retention policy covers this evidence type.",
          code: "EVIDENCE_RETENTION_POLICY_NOT_ACTIVE",
          failClosed: true,
        },
        503,
      );
    }

    const reservationRows = await db.$queryRaw<CountRow[]>`
      SELECT count(*)::bigint AS count
      FROM public.gem_verify_evidence_items
      WHERE application_id = ${application.id}
        AND uploaded_by_user_id = ${gate.session.userId}
        AND status = 'reserved'
        AND upload_url_expires_at > now()
    `;
    const activeReservations = Number(reservationRows[0]?.count ?? 0);
    if (activeReservations >= MAX_ACTIVE_RESERVATIONS) {
      return json(
        {
          error: "Too many active evidence upload reservations.",
          code: "EVIDENCE_UPLOAD_RESERVATION_LIMIT",
        },
        429,
      );
    }

    const evidenceId = randomUUID();
    const storagePath = createEvidenceStoragePath({
      applicationId: application.id,
      evidenceId,
      fileName: data.fileName,
    });
    const retentionUntil = new Date(
      Date.now() + retentionPolicy.retention_days * 24 * 60 * 60 * 1000,
    );
    const { ipAddress, userAgent } = getRequestContext(request);

    await db.$transaction(async (tx) => {
      await tx.$executeRaw`
        INSERT INTO public.gem_verify_evidence_items (
          id,
          application_id,
          uploaded_by_user_id,
          document_type,
          storage_bucket,
          storage_path,
          original_filename,
          declared_mime_type,
          file_size_bytes,
          status,
          quarantine_status,
          validation_status,
          reviewer_status,
          retention_until,
          metadata
        ) VALUES (
          ${evidenceId},
          ${application.id},
          ${gate.session.userId},
          ${normalizedDocumentType},
          ${GEM_VERIFY_EVIDENCE_BUCKET},
          ${storagePath},
          ${data.fileName},
          ${data.mimeType},
          ${data.fileSizeBytes},
          'reserved',
          'pending',
          'pending',
          'pending',
          ${retentionUntil},
          ${JSON.stringify({ retentionPolicyId: retentionPolicy.id })}::jsonb
        )
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
          ${evidenceId},
          ${gate.session.userId},
          'upload_reserved',
          'applicant_evidence_submission',
          'pending_authorization',
          ${ipAddress},
          ${userAgent},
          ${JSON.stringify({ documentType: normalizedDocumentType })}::jsonb
        )
      `;
    });

    try {
      const signed = await createSignedEvidenceUpload(storagePath);
      const tokenHash = sha256Hex(signed.token);

      await db.$transaction(async (tx) => {
        await tx.$executeRaw`
          UPDATE public.gem_verify_evidence_items
          SET upload_token_hash = ${tokenHash},
              upload_url_expires_at = ${signed.expiresAt},
              updated_at = now()
          WHERE id = ${evidenceId}
            AND status = 'reserved'
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
            ${evidenceId},
            ${gate.session.userId},
            'signed_url_issued',
            'applicant_evidence_submission',
            'issued',
            ${ipAddress},
            ${userAgent},
            ${JSON.stringify({ expiresAt: signed.expiresAt.toISOString() })}::jsonb
          )
        `;
      });

      return json(
        {
          ok: true,
          evidenceId,
          upload: {
            method: "PUT",
            url: signed.signedUrl,
            expiresAt: signed.expiresAt.toISOString(),
            headers: {
              "Content-Type": data.mimeType,
              "x-upsert": "false",
            },
          },
          completion: {
            method: "POST",
            endpoint: "/api/verify/evidence/complete",
            body: { evidenceId },
          },
          safeguards: {
            privateBucket: true,
            quarantineOnly: true,
            overwriteAllowed: false,
            reviewerAccessAllowed: false,
          },
        },
        201,
      );
    } catch (error) {
      const reason =
        error instanceof EvidenceStorageError ? error.code : "UNKNOWN_STORAGE_ERROR";
      await db.$transaction(async (tx) => {
        await tx.$executeRaw`
          UPDATE public.gem_verify_evidence_items
          SET status = 'rejected',
              quarantine_status = 'manual_hold',
              validation_status = 'failed',
              updated_at = now(),
              metadata = metadata || ${JSON.stringify({ authorizationFailure: reason })}::jsonb
          WHERE id = ${evidenceId}
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
            ${evidenceId},
            ${gate.session.userId},
            'rejected',
            'upload_authorization_failure',
            'denied',
            ${ipAddress},
            ${userAgent},
            ${JSON.stringify({ reason })}::jsonb
          )
        `;
      });
      throw error;
    }
  } catch (error) {
    console.error("[POST /api/verify/evidence/upload-intent]", error);
    const statusCode =
      error instanceof EvidenceStorageError ? error.statusCode : 503;
    const code =
      error instanceof EvidenceStorageError
        ? error.code
        : "EVIDENCE_AUTHORIZATION_UNAVAILABLE";
    return json(
      {
        error: "Evidence upload authorization could not be completed.",
        code,
        failClosed: true,
      },
      statusCode,
    );
  }
}
