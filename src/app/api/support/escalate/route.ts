import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { supportStore } from "@/lib/support/store-instance";
import { escalateSession } from "@/lib/support/escalate-session";
import { z } from "zod";

const schema = z.object({
  sessionId: z.string().min(1).max(128),
  reason: z
    .enum([
      "user_requested",
      "policy_triggered",
      "incident_detected",
      "restricted_class",
      "billing_query",
      "consultation_request",
    ])
    .optional(),
});

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

  const { sessionId, reason } = parsed.data;
  const session = await supportStore.getSession(sessionId);

  if (!session || session.userId !== auth.userId) {
    return json({ error: "Session not found" }, 404);
  }

  if (session.status === "escalated" || session.status === "ticket_created") {
    return json({ error: "This support session is already assigned for human review." }, 409);
  }

  try {
    const result = await escalateSession(sessionId, reason ?? "user_requested");
    if (!result) {
      return json({ error: "Failed to escalate" }, 500);
    }

    return json({
      success: result.success,
      queue: result.queue,
      channel: result.handoffChannel,
      ticketId: result.ticketId,
      atlassianIssueKey: result.atlassianIssueKey,
      message:
        result.handoffChannel === "atlassian"
          ? `Your request was delivered to ${result.queue}. Review the Support Center for updates.`
          : `Your human-support request was recorded as a GEM case for ${result.queue}. Review the Support Center for updates.`,
    });
  } catch (err) {
    console.error("[support/escalate]", err);
    return json({ error: "Failed to escalate session" }, 500);
  }
}
