# ADR-003 — AI Interaction Policy

**Date:** 2026-03-18
**Status:** Accepted
**Deciders:** Legal & compliance, platform architect
**Dossier ref:** Master Dossier §2 (non-negotiable principles), §7 (profile framework), Risk R1, R2, R6

## Context

The platform uses AI-assisted chat, summarization, and extraction. Master Dossier §2 mandates that AI must not independently finalize regulated judgments and must not materially deceive users about whether they are interacting with a person or a system.

## Decision

### Disclosure requirement

Every AI-assisted session must:

1. Display a visible disclosure notice before the first message is sent. Text (subject to legal review):

   > "You are interacting with an AI-assisted support system. This assistant can answer general questions and help you submit requests. It cannot provide legal, financial, or cybersecurity advice. A qualified human advisor will review any regulated matter."

2. The disclosure text is stored in `NEXT_PUBLIC_AI_DISCLOSURE_TEXT` env var so legal can update it without a code deploy.
3. Disclosure acceptance is recorded as a `ConsentRecord` with type `AI_SESSION` before any message is processed.

### Response class restrictions

The assistant must not produce a response in these restricted classes without triggering escalation:

- `LEGAL_ADVICE` — any output that could constitute legal counsel
- `FINANCIAL_ADVICE` — investment recommendations, tax guidance
- `SECURITY_CLOSURE` — confirming an incident is resolved
- `IDENTITY_DETERMINATION` — concluding identity mismatch or fraud

On restricted class detection, the assistant:
1. Stops generating.
2. Sends a canned escalation message to the user.
3. Creates a case (`GEM-XXXX`) with `escalation_reason = restricted_class`.
4. Notifies the assigned advisor.

### AiRun record

Every AI session emits an `AiRun` record containing:
- `sessionId`, `userId`, `modelVersion`, `promptClass`, `inputHash`, `outputStatus`
- `transcriptPointer` (storage path to full transcript)
- `escalationTriggered` (bool), `escalationReason`
- `consentReceiptId` (FK to ConsentRecord)

### Profile persona policy

AI-enabled support profiles must declare:
- `personaType: 'ai_assisted' | 'supervised_va' | 'hybrid_queue'`
- `disclosureTreatment`: what is shown to the user
- `approvedResponseClasses`: list of allowed response classes
- `escalationPath`: advisor ID or queue

No AI profile may claim to be a named human staff member.

## Consequences

- `AIChatWidget` component must not render the compose input until consent is captured.
- `POST /api/assistant/message` must run class detection before forwarding to AI model.
- Restricted class responses are never shown to the user — only the canned escalation message.
- Model version pinned and logged — prevents silent model upgrades changing behavior.
