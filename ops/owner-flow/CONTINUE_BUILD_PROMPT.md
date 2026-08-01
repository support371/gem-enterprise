# GEM Enterprise terminal coding-agent master prompt

Paste the prompt below into a coding agent running from the root of the existing `support371/gem-enterprise` repository.

```text
Work continuously in the existing support371/gem-enterprise repository until every repository-owned part of the GEM Enterprise social-content, video-production, provider-connection, scheduling, website-placement, governance, publishing, analytics, and service-automation flow is implemented, tested, documented, and ready for owner-controlled activation.

Do not create a second application, repository, content engine, OAuth store, credential store, scheduler, video pipeline, media registry, approval system, publishing queue, provider adapter framework, or analytics store. Extend the existing GEM Enterprise platform only.

Start by reading and obeying:
- AGENTS.md
- package.json
- vercel.json
- docs/social-media-command-center.md
- docs/free-local-video-service.md
- docs/VIDEO_RENDER_WORKER.md
- ops/video-render-worker/WINDOWS_ACTIVATION.md
- ops/owner-flow/README.md
- the current main branch
- every open pull request and review thread affecting social media, video, content orchestration, website media, provider connections, publishing, analytics, database reliability, deployment, claims, security, or public routes
- issues #237, #262, #263, and any newer issue that supersedes them

Determine the exact state from code, migrations, tests, database contracts, provider definitions, retained Vercel evidence, and approved source material. Never infer that an account is connected, a provider is approved, a worker is running, a migration is applied, or publishing is live merely because supporting code exists.

Continue this one governed system flow:
Observe → Plan → Create → Review → Render → Verify → Approve → Queue → Publish → Engage → Learn → Repeat.

Complete all repository-owned work required for the following.

CONTENT AND COMPANY SOURCE MATERIAL
- Use the canonical GEM service catalog and approved company source material as the source of truth.
- Generate unique daily content with no accidental historical duplication.
- Adapt content to current, genuinely observed intelligence and engagement evidence without presenting invented campaign copy as live market intelligence.
- Produce at least 20 unique TikTok drafts when TikTok is enabled.
- Produce platform-native TikTok, Facebook Page, Instagram Professional, X, Nextdoor, LinkedIn Company, and YouTube packages.
- Include Indeed only for a genuine approved vacancy with a vacancy identifier or a documented employer update.
- Store short-video and long-video scripts, scenes, narration, camera direction, human-presence requirements, disclosures, image and carousel briefs, captions, hashtags, calls to action, accessibility instructions, source evidence, unsupported-claim flags, security-sensitive flags, regulatory flags, media-rights checks, local-context checks, and publishing checklists.

WEBSITE AND COMMAND CENTER VIDEO
- Inspect every public and authenticated GEM route where a service explanation, onboarding explanation, security education item, campaign, product, case-study placeholder, application step, Content Studio item, or approved media preview should support video.
- Add video descriptions, governed placeholders, metadata, and components only where the current design and approved source material justify them.
- Never claim that a video exists until a verified media asset is registered and bound to the exact content version.
- Preserve private playback authorization, workspace isolation, no-store caching, checksum evidence, compliance evidence, approval evidence, and accessible captions or transcripts.

VIDEO PRODUCTION
- Use the existing worker-dispatch architecture and trusted private ComfyUI worker.
- Preserve durable render jobs, leases, bounded attempts, local journal recovery, deterministic client IDs, exact prompt/output binding, size limits, transfer timeouts, SHA-256 calculation, immutable private storage, server-side upload verification, recoverable finalization, fresh exact-version compliance review, and fresh separate-human approval.
- Keep large video bytes between the private worker and approved storage, not through Vercel functions.
- Do not implement real-person face or voice cloning without documented rights and explicit approval.
- Keep the complete negative-prompt and security policy intact.

SOCIAL ACCOUNT CONNECTIONS
- Keep TikTok inside the existing TokMetric OAuth and publishing-preflight module.
- Use the shared OAuth foundation for Meta, X, LinkedIn, YouTube, and Nextdoor.
- Preserve signed single-use state, PKCE where applicable, encrypted server-only token storage, provider account discovery, explicit destination selection, token health, refresh serialization, reauthorization, disconnect, revocation, and audit evidence.
- Support only Facebook Pages and Instagram Business or Creator accounts, never personal Facebook-profile automation.
- Require the authorized X company account.
- Require a company organization and appropriate product access for LinkedIn.
- Require an authorized channel or Brand Account and applicable project verification for YouTube.
- Require documented local context, an authorized identity, and Publish API evidence for Nextdoor.
- Never automatically select the first discovered account, page, organization, channel, or identity.

SCHEDULING AND PUBLISHING
- Preserve the daily orchestrator schedule and its idempotency.
- Ensure scheduled generation creates governed drafts and approval requests, not automatic external publications.
- Use the existing provider-neutral publishing queue and registered adapters.
- Require exact-version compliance evidence, approval by a different authorized operator, explicit healthy connector selection, required scopes, platform access evidence, emergency-lock checks, global and provider live gates, stable idempotency, atomic worker claims, bounded retries, dead-letter handling, sanitized provider evidence, external identifiers, timestamps, and analytics dimensions.
- Keep every live publishing gate false during implementation, tests, review, preview, and deployment verification.

ENGAGEMENT AND LEARNING
- Persist sanitized platform analytics and engagement evidence.
- Feed approved engagement evidence into future planning without leaking private account or audience data.
- Prevent analytics failures from changing publication evidence or silently duplicating content.
- Provide operator-visible status, retry, and audit evidence in the existing Command Center.

SECURITY, CLAIMS, AND GOVERNANCE
- Never place secrets in source, Git history, logs, browser data, URLs, prompts, ComfyUI workflows, content packages, provider response archives, screenshots, or documentation.
- Never bypass authentication, active-account checks, workspace access, permissions, requester/approver separation, compliance review, emergency locks, or provider certification.
- Do not publish unsupported guarantees, customer outcomes, statistics, regulatory certification, government approval, partnerships, response times, monitoring availability, or service activation status.
- Treat request-only or disabled services as request-only or disabled in every public and generated message.
- Require human approval for customer references, case studies, identifiable people, pricing, contractual commitments, incident commentary, regulatory statements, and synthetic realistic media.
- Keep all mutations authenticated, authorized, idempotent, audited, bounded, retry-safe, and fail closed.

IMPLEMENTATION METHOD
- Inspect code before proposing architecture.
- Continue the existing implementation directly; do not stop at analysis or a plan.
- Resolve every valid review finding through code and tests.
- Add migrations only when a durable data contract is required, with RLS/grant restrictions and rollback notes.
- Add focused tests for authorization, tenant isolation, idempotency, retries, partial failures, exact-version binding, claim scanning, provider restrictions, queue behavior, worker recovery, and no-external-write guarantees.
- Keep documentation aligned with the actual code and exact environment-variable names.
- Run the repository's schema checks, public-claims checks, lint, TypeScript, tests, and optimized Next.js build.
- Use the canonical Vercel preview as the hosted verification gate when GitHub Actions fails before a runner or step starts.
- Do not merge a branch with unresolved review threads, a failing exact-head canonical build, a hidden owner dependency represented as complete, or any enabled publishing gate.

OWNER-ONLY BOUNDARY
Do not fabricate or bypass these owner actions:
- provider developer-app creation and review;
- provider API product access or audit approval;
- entry of real client secrets into managed secret storage;
- social-account sign-in and OAuth consent;
- explicit Page, professional account, organization, channel, or Nextdoor identity selection;
- private ComfyUI model and workflow installation;
- dedicated private-storage credential creation;
- controlled production migration authorization;
- separate human content approval;
- provider-by-provider publishing certification and final live-gate authorization.

At completion, provide one exact activation report containing:
1. merged or proposed repository changes and pull requests;
2. exact-head verification results;
3. migrations still requiring owner authorization;
4. missing environment variables grouped by application, orchestrator, video worker, storage, and provider;
5. provider approvals still missing;
6. social accounts still requiring browser OAuth consent and explicit destination selection;
7. the controlled render → private upload → verify → exact-version finalization evidence cycle still required;
8. every publishing gate that remains false;
9. the exact Windows terminal command to run next;
10. the exact GEM Command Center pages to open next.

Do not end with general recommendations. Implement everything within repository authority, then report only verified results and unavoidable owner-controlled actions.
```

After repository-owned work is merged, the owner activation command is:

```powershell
Copy-Item ops\owner-flow\social-providers.example.json ops\owner-flow\social-providers.local.json
notepad ops\owner-flow\social-providers.local.json
ops\owner-flow\run-all-windows.cmd -Mode Full -StartWorker
```
