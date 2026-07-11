import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  getRequestContext,
  requireStaff,
} from "@/lib/api/auth-helpers";
import {
  createSignedEvidenceReadUrl,
  EvidenceStorageError,
} from "@/lib/kyc/evidence-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REVIEW_URL_TTL_SECONDS = 5 * 60;

const requestSchema = z
  .object({
    evidenceId: z.string().uuid(),
    purpose: z.string().trim().min(5).max(240),
  })
  .strict();

type EvidenceRow = {
  id: string;
  storage_path: string;
  status: string;
  quarantine_status: string;
  validation_status: string;
  reviewer_status: string;
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

export async function POST(request: NextRequest) {
  const gate = await requireStaff();
  if (!gate.ok) return gate.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Request body must be valid JSON." }, 400);
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return json(
      {
        error: "Reviewer evidence access request is invalid.",
        details: parsed.error.flatten().fieldErrors,
      },
      400,
    );
  }

  const { evidenceId, purpose } = parsed.data;
  const { ipAddress, userAgent } = getRequestContext(request);

  try {
    const rows = await db.$queryRaw<EvidenceRow[]>`
      SELECT
        id,
        storage_path,
        status,
        quarantine_status,
        validation_status,
        reviewer_status
      FROM public.gem_verify_evidence_items
      WHERE id = ${evidenceId}
      LIMIT 1
    `;
    const evidence = rows[0];
    if (!evidence) return json({ error: "Evidence item not found." }, 404);

    const releasable =
      evidence.status === "released" &&
      evidence.quarantine_status === "passed" &&
      evidence.validation_status === "passed";
    if (!releasable) {
      await db.$executeRaw`
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
          'view_requested',
          ${purpose},
          'denied_not_released',
          ${ipAddress},
          ${userAgent},
          ${JSON.stringify({
            status: evidence.status,
            quarantineStatus: evidence.quarantine_status,
            validationStatus: evidence.validation_status,
          })}::jsonb
        )
      `;
      return json(
        {
          error: "Evidence has not passed quarantine and validation controls.",
          code: "EVIDENCE_NOT_RELEASED",
          failClosed: true,
        },
        423,
      );
    }

    const signed = await createSignedEvidenceReadUrl(
      evidence.storage_path,
      REVIEW_URL_TTL_SECONDS,
    );

    await db.$transaction(async (tx) => {
      await tx.$executeRaw`
        UPDATE public.gem_verify_evidence_items
        SET reviewer_status = CASE
              WHEN reviewer_status = 'pending' THEN 'assigned'
              ELSE reviewer_status
            END,
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
        ) VALUES
        (
          ${evidence.id},
          ${gate.session.userId},
          'view_requested',
          ${purpose},
          'approved',
          ${ipAddress},
          ${userAgent},
          ${JSON.stringify({ ttlSeconds: REVIEW_URL_TTL_SECONDS })}::jsonb
        ),
        (
          ${evidence.id},
          ${gate.session.userId},
          'signed_url_issued',
          ${purpose},
          'issued',
          ${ipAddress},
          ${userAgent},
          ${JSON.stringify({ expiresAt: signed.expiresAt.toISOString() })}::jsonb
        )
      `;
    });

    return json({
      ok: true,
      evidenceId: evidence.id,
      signedUrl: signed.signedUrl,
      expiresAt: signed.expiresAt.toISOString(),
      singlePurpose: true,
      public: false,
    });
  } catch (error) {
    console.error("[POST /api/verify/evidence/review-url]", error);
    return json(
      {
        error: "Reviewer evidence access could not be authorized.",
        code:
          error instanceof EvidenceStorageError
            ? error.code
            : "EVIDENCE_REVIEW_ACCESS_UNAVAILABLE",
        failClosed: true,
      },
      error instanceof EvidenceStorageError ? error.statusCode : 503,
    );
  }
}
