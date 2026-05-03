import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { z } from "zod";

async function requireAdmin() {
  const session = await getSession();
  if (!session) return null;
  if (!['admin', 'super_admin', 'internal'].includes(session.role)) return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const campaigns = await db.emailCampaign.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ campaigns });
}

const CreateSchema = z.object({
  title: z.string().min(1).max(200),
  subject: z.string().min(1).max(200),
  body: z.string().min(1),
  scheduledAt: z.string().datetime().optional(),
});

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { title, subject, body: campaignBody, scheduledAt } = parsed.data;

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

  return NextResponse.json({ campaign }, { status: 201 });
}
