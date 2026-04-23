import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

const createRequestSchema = z.object({
  type: z.enum(["service_change", "allocation", "access", "withdrawal", "other"]),
  subject: z.string().min(1, "Subject is required").max(255),
  description: z.string().min(1, "Description is required"),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { type, subject, description, priority } = parsed.data;

    const serviceRequest = await db.request.create({
      data: {
        userId: session.userId,
        type,
        subject,
        description,
        priority,
        status: "open",
      },
    });

    await db.auditLog.create({
      data: {
        userId: session.userId,
        action: "request_submitted",
        resource: "request",
        resourceId: serviceRequest.id,
        metadata: { type, subject, priority },
      },
    });

    return NextResponse.json({
      success: true,
      requestId: serviceRequest.id,
      status: serviceRequest.status,
      createdAt: serviceRequest.createdAt,
    });
  } catch (error) {
    console.error("[POST /api/requests]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(_request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requests = await db.request.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        type: true,
        subject: true,
        status: true,
        priority: true,
        assignedTo: true,
        resolvedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ requests, total: requests.length });
  } catch (error) {
    console.error("[GET /api/requests]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
