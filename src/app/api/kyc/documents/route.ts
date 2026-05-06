import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { emitAuditLog } from "@/lib/audit";
import {
  requireSession,
  getRequestContext,
  badRequest,
  serverError,
} from "@/lib/api/auth-helpers";

// Storage path is generated server-side from the application ID; the client
// only supplies metadata. This prevents an authenticated user from writing
// document rows that point at someone else's storage prefix.

const ALLOWED_MIME = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
];
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

const createDocumentSchema = z.object({
  applicationId: z.string().min(1, "applicationId is required"),
  documentType: z
    .string()
    .trim()
    .min(2)
    .max(64)
    .regex(/^[a-z0-9_-]+$/i, "documentType must be alphanumeric/underscore"),
  fileName: z
    .string()
    .trim()
    .min(1)
    .max(255)
    // Block path traversal characters at the filename level.
    .regex(/^[^/\\]+$/, "fileName must not contain path separators"),
  fileSize: z
    .number()
    .int()
    .nonnegative()
    .max(MAX_FILE_SIZE, `File exceeds ${MAX_FILE_SIZE} bytes`)
    .optional(),
  mimeType: z.string().trim().min(1).max(127).optional(),
});

export async function POST(req: NextRequest) {
  const gate = await requireSession();
  if (!gate.ok) return gate.response;
  const session = gate.session;
  const { ipAddress, userAgent } = getRequestContext(req);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON");
  }

  const parsed = createDocumentSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Validation failed", parsed.error.flatten().fieldErrors);
  }

  const { applicationId, documentType, fileName, fileSize, mimeType } = parsed.data;
  const safeMime = mimeType && ALLOWED_MIME.includes(mimeType)
    ? mimeType
    : "application/octet-stream";

  try {
    // Ownership check: only allow attaching documents to the caller's own
    // application, and only while the application is still editable.
    const application = await db.kYCApplication.findFirst({
      where: { id: applicationId, userId: session.userId },
      select: { id: true, status: true },
    });
    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }
    if (
      application.status === "approved" ||
      application.status === "rejected" ||
      application.status === "expired"
    ) {
      return NextResponse.json(
        { error: "Cannot attach documents to a finalized application" },
        { status: 409 },
      );
    }

    const document = await db.kycDocument.create({
      data: {
        applicationId: application.id,
        documentType,
        fileName,
        fileSize: fileSize ?? 0,
        mimeType: safeMime,
        // Server-controlled storage prefix scoped by application id.
        storagePath: `kyc/${application.id}/${Date.now()}-${fileName}`,
        status: "pending",
      },
    });

    // Bump the application status forward if it's still in early stages so
    // the dashboard reflects upload progress.
    if (application.status === "not_started" || application.status === "started") {
      await db.kYCApplication.update({
        where: { id: application.id },
        data: { status: "documents_uploaded" },
      });
    }

    await emitAuditLog({
      userId: session.userId,
      action: "document_upload",
      resource: "kyc_document",
      resourceId: document.id,
      metadata: {
        applicationId: application.id,
        documentType,
        fileName,
        fileSize: fileSize ?? 0,
        mimeType: safeMime,
      },
      ipAddress,
      userAgent,
    });

    return NextResponse.json({ ok: true, document });
  } catch (error) {
    console.error("[POST /api/kyc/documents]", error);
    return serverError();
  }
}
