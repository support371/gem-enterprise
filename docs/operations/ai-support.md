# Governed AI Support Operations

## Runtime flow

```text
authenticated member
  -> AI disclosure and ConsentRecord
  -> persisted SupportSession consent
  -> deterministic policy evaluation
  -> restricted/human request: durable support handoff
  -> ordinary request: verified GEM knowledge retrieval
  -> Vercel AI Gateway ToolLoopAgent
  -> deterministic fallback on any provider failure
  -> explicit human request: durable support ticket and case conversation
  -> authorized staff claim, reply, status update, and resolution
```

The browser never receives a provider credential. The support widget sends only to authenticated same-origin GEM routes.

## Configuration

- `GEM_AI_PROVIDER_ENABLED=true` enables Gateway generation. Set it to `false` for a provider-free deterministic support mode.
- `GEM_AI_MODEL=openai/gpt-5.6-luna` pins the approved Gateway model. Do not change the identifier without checking the live Gateway model catalogue and rerunning exact-head validation.
- `NEXT_PUBLIC_AI_DISCLOSURE_TEXT` controls the disclosure displayed and hashed into the consent receipt.
- Vercel deployments should use project OIDC. A static `AI_GATEWAY_API_KEY` is an alternative only when stored in approved server-side secret storage; it must never use a `NEXT_PUBLIC_` name.
- Atlassian credentials are optional. If they are absent or the provider rejects a handoff, GEM creates a local support ticket rather than a fake external issue.

## Security boundaries

- Message length: 2,000 characters.
- Conversation context: eight prior user/assistant messages, each capped at 1,500 characters.
- Generation output: 500 tokens and 1,500 rendered characters.
- Per-session rate window: 12 user messages per five minutes.
- No private workspace records are retrieved for the model in this release.
- Gateway user attribution is pseudonymous.
- Passwords, one-time codes, tokens, private keys, seed phrases, complete payment-card data, and identity-document numbers must not be entered into chat.
- Credential-like values and valid payment-card numbers are rejected before model invocation or persistence.
- All assistant, ticket, escalation, and case-message mutations require an explicit same-origin browser request.
- Legal, financial, investment, tax, identity, fraud, and incident-closure decisions require human review.

## Readiness

Repository tests prove policy routing, deterministic fallback, route grounding, disclosure gating, and real local-ticket handoff behavior without calling a production model. Physical production acceptance additionally requires an authenticated smoke test and Gateway observability evidence from the canonical Vercel project.

## Human-support lifecycle

- A client may request human support directly from the assistant or open a case in `/app/support`.
- Every successful handoff returns a real local ticket ID or a real configured external issue key; the UI never fabricates agent presence.
- Clients open the case conversation from Support and receive recorded staff replies and status updates.
- Analysts, administrators, internal operators, and super administrators use `/app/support/operations` to review the queue, claim cases, reply, mark a case waiting on the client, and resolve it.
- Case conversations poll the durable server record on a bounded interval. Closing the browser does not erase the ticket or its messages.
- `open`, `in_progress`, `waiting_on_client`, `resolved`, and `closed` are factual case states. None of them implies a contractual response time.

## Rollback

Revert the AI-support release commit. Existing consent, `AiRun`, support-session, and support-ticket records remain valid audit evidence and must not be deleted as part of code rollback.
