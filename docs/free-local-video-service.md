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
```

Never expose an unauthenticated ComfyUI server directly to the public internet. Use a private network, authenticated tunnel, or reverse proxy with TLS and access control.

## Command Center flow

Open:

`/app/command-center/social-media/content-studio`

The studio provides the complete controlled flow:

1. Load or generate the daily cross-platform content plan.
2. Select an orchestrated video item.
3. Queue its exact reviewed content version on the local ComfyUI worker.
4. Check queued, running, completed, or failed status.
5. Upload the completed render to an approved media origin.
6. Enter its immutable URL, file size, MIME type, and SHA-256 checksum.
7. Register it as a governed media asset.
8. Create a new exact content version containing the asset.
9. Rerun compliance review.
10. Request fresh approval from another authorized operator.

Rendering never queues social publishing. The existing publishing queue, connector selection, provider scopes, emergency locks, idempotency, and live gates remain separate.

## API surface

### Direct administrator worker controls

All direct worker endpoints require an active GEM administrator account.

- `GET /api/video/readiness` — verifies configuration and returns a redacted readiness summary.
- `POST /api/video/jobs` — queues a ComfyUI API-format workflow after checking queue capacity.
- `GET /api/video/jobs/{promptId}` — returns a sanitized job state, output descriptors, and execution error summary.
- `DELETE /api/video/jobs/{promptId}` — deletes only the requested pending job. A currently running render is not interrupted automatically.

### Governed content controls

These endpoints require the existing TokMetric workspace access and permissions.

- `POST /api/video/content/{contentId}/render` — queues the exact passing content version. Requires `workspaceId` and an `Idempotency-Key` header.
- `GET /api/video/content/{contentId}/render?workspaceId=...` — returns the latest content-bound render state.
- `POST /api/video/content/{contentId}/finalize` — registers a successfully completed render from an approved storage origin, creates a new content version, reruns review, and requests fresh approval.

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

The local worker or operator must upload the finished file to approved storage. The GEM finalization endpoint validates the render binding and metadata; it does not transfer large video bytes through a Vercel function.

## Safety controls

- Do not generate a real person's face or voice without documented permission.
- Mark realistic synthetic presenters and reconstructions as AI-generated.
- Keep original incident footage immutable and store a cryptographic hash before analysis.
- Keep prompts, workflows, and raw worker diagnostics restricted to active administrators.
- Bound queue depth and delete only the requested pending prompt.
- Audit successful queue, cancellation, content render, and finalization mutations.
- Accept final assets only from approved HTTPS storage origins.
- Bind every render to a workspace, content ID, content-version ID, and passing compliance review.
- Require fresh human approval after rendered media is attached.
