import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { emitAuditLog } from "@/lib/audit";
import {
  requireAdmin,
  getRequestContext,
  badRequest,
  serverError,
} from "@/lib/api/auth-helpers";

const UpdateSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    subject: z.string().trim().min(1).max(200).optional(),
    body: z.string().trim().min(1).max(100_000).optional(),
    scheduledAt: z.string().datetime().nullable().optional(),
    status: z.enum(["DRAFT", "SCHEDULED", "CANCELLED"]).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "No updatable fields provided" });

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const gate = await requireAdmin();
  if (!gate.ok) {
    return (gate as { ok: false; response: NextResponse }).response;
    return gate.response;
  }
  const session = gate.session;
  const { ipAddress, userAgent } = getRequestContext(req);

  const { id } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON");
  }

  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Validation failed", parsed.error.flatten().fieldErrors);
  }

  try {
    const existing = await db.emailCampaign.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (existing.status === "SENT") {
      return NextResponse.json(
        { error: "Cannot modify a sent campaign" },
        { status: 409 },
      );
    }

    const campaign = await db.emailCampaign.update({
      where: { id },
      data: {
        ...parsed.data,
        scheduledAt:
          parsed.data.scheduledAt === null
            ? null
            : parsed.data.scheduledAt
              ? new Date(parsed.data.scheduledAt)
              : undefined,
      },
    });

    await emitAuditLog({
      userId: session.userId,
      action: "admin_action",
      resource: "email_campaign",
      resourceId: id,
      metadata: {
        kind: "campaign_updated",
        previousStatus: existing.status,
        newStatus: campaign.status,
        fields: Object.keys(parsed.data),
      },
      ipAddress,
      userAgent,
    });

    return NextResponse.json({ campaign });
  } catch (error) {
    console.error("[PATCH /api/admin/campaigns/[id]]", error);
    return serverError();
  }
}
