import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { supportStore } from "@/lib/support/store-instance";
import { escalateSession } from "@/lib/support/escalate-session";
import { z } from "zod";

const schema = z.object({
  sessionId: z.string().min(1),
  reason: z.string().optional(),
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

  const { sessionId } = parsed.data;
  const session = await supportStore.getSession(sessionId);

  if (!session || session.userId !== auth.userId) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  try {
    const result = await escalateSession(sessionId, "user_requested");
    if (!result) {
      return NextResponse.json({ error: "Failed to escalate" }, { status: 500 });
    }

    return NextResponse.json({
      success: result.success,
      queue: result.queue,
      atlassianIssueKey: result.atlassianIssueKey,
      message: `Your session has been escalated to ${result.queue}. An advisor will contact you shortly.`,
    });
  } catch (err) {
    console.error("[support/escalate]", err);
    return NextResponse.json({ error: "Failed to escalate session" }, { status: 500 });
  }
}
