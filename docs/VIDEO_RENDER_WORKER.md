# GEM Automated Trusted Video Production

The trusted worker completes the operational path between GEM's governed content orchestrator and the exact-version approval queue. It runs on the machine that can reach ComfyUI. The canonical Vercel deployment does not need network access to private ComfyUI when `VIDEO_RENDER_DISPATCH_MODE=worker`.

The worker does not publish content, authorize social providers, approve content, or modify publishing gates.

## Runtime flow

1. GEM creates or loads the daily governed content campaign.
2. An operator may queue one eligible video or use **Produce all videos** for the campaign.
3. GEM validates the exact content version and passing compliance review, revokes any stale pre-render approval, and persists a durable `DISPATCHING` render job.
4. The trusted worker obtains a bounded lease from `POST /api/video/worker/dispatch`.
5. The worker submits the stored workflow to its local or private ComfyUI endpoint.
6. Immediately after ComfyUI accepts the prompt, the worker writes the prompt ID to its protected local journal before calling GEM.
7. `POST /api/video/worker/dispatch/{renderJobId}/complete` binds that provider prompt to the durable workspace, content, version, review, actor, and render job.
8. The worker checks bound jobs through `GET /api/video/worker/jobs`.
9. For a completed prompt, it selects a supported MP4, WebM, or MOV output from the exact provider manifest.
10. It streams the output into a temporary file, enforcing size and transfer limits while calculating SHA-256.
11. It uploads the file to a deterministic private storage path with upsert disabled.
12. It calls `POST /api/video/uploads/verify` with the immutable file manifest.
13. GEM independently rechecks the provider output filename and performs an authenticated server-side `HEAD` request against the approved storage origin.
14. The worker calls `POST /api/video/worker/finalize`. GEM leases verified completed jobs, registers the media asset, creates a new exact content version, carries forward compliance evidence, and opens a fresh approval request.
15. A different authorized human must approve that exact rendered version before the existing governed publishing queue can accept it.

No step in this flow creates a social publishing job automatically.

## Required application environment

Configure these values in the canonical Vercel project:

```bash
# Default and recommended mode. ComfyUI remains private to the worker machine.
VIDEO_RENDER_DISPATCH_MODE=worker

# Workflow exported from ComfyUI with Save (API Format).
COMFYUI_WORKFLOW_JSON={"6":{"class_type":"CLIPTextEncode","inputs":{"text":"placeholder"}}}
COMFYUI_PROMPT_NODE_ID=6
# Optional workflow input nodes.
COMFYUI_NEGATIVE_PROMPT_NODE_ID=7
COMFYUI_SEED_NODE_ID=3
COMFYUI_DEFAULT_NEGATIVE_PROMPT=real company logos, credentials, private data, unreadable text, distorted faces

VIDEO_RENDER_CALLBACK_SECRET=<managed independent secret>
VIDEO_RENDER_STORAGE_URL=https://<project-ref>.supabase.co
VIDEO_RENDER_STORAGE_KEY=<managed server storage credential>
VIDEO_RENDER_STORAGE_AUTH_ORIGIN=https://<project-ref>.supabase.co
VIDEO_ASSET_ALLOWED_ORIGINS=https://<project-ref>.supabase.co
```

`COMFYUI_BASE_URL` is not required in the Vercel project when worker dispatch mode is enabled. The workflow JSON is encrypted as a managed environment value and is copied only into the private durable render-job payload returned to the authenticated worker.

`VIDEO_RENDER_STORAGE_KEY` is sent only when the object URL origin exactly matches `VIDEO_RENDER_STORAGE_AUTH_ORIGIN`, `VIDEO_RENDER_STORAGE_URL`, or `SUPABASE_URL`. It is never sent to another origin listed in `VIDEO_ASSET_ALLOWED_ORIGINS`.

Use a dedicated server credential and storage policies restricted to the render bucket. Do not place it in browser variables, screenshots, logs, GitHub, or ComfyUI workflows.

## Required worker environment

Copy `ops/video-render-worker/worker.env.example` to a protected location outside the repository and fill it using managed secret values.

```bash
GEM_VIDEO_WORKER_API_URL=https://www.gemcybersecurityassist.com
VIDEO_RENDER_CALLBACK_SECRET=<same managed callback secret as Vercel>

# Local ComfyUI is recommended.
COMFYUI_BASE_URL=http://127.0.0.1:8188

VIDEO_RENDER_STORAGE_URL=https://<project-ref>.supabase.co
VIDEO_RENDER_STORAGE_KEY=<restricted storage credential>
VIDEO_RENDER_STORAGE_BUCKET=gem-video-renders
VIDEO_RENDER_WORKER_STATE_DIR=/var/lib/gem-video-render-worker
```

GEM and storage URLs must use HTTPS. ComfyUI must also use HTTPS unless it is addressed through `http://localhost`, `http://127.0.0.1`, or the IPv6 loopback address on the same machine.

Optional values:

```bash
COMFYUI_BEARER_TOKEN=<private reverse-proxy credential>
VIDEO_RENDER_STORAGE_PREFIX=renders
VIDEO_RENDER_WORKER_BATCH_SIZE=5
VIDEO_RENDER_WORKER_DISPATCH_LEASE_MS=120000
VIDEO_RENDER_WORKER_POLL_MS=15000
VIDEO_RENDER_WORKER_TIMEOUT_MS=30000
VIDEO_RENDER_WORKER_TRANSFER_TIMEOUT_MS=900000
VIDEO_RENDER_MAX_FILE_BYTES=1073741824
```

