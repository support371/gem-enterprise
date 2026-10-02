# GEM Authorized Command Runner

## Purpose

The command runner connects the protected **Development Operations** workspace to an authorized local GEM host without exposing a public shell.

The browser never submits raw shell text. A platform owner selects a fixed command ID, GEM records a durable request in the existing `DomainEvent` store, and the local worker polls outbound over HTTPS. The worker owns its own hard-coded allowlist and ignores any command ID it does not recognize.

## Initial allowlist

- Repository status
- Lint
- Type check
- Unit tests
- Preview verification
- Local production build

The initial release intentionally excludes package installation, database mutation, migrations, deployment, secret management, arbitrary PowerShell/cmd input, process killing, and filesystem deletion.

## Platform environment

Configure these values in the canonical GEM deployment:

```text
GEM_COMMAND_RUNNER_ENABLED=true
GEM_COMMAND_RUNNER_WORKSPACE_ID=<existing GEM workspace id>
GEM_COMMAND_RUNNER_HOST_ID=GEM-ASSIST
GEM_COMMAND_RUNNER_WORKER_TOKEN=<high-entropy secret>
```

The command UI is restricted by `requirePlatformOwner()`. Worker endpoints do not use browser sessions; they require the worker bearer token plus the configured host ID.

## Windows host environment

On the authorized Windows host:

```text
GEM_PLATFORM_URL=https://gem-assist-enterprise.vercel.app
GEM_COMMAND_RUNNER_WORKER_TOKEN=<same high-entropy secret>
GEM_COMMAND_RUNNER_HOST_ID=GEM-ASSIST
GEM_COMMAND_RUNNER_REPO_DIR=C:\path\to\gem-enterprise
```

Run:

```powershell
node ops\command-runner\worker.mjs
```

For a single poll/execution cycle:

```powershell
node ops\command-runner\worker.mjs --once
```

## Security boundary

- The public website never receives direct operating-system command authority.
- The platform sends only a command ID, never a shell command string.
- The Windows worker independently maps that ID to a fixed local command.
- Command output is bounded and common credential assignments are redacted before persistence.
- Requests and terminal outcomes are recorded as domain and audit events.
- Direct command access is platform-owner-only.
- Production deploys and database-changing commands remain outside this runner.

## Operational behavior

A queued request is claimed once by the configured host. The worker runs the local command in `GEM_COMMAND_RUNNER_REPO_DIR`, posts completion status and bounded output, then returns to polling.

If the worker is offline, requests remain queued. If the worker process exits after claiming a job but before reporting a result, that job remains in `running` state and requires an explicit recovery/retry capability in a later release rather than being silently re-executed.
