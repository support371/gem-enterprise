import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { emitAuditLog } from "@/lib/audit";
import { createEvidenceItem } from "@/lib/evidence";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const application = await db.kYCApplication.findFirst({
    where: { userId: session.userId, status: "started" },
  });

  if (!application) return NextResponse.json({ error: "No active application" }, { status: 404 });

  await db.kYCApplication.update({
    where: { id: application.id },
    data: { status: "under_review", submittedAt: new Date() }
  });

  await emitAuditLog({
    userId: session.userId,
    action: "kyc_submit",
    resource: "kyc_application",
    resourceId: application.id,
  });

  await createEvidenceItem({
    userId: session.userId,
    class: "decision",
    action: "kyc_submission",
    data: { applicationId: application.id },
    retentionYears: 7
  });

  return NextResponse.json({ ok: true });
}
