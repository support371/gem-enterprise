/**
 * POST /api/assistant/session
 *
 * Opens a governed AI chat session.
 * Creates an AiRun record and ConsentRecord in the database before any message
 * is processed.
 *
 * Governance: Master Dossier §2, §7; ADR-003 (AI Interaction Policy)
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      profileId,
      consentGiven,
      disclosureTextHash,
    } = body as {
      profileId: string;
      consentGiven: boolean;
      disclosureTextHash: string;
    };

    // ── Consent gate (ADR-003) ───────────────────────────────────────────────
    if (!consentGiven) {
      return NextResponse.json(
        { ok: false, error: "AI session cannot start without disclosure acceptance." },
        { status: 422 }
      );
    }

    if (!disclosureTextHash) {
      return NextResponse.json(
        { ok: false, error: "Disclosure text hash required for audit trail." },
        { status: 400 }
      );
    }

    const resolvedProfileId = profileId ?? "PRF-005";
    const modelVersion = process.env.AI_MODEL_VERSION ?? "claude-haiku-4-5-20251001";
    const consentReceiptId = `CR-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

    // ── Persist AiRun + ConsentRecord (ADR-003) ──────────────────────────────
    const aiRun = await db.aiRun.create({
      data: {
        profileId: resolvedProfileId,
        modelVersion,
        promptClass: "GENERAL",
        consentReceiptId,
        disclosureTextHash,
        outputStatus: "open",
        consentRecord: {
          create: {
            disclosureTextHash,
            userId: null,
            ipAddress: req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? null,
            userAgent: req.headers.get("user-agent") ?? null,
          },
        },
      },
    });

    // ── Audit log ────────────────────────────────────────────────────────────
    await db.auditLog.create({
      data: {
        action: "ai_session_opened",
        resource: "ai_run",
        resourceId: aiRun.id,
        metadata: { profileId: resolvedProfileId, modelVersion },
        ipAddress: req.headers.get("x-forwarded-for") ?? null,
        userAgent: req.headers.get("user-agent") ?? null,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        sessionId: aiRun.id,
        profileId: resolvedProfileId,
        modelVersion,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[assistant/session]", err);
    return NextResponse.json({ ok: false, error: "Failed to open session." }, { status: 500 });
  }
}
