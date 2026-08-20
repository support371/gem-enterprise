import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { emitAuditLog } from "@/lib/audit";
import { getGatewaySessionToken, getSession } from "@/lib/auth";
import { GatewayRequestError, workspaceGateway } from "@/lib/supabase-gateway";
import { DEFAULT_GEM_AI_MODEL } from "@/lib/ai/gem-support-agent";
import { requireSameOriginSupportRequest, SupportSecurityError } from "@/lib/support/security";

const schema = z.object({
  consentGiven: z.boolean(),
  disclosureTextHash: z.string().regex(/^[0-9a-f]{64}$/i),
  profileId: z.string().trim().min(1).max(128).optional(),
});

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
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
  if (!session) {
    return json({ error: "Unauthorized" }, 401);
  }

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return json({ error: "Invalid request", details: parsed.error.flatten() }, 400);
    }

    const { consentGiven, disclosureTextHash, profileId } = parsed.data;

    if (!consentGiven) {
      return json({ error: "Consent required" }, 400);
    }

    if (session.authSource === "supabase_gateway") {
      const token = await getGatewaySessionToken();
      if (!token) {
        return json({ error: "Gateway session required" }, 401);
      }
      const result = await workspaceGateway<{ ok: true; sessionId: string }>(
        "ai_session",
        token,
        {
          profileId: profileId || session.userId,
          disclosureTextHash,
          ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
          userAgent: req.headers.get("user-agent") || undefined,
        },
      );
      return json(result);
    }

    const aiRun = await db.aiRun.create({
      data: {
        profileId: profileId || session.userId,
        modelVersion: process.env.GEM_AI_MODEL ?? DEFAULT_GEM_AI_MODEL,
        consentReceiptId: `CR-${Date.now()}`,
        disclosureTextHash,
        consentRecord: {
          create: {
            disclosureTextHash,
            userId: session.userId,
            ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
            userAgent: req.headers.get("user-agent") || undefined,
          },
        },
      },
    });

    await emitAuditLog({
      action: "ai_session_opened",
      resource: "ai_run",
      resourceId: aiRun.id,
      metadata: { profileId: aiRun.profileId, disclosureTextHash },
    });

    return json({ ok: true, sessionId: aiRun.id });
  } catch (error) {
    if (error instanceof GatewayRequestError) {
      return json({ error: error.message, code: error.code }, error.statusCode);
    }
    console.error(error);
    return json({ error: "Internal server error" }, 500);
  }
}
