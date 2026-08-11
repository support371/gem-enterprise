# Failure Taxonomy

Use exactly one primary class. Record secondary facts in evidence, not as new
taxonomy values.

| Class | Meaning | Expected response |
|---|---|---|
| SOURCE | Wrong, stale, missing, or conflicting repository/branch/head/content identity | Stop mutation, refresh exact sources, reconcile without blind rebase |
| CONFIGURATION | Required non-secret setting or secret-name binding is absent/invalid | Preserve fail-closed behavior; document variable names; route secret values to authorized storage |
| DEPENDENCY | Package, service, tool, or upstream component prevents execution | Pin/restore only within scope; otherwise record external blocker |
| AUTHORIZATION | Required account or repository permission is absent | Stop the protected action and request the minimum authorized access |
| DATABASE | Database availability, schema, migration, or persistence evidence blocks work | Do not bypass with Prisma mutation; separate independent tests |
| NETWORK | Connectivity, DNS, TLS, or transport prevents evidence collection | Retry bounded diagnostics; stop if identity cannot be proven |
| PROVIDER | External provider state, quota, billing, API, or deployment blocks work | Fail closed; do not activate billing; require provider evidence |
| MEDIA | Real media, device, likeness, voice, codec, or rendering acceptance is missing | Keep synthetic/real claims gated; require authorized acceptance |
| SECURITY | Credential exposure, unsafe boundary, vulnerability, or containment defect | Contain, redact, test, and keep incident closure separate from human rotation |
| ENVIRONMENT | Runner, OS, runtime, filesystem, or toolchain differs from the task contract | Identify exact environment; reproduce or record the boundary |
| HUMAN_GOVERNANCE | A genuine owner, legal, regulated, consent, or production decision is required | Mark `HUMAN_REQUIRED`; do not automate or infer approval |
| UNKNOWN | Evidence cannot establish source or root cause | **STOP.** Do not mutate, widen scope, or claim readiness |
