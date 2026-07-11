import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  isStaffRole,
  requireSession,
} from "@/lib/api/auth-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type EvidenceItemRow = {
  id: string;
  application_id: string;
  document_type: string;
  original_filename: string;
  declared_mime_type: string;
  file_size_bytes: bigint | number | string;
  status: string;
  quarantine_status: string;
  validation_status: string;
  reviewer_status: string;
  upload_url_expires_at: Date | string | null;
  upload_completed_at: Date | string | null;
  scan_requested_at: Date | string | null;
  scan_completed_at: Date | string | null;
  created_at: Date | string;
  updated_at: Date | string;
};

type ValidationRow = {
  evidence_id: string;
  check_type: string;
  status: string;
  checked_at: Date | string;
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
  const gate = await requireSession();
  if (!gate.ok) return gate.response;

  try {
    const requestedApplicationId = request.nextUrl.searchParams
      .get("applicationId")
      ?.trim();

    const application = requestedApplicationId
      ? await db.kYCApplication.findUnique({
          where: { id: requestedApplicationId },
          select: { id: true, userId: true, status: true },
        })
      : await db.kYCApplication.findFirst({
          where: { userId: gate.session.userId },
          orderBy: { createdAt: "desc" },
          select: { id: true, userId: true, status: true },
        });

    if (!application) {
      return json({
        ok: true,
        application: null,
        evidenceItems: [],
      });
    }

    const canAccess =
      application.userId === gate.session.userId ||
      isStaffRole(gate.session.role);
    if (!canAccess) return json({ error: "Forbidden" }, 403);

    const [items, validations] = await Promise.all([
      db.$queryRaw<EvidenceItemRow[]>`
        SELECT
          id,
          application_id,
          document_type,
          original_filename,
          declared_mime_type,
          file_size_bytes,
          status,
          quarantine_status,
          validation_status,
          reviewer_status,
          upload_url_expires_at,
          upload_completed_at,
          scan_requested_at,
          scan_completed_at,
          created_at,
          updated_at
        FROM public.gem_verify_evidence_items
        WHERE application_id = ${application.id}
          AND deleted_at IS NULL
        ORDER BY created_at DESC
      `,
      db.$queryRaw<ValidationRow[]>`
        SELECT
          v.evidence_id,
          v.check_type,
          v.status,
          v.checked_at
        FROM public.gem_verify_evidence_validations v
        JOIN public.gem_verify_evidence_items e ON e.id = v.evidence_id
        WHERE e.application_id = ${application.id}
        ORDER BY v.checked_at ASC
      `,
    ]);

    const validationsByEvidence = new Map<string, ValidationRow[]>();
    for (const validation of validations) {
      const current = validationsByEvidence.get(validation.evidence_id) ?? [];
      current.push(validation);
      validationsByEvidence.set(validation.evidence_id, current);
    }

    return json({
      ok: true,
      application: {
        id: application.id,
        status: application.status,
      },
      evidenceItems: items.map((item) => ({
        id: item.id,
        applicationId: item.application_id,
        documentType: item.document_type,
        fileName: item.original_filename,
        declaredMimeType: item.declared_mime_type,
        fileSizeBytes: Number(item.file_size_bytes),
        status: item.status,
        quarantineStatus: item.quarantine_status,
        validationStatus: item.validation_status,
        reviewerStatus: item.reviewer_status,
        uploadAuthorizationExpiresAt: iso(item.upload_url_expires_at),
        uploadCompletedAt: iso(item.upload_completed_at),
        scanRequestedAt: iso(item.scan_requested_at),
        scanCompletedAt: iso(item.scan_completed_at),
        createdAt: iso(item.created_at),
        updatedAt: iso(item.updated_at),
        validations: (validationsByEvidence.get(item.id) ?? []).map(
          (validation) => ({
            checkType: validation.check_type,
            status: validation.status,
            checkedAt: iso(validation.checked_at),
          }),
        ),
      })),
      safeguards: {
        storagePathExposed: false,
        signedUrlExposed: false,
        scannerDetailsExposed: false,
      },
    });
  } catch (error) {
    console.error("[GET /api/verify/evidence/items]", error);
    return json(
      {
        error: "Evidence status could not be loaded.",
        code: "EVIDENCE_STATUS_UNAVAILABLE",
      },
      503,
    );
  }
}
