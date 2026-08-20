import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { startSupportSession } from "@/lib/support/start-session";
import { requireSameOriginSupportRequest, SupportSecurityError } from "@/lib/support/security";

export async function POST(request: NextRequest) {
  try {
    requireSameOriginSupportRequest(request);
  } catch (error) {
    if (error instanceof SupportSecurityError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode, headers: { "Cache-Control": "no-store" } },
      );
    }
    throw error;
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }

  try {
    const { session: supportSession, isExisting } = await startSupportSession(session);

    return NextResponse.json({
      sessionId: supportSession.id,
      status: supportSession.status,
      requiresConsent: !supportSession.consentAccepted,
      isExisting,
      messages: isExisting
        ? supportSession.messages.slice(-12).map(({ id, role, content, timestamp }) => ({
            id,
            role,
            text: content,
            timestamp,
          }))
        : [],
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[support/session/start]", err);
    return NextResponse.json({ error: "Failed to start session" }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
