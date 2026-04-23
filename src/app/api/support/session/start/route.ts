import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { startSupportSession } from "@/lib/support/start-session";

export async function POST(_request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { session: supportSession, isExisting } = await startSupportSession(session);

    return NextResponse.json({
      sessionId: supportSession.id,
      status: supportSession.status,
      requiresConsent: !supportSession.consentAccepted,
      isExisting,
    });
  } catch (err) {
    console.error("[support/session/start]", err);
    return NextResponse.json({ error: "Failed to start session" }, { status: 500 });
  }
}
