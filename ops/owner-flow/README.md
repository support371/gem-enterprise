# GEM unified owner terminal flow

This is the single Windows terminal entry point for the owner-controlled activation of the current GEM Enterprise platform.

It does not create a second content system. It operates the existing repository, scheduled Content Orchestrator, trusted video worker, private media flow, Social Media Command Center, TokMetric TikTok module, compliance controls, approvals, and governed publishing queue.

## What is already built

The current platform includes:

- daily Observe → Plan → Create → Review → Publish → Engage → Learn → Repeat orchestration;
- at least 20 unique TikTok drafts when TikTok is enabled;
- Facebook Page, Instagram Professional, X, Nextdoor, LinkedIn, and YouTube content packages;
- Indeed exclusion unless a genuine vacancy or approved employer update exists;
- scripts, video recipes, image/carousel briefs, captions, hashtags, CTAs, source evidence, risk flags, and publishing checklists;
- compliance review and exact-version human approval;
- durable worker-dispatch video jobs;
- local ComfyUI rendering;
- private `gem-video-renders` storage;
- checksum-verified uploads;
- exact rendered content versions and private preview;
- a daily Vercel cron at 12:00 UTC;
- shared OAuth foundations for Meta, X, Nextdoor, LinkedIn, and YouTube;
- the existing TokMetric TikTok OAuth flow;
- a unified publishing queue that remains fail-closed.

## What the terminal flow completes

The `Full` mode:

1. authenticates the canonical Vercel project;
2. installs locked dependencies;
3. runs schema checks, public-claims checks, lint, TypeScript, tests, and the optimized production build;
4. configures the scheduled Content Orchestrator workspace, service actor, Nextdoor context, provider list, and cron secret;
5. configures provider OAuth prerequisites using secure prompts for client secrets;
6. generates encryption and state-signing secrets when absent;
7. forces all global and provider live-publishing gates to remain `false`;
8. redeploys the currently serving canonical production artifact;
9. invokes the existing transactional Windows video-worker activation;
10. optionally starts the continuous trusted worker;
11. audits public routes and redacted production readiness;
12. opens Social Media Operations, TokMetric, and Content Studio for browser-based provider consent.

OAuth consent cannot be completed safely by a terminal alone. The script configures the prerequisites and opens the exact governed pages. The account owner must sign in to each provider and grant consent in the provider's browser screen.

## Requirements

- Windows 10 or 11
- PowerShell 7 (`pwsh`)
- Git
- Node.js 24.x
- pnpm 10.x
- authenticated access to the canonical GEM Vercel project
- a local ComfyUI installation and API-format workflow for video activation
- provider developer-app credentials for the accounts being connected
- documentary platform approval where the provider requires it

Do not enter Facebook, Instagram, X, TikTok, Nextdoor, LinkedIn, Google, or Indeed account passwords into this script. It asks only for developer application credentials. Provider account consent happens directly on the provider's website.

## Prepare the private configuration

From the repository root:

```powershell
Copy-Item ops\owner-flow\social-providers.example.json ops\owner-flow\social-providers.local.json
notepad ops\owner-flow\social-providers.local.json
```

Fill in non-secret values:

- TokMetric workspace ID
- approved service actor user ID
- exact Nextdoor local context
- provider client IDs or app IDs
- API versions and scopes
- `platformApprovalRecorded: true` only when documentary approval actually exists

Do not put client secrets in the JSON file. The terminal requests them using secure prompts and sends them directly to managed Vercel secret storage.

## Run the full flow

```powershell
ops\owner-flow\run-all-windows.cmd -Mode Full -StartWorker
```

The video activation portion prompts for:

- the ComfyUI workflow exported with **Save (API Format)**;
- positive-prompt node ID;
- optional negative-prompt and seed node IDs;
- optional local ComfyUI bearer token;
- the dedicated bucket-scoped render-storage credential if it is not already configured.

## Other modes

Audit the repository and production configuration:

```powershell
ops\owner-flow\run-all-windows.cmd -Mode Audit
```

Configure the orchestrator and social OAuth prerequisites without video activation:

```powershell
ops\owner-flow\run-all-windows.cmd -Mode Configure
```

Activate only the trusted video worker:

```powershell
ops\owner-flow\run-all-windows.cmd -Mode ActivateVideo -StartWorker
```

Open the account-connection surfaces after configuration:

```powershell
ops\owner-flow\run-all-windows.cmd -Mode Connect -WorkspaceId YOUR_WORKSPACE_ID
```

Skip the local full verification only when a canonical exact-head build has already passed:

```powershell
ops\owner-flow\run-all-windows.cmd -Mode Full -SkipLocalVerification -StartWorker
```

## Browser account connection sequence

After the terminal configuration and redeployment complete:

1. Sign in to GEM as an active approved operator.
2. Open **Social Media Operations**.
3. Paste the workspace ID copied by the terminal.
4. Authorize Meta Business and explicitly select the Facebook Page and Instagram Professional account.
5. Authorize the approved X company account.
6. Authorize Nextdoor only when Publish API access and a documented local identity exist.
7. Authorize LinkedIn and YouTube only when those providers are enabled in the local configuration.
8. Open **TokMetric** and authorize TikTok there. Do not create a second TikTok connector.
9. Run the connector-health check for every stored account.
10. Open **Content Studio**, generate the daily plan, produce videos, review private previews, and route exact versions to human approval.

The provider callback URLs printed by the terminal must also be registered in each provider developer console.

## Daily schedule

Vercel invokes:

```text
POST /api/social-media/orchestrator/daily/process
```

at **12:00 UTC every day**.

The scheduled run creates governed content drafts and approval requests. It does not automatically publish externally.

## Publishing activation boundary

The terminal deliberately keeps these controls false:

```text
SOCIAL_MEDIA_LIVE_PUBLISHING_ENABLED=false
META_SOCIAL_PUBLISHING_ENABLED=false
X_SOCIAL_PUBLISHING_ENABLED=false
NEXTDOOR_PUBLISHING_ENABLED=false
LINKEDIN_SOCIAL_PUBLISHING_ENABLED=false
YOUTUBE_PUBLISHING_ENABLED=false
TOKMETRIC_LIVE_PUBLISHING_ENABLED=false
INDEED_JOB_PUBLISHING_ENABLED=false
```

OAuth connection is not publishing authorization. Live gates should be enabled only after provider certification, exact-version compliance and approval evidence, a controlled sandbox/dry-run where available, and owner authorization.

## Report

The flow writes a secret-free readiness report to:

```text
%LOCALAPPDATA%\GEM\owner-flow\last-readiness.json
```

The report includes route status, configured-variable presence, the daily schedule, video readiness, OAuth readiness, and publishing-lock state. It never includes secret values.
