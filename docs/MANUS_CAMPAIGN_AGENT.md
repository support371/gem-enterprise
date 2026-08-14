# GEM Manus Campaign Agent

## Purpose

The Manus Campaign Agent is an administrator-only, draft-generation integration for GEM Enterprise. It converts a bounded campaign brief into a structured campaign package containing email copy, landing-page copy, social variants, compliance findings, disclosures, prohibited-claim findings, and measurement recommendations.

The integration does **not** send email, publish social content, spend advertising funds, contact prospects, create provider accounts, or bypass GEM approval controls.

## Routes

- UI: `/app/admin/campaigns/manus`
- Create private Manus task: `POST /api/admin/manus/campaigns`
- Poll structured result: `GET /api/admin/manus/tasks/{taskId}`
- Save selected email output as an unapproved GEM draft: existing `POST /api/admin/campaigns`

## Required Manus configuration

Create an API key in Manus Open API settings. Store it only as a server-side deployment secret.

```dotenv
MANUS_API_KEY=

# Both must remain false unless the owner has explicitly approved creating
# external Manus tasks and confirmed the account's billing exposure.
MANUS_TASK_CREATION_ENABLED=false
MANUS_BILLING_APPROVED=false
```

Optional settings:

```dotenv
# Optional Manus project containing shared GEM instructions/knowledge.
MANUS_PROJECT_ID=

# The integration is pinned to the conservative manus-1.6-lite profile.
```

Never create a `NEXT_PUBLIC_MANUS_API_KEY` variable and never place a Manus key in source code, browser storage, client components, screenshots, or GitHub.

## Immediate Vercel setup

1. Open the canonical GEM Enterprise Vercel project.
2. Go to **Settings → Environment Variables**.
3. Add `MANUS_API_KEY` only after the owner has reviewed the current provider terms and account billing state.
4. Optionally add `MANUS_PROJECT_ID`.
5. Keep `MANUS_TASK_CREATION_ENABLED=false` and `MANUS_BILLING_APPROVED=false` until the owner explicitly approves both gates.
6. Redeploy the exact reviewed commit.
7. Sign in with an active GEM administrator account.
8. Confirm task creation fails closed while either approval gate is false.
9. After explicit owner approval, enable both gates and submit one controlled test brief.
10. Confirm that the private Manus task completes and returns structured output.
11. Save the output as a GEM draft and verify that no send or publishing action occurred.

## Recommended Manus project instructions

Create a private Manus project named `GEM Enterprise Campaign Operations` and use the following shared instruction:

```text
You are the governed campaign-production agent for GEM Cybersecurity & Monitoring Assist and gemcybersecurityassist.com.

Produce research and draft campaign assets only. Never send email, publish content, buy advertising, contact prospects, create accounts, or perform external actions. Use permission-based marketing. Do not use scraped, purchased, or non-consensual contact lists. Do not invent licences, certifications, partnerships, customer counts, guarantees, savings, regulatory status, or security outcomes. Do not expose credentials, client data, private architecture, operational security details, or confidential information.

Use a professional enterprise tone. Avoid fear-based manipulation, spam wording, deceptive urgency, and unsupported superlatives. Direct calls to action toward requesting access, booking a consultation, contacting GEM, or beginning an eligibility review. Identify claims that require evidence, legal review, compliance review, or human verification.
```

Set the resulting Manus project identifier as `MANUS_PROJECT_ID`.

## Verification checklist

- Administrator authentication is required.
- Task creation rejects cross-origin POST requests.
- External task creation remains disabled unless both owner-controlled approval gates are true.
- The Manus key is never returned to the browser.
- Manus tasks use `share_visibility: private`.
- Interactive mode is disabled for unattended task execution.
- Structured output is validated by GEM before display.
- Generated output is labelled and handled as an unapproved draft.
- Saving creates a draft campaign only.
- No email send, provider publish, ad purchase, or prospect contact occurs.
- A durable, quota-counted reservation is recorded before the provider call.
- Audit metadata truthfully records successful Manus task creation with `externalActionTaken: true`.
- Polling is restricted to task identifiers reserved by the current administrator.

## Rollback

Set `MANUS_TASK_CREATION_ENABLED=false` and `MANUS_BILLING_APPROVED=false`, then remove the Manus API key and revert the integration commit. Either disabled gate fails closed before a provider task can be created.
