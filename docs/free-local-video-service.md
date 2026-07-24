# GEM Assist Free Local Video Service

This integration uses a self-hosted ComfyUI instance. It has no required paid video API and no provider usage fee. Rendering capacity is limited only by the machine running ComfyUI.

## Required environment

Set these values in the GEM Enterprise runtime:

```bash
COMFYUI_BASE_URL=https://your-private-comfyui-host.example
# Optional when the ComfyUI reverse proxy requires a bearer token
COMFYUI_BEARER_TOKEN=replace-with-a-long-random-secret
```

Never expose an unauthenticated ComfyUI server directly to the public internet. Use a private network, authenticated tunnel, or reverse proxy with TLS and access control.

## API surface

- `GET /api/video/readiness` — verifies configuration and calls ComfyUI `/system_stats`.
- `POST /api/video/jobs` — queues a ComfyUI API-format workflow. Admin or super-admin only.
- `GET /api/video/jobs/{promptId}` — reads job history.
- `DELETE /api/video/jobs/{promptId}` — clears the ComfyUI queue. Admin or super-admin only.

A submitted workflow must be exported from ComfyUI using **Save (API Format)**. The request supplies the node IDs that contain the positive prompt, optional negative prompt, and optional seed.

## Example request

```json
{
  "prompt": "Professional cyber-security awareness scene in a modern operations centre",
  "negativePrompt": "logos, unreadable text, distorted faces",
  "workflow": { "6": { "class_type": "CLIPTextEncode", "inputs": { "text": "placeholder" } } },
  "promptNodeId": "6",
  "negativePromptNodeId": "7",
  "seedNodeId": "3",
  "seed": 42
}
```

## Free-plan operating model

Vercel hosts the control API and interface. The actual GPU render runs on a user-controlled computer or self-hosted runner. GitHub Actions validates code only; it does not perform GPU rendering.

## Safety controls

- Do not generate a real person's face or voice without documented permission.
- Mark realistic synthetic presenters and reconstructions as AI-generated.
- Keep original incident footage immutable and store a cryptographic hash before analysis.
- Require human approval before publication or evidential use.
