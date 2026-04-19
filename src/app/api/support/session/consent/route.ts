import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { supportStore } from "@/lib/support/store-instance";
import { z } from "zod";

const schema = z.object({
  sessionId: z.string().min(1),
  accepted: z.boolean(),
});

const GREETING =
  "Welcome to GEM Concierge. I'm your AI support assistant. How can I help you today? You can ask about your account, products, KYC status, or request to speak with a human advisor.";

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

  const { sessionId, accepted } = parsed.data;
  const session = await supportStore.getSession(sessionId);

  if (!session || session.userId !== auth.userId) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  if (!accepted) {
    await supportStore.closeSession(sessionId);
    return NextResponse.json({ success: false, greeting: "" });
  }

  await supportStore.updateSession(sessionId, {
    consentAccepted: true,
    consentAcceptedAt: new Date().toISOString(),
    status: "active",
  });

  return NextResponse.json({ success: true, greeting: GREETING });
}
