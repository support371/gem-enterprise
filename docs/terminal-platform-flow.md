# GEM Enterprise Terminal Platform Flow

This runbook starts from the current canonical repository and uses the platform's existing systems of record. It does not create a second content engine, video pipeline, connector store, OAuth implementation, publishing queue, or social scheduler.

## What is already built

The current platform includes:

- the adaptive Content Orchestrator;
- daily cross-platform packages for TikTok, Facebook Page, Instagram Professional, X, Nextdoor, LinkedIn, and YouTube;
- Indeed restrictions for genuine vacancies and approved employer updates only;
- exact-version compliance review and separate human approval;
- duplicate-content fingerprint prevention;
- a minimum of 20 unique TikTok drafts when TikTok is enabled;
- a durable, trusted ComfyUI render-job and worker flow;
- verified media upload, checksum, storage-origin, and exact-job binding;
- the Content and Video Studio;
- the shared OAuth connector foundation for Meta, X, LinkedIn, YouTube, and Nextdoor;
- TikTok OAuth inside TokMetric;
- the provider-neutral governed publishing queue.

## What remains owner-controlled

A terminal process can validate and start the platform, but it cannot lawfully or technically complete these actions without the account owner:

1. Enter production database, storage, provider, and application secrets.
2. Apply the committed render-store migration to the intended database.
3. Install and operate the approved ComfyUI workflow on a private worker.
4. Complete each provider's developer-app review or API-access approval.
5. Sign in to each social platform and approve OAuth consent.
6. Select the correct Facebook Page, Instagram professional account, company organization, channel, or Nextdoor identity.
7. Approve final media and content through a different authorized GEM operator.
8. Enable live-publishing gates only after certification evidence exists.

The script never turns on live publishing or represents a provider approval as complete.

## One command

From the repository root:

```bash
node scripts/gem-platform-flow.mjs --all
```

This performs:

1. platform and environment audit;
2. locked dependency installation;
3. Prisma schema generation and validation;
4. claims, lint, TypeScript, and test verification;
5. trusted video-worker readiness check;
6. Next.js application startup;
7. continuous video-worker startup;
8. browser opening for Integrations, Social Media, Content Studio, and TokMetric.

It does **not** apply database migrations by default.

To apply committed migrations before startup:

```bash
node scripts/gem-platform-flow.mjs --all --migrate
```

Use `--migrate` only after confirming that `.env.local` points to the intended database and a backup or recovery path exists.

## First audit

Run this before adding provider credentials:

```bash
node scripts/gem-platform-flow.mjs --audit
```

For machine-readable output:

```bash
node scripts/gem-platform-flow.mjs --audit --json
```

The report separates:

- missing database and application configuration;
- scheduled orchestrator configuration;
- trusted video-worker configuration;
- provider credentials and scopes;
- platform approval evidence;
- human OAuth authorization;
- live-publishing gates.

## Required local environment

Copy the example file and fill real values without committing it:

### Windows PowerShell

```powershell
Copy-Item .env.example .env.local
notepad .env.local
```

### macOS or Linux

```bash
cp .env.example .env.local
${EDITOR:-nano} .env.local
```

At minimum, configure the relevant values from these groups.

### Application and database

