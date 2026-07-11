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
  dispatchEvidenceScan,
  downloadEvidenceObject,
  EvidenceStorageError,
  validateStoredEvidence,
} from "@/lib/kyc/evidence-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const completeSchema = z
  .object({
    evidenceId: z.string().uuid(),
  })
  .strict();

type EvidenceRow = {
  id: string;
  application_id: string;
  application_user_id: string;
  uploaded_by_user_id: string | null;
  document_type: string;
  storage_path: string;
  original_filename: string;
  declared_mime_type: string;
  file_size_bytes: bigint | number | string;
  status: string;
  quarantine_status: string;
  validation_status: string;
  scan_job_id: string | null;
  upload_url_expires_at: Date | string | null;
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

function storageStatus(error: unknown) {
  if (error instanceof EvidenceStorageError) return error.statusCode;
  return 503;
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

  const parsed = completeSchema.safeParse(body);
  if (!parsed.success) {
    return json(
      {
        error: "Evidence completion request is invalid.",
        details: parsed.error.flatten().fieldErrors,
      },
      400,
    );
  }

  const { evidenceId } = parsed.data;
  const { ipAddress, userAgent } = getRequestContext(request);

  try {
    const rows = await db.$queryRaw<EvidenceRow[]>`
      SELECT
        e.id,
        e.application_id,
        a."userId" AS application_user_id,
        e.uploaded_by_user_id,
        e.document_type,
        e.storage_path,
        e.original_filename,
        e.declared_mime_type,
        e.file_size_bytes,
        e.status,
        e.quarantine_status,
        e.validation_status,
        e.scan_job_id,
        e.upload_url_expires_at
      FROM public.gem_verify_evidence_items e
      JOIN public.kyc_applications a ON a.id = e.application_id
      WHERE e.id = ${evidenceId}
      LIMIT 1
    `;
    const evidence = rows[0];
    if (!evidence) {
      return json({ error: "Evidence reservation not found." }, 404);
    }

    const canAccess =
      evidence.application_user_id === gate.session.userId ||
      isStaffRole(gate.session.role);
    if (!canAccess) return json({ error: "Forbidden" }, 403);

    if (
      evidence.status !== "reserved" &&
      evidence.status !== "uploaded"
    ) {
      return json({
        ok: true,
        evidenceId: evidence.id,
        status: evidence.status,
        quarantineStatus: evidence.quarantine_status,
        validationStatus: evidence.validation_status,
        scanJobId: evidence.scan_job_id,
        idempotent: true,
      });
    }

    const stored = await downloadEvidenceObject(evidence.storage_path);
    const declaredSize = Number(evidence.file_size_bytes);
    const validation = validateStoredEvidence({
      bytes: stored.bytes,
      declaredMimeType: evidence.declared_mime_type,
      declaredSize,
    });

    if (!validation.valid || !validation.detectedMimeType) {
      await db.$transaction(async (tx) => {
        await tx.$executeRaw`
          UPDATE public.gem_verify_evidence_items
          SET status = 'quarantined',
              quarantine_status = 'manual_hold',
              validation_status = 'failed',
              detected_mime_type = ${validation.detectedMimeType},
              verified_file_size_bytes = ${validation.size},
              sha256 = ${validation.sha256},
              storage_etag = ${stored.etag},
              upload_completed_at = now(),
              updated_at = now(),
              metadata = metadata || ${JSON.stringify({ validationErrors: validation.errors })}::jsonb
          WHERE id = ${evidence.id}
        `;
        await tx.$executeRaw`
          INSERT INTO public.gem_verify_evidence_validations (
            evidence_id,
            check_type,
            status,
            details,
            checked_by_user_id
          ) VALUES (
            ${evidence.id},
            'file_signature_and_size',
            'failed',
            ${JSON.stringify({ errors: validation.errors, sha256: validation.sha256 })}::jsonb,
            ${gate.session.userId}
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
          ) VALUES
          (
            ${evidence.id},
            ${gate.session.userId},
            'upload_completed',
            'applicant_evidence_submission',
            'validation_failed',
            ${ipAddress},
            ${userAgent},
            ${JSON.stringify({ sha256: validation.sha256 })}::jsonb
          ),
          (
            ${evidence.id},
            ${gate.session.userId},
            'quarantine_changed',
            'file_validation_failure',
            'manual_hold',
            ${ipAddress},
            ${userAgent},
            ${JSON.stringify({ errors: validation.errors })}::jsonb
          )
        `;
      });

      return json(
        {
          error: "The uploaded file failed integrity validation and remains quarantined.",
          code: "EVIDENCE_FILE_VALIDATION_FAILED",
          evidenceId: evidence.id,
          failClosed: true,
          details: validation.errors,
        },
        422,
      );
    }

    const scanJobId = randomUUID();
    const scannerProvider = "configured_scanner";

    await db.$transaction(async (tx) => {
      await tx.$executeRaw`
        INSERT INTO public.gem_verify_evidence_scan_jobs (
          id,
          evidence_id,
          provider,
          status,
          request_payload
        ) VALUES (
          ${scanJobId},
          ${evidence.id},
          ${scannerProvider},
          'queued',
          ${JSON.stringify({
            sha256: validation.sha256,
            fileSizeBytes: validation.size,
            mimeType: validation.detectedMimeType,
          })}::jsonb
        )
      `;
      await tx.$executeRaw`
        UPDATE public.gem_verify_evidence_items
        SET status = 'quarantined',
            quarantine_status = 'scanning',
            validation_status = 'in_progress',
            detected_mime_type = ${validation.detectedMimeType},
            verified_file_size_bytes = ${validation.size},
            sha256 = ${validation.sha256},
            storage_etag = ${stored.etag},
            upload_completed_at = now(),
            scan_job_id = ${scanJobId},
            scan_provider = ${scannerProvider},
            scan_requested_at = now(),
            updated_at = now()
        WHERE id = ${evidence.id}
          AND status IN ('reserved','uploaded')
      `;
      await tx.$executeRaw`
        INSERT INTO public.gem_verify_evidence_validations (
          evidence_id,
          check_type,
          status,
          details,
          checked_by_user_id
        ) VALUES
        (
          ${evidence.id},
          'file_signature',
          'passed',
          ${JSON.stringify({ detectedMimeType: validation.detectedMimeType })}::jsonb,
          ${gate.session.userId}
        ),
        (
          ${evidence.id},
          'sha256_integrity',
          'passed',
          ${JSON.stringify({ sha256: validation.sha256 })}::jsonb,
          ${gate.session.userId}
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
        ) VALUES
        (
          ${evidence.id},
          ${gate.session.userId},
          'upload_completed',
          'applicant_evidence_submission',
          'quarantined',
          ${ipAddress},
          ${userAgent},
          ${JSON.stringify({ sha256: validation.sha256 })}::jsonb
        ),
        (
          ${evidence.id},
          ${gate.session.userId},
          'scan_requested',
          'malware_and_file_safety_scan',
          'queued',
          ${ipAddress},
          ${userAgent},
          ${JSON.stringify({ scanJobId })}::jsonb
        )
      `;
    });

    try {
      const dispatch = await dispatchEvidenceScan({
        evidenceId: evidence.id,
        scanJobId,
        storagePath: evidence.storage_path,
        sha256: validation.sha256,
        fileSizeBytes: validation.size,
        mimeType: validation.detectedMimeType,
      });

      await db.$transaction(async (tx) => {
        await tx.$executeRaw`
          UPDATE public.gem_verify_evidence_scan_jobs
          SET status = 'submitted',
              provider_job_id = ${dispatch.providerJobId},
              response_payload = ${JSON.stringify(dispatch.responsePayload)}::jsonb,
              started_at = now(),
              updated_at = now()
          WHERE id = ${scanJobId}
            AND evidence_id = ${evidence.id}
        `;
        await tx.$executeRaw`
          UPDATE public.gem_verify_evidence_items
          SET scan_result = ${JSON.stringify({ dispatchStatus: "submitted" })}::jsonb,
              updated_at = now()
          WHERE id = ${evidence.id}
        `;
      });

      return json(
        {
          ok: true,
          evidenceId: evidence.id,
          status: "quarantined",
          quarantineStatus: "scanning",
          validationStatus: "in_progress",
          scanJobId,
          reviewerAccessAllowed: false,
        },
        202,
      );
    } catch (error) {
      const reason =
        error instanceof EvidenceStorageError
          ? error.code
          : "EVIDENCE_SCAN_DISPATCH_FAILED";
      await db.$transaction(async (tx) => {
        await tx.$executeRaw`
          UPDATE public.gem_verify_evidence_scan_jobs
          SET status = 'error',
              last_error = ${reason},
              completed_at = now(),
              updated_at = now()
          WHERE id = ${scanJobId}
        `;
        await tx.$executeRaw`
          UPDATE public.gem_verify_evidence_items
          SET quarantine_status = 'manual_hold',
              validation_status = 'needs_information',
              scan_result = ${JSON.stringify({ dispatchError: reason })}::jsonb,
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
            'quarantine_changed',
            'scan_dispatch_failure',
            'manual_hold',
            ${ipAddress},
            ${userAgent},
            ${JSON.stringify({ reason, scanJobId })}::jsonb
          )
        `;
      });
      throw error;
    }
  } catch (error) {
    console.error("[POST /api/verify/evidence/complete]", error);
    return json(
      {
        error: "Evidence completion could not be verified.",
        code:
          error instanceof EvidenceStorageError
            ? error.code
            : "EVIDENCE_COMPLETION_UNAVAILABLE",
        failClosed: true,
      },
      storageStatus(error),
    );
  }
}
