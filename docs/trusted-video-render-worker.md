# GEM Trusted Video Render Worker

The trusted worker completes the automated handoff between a self-hosted ComfyUI renderer and the governed GEM Enterprise content workflow.

It does not create social posts and it cannot bypass compliance, exact-version approval, connector authorization, or live publishing gates.

## What it does

For each completed ComfyUI history item tagged with a GEM render-job ID, the worker:

1. Confirms that the ComfyUI history entry completed successfully.
2. Extracts the exact `gemRenderJobId` embedded by GEM during dispatch.
3. Selects a permanent MP4, WebM, or MOV output from the provider manifest.
4. Resolves the output beneath the configured ComfyUI output directory and blocks path traversal.
5. Waits until the file size and modification time are stable.
6. Rejects empty files and files larger than 1 GiB.
7. Calculates a SHA-256 checksum from the actual file bytes.
8. Streams the file to the configured Supabase Storage bucket.
9. Performs a public-object `HEAD` check for the uploaded size and MIME type.
10. Calls `POST /api/video/uploads/verify` with the protected callback secret.
11. Persists a local checkpoint so restarts and retries do not duplicate uploads.

A failed callback is retried from the saved uploaded manifest. The video is not uploaded again.

## Requirements

- Node.js 24 and pnpm 10.28, or Docker.
- A reachable private ComfyUI instance.
- Read access to the ComfyUI output directory.
- The render-store migration from PR #243 applied to the GEM database.
- A Supabase Storage bucket approved by `VIDEO_ASSET_ALLOWED_ORIGINS`.
- The bucket's final objects must be reachable through the public-object URL because GEM verifies them with a server-side `HEAD` request.
- A worker-only Supabase service-role key.
- The same `VIDEO_RENDER_CALLBACK_SECRET` configured in GEM Enterprise.

## Configuration

Copy the template without committing the resulting secret file:

```bash
cp .env.video-worker.example .env.video-worker
```

Required values:

```bash
COMFYUI_BASE_URL=http://127.0.0.1:8188
COMFYUI_OUTPUT_DIR=/absolute/path/to/ComfyUI/output
GEM_VIDEO_WORKER_API_BASE_URL=https://gemcybersecurityassist.com
VIDEO_RENDER_CALLBACK_SECRET=replace-with-the-secret-configured-in-gem
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=replace-with-worker-only-service-role-key
VIDEO_RENDER_SUPABASE_BUCKET=media
VIDEO_RENDER_WORKER_ID=replace-with-a-stable-uuid
```

Keep `VIDEO_RENDER_WORKER_ID` stable for the physical worker. It appears only in safe correlation and health metadata; render idempotency remains bound to the durable GEM render job.

## Direct operation

Load the environment through your operating system or preferred secret manager, then run the diagnostic:

```bash
pnpm video:worker:doctor
```

Run one scan cycle:

```bash
pnpm video:worker:once
```

Run continuously:

```bash
pnpm video:worker
```

The process writes JSON logs to standard output. Secrets, bearer tokens, and service-role keys are never included in normal log fields.

## Docker operation

Create `.env.video-worker` from the example. For a host ComfyUI instance, use:

```bash
COMFYUI_BASE_URL=http://host.docker.internal:8188
```

Set the host output directory for the Compose bind mount:

```bash
export COMFYUI_OUTPUT_DIR_HOST=/absolute/path/to/ComfyUI/output
```

Start the worker:

```bash
docker compose \
  -f deploy/video-worker/docker-compose.yml \
  --env-file .env.video-worker \
  up -d --build
```

Inspect worker health locally:

```bash
curl http://127.0.0.1:8787/health
curl http://127.0.0.1:8787/ready
```

The health port binds to localhost by default. Do not expose it publicly.

## Checkpoint and retry behavior

The default checkpoint is:

```text
.gem-video-worker/state.json
```

Docker stores it in the named volume `gem-video-worker-state`.

Per render job, the state progresses through:

```text
processing -> uploaded -> verified
                 |           ^
                 +-- failed -+
```

Transient failures use exponential backoff capped at 15 minutes. The default attempt limit is 12. Once the limit is reached, retain the state file for investigation; do not delete it before confirming whether a media object or GEM verification record already exists.

## Storage behavior

The object path is deterministic:

```text
<storage-prefix>/<render-job-id>/<checksum-prefix>-<safe-output-filename>
```

An existing object at the same deterministic path is accepted only after the public-object `HEAD` response matches the expected file size and MIME type. GEM then independently verifies the same metadata and binds the original ComfyUI output filename to the provider output manifest.

## Security requirements

- Store the callback secret and service-role key in the local secret manager or root-readable environment file.
- Never place either secret in Vercel client variables, browser code, ComfyUI prompts, workflow JSON, Git history, or screenshots.
- Run ComfyUI behind a private network or authenticated reverse proxy.
- Mount the ComfyUI output directory read-only in the worker container.
- Use a dedicated storage bucket and prefix for generated media.
- Do not upload incident evidence, credentials, customer data, internal dashboards, exploit demonstrations, or real-person likenesses without the required approvals.
- Keep social provider publishing gates disabled until provider approvals and certifications are complete.

## Acceptance test

After GEM runtime configuration and the render-store migration are active:

1. Open `/app/command-center/social-media/content-studio`.
2. Generate or load the daily content plan.
3. Select a passing video content item.
4. Queue a render.
5. Confirm the ComfyUI job contains `gemRenderJobId` in its extra data.
6. Wait for the video file to appear in the output directory.
7. Confirm the worker logs `video_worker.iteration_completed` with `verified: 1`.
8. Refresh the render status in Content Studio.
9. Finalize the verified upload.
10. Confirm GEM creates a new exact content version and a fresh approval request.
11. Confirm no social publishing job was created automatically.

## Troubleshooting codes

- `VIDEO_WORKER_HISTORY_FAILED` — ComfyUI history endpoint is unavailable or unauthorized.
- `VIDEO_WORKER_OUTPUT_PATH_INVALID` — output metadata attempted to escape the configured directory.
- `VIDEO_WORKER_OUTPUT_FILE_NOT_STABLE` — ComfyUI is still writing the file.
- `VIDEO_WORKER_UPLOAD_FAILED` — Supabase rejected the object upload.
- `VIDEO_WORKER_UPLOAD_HEAD_FAILED` — the uploaded object is not publicly verifiable.
- `VIDEO_WORKER_UPLOAD_SIZE_MISMATCH` — the stored object size differs from the local file.
- `VIDEO_WORKER_UPLOAD_TYPE_MISMATCH` — the stored content type differs from the approved video MIME type.
- `VIDEO_WORKER_CALLBACK_FAILED` — GEM rejected or could not process the trusted verification callback.
