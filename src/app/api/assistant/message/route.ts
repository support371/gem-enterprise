import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { emitAuditLog } from "@/lib/audit";
import { getGatewaySessionToken, getSession } from "@/lib/auth";
import { generateGemSupportReply } from "@/lib/ai/gem-support-agent";
import { evaluatePolicy } from "@/lib/policy/evaluate-policy";
import { GatewayRequestError, workspaceGateway } from "@/lib/supabase-gateway";
import {
  assertSafeSupportInput,
  requireSameOriginSupportRequest,
  SupportSecurityError,
} from "@/lib/support/security";

const schema = z.object({
  sessionId: z.string().min(1).max(128),
  message: z.string().trim().min(1).max(2000),
});

function json(body: unknown, status = 200, headers?: Record<string, string>) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...headers },
  });
}

export async function POST(req: NextRequest) {
  try {
    requireSameOriginSupportRequest(req);
  } catch (error) {
    if (error instanceof SupportSecurityError) {
      return json({ error: error.message, code: error.code }, error.statusCode);
    }
    throw error;
  }

  const session = await getSession();
  if (!session) return json({ error: "Unauthorized" }, 401);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return json({ error: "Invalid request" }, 400);

  const { sessionId, message } = parsed.data;
  try {
    assertSafeSupportInput(message);
  } catch (error) {
    if (error instanceof SupportSecurityError) {
      return json({ error: error.message, code: error.code }, error.statusCode);
    }
    throw error;
  }
  const policy = evaluatePolicy(message);

  try {
    if (session.authSource === "supabase_gateway") {
      const token = await getGatewaySessionToken();
      if (!token) return json({ error: "Gateway session required" }, 401);
      await workspaceGateway("ai_message_event", token, {
        sessionId,
        messageLength: message.length,
        restricted: policy.shouldEscalate,
      });
    } else {
      const consent = await db.consentRecord.findFirst({
        where: { aiRunId: sessionId, userId: session.userId },
        select: { id: true },
      });
      if (!consent) return json({ error: "AI session not found" }, 404);
    }

    if (policy.shouldEscalate) {
      await emitAuditLog({
        action: "restricted_class_detected",
        resource: "ai_run",
        resourceId: sessionId,
        metadata: {
          messageLength: message.length,
          escalationReason: policy.escalationReason,
          restrictedClass: policy.restrictedClass,
        },
      });

      return json(
        {
          error: "This request requires human support.",
          escalate: true,
          queue: policy.queue,
          supportPath: "/app/support",
        },
        422,
      );
    }

    const reply = await generateGemSupportReply({
      message,
      history: [],
      userId: session.userId,
      userTier: session.role === "admin" || session.role === "internal" ? "vip" : "standard",
    });

    if (session.authSource !== "supabase_gateway") {
      await db.aiRun.update({
        where: { id: sessionId },
        data: {
          messageCount: { increment: 1 },
          outputStatus: "responded",
        },
      });
    }

    await emitAuditLog({
      action: "ai_message_sent",
      resource: "ai_run",
      resourceId: sessionId,
      metadata: {
        messageLength: message.length,
        responseSource: reply.source,
        providerStatus: reply.providerStatus,
      },
    });

    return json({
      text: reply.text,
      knowledgeLinks: reply.knowledgeLinks,
      responseSource: reply.source,
      providerStatus: reply.providerStatus,
    });
  } catch (error) {
    if (error instanceof GatewayRequestError) {
      return json({ error: error.message, code: error.code }, error.statusCode);
    }
    console.error("[assistant/message]", error);
    return json({ error: "Error processing message" }, 500);
  }
}
