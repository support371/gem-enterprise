import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { supportStore } from "@/lib/support/store-instance";
import { z } from "zod";

const schema = z.object({
  sessionId: z.string().min(1),
  accepted: z.boolean(),
});

const GREETING =
  "Secure AI support session started. I can help with your account, organization workspace, requests, verification, products, GEM News, or a tracked human-support handoff.";

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  const auth = await getSession();
  if (!auth) {
    return json({ error: "Unauthorized" }, 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return json({ error: "Invalid request" }, 400);
  }

  const { sessionId, accepted } = parsed.data;
  const session = await supportStore.getSession(sessionId);

  if (!session || session.userId !== auth.userId) {
    return json({ error: "Session not found" }, 404);
  }

  if (!accepted) {
    await supportStore.closeSession(sessionId);
    return json({ success: false, greeting: "" });
  }

  await supportStore.updateSession(sessionId, {
    consentAccepted: true,
    consentAcceptedAt: new Date().toISOString(),
    status: "active",
  });

  return json({ success: true, greeting: GREETING });
}
