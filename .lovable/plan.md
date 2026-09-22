# Build failure diagnosis — `pnpm run build` (lint_or_type_error)

## Important caveat

The working copy here is at commit `502921896932d19aa787945bc5f984b02c90c390`, not `c41d0a93f5e725bd129f46f63d84588d45a4122a`. Everything below is measured on this checkout; re-run the same two commands on the exact head before recording evidence.

## What I ran

- `npx tsc --noEmit` (same as `pnpm run typecheck`, and `next build` uses the same `tsconfig.json`; `next.config.js` does **not** set `ignoreBuildErrors`)
- `npx eslint src --ext .ts,.tsx --max-warnings=0` (same as `pnpm run lint`)

Result: 15 TypeScript errors, 1 ESLint error. Both gates fail, so `pnpm run verify` / the Vercel build stops before compilation.

## Cluster 1 — Social Autopilot (13 of 15 type errors)

All in `src/__tests__/social-autopilot.test.ts`, lines 21, 29, 38, 44, 53, 60, 94, 95, 114, 123, 125, 129, 131.

```text
error TS2345: Argument of type '{ SOCIAL_AUTOPILOT_ENABLED: string; ... }' is not
assignable to parameter of type 'ProcessEnv'.
  Property 'NODE_ENV' is missing in type '{...}' but required in type 'ProcessEnv'.
```

Cause: the autopilot helpers type their env parameter as `NodeJS.ProcessEnv` —
`src/lib/social-media/autopilot/policy.ts` (lines 67, 86, 91, 101, 123, 131, 142, 158, 183, 213),
`scheduler.ts:37`, `service.ts:127,368`, and `src/lib/social-media/publishing/gates.ts:22,26,27,32,34`.
Under the installed `@types/node`, `ProcessEnv` now declares a **required** `NODE_ENV`, so the partial
env literals the tests pass are no longer assignable. The functions only ever read named keys, so the
declared type is stricter than the actual contract.

## Cluster 2 — stray Lovable/Vite files (2 type errors + the lint error)

```text
src/integrations/supabase/client.ts(6,38): error TS2339: Property 'VITE_SUPABASE_URL' does not exist on type 'ImportMetaEnv'.
src/integrations/supabase/client.ts(7,50): error TS2339: Property 'VITE_SUPABASE_PUBLISHABLE_KEY' does not exist on type 'ImportMetaEnv'.
src/integrations/supabase/previewAuthStorage.ts(38,11): error 'timer' is never reassigned. Use 'const' instead (prefer-const)
```

`src/integrations/supabase/*` is auto-generated Vite/Lovable scaffolding. It is imported by nothing in
the app (only by itself), there is no `src/vite-env.d.ts`, and Next's `import.meta.env` typing has no
`VITE_*` keys. Confirm whether these files exist at `c41d0a9` on GitHub — if they do not, only Cluster 1
is the production failure.

## Minimal safe fix

1. **Autopilot env typing (root cause, production code).** Add an exported alias in
   `src/lib/social-media/autopilot/policy.ts`:
   `export type SocialEnvSource = Record<string, string | undefined>;`
   and replace every `NodeJS.ProcessEnv` annotation in `policy.ts`, `scheduler.ts`, `service.ts` and
   `src/lib/social-media/publishing/gates.ts` with it. Defaults stay `= process.env` (`ProcessEnv` is
   assignable to the alias). No runtime behaviour, no gate, and no default value changes; tests need no edit.
   Narrower alternative if the task contract forbids touching `src/lib/**`: cast each literal in the test
   file to `as NodeJS.ProcessEnv`. This hides the over-strict signature rather than fixing it.
2. **Stray Vite files.** Do not edit the auto-generated files. Add `"src/integrations/**"` to `exclude`
   in `tsconfig.json` and an ignore entry in `eslint.config.mjs`. If they are genuinely unused at the
   target head, deleting the `src/integrations` directory is the cleaner option and needs owner sign-off.

## Verification

Re-run at the exact PR head: `pnpm run lint` then `pnpm run typecheck`, then `pnpm run build`.
Only record `PASS` on output from that exact head — both must be clean.
