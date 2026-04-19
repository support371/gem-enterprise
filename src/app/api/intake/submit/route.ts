/**
 * POST /api/intake/submit
 *
 * Unified intake endpoint for all service domains.
 * Captures consent receipt, performs risk scoring, and creates
 * a case or lead record with full audit trail.
 *
 * Governance: Master Dossier §5 (Intake and triage)
 *             ADR-004 (Evidence and audit logging)
 *             Control C-011 (Consent capture)
 */

import { NextRequest, NextResponse } from 'next/server'

// ── Risk scoring ──────────────────────────────────────────────────────────────

type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

interface RiskScore {
  level: RiskLevel
  score: number        // 0–100
  factors: string[]
}

function scoreRisk(body: IntakeBody): RiskScore {
  let score = 0
  const factors: string[] = []

  // Domain risk weight
  const domainWeights: Record<string, number> = {
    cyber:     20,
    financial: 25,
    legal:     30,
    realty:    15,
    general:    5,
  }
  score += domainWeights[body.domain] ?? 5
  if (body.domain !== 'general') factors.push(`Regulated domain: ${body.domain}`)

  // PII indicators
  if (body.message?.toLowerCase().includes('social security') ||
      body.message?.toLowerCase().includes('passport') ||
      body.message?.toLowerCase().includes('bank account')) {
    score += 20
    factors.push('PII indicators in message')
  }

  // Urgency
  if (body.urgency === 'emergency') {
    score += 25
    factors.push('Self-reported emergency')
  } else if (body.urgency === 'urgent') {
    score += 10
    factors.push('Self-reported urgent')
  }

  // Financial threshold
  if (body.estimatedValue && body.estimatedValue > 100_000) {
    score += 15
    factors.push(`High-value transaction: $${body.estimatedValue.toLocaleString()}`)
  }

  const level: RiskLevel =
    score >= 70 ? 'critical' :
    score >= 45 ? 'high' :
    score >= 20 ? 'medium' : 'low'

  return { level, score: Math.min(score, 100), factors }
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface IntakeBody {
  // Service context
  domain:        'cyber' | 'financial' | 'realty' | 'legal' | 'general'
  serviceType?:  string   // e.g. 'incident_intake', 'property_advisory'

  // Contact
  name:          string
  email:         string
  phone?:        string

  // Request content
  subject:       string
  message:       string
  urgency?:      'low' | 'normal' | 'urgent' | 'emergency'
  estimatedValue?: number

  // Consent + compliance
  consentGiven:  boolean
  privacyAccepted: boolean
  jurisdiction?: string
  channelSource: 'web_form' | 'chat' | 'phone' | 'email'
}

// ── Handler ───────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const requestId = `INT-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`

  try {
    const body: IntakeBody = await req.json()

    // ── 1. Validate required fields ──────────────────────────────────────────
    const required: (keyof IntakeBody)[] = ['domain', 'name', 'email', 'subject', 'message', 'consentGiven', 'privacyAccepted', 'channelSource']
    for (const field of required) {
      if (!body[field] && body[field] !== false) {
        return NextResponse.json(
          { ok: false, error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // ── 2. Consent gate — non-negotiable (Control C-011) ────────────────────
    if (!body.consentGiven || !body.privacyAccepted) {
      return NextResponse.json(
        { ok: false, error: 'Consent and privacy acceptance are required before intake can proceed.' },
        { status: 422 }
      )
    }

    // ── 3. Risk scoring ──────────────────────────────────────────────────────
    const riskScore = scoreRisk(body)

    // ── 4. Determine routing ─────────────────────────────────────────────────
    const requiresEscalation = riskScore.level === 'critical' || riskScore.level === 'high' || body.urgency === 'emergency'
    const assignedQueue = requiresEscalation
      ? `escalation:${body.domain}`
      : `standard:${body.domain}`

    // ── 5. Build intake record ───────────────────────────────────────────────
    const caseId = `GEM-${Math.floor(2100 + Math.random() * 900)}`

    const intakeRecord = {
      requestId,
      caseId,
      domain:            body.domain,
      serviceType:       body.serviceType ?? 'general',
      contact: {
        name:  body.name,
        email: body.email,
        phone: body.phone ?? null,
      },
      subject:           body.subject,
      urgency:           body.urgency ?? 'normal',
      channelSource:     body.channelSource,
      jurisdiction:      body.jurisdiction ?? 'unspecified',
      riskScore,
      assignedQueue,
      requiresEscalation,
      consentReceipt: {
        consentGiven:    body.consentGiven,
        privacyAccepted: body.privacyAccepted,
        recordedAt:      new Date().toISOString(),
        // In production: FK to ConsentRecord table (Control C-011)
      },
      createdAt: new Date().toISOString(),
    }

    // ── 6. Emit audit log (ADR-004) ──────────────────────────────────────────
    // In production: call emitAuditLog() from src/lib/audit.ts
    // Stubbed here — full implementation in Sprint 5
    console.info(JSON.stringify({
      _type:     'audit',
      actor:     'system',
      action:    'intake.submitted',
      resource:  `case:${caseId}`,
      outcome:   'success',
      requestId,
      metadata: {
        domain:    body.domain,
        riskLevel: riskScore.level,
        riskScore: riskScore.score,
        escalated: requiresEscalation,
        channel:   body.channelSource,
      },
      timestamp: new Date().toISOString(),
    }))

    // ── 7. Emit evidence record (ADR-004, class: interaction) ────────────────
    // In production: call createEvidenceItem() from src/lib/evidence.ts
    // Stubbed here — full implementation in Sprint 5

    // ── 8. Trigger escalation notification if required ───────────────────────
    // In production: call comms-adapter to notify assigned queue
    // Stubbed here — full implementation in Sprint 5

    // ── 9. Return ────────────────────────────────────────────────────────────
    return NextResponse.json({
      ok: true,
      caseId,
      requestId,
      riskLevel: riskScore.level,
      requiresEscalation,
      assignedQueue,
      message: requiresEscalation
        ? 'Your request has been flagged for priority review. A team member will contact you within 1 hour.'
        : 'Your request has been received. A case has been created and you will hear from us within 24 hours.',
    }, { status: 201 })

  } catch (err) {
    // Audit log on failure
    console.error(JSON.stringify({
      _type:     'audit',
      actor:     'system',
      action:    'intake.submitted',
      resource:  `request:${requestId}`,
      outcome:   'failure',
      requestId,
      error:     String(err),
      timestamp: new Date().toISOString(),
    }))

    return NextResponse.json(
      { ok: false, error: 'Intake submission failed. Please try again or contact support directly.' },
      { status: 500 }
    )
  }
}