Limits are fail-closed:

- batch size: 1–20
- dispatch lease: 30–900 seconds
- poll interval: 5–300 seconds
- request and response-body timeout: 5–120 seconds
- download and upload transfer timeout: 60–3,600 seconds
- maximum video size: 1 byte–1 GiB

## Durable worker journal

The journal closes the gap between ComfyUI accepting a prompt and GEM recording the returned prompt ID.

- A prompt is written to `<state-directory>/<render-job-id>.json` before the completion callback.
- The file mode is `0600`; the directory mode is `0700`.
- If the callback fails or the worker restarts, the next lease retries the callback from the journal instead of submitting another ComfyUI prompt.
- The journal entry is deleted only after GEM confirms the binding.

The provided systemd unit uses `StateDirectory=gem-video-render-worker`, which creates `/var/lib/gem-video-render-worker` with restricted ownership.

## Storage provision

Create a private bucket named `gem-video-renders`, or set `VIDEO_RENDER_STORAGE_BUCKET` to the approved private bucket name.

The worker writes deterministic objects under:

```text
<prefix>/<workspace-id>/<content-id>/<render-job-id>/<sha256>-<safe-file-name>
```

The checksum path requires exactly 64 hexadecimal SHA-256 characters. Uploads use `x-upsert: false`. A retry may reuse an existing deterministic object only when its server-reported size and MIME type match the file that was just hashed.

## Commands

Install the repository dependencies on the worker machine with Node.js 24 and pnpm 10.28.0.

Readiness check:

```bash
pnpm run video:worker:check
```

Process one complete bounded cycle and exit:

```bash
pnpm run video:worker:once
```

Run continuously:

```bash
pnpm run video:worker
```

One cycle performs dispatch claims, render-status processing, upload verification, and automatic finalization. The commands emit structured JSON logs and do not print callback secrets, storage keys, ComfyUI bearer tokens, full prompts, workflow payloads, or provider response bodies.

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

The provided service uses a private temporary directory, a dedicated persistent state directory, restricted filesystem access, no privilege escalation, automatic restart on failure, and graceful `SIGTERM` shutdown.

## Windows or macOS foreground operation

Load the environment through the operating system's secret-managed process environment, set `VIDEO_RENDER_WORKER_STATE_DIR` to a protected persistent directory, open the repository directory, and run:

```bash
pnpm run video:worker:check
pnpm run video:worker
```

Do not store production secrets in a tracked `.env` file.

## Expected readiness result

The check succeeds only when all of these are available:

- the callback-secret-protected GEM job feed
- the durable render-job tables and dispatch columns
- the worker journal directory
- the private ComfyUI health endpoint
- the configured private storage bucket

A missing migration, secret, bucket, worker endpoint, journal directory, or ComfyUI connection returns a non-zero exit status.

## Failure and retry behaviour

- undispatched jobs are leased with `FOR UPDATE SKIP LOCKED`, preventing two workers from claiming the same row
- an expired dispatch lease may be reclaimed
- queue-capacity, timeout, and provider 5xx failures return the job for bounded retry
- non-retryable workflow errors mark the durable job failed
- accepted prompt IDs remain in the local journal until GEM confirms the binding
- queued or running prompts remain pending
- unsupported or empty outputs fail the job attempt
- files over the configured maximum are stopped during streaming
- stalled downloads and uploads are terminated by the transfer timeout
- upload retries use the deterministic checksum path
- upload verification is idempotent for the same immutable manifest
- finalization uses a database lease and the existing atomic exact-version transaction
- worker failures never create a social publishing job

## Human approval boundary

Media finalization is automated because it is an internal, reversible preparation step. It does not publish.

Finalization creates a new exact content version and a fresh approval request. A separate authorized operator must approve that rendered version before it can enter the governed publishing queue. Provider OAuth, connector health, required scopes, emergency locks, production gates, and publishing idempotency remain mandatory.

## Verification checklist

- `pnpm run verify` passes.
- the `20260726062000_video_worker_dispatch` migration is applied.
- `VIDEO_RENDER_DISPATCH_MODE=worker` is set in the canonical application.
- `pnpm run video:worker:check` passes on the intended worker machine.
- batch production creates durable jobs without a Vercel-to-ComfyUI request.
- the worker binds each accepted prompt once.
- a simulated callback failure is recovered from the local journal without a second provider prompt.
- a controlled test render reaches `COMPLETED`.
- the object exists in the private render bucket.
- the callback creates one `video_render_uploads` row.
- automatic finalization creates a new version and approval request.
- retrying the worker does not create another object, upload row, version, or approval request.
- no `social_publishing_jobs` row is created by dispatch, rendering, upload verification, or finalization.

## Rollback

```bash
sudo systemctl disable --now gem-video-render-worker
```

Then set `VIDEO_RENDER_DISPATCH_MODE=server` only when the application has an explicitly approved secure route to ComfyUI, or revert this feature. Do not remove render tables or migrations while retained media and audit records are required. Without a running worker, worker-mode jobs remain fail-closed in `DISPATCHING` and do not publish.