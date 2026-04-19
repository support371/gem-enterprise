import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { supportStore } from "@/lib/support/store-instance";
import { generateSupportResponse } from "@/lib/support/generate-response";
import { z } from "zod";

const schema = z.object({
  sessionId: z.string().min(1),
  message: z.string().min(1).max(2000),
});

export async function POST(request: NextRequest) {
  const auth = await getSession();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { sessionId, message } = parsed.data;
  const session = await supportStore.getSession(sessionId);

  if (!session || session.userId !== auth.userId) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  if (!session.consentAccepted) {
    return NextResponse.json({ error: "Consent required" }, { status: 403 });
  }

  if (session.status === "closed") {
    return NextResponse.json({ error: "Session is closed" }, { status: 409 });
  }

  try {
    const result = await generateSupportResponse(sessionId, message);
    if (!result) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({
      messageId: result.assistantMessage.id,
      reply: result.orchestration.reply,
      action: result.orchestration.action,
      shouldEscalate: result.orchestration.shouldEscalate,
    });
  } catch (err) {
    console.error("[support/message]", err);
    return NextResponse.json({ error: "Failed to process message" }, { status: 500 });
  }
}
