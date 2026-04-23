import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

const documentPostSchema = z.object({
  applicationId: z.string().min(1, "Application ID is required"),
  documentType: z.enum([
    "government_id",
    "proof_of_address",
    "tax_document",
    "financial_statement",
    "trust_deed",
    "articles_of_incorporation",
    "beneficial_owner",
    "accredited_investor",
    "other",
  ]),
  fileName: z.string().min(1, "File name is required"),
  fileSize: z.number().int().positive().optional(),
  mimeType: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = documentPostSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { applicationId, documentType, fileName, fileSize, mimeType } = parsed.data;

    // Verify the application belongs to the current user
    const application = await db.kYCApplication.findFirst({
      where: {
        id: applicationId,
        userId: session.userId,
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found or access denied" },
        { status: 404 }
      );
    }

    // Create the document record (fileUrl is a placeholder; real upload uses presigned URLs)
    const document = await db.kYCDocument.create({
      data: {
        applicationId,
        documentType,
        status: "pending",
        fileName,
        fileUrl: `pending://${applicationId}/${fileName}`,
        fileSize: fileSize ?? null,
        mimeType: mimeType ?? null,
      },
    });

    // Update application status to documents_uploaded
    await db.kYCApplication.update({
      where: { id: applicationId },
      data: { status: "documents_uploaded" },
    });

    await db.auditLog.create({
      data: {
        userId: session.userId,
        action: "kyc_document_upload",
        resource: "kyc_document",
        resourceId: document.id,
        metadata: { applicationId, documentType, fileName },
      },
    });

    return NextResponse.json({
      success: true,
      documentId: document.id,
      documentType: document.documentType,
      status: document.status,
    });
  } catch (error) {
    console.error("[POST /api/kyc/documents]", error);
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
    });

    if (!application) {
      return NextResponse.json({ documents: [] });
    }

    const documents = await db.kYCDocument.findMany({
      where: { applicationId: application.id },
      orderBy: { uploadedAt: "desc" },
      select: {
        id: true,
        documentType: true,
        status: true,
        fileName: true,
        fileSize: true,
        mimeType: true,
        uploadedAt: true,
        reviewedAt: true,
        rejectionReason: true,
      },
    });

    return NextResponse.json({
      applicationId: application.id,
      documents,
    });
  } catch (error) {
    console.error("[GET /api/kyc/documents]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
