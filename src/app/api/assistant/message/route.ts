/**
 * POST /api/assistant/message
 *
 * Processes a single AI assistant message.
 * Runs restricted class detection before forwarding to the model.
 * If a restricted class is detected the message is escalated — never passed
 * to the model — and an AiEscalationEvent is persisted.
 *
 * Governance: Master Dossier §2, §7; ADR-003 (AI Interaction Policy)
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// ── Restricted class detection ─────────────────────────────────────────────────
// Evaluated server-side to prevent client-side bypass. Source: ADR-003.

const RESTRICTED_CLASSES: Array<{ class: string; patterns: RegExp[] }> = [
  {
    class: "LEGAL_ADVICE",
    patterns: [
      /\b(legal advice|you should sue|file a lawsuit|consult an attorney)\b/i,
      /\b(legal conclusion|legally required|legally liable)\b/i,
    ],
  },
  {
    class: "FINANCIAL_ADVICE",
    patterns: [
      /\b(invest in|buy (this|that|the) (stock|fund|asset)|portfolio recommendation)\b/i,
      /\b(you should (sell|buy|hold)|market timing|guaranteed return)\b/i,
    ],
  },
  {
    class: "SECURITY_CLOSURE",
    patterns: [
      /\b(breach (is|has been) contained|incident (is |has been )?closed|all clear|no (longer a )?threat)\b/i,
    ],
  },
  {
    class: "IDENTITY_DETERMINATION",
    patterns: [
      /\b(identity (is |has been )?confirmed|verified identity|no fraud detected|identity mismatch)\b/i,
    ],
  },
];

function detectRestrictedClass(text: string): string | null {
  for (const rc of RESTRICTED_CLASSES) {
    if (rc.patterns.some((p) => p.test(text))) return rc.class;
  }
  return null;
}

// ── Real AI model call via Anthropic API ──────────────────────────────────────

async function callAiModel(
  message: string,
  history: { role: "user" | "assistant"; content: string }[]
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return generateFallbackReply(message);
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system: `You are GEM Concierge, the AI support assistant for GEM Enterprise — an institutional-grade cybersecurity, financial security, and real estate protection platform.
You assist verified, authenticated clients with account inquiries, product questions, and support needs.
Be concise, professional, and helpful. Do not invent policies. If uncertain, offer to connect the client with a human advisor.
Keep responses to 2-4 sentences unless detail is specifically required.
Never provide legal advice, investment advice, security incident determinations, or identity verification conclusions.`,
      messages: [
        ...history,
        { role: "user" as const, content: message },
      ],
    }),
  });

  if (!response.ok) {
    return generateFallbackReply(message);
  }

  const data = await response.json();
  return data?.content?.[0]?.text ?? generateFallbackReply(message);
}

function generateFallbackReply(message: string): string {
  const msg = message.toLowerCase();
  if (msg.includes("password") || msg.includes("login") || msg.includes("access")) {
    return "For account access issues, visit your Security settings or use the password reset flow on the login page. If you continue to have trouble, I can connect you with a human advisor.";
  }
  if (msg.includes("kyc") || msg.includes("verif") || msg.includes("document")) {
    return "Your KYC status and submitted documents are in the KYC Status page. If your application is under review, you'll be notified by email when a decision is reached.";
  }
  if (msg.includes("portfolio") || msg.includes("allocation")) {
    return "Portfolio details including holdings and allocations are available in the Portfolios section of your dashboard. For allocation changes, please submit a service request.";
  }
  if (msg.includes("report") || msg.includes("statement")) {
    return "Account statements and compliance reports are available in the Documents section of your portal. If you need a specific report, I can help you submit a request.";
  }
  if (msg.includes("thank")) {
    return "You're welcome. Is there anything else I can help you with today?";
  }
  return "Thank you for your message. I'm here to help with your GEM Enterprise account, products, and services. Could you provide more detail about what you need?";
}

// ── Handler ───────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { sessionId, message, history } = (await req.json()) as {
      sessionId: string;
      message: string;
      history?: { role: "user" | "assistant"; content: string }[];
    };

    if (!sessionId || !message) {
      return NextResponse.json(
        { ok: false, error: "sessionId and message are required." },
        { status: 400 }
      );
    }

    // ── Verify session exists ──────────────────────────────────────────────────
    const aiRun = await db.aiRun.findUnique({ where: { id: sessionId } });
    if (!aiRun) {
      return NextResponse.json(
        { ok: false, error: "Session not found. Start a new session." },
        { status: 404 }
      );
    }

    if (aiRun.outputStatus === "escalated") {
      return NextResponse.json(
        { ok: false, error: "Session has been escalated. A human advisor will be in touch." },
        { status: 409 }
      );
    }

    // ── Restricted class check (ADR-003) ──────────────────────────────────────
    const restrictedClass = detectRestrictedClass(message);

    if (restrictedClass) {
      // Persist escalation event
      await db.aiEscalationEvent.create({
        data: {
          aiRunId: sessionId,
          restrictedClass,
          messagePreview: message.slice(0, 120),
        },
      });

      // Update AiRun to escalated
      await db.aiRun.update({
        where: { id: sessionId },
        data: { escalationTriggered: true, escalationReason: restrictedClass, outputStatus: "escalated" },
      });

      // Audit log
      await db.auditLog.create({
        data: {
          action: "ai_message_escalated",
          resource: "ai_run",
          resourceId: sessionId,
          metadata: { restrictedClass, messagePreview: message.slice(0, 80) },
        },
      });

      return NextResponse.json({
        ok: true,
        escalated: true,
        restrictedClass,
        response: null,
        escalationMessage:
          "Your query requires a qualified human advisor. A case has been created and the appropriate team has been notified.",
      });
    }

    // ── Forward to AI model ────────────────────────────────────────────────────
    const safeHistory = (history ?? []).slice(-10);
    const aiResponse = await callAiModel(message, safeHistory);

    // Increment message count + persist
    await db.aiRun.update({
      where: { id: sessionId },
      data: { messageCount: { increment: 1 } },
    });

    // Audit log
    await db.auditLog.create({
      data: {
        action: "ai_message_responded",
        resource: "ai_run",
        resourceId: sessionId,
        metadata: { promptLength: message.length, responseLength: aiResponse.length },
      },
    });

    return NextResponse.json({ ok: true, escalated: false, response: aiResponse });
  } catch (err) {
    console.error("[assistant/message]", err);
    return NextResponse.json(
      { ok: false, error: "Message processing failed." },
      { status: 500 }
    );
  }
}
