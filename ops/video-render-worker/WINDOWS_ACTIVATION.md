# Windows production activation

This utility completes the owner-controlled portion of the GEM trusted video worker without committing or printing production secrets.

## What it configures

- targets the canonical Vercel project `prj_VDGqnA7wZt2E65LLvT94ZOpnYc2Z`
- sets worker dispatch mode and the ComfyUI API workflow in Vercel Production
- generates a new 48-byte callback secret and applies the same value to Vercel and the local worker
- reuses the existing production Supabase service credential when available, without printing it
- binds storage to `https://slzdjoqpzbkwzuaexlkj.supabase.co`
- uses the private `gem-video-renders` bucket
- writes the worker environment under `%LOCALAPPDATA%\GEM\video-render-worker`
- removes inherited permissions from the local environment file and grants access only to the current Windows user
- redeploys the already verified production artifact
- runs the complete GEM, ComfyUI, database, journal, and storage readiness check

## Requirements

- Windows 10 or 11
- PowerShell 7 (`pwsh`)
- Node.js 24.x
- pnpm 10.x
- local ComfyUI reachable at `http://127.0.0.1:8188`, unless another URL is supplied
- a ComfyUI workflow exported with **Save (API Format)**
- Vercel access to the canonical GEM project

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
5. a restricted Supabase storage credential only when one is not already configured in Vercel.

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

## Security boundary

The local environment file contains production credentials and must not be copied into the repository, screenshots, email, chat, cloud-sync folders, or ComfyUI workflows. The generated file is protected with a current-user-only Windows ACL. Delete it and rotate the Vercel callback secret immediately if the Windows account or machine is compromised.
