# TikTok Shop Seller Sync

| Field | Value |
|---|---|
| OWNER | Codex / TikTok Shop integration lane |
| SOURCE | Owner request dated 2026-09-08 |
| BASE SHA | `5e11055caaeff064aa3e2998899c7b1b7ae2b7de` |
| WORKING BRANCH | `codex/tiktok-shop-seller-sync` |
| OWNED FILES | TikTok Shop OAuth/config/client routes, seller-shop/product read sync UI, focused tests, environment template, and TikTok Shop activation documentation |
| FORBIDDEN OVERLAP | Existing organic TikTok publishing behavior, unrelated auth, Prisma schema/migrations, production secrets, paid/provider activation, and other active-work files |
| STATUS | IMPLEMENTED — LOCAL GATES PASSED |
| BLOCKER CLASS | PROVIDER ACCESS for final Seller authorization and TikTok approval |
| NEXT SAFE ACTION | Publish the reviewable branch without merging, then configure the Partner Center values and complete owner authorization after TikTok approval. |

## Acceptance criteria

- TikTok Shop uses its own Partner Center credentials and OAuth endpoints, not TikTok Login Kit credentials.
- Seller authorization is workspace-bound, short-lived, replay-protected, audited, and encrypted at rest.
- The application can discover authorized shops and read approved products after authorization.
- No listing, inventory, price, order, or fulfillment write is possible in this change.
- UI and readiness output name every missing provider-controlled prerequisite.
- Tests, typecheck, lint, and production build pass at the exact branch head.
