import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

const SUBMITTABLE_STATUSES = ["in_progress", "documents_uploaded"];

export async function POST(_request: NextRequest) {
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
          where: { status: { not: "rejected" } },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "No KYC application found" },
        { status: 404 }
      );
    }

    if (!SUBMITTABLE_STATUSES.includes(application.status)) {
      return NextResponse.json(
        {
          error: `Cannot submit application with status: ${application.status}`,
          status: application.status,
        },
        { status: 409 }
      );
    }

    if (application.documents.length === 0) {
      return NextResponse.json(
        { error: "At least one document must be uploaded before submitting" },
        { status: 422 }
      );
    }

    const updated = await db.kYCApplication.update({
      where: { id: application.id },
      data: {
        status: "under_review",
        submittedAt: new Date(),
      },
    });

    await db.auditLog.create({
      data: {
        userId: session.userId,
        action: "kyc_submit",
        resource: "kyc_application",
        resourceId: application.id,
        metadata: {
          previousStatus: application.status,
          documentCount: application.documents.length,
        },
      },
    });

    return NextResponse.json({
      success: true,
      status: updated.status,
      submittedAt: updated.submittedAt,
    });
  } catch (error) {
    console.error("[POST /api/kyc/submit]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
