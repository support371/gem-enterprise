# Windows production activation

This utility completes the owner-controlled portion of the GEM trusted video worker without committing or printing production secrets.

## What it configures

- targets the canonical Vercel project `prj_VDGqnA7wZt2E65LLvT94ZOpnYc2Z`
- validates every configured ComfyUI node and required input before changing production
- tests local ComfyUI health, the worker journal directory, and private storage upload/delete access before activation
- requires a dedicated bucket-scoped `VIDEO_RENDER_STORAGE_KEY`; it never copies the Supabase service-role key into the worker
- sets worker dispatch mode and the ComfyUI API workflow in Vercel Production
- applies the complete negative-prompt safety policy used by the application runtime
- generates a new 48-byte callback secret and applies the same value to Vercel and the local worker
- binds storage to `https://slzdjoqpzbkwzuaexlkj.supabase.co`
- uses the private `gem-video-renders` bucket
- writes the worker environment under `%LOCALAPPDATA%\GEM\video-render-worker`
- removes inherited permissions from the local environment file and grants access only to the current Windows user
- stops an existing trusted worker before callback-secret rotation and restarts it only after successful readiness verification
- deploys the current checked-out GEM revision rather than a frozen historical artifact
- restores the previous Vercel and local worker configuration if deployment or readiness verification fails
- runs the complete GEM, ComfyUI, database, journal, and storage readiness check

## Requirements

- Windows 10 or 11
- PowerShell 7 (`pwsh`)
- Node.js 24.x
- pnpm 10.x
- local ComfyUI reachable at `http://127.0.0.1:8188`, unless another URL is supplied
- a ComfyUI workflow exported with **Save (API Format)**
- a dedicated Supabase credential restricted to the private `gem-video-renders` bucket
- Vercel access to the canonical GEM project

Do not use `SUPABASE_SERVICE_ROLE_KEY` as the worker storage credential. The worker credential is long-lived on the owner-controlled Windows machine and must be limited to the render bucket.

## Activate

Open a terminal in the repository and run:

```powershell
ops\video-render-worker\activate-windows.cmd
```

The utility prompts only for:

1. the exported ComfyUI API-workflow file,
2. the positive-prompt node ID,
3. optional negative-prompt and seed node IDs,
4. an optional ComfyUI bearer token,
5. the dedicated bucket-scoped storage credential when `VIDEO_RENDER_STORAGE_KEY` is not already configured in Vercel.

Secret values are not written to GitHub and are not printed to the terminal.

## Operate

Readiness check:

```powershell
ops\video-render-worker\activate-windows.cmd -Mode Check
```

Run one bounded cycle:

```powershell
ops\video-render-worker\activate-windows.cmd -Mode Once
```

Run continuously:

```powershell
ops\video-render-worker\activate-windows.cmd -Mode Run
```

The continuous worker performs dispatch, local ComfyUI rendering, checksum calculation, immutable private upload, server-side verification, exact-version finalization, and fresh human-approval creation. It never creates or executes a social publishing job.

## Transactional behavior

The utility performs local ComfyUI, journal, and storage-write preflights before setting worker mode. It snapshots the current managed Vercel values and local worker file before rotation. If environment mutation, deployment, or the post-deployment readiness check fails, it restores the previous values, redeploys, restores the previous local worker file, and restarts a previously running worker only after rollback.

A storage probe is uploaded with MIME type `video/mp4` under `activation-probes/` and immediately deleted. Any failure to upload or clean up stops activation.

## Security boundary

The local environment file contains production credentials and must not be copied into the repository, screenshots, email, chat, cloud-sync folders, or ComfyUI workflows. The generated file is protected with a current-user-only Windows ACL. Delete it and rotate the Vercel callback secret immediately if the Windows account or machine is compromised.
