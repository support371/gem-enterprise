# GEM Enterprise Terminal Platform Flow

This runbook operates the existing `support371/gem-enterprise` platform. It does not create a second content engine, OAuth store, credential store, video pipeline, social scheduler, or publishing queue.

## Current implementation

The repository already contains:

- adaptive daily content orchestration;
- approved GEM service-catalog grounding;
- historical fingerprint checks to prevent repeated content;
- at least 20 unique TikTok drafts when TikTok is enabled;
- platform-native packages for TikTok, Facebook Page, Instagram Professional, X, Nextdoor, LinkedIn Company, and YouTube;
- Indeed restrictions for genuine vacancies and approved employer updates only;
- video recipes, image/carousel briefs, captions, hashtags, calls to action, source evidence, risk flags, and publishing checklists;
- exact-version compliance review and separate human approval;
- shared OAuth connection management for Meta, X, LinkedIn, YouTube, and Nextdoor;
- TikTok OAuth inside TokMetric;
- durable worker-dispatch video production through private ComfyUI;
- verified private-storage uploads, SHA-256 evidence, exact-job binding, and automatic finalization into a fresh approval request;
- the provider-neutral governed publishing queue.

## Owner-controlled work that no terminal script can bypass

The owner must still:

1. supply real database, storage, application, and provider credentials;
2. apply the committed video migrations to the intended database;
3. install the approved ComfyUI workflow and model dependencies on the private worker;
4. complete provider developer-app review or API-access approval;
5. sign in to each social platform and grant OAuth consent;
6. select the correct Page, professional account, organization, channel, or Nextdoor identity;
7. approve final media through a different authorized GEM operator;
8. enable each publishing gate only after provider certification evidence exists.

The terminal flow never turns on publishing gates, invents platform approval, or bypasses human consent.

## First command: audit

From the repository root:

```bash
node scripts/gem-platform-flow.mjs --audit
```

Machine-readable output:

```bash
node scripts/gem-platform-flow.mjs --audit --json
```

The audit reports repository surfaces, database/application readiness, scheduled orchestration, application video dispatch, private worker readiness, provider credentials, platform approvals, OAuth readiness, and publishing gates. It never prints secret values.

## Full local command

After `.env.local` and the private worker environment are configured:

```bash
node scripts/gem-platform-flow.mjs --all
```

This command:

1. audits the platform;
2. installs locked dependencies;
3. generates and validates Prisma;
4. runs claims, lint, TypeScript, and tests;
5. checks the trusted video worker;
6. starts Next.js;
7. starts the continuous render worker;
8. opens Integrations, Social Media, Content Studio, and TokMetric.

It does **not** apply database migrations by default.

To apply committed migrations before startup:

```bash
node scripts/gem-platform-flow.mjs --all --migrate
```

Use `--migrate` only after verifying the target database and recovery path.

## Environment templates

Application and provider template:

```text
config/gem-social-video.env.example
```

Dedicated worker template:

```text
ops/video-render-worker/worker.env.example
```

Never commit real credentials.

### Application and database

```text
POSTGRES_PRISMA_URL
POSTGRES_URL_NON_POOLING
JWT_SECRET
NEXT_PUBLIC_APP_URL
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

### Scheduled content orchestration

```text
CONTENT_ORCHESTRATOR_WORKSPACE_ID
CONTENT_ORCHESTRATOR_ACTOR_ID
CONTENT_ORCHESTRATOR_CRON_SECRET
CONTENT_ORCHESTRATOR_PROVIDERS
CONTENT_ORCHESTRATOR_NEXTDOOR_LOCAL_CONTEXT
CONTENT_ORCHESTRATOR_MINIMUM_TIKTOK_ITEMS
CONTENT_ORCHESTRATOR_OTHER_PROVIDER_ITEMS
```

Recommended providers:

```text
TIKTOK,FACEBOOK_PAGE,INSTAGRAM_PROFESSIONAL,X,NEXTDOOR
```

The TikTok minimum must remain at least `20`.

### Canonical application video dispatch

```text
VIDEO_RENDER_DISPATCH_MODE=worker
COMFYUI_WORKFLOW_JSON
COMFYUI_PROMPT_NODE_ID
COMFYUI_NEGATIVE_PROMPT_NODE_ID
COMFYUI_SEED_NODE_ID
COMFYUI_DEFAULT_NEGATIVE_PROMPT
VIDEO_RENDER_CALLBACK_SECRET
VIDEO_RENDER_STORAGE_URL
VIDEO_RENDER_STORAGE_KEY
VIDEO_RENDER_STORAGE_AUTH_ORIGIN
VIDEO_ASSET_ALLOWED_ORIGINS
```

The Vercel application does not need access to private ComfyUI when worker mode is used.

### Trusted private worker

```text
GEM_VIDEO_WORKER_API_URL
VIDEO_RENDER_CALLBACK_SECRET
COMFYUI_BASE_URL
COMFYUI_BEARER_TOKEN
VIDEO_RENDER_STORAGE_URL
VIDEO_RENDER_STORAGE_KEY
VIDEO_RENDER_STORAGE_BUCKET
VIDEO_RENDER_STORAGE_PREFIX
VIDEO_RENDER_WORKER_STATE_DIR
VIDEO_RENDER_WORKER_BATCH_SIZE
VIDEO_RENDER_WORKER_DISPATCH_LEASE_MS
VIDEO_RENDER_WORKER_POLL_MS
VIDEO_RENDER_WORKER_TIMEOUT_MS
VIDEO_RENDER_WORKER_TRANSFER_TIMEOUT_MS
VIDEO_RENDER_MAX_FILE_BYTES
```

The worker and application must share the managed callback secret. Run:

```bash
pnpm video:worker:check
```

The check fails closed when the job feed, migrations, journal directory, ComfyUI, private bucket, or callback configuration is unavailable.

## Social account connection

After the application is running, sign in with an active approved administrator or authorized workspace operator. The terminal flow opens:

```text
/app/command-center/integrations
/app/command-center/social-media
/app/command-center/social-media/content-studio
/app/command-center/tokmetric
```

Authorize in this order:

1. TikTok through TokMetric.
2. Meta, then explicitly select the Facebook Page and Instagram professional account.
3. X company account.
4. LinkedIn company organization.
5. YouTube channel or Brand Account.
6. Nextdoor identity or business page after Publish API approval.
7. Indeed only through the employer-feed workflow for a genuine vacancy or approved employer update.

OAuth stores encrypted credentials and discovered destinations. It does not authorize publishing.

## Daily operating flow

```text
Observe → Plan → Create → Review → Render → Verify → Approve → Queue → Publish → Engage → Learn → Repeat
```

In Content Studio, generate or load the daily plan, produce the eligible video set, allow the trusted worker to render and verify outputs, and obtain fresh exact-version approval. Only then may a separately governed publishing job be created for an explicitly selected healthy connector.

## Publishing gates

Keep all gates false during setup and certification:

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

A provider gate may be enabled only after credentials, scopes, platform approval, OAuth authorization, destination selection, sandbox evidence, audit review, and rollback readiness are verified for that provider.

## Terminal coding-agent master prompt

```text
Work only in the existing support371/gem-enterprise repository. Do not create a second application, content engine, OAuth store, credential store, video pipeline, scheduler, or publishing queue.

