import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { emitAuditLog } from "@/lib/audit";

function isAdmin(role: string) {
  return role === "admin" || role === "internal";
}

const adminKycActionSchema = z.object({
  applicationId: z.string().min(1, "Application ID is required"),
  action: z.enum(["approve", "reject", "manual_review"]),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !isAdmin(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const applications = await db.kYCApplication.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        documents: true,
        decision: true,
      },
    });

    return NextResponse.json({ applications, total: applications.length });
  } catch (error) {
    console.error("[GET /api/admin/kyc]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !isAdmin(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = adminKycActionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { applicationId, action, notes } = parsed.data;

    const application = await db.kYCApplication.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const newStatus =
      action === "approve"
        ? "approved"
        : action === "reject"
        ? "rejected"
        : "manual_review";

    await db.$transaction(async (tx) => {
      await tx.kYCApplication.update({
        where: { id: applicationId },
        data: {
          status: newStatus,
          completedAt: action !== "manual_review" ? new Date() : null,
          reviewNotes: notes ?? null,
        },
      });

      await tx.decision.upsert({
        where: { applicationId },
        update: {
          decision: newStatus,
          decisionBy: session.userId,
          decisionAt: new Date(),
          reason: notes ?? null,
        },
        create: {
          applicationId,
          decision: newStatus,
          decisionBy: session.userId,
          reason: notes ?? null,
        },
      });

      await tx.kYCReview.create({
        data: {
          applicationId,
          reviewerId: session.userId,
          action: newStatus,
          notes: notes ?? null,
        },
      });

      if (action === "approve") {
        await tx.entitlement.create({
          data: {
            userId: application.userId,
            slug: "client_approved",
            grantedBy: session.userId,
            notes: notes ?? `KYC approved`,
          },
        });
      }

      await emitAuditLog({
        userId: session.userId,
        action: action === "approve" ? "kyc_approve" : action === "reject" ? "kyc_reject" : "kyc_flag",
        resource: "kyc_application",
        resourceId: applicationId,
        metadata: { notes, newStatus }
      });
    });

    return NextResponse.json({ success: true, status: newStatus });
  } catch (error) {
    console.error("[POST /api/admin/kyc]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
