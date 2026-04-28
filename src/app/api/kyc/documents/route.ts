import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { applicationId, documentType, fileName, fileSize, mimeType } = body;

  const document = await db.kycDocument.create({
    data: {
      applicationId,
      documentType,
      fileName,
      fileSize: fileSize || 0,
      mimeType: mimeType || "application/octet-stream",
      storagePath: `kyc/${applicationId}/${fileName}`,
      status: "pending"
    }
  });

  return NextResponse.json({ ok: true, document });
}
