import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { emitAuditLog } from "@/lib/audit";
import { getSession } from "@/lib/auth";

async function generateAIReply(
  message: string,
  history: { role: string; content: string }[]
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return generateFallbackReply(message);
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001",
        max_tokens: 512,
        system: `You are GEM Concierge, the AI support assistant for GEM Enterprise — an institutional-grade cybersecurity, financial security, and real estate protection platform.
You assist verified, authenticated clients with account inquiries, product questions, and support needs.
Be concise, professional, and helpful. Do not invent policies. If uncertain, offer to connect the client with a human advisor.
Keep responses to 2-4 sentences unless detail is specifically required.`,
        messages: [
          ...history.map((h) => ({ role: h.role as "user" | "assistant", content: h.content })),
          { role: "user", content: message },
        ],
      }),
    });

    if (!response.ok) {
      return generateFallbackReply(message);
    }

    const data = await response.json();
    return data?.content?.[0]?.text ?? generateFallbackReply(message);
  } catch {
    return generateFallbackReply(message);
  }
}

function generateFallbackReply(message: string): string {
  const msg = message.toLowerCase();

  if (msg.includes("password") || msg.includes("login") || msg.includes("access")) {
    return "For account access issues, I recommend visiting your Security settings or using the password reset flow on the login page. If you continue to have trouble, I can connect you with a human advisor.";
  }
  if (msg.includes("kyc") || msg.includes("verif") || msg.includes("document")) {
    return "Your KYC status and submitted documents can be reviewed in the KYC Status page. If your application is under review, you'll be notified when a decision is reached.";
  }
  if (msg.includes("portfolio") || msg.includes("allocation")) {
    return "Portfolio details including holdings and allocations are available in the Portfolios section of your dashboard. For specific allocation changes, please submit a service request.";
  }
  if (msg.includes("thank")) {
    return "You're welcome. Is there anything else I can help you with today?";
  }

  return "Thank you for your message. I'm here to help with your GEM Enterprise account, products, and services. Could you provide a bit more detail about what you need assistance with?";
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { sessionId, message } = await req.json();

    if (!sessionId || !message) {
      return NextResponse.json({ error: "sessionId and message are required" }, { status: 400 });
    }

    // Restricted class detection (ADR-003)
    const isRestricted = /legal|financial|advice/i.test(message);

    if (isRestricted) {
      await emitAuditLog({
        action: "restricted_class_detected",
        resource: "ai_run",
        resourceId: sessionId,
        metadata: { message },
      });

      return NextResponse.json(
        { error: "Restricted content detected", escalate: true },
        { status: 422 }
      );
    }

    await emitAuditLog({
      action: "ai_message_sent",
      resource: "ai_run",
      resourceId: sessionId,
      metadata: { messageLength: message.length },
    });

    // Increment message count on the AiRun record
    await db.aiRun.update({
      where: { id: sessionId },
      data: { messageCount: { increment: 1 } },
    }).catch(() => {
      // Non-fatal: session may be from a different flow
    });

    const reply = await generateAIReply(message, []);

    return NextResponse.json({ text: reply });
  } catch (error) {
    return NextResponse.json({ error: "Error processing message" }, { status: 500 });
  }
}
