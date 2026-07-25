# GEM Assist Free Local Video Service

This integration uses a self-hosted ComfyUI instance. It has no required paid video API and no provider usage fee. Rendering capacity is limited by the machine running ComfyUI and by the configured GEM queue boundary.

## Required environment

Set these values in the GEM Enterprise runtime:

```bash
COMFYUI_BASE_URL=https://your-private-comfyui-host.example
# Optional when the ComfyUI reverse proxy requires a bearer token
COMFYUI_BEARER_TOKEN=replace-with-a-long-random-secret
# Optional. Defaults to 4 and is capped at 20.
COMFYUI_MAX_QUEUE_ITEMS=4
```

Never expose an unauthenticated ComfyUI server directly to the public internet. Use a private network, authenticated tunnel, or reverse proxy with TLS and access control.

## API surface

All endpoints require an active GEM administrator account.

- `GET /api/video/readiness` — verifies configuration and returns a redacted readiness summary.
- `POST /api/video/jobs` — queues a ComfyUI API-format workflow after checking queue capacity.
- `GET /api/video/jobs/{promptId}` — returns a sanitized job state, output descriptors, and execution error summary.
- `DELETE /api/video/jobs/{promptId}` — deletes only the requested pending job. A currently running render is not interrupted automatically.

A submitted workflow must be exported from ComfyUI using **Save (API Format)**. The request supplies the node IDs that contain the positive prompt, optional negative prompt, and optional seed.

## Example request

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

## Safety controls

- Do not generate a real person's face or voice without documented permission.
- Mark realistic synthetic presenters and reconstructions as AI-generated.
- Keep original incident footage immutable and store a cryptographic hash before analysis.
- Keep prompts, workflows, and raw worker diagnostics restricted to active administrators.
- Audit successful queue and cancellation mutations.
- Require human approval before publication or evidential use.
