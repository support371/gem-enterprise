import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

const kycPostSchema = z.object({
  entityType: z.enum(["individual", "business", "trust", "family_office"]),
  formData: z.record(z.unknown()).optional(),
});

const TERMINAL_STATUSES = ["approved", "rejected"];

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = kycPostSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { entityType, formData } = parsed.data;

    const existing = await db.kYCApplication.findFirst({
      where: {
        userId: session.userId,
        status: {
          notIn: TERMINAL_STATUSES as ("approved" | "rejected")[],
        },
      },
      orderBy: { createdAt: "desc" },
    });

    let application;

    if (!existing) {
      application = await db.kYCApplication.create({
        data: {
          userId: session.userId,
          entityType,
          status: "started",
          formData: (formData ?? {}) as Prisma.InputJsonValue,
        },
      });

      await db.auditLog.create({
        data: {
          userId: session.userId,
          action: "kyc_start",
          resource: "kyc_application",
          resourceId: application.id,
          metadata: { entityType } as Prisma.InputJsonValue,
        },
      });
    } else {
      application = await db.kYCApplication.update({
        where: { id: existing.id },
        data: {
          formData: (formData ?? existing.formData ?? {}) as Prisma.InputJsonValue,
          status: "in_progress",
          entityType,
        },
      });
    }

    return NextResponse.json({
      success: true,
      applicationId: application.id,
      status: application.status,
    });
  } catch (error) {
    console.error("[POST /api/kyc]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(_request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const application = await db.kYCApplication.findFirst({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      include: {
        documents: {
          select: {
            id: true,
            documentType: true,
            status: true,
            fileName: true,
            uploadedAt: true,
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json({
        applicationId: null,
        status: "not_started",
        entityType: null,
        submittedAt: null,
        documents: [],
      });
    }

    return NextResponse.json({
      applicationId: application.id,
      status: application.status,
      entityType: application.entityType,
      submittedAt: application.submittedAt,
      documents: application.documents,
    });
  } catch (error) {
    console.error("[GET /api/kyc]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
