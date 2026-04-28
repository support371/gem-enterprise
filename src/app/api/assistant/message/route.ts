import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { emitAuditLog } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const { sessionId, message } = await req.json();

    // Logic for restricted class detection (ADR-003)
    const isRestricted = /legal|financial|advice/i.test(message);

    if (isRestricted) {
       await emitAuditLog({
         action: "restricted_class_detected",
         resource: "ai_run",
         resourceId: sessionId,
         metadata: { message }
       });

       return NextResponse.json({
         error: "Restricted content detected",
         escalate: true
       }, { status: 422 });
    }

    await emitAuditLog({
      action: "ai_message_sent",
      resource: "ai_run",
      resourceId: sessionId,
      metadata: { messageLength: message.length }
    });

    return NextResponse.json({
      text: "This is a stub response. AI model integration pending."
    });
  } catch (error) {
    return NextResponse.json({ error: "Error processing message" }, { status: 500 });
  }
}
