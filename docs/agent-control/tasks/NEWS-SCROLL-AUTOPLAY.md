# GEM News — Coordinated Scroll Autoplay

## TASK ID
NEWS-SCROLL-AUTOPLAY

## TITLE
Viewport-aware video previews and continuously refreshed news

## OWNER
Codex / GEM News experience lane

## SOURCE PR/ISSUE
User-directed owner pre-production finishing

## CURRENT MAIN SHA
`f084e96457ffa8480be9fadfbb0698bf489da5cd`

## SOURCE HEAD SHA
`f084e96457ffa8480be9fadfbb0698bf489da5cd`

## WORKING BRANCH
`codex/news-scroll-autoplay`

## OBJECTIVE
Preserve the approved GEM News design while making playable video cards begin a
muted inline preview as they become the active card in the viewport, pause when
scrolled away, and refresh the visible feed automatically when new ingested
stories become available.

## NON-GOALS

- Do not autoplay audible media.
- Do not allow multiple news previews to play concurrently.
- Do not bypass publisher embed restrictions or browser autoplay policy.
- Do not copy or store full publisher content.
- Do not modify authentication, Prisma, provider credentials, or IWW.

## KNOWN CURRENT STATE
The implementation now coordinates a single highest-visibility video preview
across both news feeds, refreshes a visible tab every five minutes, respects
viewer motion/network settings, and supplies a due-aware gateway with a versioned
15-minute scheduler migration.

## KNOWN DEFECT / MISSING CAPABILITY
Several cards can qualify independently; the main feed lacks scroll previews;
embedded autoplay does not explicitly request muted playback; and newly ingested
stories require a manual refresh or navigation.

## OWNED FILES

- `src/components/intel/CuratedNewsFeed.tsx`
- `src/components/intel/NewsArticleCard.tsx`
- `src/components/video/GemVideoPlayer.tsx`
- `src/lib/video/playback.ts`
- `supabase/functions/gem-news-gateway/index.ts`
- `supabase/migrations/20260829120000_news_refresh_cadence.sql`
- `src/__tests__/gem-video-player.test.tsx`
- `src/__tests__/native-news-platform.test.ts`
- `src/__tests__/news-scroll-autoplay.test.tsx`
- `docs/agent-control/tasks/NEWS-SCROLL-AUTOPLAY.md`
- `docs/agent-control/ACTIVE-WORK.md` (this entry only)

## FORBIDDEN FILES

- Active PR #291, PR #292, and PR #252 file sets
- Prisma schema and migrations
- Authentication, authorization, and provider credentials
- Integration catalogue PR #334 files
- IWW repository files

## IMPLEMENTATION REQUIREMENTS

- Select one highest-visibility video card as the autoplay candidate.
- Play muted and inline; pause native media and unload auto-started embeds off-screen.
- Keep manual player controls and publisher fallbacks available.
- Respect reduced-motion, data-saving, tab visibility, and browser autoplay policy.
- Enable previews on the main news feed and dedicated video feed.
- Refresh the visible client feed every five minutes without clearing current content.
- Schedule ingestion checks every 15 minutes while honoring each source's poll interval.
- Set priority sources to a 30-minute interval and avoid refetching sources not yet due.

## SECURITY BOUNDARIES
Only allowlisted/native playable media is embedded. External publisher URLs retain
HTTPS validation, referrer isolation, attribution, and fail-closed fallback behavior.
The ingestion gateway remains token-hash authorized and service-role only.

## TEST PLAN

### CONFIGURATION-INDEPENDENT TESTS

- Player autoplay/mute/pause behavior and iframe autoplay parameters.
- Single active card selection and search/feed behavior.
- Reduced-motion and data-saving suppression.
- Ingestion due-source filtering and cadence contract assertions.
- Lint, TypeScript, unit tests, production build, diff check, and secret scan.

### CONFIGURATION-DEPENDENT TESTS

- Exact-head canonical Vercel preview build and runtime-error inspection.
- Supabase migration/function application remains separately verifiable against the
  dedicated GEM backend before production activation.

## ACCEPTANCE CRITERIA

- Scrolling selects at most one active video preview.
- The active playable card begins muted; cards pause or unload after leaving view.
- The main and video-only feeds both use the same coordinated behavior.
- Viewers can still manually play, pause, seek, open captions, and visit the source.
- Fresh ingested stories appear without a manual refresh within five minutes.
- Priority ingestion runs no more often than configured and never bypasses auth.

## ROLLBACK POINT
`f084e96457ffa8480be9fadfbb0698bf489da5cd`

## HUMAN GATES
Applying the Supabase SQL/function release and activating provider-side scheduling
require exact GEM backend identity and deployment evidence.

Current evidence: the project reference is `slzdjoqpzbkwzuaexlkj`, but the
connected Supabase account returned a permission denial for project inspection,
migration history, and Edge Function inspection. No remote backend mutation was
attempted after that explicit access boundary.

## RETURN FORMAT
Exact head, changed files, playback behavior, refresh cadence, checks, preview URL,
backend activation status, blockers, and next safe action.

## SUPERSESSION CONDITIONS
Only a later contract explicitly owning these news files and preserving publisher,
autoplay, accessibility, and ingestion security boundaries may supersede this task.

## MERGE GATE
Configuration-independent checks and canonical exact-head preview must pass. The
required GitHub Actions check must execute successfully rather than fail pre-run.

## LOCAL VERIFICATION

- Focused news/video tests: 3 files and 15 tests passed.
- Repository lint and TypeScript: passed.
- Full test suite: 114 files and 680 tests passed.
- Prisma schema validation and client generation: passed.
- Next.js production build: passed; 358 static pages generated.
