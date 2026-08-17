# GEM Enterprise Copilot instructions

## Runtime and verification
- Use Node.js 24.x and pnpm 10.28.0.
- Install dependencies with `pnpm install --frozen-lockfile`.
- Before declaring a change complete, run `pnpm run verify`.
- For routing, authentication, authorization, user-facing flows, or API behavior, also run `pnpm exec playwright test --grep @smoke`.

## Security boundaries
- Preserve fail-closed authentication and authorization behavior.
- Never bypass role or tenant/client authorization to make a test pass.
- Never hardcode secrets, credentials, tokens, or production connection strings.
- Treat cross-client/tenant isolation as a security boundary.
- Security fixes require regression tests.
- Do not disable tests, linting, typechecking, CodeQL, or security gates.

## Change control
- Prefer the smallest scoped change that satisfies the task.
- Do not modify `.github/workflows/**`, `.github/actions/**`, or this file unless the task explicitly authorizes governance changes.
- Do not write directly to `main`; deliver repository changes through a pull request.
- Document material assumptions in the pull request.
