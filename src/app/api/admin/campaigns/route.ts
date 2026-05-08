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

export async function GET() {
  const gate = await requireAdmin();
  if (!gate.ok) return (gate as { ok: false; response: any }).response;

  try {
    const campaigns = await db.emailCampaign.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error("[GET /api/admin/campaigns]", error);
    return serverError();
  }
}

const CreateSchema = z.object({
  title: z.string().trim().min(1).max(200),
  subject: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(100_000),
  scheduledAt: z.string().datetime().optional(),
});

export async function POST(req: NextRequest) {
  const gate = await requireAdmin();
  if (!gate.ok) return (gate as { ok: false; response: any }).response;
  const session = gate.session;
  const { ipAddress, userAgent } = getRequestContext(req);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON");
  }

  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Validation failed", parsed.error.flatten().fieldErrors);
  }

  const { title, subject, body: campaignBody, scheduledAt } = parsed.data;

  try {
    const campaign = await db.emailCampaign.create({
      data: {
        title,
        subject,
        body: campaignBody,
        createdBy: session.userId,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        status: scheduledAt ? "SCHEDULED" : "DRAFT",
      },
    });

    await emitAuditLog({
      userId: session.userId,
      action: "admin_action",
      resource: "email_campaign",
      resourceId: campaign.id,
      metadata: {
        kind: "campaign_created",
        title,
        scheduledAt: scheduledAt ?? null,
        status: campaign.status,
      },
      ipAddress,
      userAgent,
    });

    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/campaigns]", error);
    return serverError();
  }
}
