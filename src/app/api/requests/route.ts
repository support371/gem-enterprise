import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { emitAuditLog } from "@/lib/audit";
import { getSession } from "@/lib/auth";

const createSchema = z.object({
  type: z.string().min(1, "Request type is required"),
  subject: z.string().min(3, "Subject is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
});

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const requests = await db.serviceRequest.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      type: true,
      subject: true,
      description: true,
      status: true,
      priority: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ requests });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { type, subject, description, priority } = parsed.data;

  const request = await db.serviceRequest.create({
    data: {
      userId: session.userId,
      type,
      subject,
      description,
      priority: priority ?? "medium",
      status: "open",
    },
  });

  await emitAuditLog({
    action: "case_created",
    resource: "service_request",
    resourceId: request.id,
    metadata: { type, subject },
  });

  return NextResponse.json({ ok: true, request }, { status: 201 });
}