Inspect AGENTS.md, package.json, docs/social-media-command-center.md, docs/free-local-video-service.md, docs/VIDEO_RENDER_WORKER.md, the current main branch, open issues #262 and #263, and every open pull request touching social media, video, content orchestration, provider certification, database reliability, deployment, or public website video placement.

Determine the exact implemented and remaining state from code, migrations, tests, retained Vercel evidence, and provider evidence. Do not infer that a provider is connected, approved, certified, or live merely because configuration support exists.

Continue the existing governed flow:
Observe → Plan → Create → Review → Render → Verify → Approve → Queue → Publish → Engage → Learn → Repeat.

Complete all repository-owned work needed for:
- unique daily packages grounded in the approved GEM service catalog;
- TikTok, Facebook Page, Instagram Professional, X, Nextdoor, LinkedIn Company, and YouTube;
- Indeed only for genuine vacancies or approved employer updates;
- short and long video, image, carousel, text, captions, hashtags, CTAs, accessibility, source evidence, risk flags, and publishing checklists;
- appropriate governed video descriptions and placements across public and authenticated GEM pages without claiming that a render exists before verified media is registered;
- private worker-dispatch ComfyUI production, durable leasing, local journal recovery, exact output binding, bounded transfer, SHA-256, private versioned or immutable storage, upload verification, automatic finalization, and fresh human approval;
- secure OAuth start/callback, signed state, PKCE where applicable, encrypted token storage, account discovery, explicit destination selection, health, refresh, disconnect, revocation, and audit evidence;
- the provider-neutral publishing worker with exact-version approval, compliance evidence, idempotency, emergency locks, retries, dead-letter handling, and sanitized provider results;
- Content Studio, Social Media Command Center, Integrations, TokMetric, and scripts/gem-platform-flow.mjs.

Preserve these constraints:
- no secret in source, logs, browser data, URLs, prompts, workflow payloads, or response archives;
- no automatic selection of the first social destination;
- no personal Facebook-profile automation;
- no Nextdoor content without documented local context;
- no Indeed general marketing posts;
- no unsupported security, performance, regulatory, certification, partnership, customer, or outcome claims;
- no real-person face or voice generation without documented rights;
- no external publishing during development, tests, review, or preview verification;
- all publishing gates remain false until provider-specific owner approval and certification evidence exist;
- requester and approver remain separate;
- every external mutation is authenticated, authorized, idempotent, audited, bounded, retry-safe, and fail closed.

Implement through code, tests, migrations, documentation, and the existing Command Center. Resolve review findings rather than describing them. Run schema checks, public-claims checks, lint, TypeScript, tests, and the optimized Next.js build. Use the canonical Vercel preview as the hosted gate when GitHub Actions is blocked before runner startup.

Do not claim completion of owner-only actions. End with an exact activation report containing:
1. merged or proposed repository changes;
2. migrations still requiring owner authorization;
3. missing environment values grouped by subsystem and provider;
4. platform approvals still missing;
5. accounts requiring human OAuth consent and destination selection;
6. the controlled queue → render → upload → verify → finalize evidence cycle still required;
7. publishing gates that remain false;
8. the exact next terminal command and Command Center pages for the owner.
```