```text
POSTGRES_PRISMA_URL
POSTGRES_URL_NON_POOLING
JWT_SECRET
NEXT_PUBLIC_APP_URL
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

### Scheduled daily content

```text
CONTENT_ORCHESTRATOR_WORKSPACE_ID
CONTENT_ORCHESTRATOR_ACTOR_ID
CONTENT_ORCHESTRATOR_CRON_SECRET
CONTENT_ORCHESTRATOR_NEXTDOOR_LOCAL_CONTEXT
CONTENT_ORCHESTRATOR_PROVIDERS
CONTENT_ORCHESTRATOR_MINIMUM_TIKTOK_ITEMS
CONTENT_ORCHESTRATOR_OTHER_PROVIDER_ITEMS
```

Recommended provider list:

```text
TIKTOK,FACEBOOK_PAGE,INSTAGRAM_PROFESSIONAL,X,NEXTDOOR
```

The minimum TikTok value must remain at least `20`.

### Trusted local video production

```text
COMFYUI_BASE_URL
COMFYUI_BEARER_TOKEN
COMFYUI_MAX_QUEUE_ITEMS
COMFYUI_WORKFLOW_JSON
COMFYUI_PROMPT_NODE_ID
COMFYUI_NEGATIVE_PROMPT_NODE_ID
COMFYUI_SEED_NODE_ID
COMFYUI_DEFAULT_NEGATIVE_PROMPT
VIDEO_RENDER_CALLBACK_SECRET
VIDEO_ASSET_ALLOWED_ORIGINS
VIDEO_WORKER_PLATFORM_BASE_URL
VIDEO_WORKER_CALLBACK_SECRET
VIDEO_WORKER_SUPABASE_URL
VIDEO_WORKER_SUPABASE_SERVICE_ROLE_KEY
VIDEO_WORKER_STORAGE_BUCKET
VIDEO_WORKER_STATE_DIR
```

The private worker must use the same callback secret expected by the platform. The exact worker variable names should be confirmed by `pnpm video:worker:check`, which fails closed and prints only redacted configuration.

### Shared OAuth security

```text
SOCIAL_TOKEN_ENCRYPTION_KEY
SOCIAL_OAUTH_STATE_SECRET
```

### TikTok / TokMetric

```text
TIKTOK_CLIENT_KEY
TIKTOK_CLIENT_SECRET
TIKTOK_REDIRECT_URI
TOKMETRIC_TOKEN_ENCRYPTION_KEY
TOKMETRIC_TIKTOK_OAUTH_ENABLED
```

### Meta: Facebook Page and Instagram Professional

```text
META_APP_ID
META_APP_SECRET
META_GRAPH_API_VERSION
META_SOCIAL_SCOPES
META_OAUTH_REDIRECT_URI
META_APP_REVIEW_APPROVED
META_SOCIAL_OAUTH_ENABLED
```

### X

```text
X_CLIENT_ID
X_CLIENT_SECRET
X_SOCIAL_SCOPES
X_OAUTH_REDIRECT_URI
X_SOCIAL_OAUTH_ENABLED
```

### LinkedIn Company

```text
LINKEDIN_CLIENT_ID
LINKEDIN_CLIENT_SECRET
LINKEDIN_SOCIAL_SCOPES
LINKEDIN_API_VERSION
LINKEDIN_OAUTH_REDIRECT_URI
LINKEDIN_COMMUNITY_MANAGEMENT_ACCESS_APPROVED
LINKEDIN_SOCIAL_OAUTH_ENABLED
```

### YouTube

```text
GOOGLE_SOCIAL_CLIENT_ID
GOOGLE_SOCIAL_CLIENT_SECRET
YOUTUBE_SOCIAL_SCOPES
YOUTUBE_OAUTH_REDIRECT_URI
YOUTUBE_DATA_API_AUDIT_APPROVED
YOUTUBE_SOCIAL_OAUTH_ENABLED
```

### Nextdoor

```text
NEXTDOOR_CLIENT_ID
NEXTDOOR_CLIENT_SECRET
NEXTDOOR_SOCIAL_SCOPES
NEXTDOOR_OAUTH_REDIRECT_URI
NEXTDOOR_PUBLISH_API_ACCESS_APPROVED
NEXTDOOR_OAUTH_ENABLED
CONTENT_ORCHESTRATOR_NEXTDOOR_LOCAL_CONTEXT
```

### Indeed

Indeed is not connected through generic social OAuth. Configure it only when GEM has a genuine approved vacancy or employer update:

```text
INDEED_EMPLOYER_ID
INDEED_JOB_FEED_URL
INDEED_EMPLOYER_INTEGRATION_ENABLED
```

## Account connection flow

After the application is running, sign in with an active approved administrator or authorized workspace operator.

Open:

```text
/app/command-center/social-media
```

Then authorize providers in this order:

1. TikTok through `/app/command-center/tokmetric`.
2. Meta and explicitly select the correct Facebook Page and Instagram professional account.
3. X company account.
4. LinkedIn company organization.
5. YouTube channel or Brand Account.
6. Nextdoor authorized identity or business page after Publish API approval.
7. Indeed only through the approved employer-feed workflow.

OAuth connection stores encrypted credentials and discovered destination accounts. It does not enable publishing.

## Daily content and video flow

Open:

```text
/app/command-center/social-media/content-studio
```

The operating sequence is:

```text
Observe → Plan → Create → Review → Render → Verify → Approve → Queue → Publish → Engage → Learn → Repeat
```

The system prepares video recipes, image/carousel briefs, captions, hashtags, calls to action, source evidence, risk flags, and publishing checklists. A passing exact-version review is required before rendering. The trusted worker renders, checksums, uploads, and verifies the result. GEM creates a new exact version containing the video and requires fresh human approval before a publishing job can be created.

## Publishing activation

Keep these false while configuring and testing:

```text
SOCIAL_MEDIA_LIVE_PUBLISHING_ENABLED=false
TOKMETRIC_LIVE_PUBLISHING_ENABLED=false
META_SOCIAL_PUBLISHING_ENABLED=false
X_SOCIAL_PUBLISHING_ENABLED=false
LINKEDIN_SOCIAL_PUBLISHING_ENABLED=false
YOUTUBE_PUBLISHING_ENABLED=false
NEXTDOOR_PUBLISHING_ENABLED=false
INDEED_JOB_PUBLISHING_ENABLED=false
```

Each provider gate may be enabled only after credentials, account authorization, scopes, platform approval, sandbox evidence, destination selection, audit review, and rollback readiness are verified for that provider.

## Terminal coding-agent master prompt

Use the following prompt from the repository root when a terminal coding agent is available:

```text
Work only in the existing support371/gem-enterprise repository. Do not create a second application, content engine, OAuth store, credential store, video pipeline, scheduler, or publishing queue.

