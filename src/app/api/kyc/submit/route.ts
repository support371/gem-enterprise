import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { emitAuditLog } from "@/lib/audit";
import { createEvidenceItem } from "@/lib/evidence";
import {
  requireSession,
  getRequestContext,
  badRequest,
  serverError,
} from "@/lib/api/auth-helpers";

// Statuses that indicate "ready to submit for review".
// We accept any in-flight state — `started`, `in_progress`, or
// `documents_uploaded` — to keep the form flow forgiving for users.
const SUBMITTABLE_STATUSES = [
  "not_started",
  "started",
  "in_progress",
  "documents_uploaded",
] as const;

const submitSchema = z
  .object({ applicationId: z.string().min(1).optional() })
  .partial();

export async function POST(req: NextRequest) {
  const gate = await requireSession();
  if (!gate.ok) return (gate as { ok: false; response: any }).response;
  const session = gate.session;
  const { ipAddress, userAgent } = getRequestContext(req);

  // Body is optional (legacy clients send an empty POST). When present and
  // shaped wrong, we still report a clean 400 instead of a silent failure.
  let parsed: { applicationId?: string } = {};
  if (req.headers.get("content-length") && Number(req.headers.get("content-length")) > 0) {
    try {
      const body = await req.json();
      const result = submitSchema.safeParse(body ?? {});
      if (!result.success) {
        return badRequest("Validation failed", result.error.flatten().fieldErrors);
      }
      parsed = result.data;
    } catch {
      // tolerate empty / non-JSON bodies — fall through to default lookup
    }
  }

  try {
    const application = parsed.applicationId
      ? await db.kYCApplication.findFirst({
          where: { id: parsed.applicationId, userId: session.userId },
        })
      : await db.kYCApplication.findFirst({
          where: {
            userId: session.userId,
            status: { in: [...SUBMITTABLE_STATUSES] },
          },
          orderBy: { createdAt: "desc" },
        });

    if (!application) {
      return NextResponse.json(
        {
          error:
            "No active KYC application found. Start a new application before submitting.",
        },
        { status: 404 },
      );
    }

    if (
      application.status === "approved" ||
      application.status === "rejected" ||
      application.status === "expired"
    ) {
      return NextResponse.json(
        { error: `Application is already ${application.status}` },
        { status: 409 },
      );
    }

    if (application.status === "under_review" || application.status === "manual_review") {
      // Idempotent — already submitted; return a clean ok so the client UI
      // doesn't bounce on retries.
      return NextResponse.json({ ok: true, application, alreadySubmitted: true });
    }

    const updated = await db.kYCApplication.update({
      where: { id: application.id },
      data: { status: "under_review", submittedAt: new Date() },
    });

    await emitAuditLog({
      userId: session.userId,
      action: "kyc_submit",
      resource: "kyc_application",
      resourceId: application.id,
      metadata: { previousStatus: application.status },
      ipAddress,
      userAgent,
    });

    await createEvidenceItem({
      userId: session.userId,
      class: "decision",
      action: "kyc_submission",
      data: {
        applicationId: application.id,
        previousStatus: application.status,
        ipAddress,
        userAgent,
      },
      retentionYears: 7,
    });

    return NextResponse.json({ ok: true, application: updated });
  } catch (error) {
    console.error("[POST /api/kyc/submit]", error);
    return serverError();
  }
}
