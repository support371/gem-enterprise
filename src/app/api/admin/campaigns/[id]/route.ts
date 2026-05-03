import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { z } from "zod";
import nodemailer from "nodemailer";

async function requireAdmin() {
  const session = await getSession();
  if (!session) return null;
  if (!['admin', 'super_admin', 'internal'].includes(session.role)) return null;
  return session;
}

const UpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  subject: z.string().min(1).max(200).optional(),
  body: z.string().min(1).optional(),
  scheduledAt: z.string().datetime().nullable().optional(),
  status: z.enum(["DRAFT", "SCHEDULED", "CANCELLED"]).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const existing = await db.emailCampaign.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.status === "SENT") return NextResponse.json({ error: "Cannot modify a sent campaign" }, { status: 409 });

  const campaign = await db.emailCampaign.update({
    where: { id },
    data: {
      ...parsed.data,
      scheduledAt: parsed.data.scheduledAt === null ? null : parsed.data.scheduledAt ? new Date(parsed.data.scheduledAt) : undefined,
    },
  });

  return NextResponse.json({ campaign });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const url = new URL(req.url);
  const action = url.pathname.endsWith("/send") ? "send" : null;

  if (action !== "send") return NextResponse.json({ error: "Unknown action" }, { status: 400 });

  const campaign = await db.emailCampaign.findUnique({ where: { id } });
  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (campaign.status === "SENT") return NextResponse.json({ error: "Already sent" }, { status: 409 });
  if (campaign.status === "CANCELLED") return NextResponse.json({ error: "Campaign is cancelled" }, { status: 409 });

  const users = await db.user.findMany({
    where: { status: "active", isActive: true },
    select: { email: true },
  });

  let sentCount = 0;
  if (process.env.SMTP_HOST) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    for (const user of users) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM ?? "noreply@gemcybersecurityassist.com",
          to: user.email,
          subject: campaign.subject,
          text: campaign.body,
        });
        sentCount++;
      } catch {
        // continue on individual send failure
      }
    }
  } else {
    sentCount = users.length;
  }

  const updated = await db.emailCampaign.update({
    where: { id },
    data: { status: "SENT", sentAt: new Date(), recipientCount: sentCount },
  });

  return NextResponse.json({ campaign: updated, sentCount });
}
