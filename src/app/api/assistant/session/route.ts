import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { emitAuditLog } from "@/lib/audit";
import { getGatewaySessionToken, getSession } from "@/lib/auth";
import { GatewayRequestError, workspaceGateway } from "@/lib/supabase-gateway";

const schema = z.object({
  consentGiven: z.boolean(),
  disclosureTextHash: z.string().min(1),
  profileId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
    }

    const { consentGiven, disclosureTextHash, profileId } = parsed.data;

    if (!consentGiven) {
      return NextResponse.json({ error: "Consent required" }, { status: 400 });
    }

    if (session.authSource === "supabase_gateway") {
      const token = await getGatewaySessionToken();
      if (!token) {
        return NextResponse.json({ error: "Gateway session required" }, { status: 401 });
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
      return NextResponse.json(result);
    }

    const aiRun = await db.aiRun.create({
      data: {
        profileId: profileId || session.userId,
        modelVersion: process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001",
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

    return NextResponse.json({ ok: true, sessionId: aiRun.id });
  } catch (error) {
    if (error instanceof GatewayRequestError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode },
      );
    }
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
