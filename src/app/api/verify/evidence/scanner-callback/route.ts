import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getRequestContext } from "@/lib/api/auth-helpers";
import { verifyScannerCallbackToken } from "@/lib/kyc/evidence-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_CALLBACK_BYTES = 64 * 1024;

const callbackSchema = z
  .object({
    evidenceId: z.string().uuid(),
    scanJobId: z.string().uuid(),
    status: z.enum(["running", "passed", "failed", "error"]),
    sha256: z.string().regex(/^[a-f0-9]{64}$/i).optional(),
    engine: z.string().trim().min(1).max(120).optional(),
    signature: z.string().trim().max(300).optional(),
    details: z.record(z.unknown()).optional(),
  })
  .strict();

type CallbackRow = {
  evidence_id: string;
  expected_sha256: string | null;
  active_scan_job_id: string | null;
  scan_status: string;
  evidence_status: string;
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

function bearerToken(request: NextRequest) {
  const authorization = request.headers.get("authorization") ?? "";
  return authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : request.headers.get("x-gem-verify-callback-token")?.trim() ?? "";
}

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_CALLBACK_BYTES) {
    return json({ error: "Scanner callback payload is too large." }, 413);
  }

  const callbackToken = bearerToken(request);
  const tokenPayload = callbackToken
    ? verifyScannerCallbackToken(callbackToken)
    : null;
  if (!tokenPayload) {
    return json({ error: "Unauthorized scanner callback." }, 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Scanner callback body must be valid JSON." }, 400);
  }

  const parsed = callbackSchema.safeParse(body);
  if (!parsed.success) {
    return json(
      {
        error: "Scanner callback payload is invalid.",
        details: parsed.error.flatten().fieldErrors,
      },
      400,
    );
  }

  const data = parsed.data;
  if (
    data.evidenceId !== tokenPayload.evidenceId ||
    data.scanJobId !== tokenPayload.scanJobId
  ) {
    return json({ error: "Scanner callback authorization does not match the job." }, 403);
  }

  const { ipAddress, userAgent } = getRequestContext(request);

  try {
    const rows = await db.$queryRaw<CallbackRow[]>`
      SELECT
        e.id AS evidence_id,
        e.sha256 AS expected_sha256,
        e.scan_job_id AS active_scan_job_id,
        s.status AS scan_status,
        e.status AS evidence_status
      FROM public.gem_verify_evidence_items e
      JOIN public.gem_verify_evidence_scan_jobs s
        ON s.id = ${data.scanJobId}
       AND s.evidence_id = e.id
      WHERE e.id = ${data.evidenceId}
      LIMIT 1
    `;
    const record = rows[0];
    if (!record) {
      return json({ error: "Evidence scan job not found." }, 404);
    }
    if (record.active_scan_job_id !== data.scanJobId) {
      return json({ error: "Scanner callback is not for the active scan job." }, 409);
    }

    if (["passed", "failed", "error", "cancelled"].includes(record.scan_status)) {
      return json({
        ok: true,
        evidenceId: data.evidenceId,
        scanJobId: data.scanJobId,
        status: record.scan_status,
        idempotent: true,
      });
    }

    const checksumMatches =
      !data.sha256 ||
      !record.expected_sha256 ||
      data.sha256.toLowerCase() === record.expected_sha256.toLowerCase();
    const effectiveStatus = checksumMatches ? data.status : "failed";
    const responseDetails = {
      engine: data.engine ?? null,
      signature: data.signature ?? null,
      reportedSha256: data.sha256 ?? null,
      checksumMatches,
      details: data.details ?? {},
    };

    if (effectiveStatus === "running") {
      await db.$transaction(async (tx) => {
        await tx.$executeRaw`
          UPDATE public.gem_verify_evidence_scan_jobs
          SET status = 'running',
              response_payload = ${JSON.stringify(responseDetails)}::jsonb,
              started_at = COALESCE(started_at, now()),
              updated_at = now()
          WHERE id = ${data.scanJobId}
            AND status IN ('queued','submitted','running')
        `;
        await tx.$executeRaw`
          INSERT INTO public.gem_verify_evidence_access_events (
            evidence_id,
            action,
            purpose,
            result,
            ip_address,
            user_agent,
            metadata
          ) VALUES (
            ${data.evidenceId},
            'scan_callback_received',
            'malware_and_file_safety_scan',
            'running',
            ${ipAddress},
            ${userAgent},
            ${JSON.stringify({ scanJobId: data.scanJobId, engine: data.engine ?? null })}::jsonb
          )
        `;
      });
      return json(
        {
          ok: true,
          evidenceId: data.evidenceId,
          scanJobId: data.scanJobId,
          status: "running",
          reviewerAccessAllowed: false,
        },
        202,
      );
    }

    if (effectiveStatus === "passed") {
      await db.$transaction(async (tx) => {
        await tx.$executeRaw`
          UPDATE public.gem_verify_evidence_scan_jobs
          SET status = 'passed',
              response_payload = ${JSON.stringify(responseDetails)}::jsonb,
              completed_at = now(),
              updated_at = now()
          WHERE id = ${data.scanJobId}
            AND status IN ('queued','submitted','running')
        `;
        await tx.$executeRaw`
          UPDATE public.gem_verify_evidence_items
          SET status = 'released',
              quarantine_status = 'passed',
              validation_status = 'passed',
              scan_completed_at = now(),
              scan_result = ${JSON.stringify({ status: "passed", ...responseDetails })}::jsonb,
              updated_at = now()
          WHERE id = ${data.evidenceId}
            AND scan_job_id = ${data.scanJobId}
            AND status = 'quarantined'
        `;
        await tx.$executeRaw`
          INSERT INTO public.gem_verify_evidence_validations (
            evidence_id,
            check_type,
            status,
            details
          ) VALUES (
            ${data.evidenceId},
            'malware_scan',
            'passed',
            ${JSON.stringify(responseDetails)}::jsonb
          )
        `;
        await tx.$executeRaw`
          INSERT INTO public.gem_verify_evidence_access_events (
            evidence_id,
            action,
            purpose,
            result,
            ip_address,
            user_agent,
            metadata
          ) VALUES
          (
            ${data.evidenceId},
            'scan_callback_received',
            'malware_and_file_safety_scan',
            'passed',
            ${ipAddress},
            ${userAgent},
            ${JSON.stringify({ scanJobId: data.scanJobId })}::jsonb
          ),
          (
            ${data.evidenceId},
            'released',
            'clean_scan_release_to_authorized_review',
            'released',
            ${ipAddress},
            ${userAgent},
            ${JSON.stringify({ scanJobId: data.scanJobId })}::jsonb
          )
        `;
      });

      return json({
        ok: true,
        evidenceId: data.evidenceId,
        scanJobId: data.scanJobId,
        status: "passed",
        evidenceStatus: "released",
        reviewerAccessAllowed: true,
      });
    }

    const manualHold = effectiveStatus === "error";
    const terminalStatus = manualHold ? "error" : "failed";
    await db.$transaction(async (tx) => {
      await tx.$executeRaw`
        UPDATE public.gem_verify_evidence_scan_jobs
        SET status = ${terminalStatus},
            response_payload = ${JSON.stringify(responseDetails)}::jsonb,
            last_error = ${manualHold ? "scanner_error" : data.signature ?? "scan_failed"},
            completed_at = now(),
            updated_at = now()
        WHERE id = ${data.scanJobId}
          AND status IN ('queued','submitted','running')
      `;
      await tx.$executeRaw`
        UPDATE public.gem_verify_evidence_items
        SET status = 'quarantined',
            quarantine_status = ${manualHold ? "manual_hold" : "failed"},
            validation_status = ${manualHold ? "needs_information" : "failed"},
            scan_completed_at = now(),
            scan_result = ${JSON.stringify({ status: terminalStatus, ...responseDetails })}::jsonb,
            updated_at = now()
        WHERE id = ${data.evidenceId}
          AND scan_job_id = ${data.scanJobId}
      `;
      await tx.$executeRaw`
        INSERT INTO public.gem_verify_evidence_validations (
          evidence_id,
          check_type,
          status,
          details
        ) VALUES (
          ${data.evidenceId},
          'malware_scan',
          ${manualHold ? "manual_review" : "failed"},
          ${JSON.stringify(responseDetails)}::jsonb
        )
      `;
      await tx.$executeRaw`
        INSERT INTO public.gem_verify_evidence_access_events (
          evidence_id,
          action,
          purpose,
          result,
          ip_address,
          user_agent,
          metadata
        ) VALUES
        (
          ${data.evidenceId},
          'scan_callback_received',
          'malware_and_file_safety_scan',
          ${terminalStatus},
          ${ipAddress},
          ${userAgent},
          ${JSON.stringify({ scanJobId: data.scanJobId, checksumMatches })}::jsonb
        ),
        (
          ${data.evidenceId},
          'quarantine_changed',
          'unsafe_or_unverified_scan_result',
          ${manualHold ? "manual_hold" : "failed"},
          ${ipAddress},
          ${userAgent},
          ${JSON.stringify({ scanJobId: data.scanJobId })}::jsonb
        )
      `;
    });

    return json(
      {
        ok: true,
        evidenceId: data.evidenceId,
        scanJobId: data.scanJobId,
        status: terminalStatus,
        evidenceStatus: "quarantined",
        reviewerAccessAllowed: false,
      },
      202,
    );
  } catch (error) {
    console.error("[POST /api/verify/evidence/scanner-callback]", error);
    return json(
      {
        error: "Scanner callback could not be recorded.",
        code: "EVIDENCE_SCANNER_CALLBACK_UNAVAILABLE",
        failClosed: true,
      },
      503,
    );
  }
}
