import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

function isAdmin(role: string) {
  return role === "admin" || role === "internal";
}

const adminKycActionSchema = z.object({
  applicationId: z.string().min(1, "Application ID is required"),
  action: z.enum(["approve", "reject", "manual_review"]),
  notes: z.string().optional(),
});

const VALID_KYC_STATUSES = [
  "not_started",
  "started",
  "in_progress",
  "documents_uploaded",
  "under_review",
  "manual_review",
  "approved",
  "rejected",
  "expired",
] as const;

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !isAdmin(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");

    const statusFilter =
      statusParam && VALID_KYC_STATUSES.includes(statusParam as (typeof VALID_KYC_STATUSES)[number])
        ? { status: statusParam as (typeof VALID_KYC_STATUSES)[number] }
        : {};

    const applications = await db.kYCApplication.findMany({
      where: statusFilter,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                phone: true,
                country: true,
                entityType: true,
              },
            },
          },
        },
        documents: {
          select: {
            id: true,
            documentType: true,
            status: true,
            fileName: true,
            uploadedAt: true,
          },
        },
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
      include: { user: true },
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

    const decisionType =
      action === "approve"
        ? "approved"
        : action === "reject"
        ? "rejected"
        : "manual_review";

    const auditAction =
      action === "approve"
        ? "kyc_approved"
        : action === "reject"
        ? "kyc_rejected"
        : "kyc_manual_review";

    await db.$transaction(async (tx) => {
      // Update application status
      await tx.kYCApplication.update({
        where: { id: applicationId },
        data: {
          status: newStatus,
          completedAt: action !== "manual_review" ? new Date() : null,
          reviewNotes: notes ?? null,
        },
      });

      // Upsert decision record
      await tx.decision.upsert({
        where: { applicationId },
        update: {
          decision: decisionType,
          decisionBy: session.userId,
          decisionAt: new Date(),
          reason: notes ?? null,
        },
        create: {
          applicationId,
          decision: decisionType,
          decisionBy: session.userId,
          reason: notes ?? null,
        },
      });

      // Create KYC review record
      await tx.kYCReview.create({
        data: {
          applicationId,
          reviewerId: session.userId,
          action: decisionType,
          notes: notes ?? null,
        },
      });

      // If approved, grant entitlements based on entity type
      if (action === "approve") {
        await tx.entitlement.create({
          data: {
            userId: application.userId,
            slug: "client_approved",
            grantedBy: session.userId,
            notes: notes ?? `KYC approved by ${session.email}`,
          },
        });
      }

      // Audit log
      await tx.auditLog.create({
        data: {
          userId: session.userId,
          action: auditAction,
          resource: "kyc_application",
          resourceId: applicationId,
          metadata: {
            targetUserId: application.userId,
            action,
            notes,
            previousStatus: application.status,
            newStatus,
          },
        },
      });
    });

    return NextResponse.json({ success: true, applicationId, status: newStatus });
  } catch (error) {
    console.error("[POST /api/admin/kyc]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
