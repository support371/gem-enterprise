import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { emitAuditLog } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { profileId, consentGiven, disclosureTextHash } = body;

    if (!consentGiven) {
      return NextResponse.json({ error: "Consent required" }, { status: 400 });
    }

    const aiRun = await db.aiRun.create({
      data: {
        profileId: profileId || "PRF-005",
        modelVersion: "claude-3-5-sonnet",
        consentReceiptId: `CR-${Date.now()}`,
        disclosureTextHash,
        consentRecord: {
          create: {
            disclosureTextHash,
            ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
          }
        }
      }
    });

    await emitAuditLog({
      action: "ai_session_opened",
      resource: "ai_run",
      resourceId: aiRun.id,
      metadata: { profileId, disclosureTextHash }
    });

    return NextResponse.json({ ok: true, sessionId: aiRun.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
