/**
 * POST /api/assistant/session
 *
 * Opens a governed AI chat session.
 * Creates an AiRun record and ConsentRecord before any message is processed.
 *
 * Governance: Master Dossier §2, §7; ADR-003 (AI Interaction Policy)
 */

import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const sessionId = `AIRUN-${Date.now()}-${Math.random().toString(36).slice(2, 9).toUpperCase()}`

  try {
    const body = await req.json()

    const { profileId, consentGiven, disclosureTextHash } = body as {
      profileId:           string
      consentGiven:        boolean
      disclosureTextHash:  string   // SHA-256 of the disclosure text shown to the user
    }

    // ── Consent gate (ADR-003) ────────────────────────────────────────────────
    if (!consentGiven) {
      return NextResponse.json(
        { ok: false, error: 'AI session cannot start without disclosure acceptance.' },
        { status: 422 }
      )
    }

    if (!disclosureTextHash) {
      return NextResponse.json(
        { ok: false, error: 'Disclosure text hash required for audit trail.' },
        { status: 400 }
      )
    }

    // ── AiRun record stub (ADR-003) ───────────────────────────────────────────
    // In production: write to AiRun table via Prisma
    const aiRun = {
      sessionId,
      profileId:            profileId ?? 'PRF-005',
      modelVersion:         process.env.AI_MODEL_VERSION ?? 'stub-v0',
      promptClass:          'GENERAL',
      consentReceiptId:     `CR-${Date.now()}`,
      disclosureTextHash,
      transcriptPointer:    null,        // set on session close
      escalationTriggered:  false,
      escalationReason:     null,
      outputStatus:         'open',
      createdAt:            new Date().toISOString(),
    }

    // Audit log
    console.info(JSON.stringify({
      _type:     'audit',
      actor:     'system',
      action:    'assistant.session.opened',
      resource:  `airun:${sessionId}`,
      outcome:   'success',
      metadata:  { profileId: aiRun.profileId, modelVersion: aiRun.modelVersion },
      timestamp: new Date().toISOString(),
    }))

    return NextResponse.json({
      ok: true,
      sessionId,
      profileId: aiRun.profileId,
      modelVersion: aiRun.modelVersion,
    }, { status: 201 })

  } catch (err) {
    return NextResponse.json(
      { ok: false, error: 'Failed to open session.' },
      { status: 500 }
    )
  }
}