First inspect AGENTS.md, package.json, docs/social-media-command-center.md, docs/free-local-video-service.md, the current main branch, open issues #262 and #263, and all current open pull requests that touch social media, video, content orchestration, deployment, database reliability, or provider certification.

Determine the exact implemented and remaining state from code and retained verification evidence. Do not infer that a provider is connected, approved, certified, or live merely because environment-variable support exists.

Continue the existing governed flow:
Observe → Plan → Create → Review → Render → Verify → Approve → Queue → Publish → Engage → Learn → Repeat.

Complete all repository-owned work needed for:
- daily unique content packages grounded in the approved GEM service catalog;
- TikTok, Facebook Page, Instagram Professional, X, Nextdoor, LinkedIn Company, and YouTube;
- Indeed only for genuine vacancies or approved employer updates;
- short video, long video, image, carousel, text, caption, hashtag, CTA, accessibility, source evidence, risk flags, and publishing checklists;
- the trusted private ComfyUI worker, durable render dispatch, checksum, immutable or versioned storage, upload verification, exact-job binding, atomic finalization, and fresh human approval;
- secure OAuth start/callback, signed state, PKCE where applicable, encrypted token storage, account discovery, explicit destination selection, health, refresh, disconnect, revocation, and audit evidence;
- the provider-neutral publishing worker with exact-version approval, compliance evidence, idempotency, emergency locks, retries, dead-letter handling, and sanitized provider results;
- the Content Studio, Social Media Command Center, Integrations, and TokMetric operator interfaces;
- a terminal audit and startup command through scripts/gem-platform-flow.mjs.

Preserve these constraints:
- no provider secret in source, logs, browser data, URLs, or response payloads;
- no auto-selection of the first social destination;
- no personal Facebook-profile automation;
- no Nextdoor content without documented local context;
- no Indeed marketing posts;
- no unsupported security, performance, regulatory, certification, partnership, customer, or outcome claims;
- no real-person face or voice generation without documented rights;
- no external publishing during tests or review;
- all publishing gates remain false until provider-specific owner approval and certification evidence exist;
- requester and approver must remain separate;
- every external mutation must be authenticated, authorized, idempotent, auditable, bounded, retry-safe, and fail closed.

Work directly through code, tests, migrations, documentation, and the existing Command Center. Resolve review findings instead of merely describing them. Run the repository's schema checks, public-claims check, lint, TypeScript, tests, and optimized Next.js build. Use the canonical Vercel preview as the hosted gate when GitHub Actions is blocked before runner startup.

Do not claim completion of owner-only actions. At the end, produce an exact activation report containing:
1. merged or proposed repository changes;
2. database migrations still requiring owner authorization;
3. environment variables still missing, grouped by subsystem and provider;
4. provider platform approvals still missing;
5. accounts still requiring human OAuth consent and destination selection;
6. one controlled video evidence cycle still required;
7. publishing gates that remain false;
8. the exact next terminal command and Command Center pages for the owner.
```
