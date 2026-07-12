import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const STALE_AFTER_MINUTES = 20;
const MAX_JOBS_PER_RUN = 25;

type StaleJob = {
  id: string;
  evidence_id: string;
};

function configured(name: string) {
  return process.env[name]?.trim() ?? "";
}

function bearer(request: NextRequest) {
  const authorization = request.headers.get("authorization") ?? "";
  return authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : request.headers.get("x-gem-internal-job-token")?.trim() ?? "";
}

function secureEqual(left: string, right: string) {
  const leftBytes = Buffer.from(left);
  const rightBytes = Buffer.from(right);
  return leftBytes.length === rightBytes.length && timingSafeEqual(leftBytes, rightBytes);
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
  const expected = configured("CRON_SECRET") || configured("GEM_VERIFY_INTERNAL_JOB_SECRET");
  const supplied = bearer(request);
  if (expected.length < 32 || !supplied || !secureEqual(supplied, expected)) {
    return json({ error: "Unauthorized internal job." }, 401);
  }

  try {
    const result = await db.$transaction(async (tx) => {
      const stale = await tx.$queryRaw<StaleJob[]>`
        SELECT s.id, s.evidence_id
        FROM public.gem_verify_evidence_scan_jobs s
        JOIN public.gem_verify_evidence_items e
          ON e.id = s.evidence_id
         AND e.scan_job_id = s.id
        WHERE s.status IN ('queued','submitted','running')
          AND COALESCE(s.started_at, s.requested_at) <
              now() - (${STALE_AFTER_MINUTES}::text || ' minutes')::interval
        ORDER BY COALESCE(s.started_at, s.requested_at)
        FOR UPDATE OF s SKIP LOCKED
        LIMIT ${MAX_JOBS_PER_RUN}
      `;

      for (const job of stale) {
        await tx.$executeRaw`
          UPDATE public.gem_verify_evidence_scan_jobs
          SET status = 'error',
              last_error = 'scan_timeout',
              completed_at = now(),
              updated_at = now(),
              response_payload = response_payload ||
                ${JSON.stringify({ status: "error", reason: "scan_timeout" })}::jsonb
          WHERE id = ${job.id}
            AND status IN ('queued','submitted','running')
        `;

        await tx.$executeRaw`
          UPDATE public.gem_verify_evidence_items
          SET status = 'quarantined',
              quarantine_status = 'manual_hold',
              validation_status = 'needs_information',
              scan_completed_at = now(),
              scan_result = scan_result ||
                ${JSON.stringify({ status: "error", reason: "scan_timeout" })}::jsonb,
              updated_at = now()
          WHERE id = ${job.evidence_id}
            AND scan_job_id = ${job.id}
            AND status = 'quarantined'
        `;

        await tx.$executeRaw`
          INSERT INTO public.gem_verify_evidence_validations (
            evidence_id,
            check_type,
            status,
            details
          ) VALUES (
            ${job.evidence_id},
            'file_safety_scan_timeout',
            'manual_review',
            ${JSON.stringify({ scanJobId: job.id, timeoutMinutes: STALE_AFTER_MINUTES })}::jsonb
          )
        `;

        await tx.$executeRaw`
          INSERT INTO public.gem_verify_evidence_access_events (
            evidence_id,
            action,
            purpose,
            result,
            metadata
          ) VALUES (
            ${job.evidence_id},
            'quarantine_changed',
            'scanner_timeout_fail_closed',
            'manual_hold',
            ${JSON.stringify({ scanJobId: job.id, timeoutMinutes: STALE_AFTER_MINUTES })}::jsonb
          )
        `;
      }

      return stale.length;
    });

    return json({
      ok: true,
      evaluatedAt: new Date().toISOString(),
      staleAfterMinutes: STALE_AFTER_MINUTES,
      processed: result,
      evidenceReleased: 0,
      failClosed: true,
    });
  } catch (error) {
    console.error("[GET /api/internal/gem-verify/scan-timeouts]", error);
    return json(
      {
        error: "Stale scan jobs could not be evaluated.",
        code: "GEM_VERIFY_SCAN_TIMEOUT_JOB_UNAVAILABLE",
        failClosed: true,
      },
      503,
    );
  }
}
