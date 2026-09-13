import { AuditAction } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/api/auth-helpers";
import { emitAuditLog } from "@/lib/audit";
import {
  CommunicationGovernanceUnavailableError,
  communicationBases,
  communicationStatuses,
  listCommunicationPreferences,
  setCommunicationPreference,
} from "@/lib/communications/governance";

const preferenceSchema = z
  .object({
    email: z.string().trim().email().max(320),
    status: z.enum(communicationStatuses),
    basis: z.enum(communicationBases).nullable().optional(),
    jurisdiction: z.string().trim().max(80).nullable().optional(),
    evidenceRef: z.string().trim().max(500).nullable().optional(),
  })
  .superRefine((value, context) => {
    if (value.status === "ALLOWED" && !value.basis) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["basis"], message: "An reviewed basis is required before marketing is allowed" });
    }
    if (value.status === "ALLOWED" && value.basis === "EXPLICIT_CONSENT" && !value.evidenceRef) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["evidenceRef"], message: "Explicit consent requires an evidence reference" });
    }
  });

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

function handleError(error: unknown) {
  if (error instanceof CommunicationGovernanceUnavailableError) {
    return json({ error: error.message, code: "COMMUNICATION_GOVERNANCE_STORAGE_NOT_READY" }, 503);
  }
  console.error("[admin:communication-preferences]", error);
  return json({ error: "Unable to complete the communication-preference operation" }, 500);
}

export async function GET() {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;
  try {
    const preferences = await listCommunicationPreferences();
    return json({ preferences, viewerRole: gate.session.role });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  const parsed = preferenceSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return json({ error: "Invalid communication preference", details: parsed.error.flatten() }, 400);

  try {
    const preferenceId = await setCommunicationPreference({
      channel: "EMAIL",
      destination: parsed.data.email,
      purpose: "MARKETING",
      status: parsed.data.status,
      basis: parsed.data.basis,
      jurisdiction: parsed.data.jurisdiction,
      source: "admin_review",
      evidenceRef: parsed.data.evidenceRef,
      changedById: gate.session.userId,
      eventType:
        parsed.data.status === "ALLOWED"
          ? "ALLOWED"
          : parsed.data.status === "BLOCKED"
            ? "BLOCKED"
            : "CREATED",
      eventEvidence: {
        reviewedByRole: gate.session.role,
        evidenceRefPresent: Boolean(parsed.data.evidenceRef),
      },
    });

    await emitAuditLog({
      userId: gate.session.userId,
      action: AuditAction.admin_action,
      resource: "communication_preference",
      resourceId: preferenceId,
      metadata: {
        channel: "EMAIL",
        purpose: "MARKETING",
        status: parsed.data.status,
        basis: parsed.data.basis ?? null,
        jurisdiction: parsed.data.jurisdiction ?? null,
        evidenceRefPresent: Boolean(parsed.data.evidenceRef),
      },
      ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined,
      userAgent: request.headers.get("user-agent") || undefined,
    });

    return json({ preferenceId }, 201);
  } catch (error) {
    return handleError(error);
  }
}
