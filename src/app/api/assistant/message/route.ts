/**
 * POST /api/assistant/message
 *
 * Processes a single AI assistant message.
 * Runs restricted class detection before forwarding to the model.
 * If a restricted class is detected, the message is escalated — never
 * passed to the model and never shown to the user as a model response.
 *
 * Governance: Master Dossier §2, §7; ADR-003 (AI Interaction Policy)
 */

import { NextRequest, NextResponse } from 'next/server'

// ── Restricted class detection ────────────────────────────────────────────────
// These pattern sets are evaluated server-side to prevent client-side bypass.
// Source: ADR-003 §Response class restrictions

const RESTRICTED_CLASSES: Array<{ class: string; patterns: RegExp[] }> = [
  {
    class: 'LEGAL_ADVICE',
    patterns: [
      /\b(legal advice|you should sue|file a lawsuit|consult an attorney)\b/i,
      /\b(legal conclusion|legally required|legally liable)\b/i,
    ],
  },
  {
    class: 'FINANCIAL_ADVICE',
    patterns: [
      /\b(invest in|buy (this|that|the) (stock|fund|asset)|portfolio recommendation)\b/i,
      /\b(you should (sell|buy|hold)|market timing|guaranteed return)\b/i,
    ],
  },
  {
    class: 'SECURITY_CLOSURE',
    patterns: [
      /\b(breach (is|has been) contained|incident (is |has been )?closed|all clear|no (longer a )?threat)\b/i,
    ],
  },
  {
    class: 'IDENTITY_DETERMINATION',
    patterns: [
      /\b(identity (is |has been )?confirmed|verified identity|no fraud detected|identity mismatch)\b/i,
    ],
  },
]

function detectRestrictedClass(text: string): string | null {
  for (const rc of RESTRICTED_CLASSES) {
    if (rc.patterns.some(p => p.test(text))) return rc.class
  }
  return null
}

// ── Stub AI call ──────────────────────────────────────────────────────────────
// In production: replaced by adapter call to OpenAI / Azure AI Foundry
// Assumption: adapter wraps SDK, logs model version, pins model ID (ADR-005)

async function callAiModel(message: string, sessionId: string): Promise<string> {
  // Stub response — Sprint 4 wires real model
  await new Promise(r => setTimeout(r, 300))
  return `[AI stub] I received your message: "${message.slice(0, 60)}...". This will be answered by the live model once Sprint 4 integration is complete.`
}

// ── Handler ───────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { sessionId, message } = await req.json() as { sessionId: string; message: string }

    if (!sessionId || !message) {
      return NextResponse.json({ ok: false, error: 'sessionId and message are required.' }, { status: 400 })
    }

    // ── Restricted class check (ADR-003) ──────────────────────────────────────
    const restrictedClass = detectRestrictedClass(message)

    if (restrictedClass) {
      // Log escalation audit event
      console.info(JSON.stringify({
        _type:    'audit',
        actor:    'system',
        action:   'assistant.message.escalated',
        resource: `airun:${sessionId}`,
        outcome:  'escalated',
        metadata: { restrictedClass, messagePreview: message.slice(0, 80) },
        timestamp: new Date().toISOString(),
      }))

      // In production: update AiRun.escalationTriggered + create escalation case
      return NextResponse.json({
        ok: true,
        escalated: true,
        restrictedClass,
        response: null,
        escalationMessage: 'Your query requires a qualified human advisor. A case has been created and the appropriate team has been notified.',
      })
    }

    // ── Forward to model ──────────────────────────────────────────────────────
    const aiResponse = await callAiModel(message, sessionId)

    // Audit log — model call
    console.info(JSON.stringify({
      _type:     'audit',
      actor:     'system',
      action:    'assistant.message.responded',
      resource:  `airun:${sessionId}`,
      outcome:   'success',
      metadata:  { promptLength: message.length, responseLength: aiResponse.length },
      timestamp: new Date().toISOString(),
    }))

    return NextResponse.json({
      ok: true,
      escalated: false,
      response: aiResponse,
    })

  } catch (err) {
    return NextResponse.json(
      { ok: false, error: 'Message processing failed.' },
      { status: 500 }
    )
  }
}
