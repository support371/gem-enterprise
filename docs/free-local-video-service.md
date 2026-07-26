# GEM Assist Free Local Video Service

This integration uses a self-hosted ComfyUI instance. It has no required paid video API and no provider usage fee. Rendering capacity is limited by the machine running ComfyUI and by the configured GEM queue boundary.

## Required environment

Set these values in the GEM Enterprise runtime:

```bash
COMFYUI_BASE_URL=https://your-private-comfyui-host.example
# Optional when the ComfyUI reverse proxy requires a bearer token.
COMFYUI_BEARER_TOKEN=replace-with-a-long-random-secret
# Optional. Defaults to 4 and is capped at 20.
COMFYUI_MAX_QUEUE_ITEMS=4

# ComfyUI workflow exported with Save (API Format).
COMFYUI_WORKFLOW_JSON={"6":{"class_type":"CLIPTextEncode","inputs":{"text":"placeholder"}}}
COMFYUI_PROMPT_NODE_ID=6
# Optional workflow input nodes.
COMFYUI_NEGATIVE_PROMPT_NODE_ID=7
COMFYUI_SEED_NODE_ID=3
COMFYUI_DEFAULT_NEGATIVE_PROMPT=real company logos, credentials, private data, unreadable text, distorted faces

# Comma-separated HTTPS origins approved to host final rendered media.
# The configured SUPABASE_URL origin is also accepted automatically.
VIDEO_ASSET_ALLOWED_ORIGINS=https://your-project-ref.supabase.co

# Dedicated bearer secret used only by the trusted render-worker upload callback.
VIDEO_RENDER_CALLBACK_SECRET=replace-with-an-independent-long-random-secret
```

Never expose an unauthenticated ComfyUI server directly to the public internet. Use a private network, authenticated tunnel, or reverse proxy with TLS and access control.

## Database provision

Apply:

`prisma/migrations/20260725035000_video_render_jobs/migration.sql`

The migration creates private, workspace-scoped durable render-job and verified-upload records. The feature fails closed with `VIDEO_RENDER_STORE_NOT_PROVISIONED` until these tables exist.

## Command Center flow

Open:

`/app/command-center/social-media/content-studio`

The studio provides the controlled operator flow:

1. Load or generate the daily cross-platform content plan.
2. Select an orchestrated video item.
3. Persist a durable exact-version render job before contacting ComfyUI.
4. Queue the reviewed content version on the local ComfyUI worker.
5. Check queued, running, completed, failed, or finalized status.
6. The trusted worker uploads the exact completed output to an approved media origin.
7. The worker calls the protected upload-verification endpoint with its file manifest.
8. GEM confirms the file is present in the provider output manifest and verifies storage size, MIME type, origin, and trusted worker checksum evidence.
9. The operator finalizes the verified upload.
10. GEM atomically registers the media asset, creates a new exact content version, copies the passing review evidence with a verified-media finding, and opens a fresh approval request.

The browser cannot supply or override URL, file-size, MIME-type, or checksum evidence. Rendering never queues social publishing. The existing publishing queue, connector selection, provider scopes, emergency locks, idempotency, and live gates remain separate.

## API surface

### Direct administrator worker controls

All direct worker endpoints require an active GEM administrator account.

- `GET /api/video/readiness` — verifies worker reachability and the governed workflow configuration, returning a redacted summary.
- `POST /api/video/jobs` — queues a ComfyUI API-format workflow after checking queue capacity.
- `GET /api/video/jobs/{promptId}` — returns a sanitized job state, output descriptors, and execution error summary.
- `DELETE /api/video/jobs/{promptId}` — deletes only the requested pending job. A currently running render is not interrupted automatically.

### Governed content controls

These endpoints require an active approved TokMetric account, workspace access, and the applicable permissions.

- `POST /api/video/content/{contentId}/render` — persists and queues the exact passing content version. Requires `workspaceId` and an `Idempotency-Key` header.
- `GET /api/video/content/{contentId}/render?workspaceId=...` — returns the latest durable content-bound render state.
- `POST /api/video/content/{contentId}/finalize` — finalizes only an existing trusted-worker upload verification record and performs the atomic media/version/review/approval transition.

### Trusted worker callback

`POST /api/video/uploads/verify`

Authorization:

```http
Authorization: Bearer <VIDEO_RENDER_CALLBACK_SECRET>
Content-Type: application/json
```

Example body:

```json
{
  "renderJobId": "11111111-1111-4111-8111-111111111111",
  "storageRef": "https://your-project-ref.supabase.co/storage/v1/object/public/media/render.mp4",
  "fileName": "render.mp4",
  "mimeType": "video/mp4",
  "fileSize": 2048,
  "checksumSha256": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
}
```

The worker must calculate the SHA-256 checksum from the actual completed file. GEM verifies the provider output filename and performs a server-side `HEAD` request against the approved storage URL before issuing the durable upload record.

## Direct worker example

A submitted workflow must be exported from ComfyUI using **Save (API Format)**. The request supplies the node IDs that contain the positive prompt, optional negative prompt, and optional seed.

```json
{
  "prompt": "Professional cyber-security awareness scene in a modern operations centre",
  "negativePrompt": "logos, unreadable text, distorted faces",
  "workflow": {
    "3": {
      "class_type": "KSampler",
      "inputs": { "seed": 1 }
    },
    "6": {
      "class_type": "CLIPTextEncode",
      "inputs": { "text": "placeholder" }
    },
    "7": {
      "class_type": "CLIPTextEncode",
      "inputs": { "text": "placeholder" }
    }
  },
  "promptNodeId": "6",
  "negativePromptNodeId": "7",
  "seedNodeId": "3",
  "seed": 42
}
```

The shortened sample demonstrates input replacement only. A production workflow must include all model, sampler, latent, decoding, animation, and save nodes required by the locally installed ComfyUI workflow.

## Free-plan operating model

Vercel hosts the control API and interface. The actual GPU render runs on a user-controlled computer or self-hosted runner. GitHub Actions validation is manual; the canonical Vercel preview runs the automatic repository gate. Neither service performs GPU rendering.

The trusted worker uploads the finished file directly to approved storage and calls GEM with the manifest. GEM does not transfer large video bytes through a Vercel function.

## Safety controls

- Do not generate a real person's face or voice without documented permission.
- Mark realistic synthetic presenters and reconstructions as AI-generated.
- Keep original incident footage immutable and store a cryptographic hash before analysis.
- Keep prompts, workflows, and raw worker diagnostics restricted to active administrators.
- Bound queue depth and delete only the requested pending prompt.
- Persist exact render ownership before dispatch and use stable worker client IDs.
- Audit successful queue, cancellation, upload verification, and finalization mutations.
- Accept final assets only from approved HTTPS storage origins.
- Bind every render to a workspace, content ID, content-version ID, and passing compliance review.
- Revoke the pre-render approval request while rendering is in progress.
- Complete final media, content-version, compliance, approval, audit, and domain-event writes atomically.
- Require approval by another authorized operator after rendered media is attached.
