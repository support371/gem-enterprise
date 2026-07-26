# GEM Trusted Video Render Worker

Issue: #246

The trusted worker completes the operational gap between a governed GEM render job and the existing verified-media finalization flow. It runs on the machine that can reach ComfyUI. It does not publish content, authorize social providers, approve content, or modify provider gates.

## Runtime flow

1. GEM persists and queues an exact reviewed content version.
2. The worker requests a bounded job list from `GET /api/video/worker/jobs` using `VIDEO_RENDER_CALLBACK_SECRET`.
3. The worker checks the bound ComfyUI prompt directly.
4. For a completed prompt, it selects a supported MP4, WebM, or MOV output from the exact provider manifest.
5. It streams the output into a temporary file, enforcing `VIDEO_RENDER_MAX_FILE_BYTES` while calculating SHA-256.
6. It uploads the file to a deterministic private Supabase Storage path with upsert disabled.
7. It calls `POST /api/video/uploads/verify` with the immutable file manifest.
8. GEM independently rechecks the ComfyUI output filename and performs an authenticated server-side `HEAD` request against the configured storage origin.
9. The verified-upload record becomes available for the existing human-operated finalization action.
10. Finalization creates a new exact content version and fresh approval request. No publishing job is created.

## Required application environment

Configure these values in the canonical Vercel project:

```bash
VIDEO_RENDER_CALLBACK_SECRET=<managed independent secret>
VIDEO_RENDER_STORAGE_URL=https://<project-ref>.supabase.co
VIDEO_RENDER_STORAGE_KEY=<managed server storage credential>
VIDEO_RENDER_STORAGE_AUTH_ORIGIN=https://<project-ref>.supabase.co
VIDEO_ASSET_ALLOWED_ORIGINS=https://<project-ref>.supabase.co
```

`VIDEO_RENDER_STORAGE_KEY` is sent only when the object URL origin exactly matches `VIDEO_RENDER_STORAGE_AUTH_ORIGIN`, `VIDEO_RENDER_STORAGE_URL`, or `SUPABASE_URL`. It is never sent to another origin listed in `VIDEO_ASSET_ALLOWED_ORIGINS`.

Use a dedicated server credential and storage policies restricted to the render bucket. Do not place it in browser variables, screenshots, logs, GitHub, or ComfyUI workflows.

## Required worker environment

Copy `ops/video-render-worker/worker.env.example` to a protected location outside the repository and fill it using managed secret values.

Required values:

```bash
GEM_VIDEO_WORKER_API_URL=https://www.gemcybersecurityassist.com
VIDEO_RENDER_CALLBACK_SECRET=<same managed callback secret as Vercel>
COMFYUI_BASE_URL=https://<private-comfyui-host>
VIDEO_RENDER_STORAGE_URL=https://<project-ref>.supabase.co
VIDEO_RENDER_STORAGE_KEY=<restricted storage credential>
VIDEO_RENDER_STORAGE_BUCKET=gem-video-renders
```

Optional values:

```bash
COMFYUI_BEARER_TOKEN=<private reverse-proxy credential>
VIDEO_RENDER_STORAGE_PREFIX=renders
VIDEO_RENDER_WORKER_BATCH_SIZE=5
VIDEO_RENDER_WORKER_POLL_MS=15000
VIDEO_RENDER_WORKER_TIMEOUT_MS=30000
VIDEO_RENDER_MAX_FILE_BYTES=1073741824
```

Limits are fail-closed:

- batch size: 1–20
- poll interval: 5–300 seconds
- request timeout: 5–120 seconds
- maximum video size: 1 byte–1 GiB

## Storage provision

Create a private bucket named `gem-video-renders`, or set `VIDEO_RENDER_STORAGE_BUCKET` to the approved private bucket name.

The worker writes deterministic objects under:

```text
<prefix>/<workspace-id>/<content-id>/<render-job-id>/<sha256>-<safe-file-name>
```

Uploads use `x-upsert: false`. A retry may reuse an existing deterministic object only when its server-reported size and MIME type match the file that was just hashed.

## Commands

Install the repository dependencies on the worker machine with Node.js 24 and pnpm 10.28.0.

Readiness check:

```bash
pnpm run video:worker:check
```

Process one bounded batch and exit:

```bash
pnpm run video:worker:once
```

Run continuously:

```bash
pnpm run video:worker
```

The commands emit structured JSON logs. They do not print callback secrets, storage keys, ComfyUI bearer tokens, full prompts, or provider response bodies.

## Linux service

1. Create a non-login account such as `gem-video`.
2. Install the repository at `/opt/gem-enterprise` and make it readable by that account.
3. Store the protected environment file at `/etc/gem-video-render-worker.env` with mode `0600`.
4. Copy `ops/video-render-worker/gem-video-render-worker.service` to `/etc/systemd/system/`.
5. Confirm `pnpm run video:worker:check` passes as the service account.
6. Enable the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now gem-video-render-worker
sudo systemctl status gem-video-render-worker
```

The provided service uses a private temporary directory, restricted filesystem access, no privilege escalation, automatic restart on failure, and graceful `SIGTERM` shutdown. Adjust the `pnpm` executable path only when the machine installs pnpm outside the service account's PATH.

## Windows or macOS foreground operation

Load the environment through the operating system's secret-managed process environment, open the repository directory, and run:

```bash
pnpm run video:worker:check
pnpm run video:worker
```

Do not store production secrets in a tracked `.env` file.

## Expected readiness result

The check succeeds only when all of these are available:

- the callback-secret-protected GEM job feed
- the durable render-job tables
- the private ComfyUI health endpoint
- the configured private Supabase Storage bucket

A missing table, secret, bucket, worker endpoint, or ComfyUI connection returns a non-zero exit status.

## Failure and retry behaviour

- queued or running prompts remain pending
- unsupported or empty outputs fail the job attempt
- files over the configured maximum are stopped during streaming
- retryable HTTP 429 and 5xx failures use bounded exponential delay
- upload retries use the deterministic checksum path
- callback retries are safe because the durable upload record is idempotent for the same manifest
- worker failures never create a social publishing job

## Human approval boundary

A successful worker callback only registers verified upload evidence. An authorized operator must still finalize the media in the Content and Video Studio. The resulting exact content version must receive fresh approval from another authorized operator before it can enter the governed publishing queue.

## Verification checklist

- `pnpm run verify` passes.
- `pnpm run video:worker:check` passes on the intended worker machine.
- a controlled test render reaches `COMPLETED`.
- the object exists in the private render bucket.
- the callback creates one `video_render_uploads` row.
- retrying the worker does not create another object or upload row.
- finalization creates a new version and approval request.
- no `social_publishing_jobs` row is created by rendering, upload verification, or finalization.

## Rollback

```bash
sudo systemctl disable --now gem-video-render-worker
```

Then revert the worker pull request and remove the worker-only environment values. Do not remove the existing render tables while retained render or media audit records are required. The application continues to fail closed without the worker.
