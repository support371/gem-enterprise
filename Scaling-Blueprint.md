# Scaling Blueprint -- GEM & ATR Platform
## gemcybersecurityassist.com | Mobile Pivot & Infrastructure Expansion

**Date:** 2026-05-04
**Auditor:** Lead Systems Architect
**Branch:** `feature/scaling-blueprint`
**Status:** AWAITING MANUAL APPROVAL

---

## 1. Repository Index & File Map

### 1.1 Stack Summary

| Layer | Technology |
|---|---|
| Build | Vite 8 |
| UI Framework | React 18 + TypeScript |
| Styling | Tailwind CSS 3.4 + tailwindcss-animate |
| Component System | shadcn/ui (Radix primitives) |
| State / Data | TanStack React Query |
| Auth | Supabase Auth (anon key, session in localStorage) |
| Database | Supabase PostgreSQL (RLS-enabled) |
| Edge Functions | Supabase Deno (gem-assist, contact-form) |
| Deployment | Vercel (SPA with catch-all rewrite) |

### 1.2 Complete File Index (83 source files)

**Entry Points:**
- `src/main.tsx` -- React root, ThemeProvider, ErrorBoundary
- `src/App.tsx` -- Router tree (255 lines, 30+ routes)
- `src/index.css` -- Design system tokens (267 lines)
- `src/App.css` -- **LEGACY BOILERPLATE** (flagged for removal)

**Public Site Components (11):**
- `src/components/Navigation.tsx` -- Header + desktop/mobile nav (421 lines)
- `src/components/HeroSection.tsx` -- Hero with animated stats (245 lines)
- `src/components/BentoGrid.tsx` -- Solutions bento grid (288 lines)
- `src/components/StatsSection.tsx` -- Animated stats section (178 lines)
- `src/components/TestimonialsSection.tsx` -- Client testimonials (253 lines)
- `src/components/TrustSection.tsx` -- Trust center preview (116 lines)
- `src/components/CTASection.tsx` -- CTA with feature pills (85 lines)
- `src/components/Footer.tsx` -- Full footer with live status (165 lines)
- `src/components/GemAssist.tsx` -- AI chat widget (376 lines)
- `src/components/ServiceTierComparison.tsx` -- Pricing comparison (217 lines)
- `src/components/NetworkParticles.tsx` -- (deprecated, not imported)

**Auth Components (4):**
- `src/components/auth/ProtectedRoute.tsx` -- RBAC route guard
- `src/components/auth/PublicOnlyRoute.tsx` -- Redirect authenticated users
- `src/components/auth/AuthLoadingScreen.tsx` -- Loading state
- `src/components/auth/AccessDenied.tsx` -- Role denial page

**Portal Components (2):**
- `src/components/portal/PortalLayout.tsx` -- Sidebar + main wrapper
- `src/components/portal/PortalSidebar.tsx` -- Navigation sidebar (303 lines)

**Widgets (2):**
- `src/components/widgets/CryptoMarketTable.tsx` -- **EMPTY FILE** (0 implementation)
- `src/components/widgets/TradingViewCalendar.tsx` -- Unknown status

**Hooks (5):**
- `src/hooks/useAuth.tsx` -- Auth context provider (143 lines)
- `src/hooks/useUserRole.tsx` -- RBAC role fetcher (69 lines)
- `src/hooks/use-mobile.tsx` -- Mobile breakpoint hook (22 lines)
- `src/hooks/use-toast.ts` -- Toast notification hook
- `src/hooks/useBlog.ts` -- Blog data hook

**Pages - Public (16):**
- `src/pages/Index.tsx`, `Auth.tsx`, `Register.tsx`, `Contact.tsx`, `Pricing.tsx`
- `src/pages/Solutions.tsx`, `SolutionDetail.tsx`, `TrustCenter.tsx`
- `src/pages/Resources.tsx`, `Blog.tsx`, `BlogPost.tsx`, `BlogManage.tsx`
- `src/pages/Dashboard.tsx`, `ResetPassword.tsx`, `NotFound.tsx`
- `src/pages/KYC.tsx`, `KYCStatus.tsx`, `Handoff.tsx`, `Profile.tsx`, `Support.tsx`

**Pages - Portal (12):**
- `src/pages/portal/Portal.tsx` -- Dashboard overview (235 lines)
- `src/pages/portal/PortalServices.tsx`, `PortalTasks.tsx`, `PortalIncidents.tsx`
- `src/pages/portal/PortalCommunity.tsx`, `PortalWorkspace.tsx`
- `src/pages/portal/PortalTeam.tsx`, `PortalActivity.tsx`, `PortalSettings.tsx`
- `src/pages/portal/AllianceTrust.tsx` -- Real estate interface (619 lines) **FLAGGED**
- `src/pages/portal/GlobalGateway.tsx` -- Integration hub (209 lines)
- `src/pages/portal/GlobalGatewayConnect.tsx` -- Connection catalog (277 lines)
- `src/pages/portal/GlobalGatewayMailchimp.tsx` -- Mailchimp config (239 lines)

**Backend / Edge Functions (2):**
- `supabase/functions/gem-assist/index.ts` -- AI chat proxy (105 lines)
- `supabase/functions/contact-form/index.ts` -- Contact form handler (82 lines)

**Database Scripts (4):**
- `scripts/001_gem_enterprise_schema.sql` -- Full schema (361 lines, 18 tables)
- `scripts/002_rls_policies.sql` -- Row-level security (156 lines)
- `scripts/003_profile_trigger.sql` -- Auto-profile on signup (29 lines)
- `scripts/004_seed_data.sql` -- Seed data

**Migrations (3):**
- `supabase/migrations/20260114190211_remix_migration_from_pg_dump.sql`
- `supabase/migrations/20260316010158_db62e781-*.sql`
- `supabase/migrations/20260316120000_create_user_roles.sql`

---

## 2. "Nexus Gateway" (Global Gateway) Dependency Map

### Current State

The "Global Gateway" in the codebase is an **integration hub** for third-party services (Mailchimp, Slack, PagerDuty, Jira, Splunk, Datadog, Okta). It is **NOT** a crypto-fiat bridge.

**Frontend pages:**
```
/global-gateway          --> GlobalGateway.tsx (integration dashboard)
/global-gateway/connect  --> GlobalGatewayConnect.tsx (connection catalog)
/global-gateway/mailchimp --> GlobalGatewayMailchimp.tsx (Mailchimp config)
```

**Dependencies:**
```
GlobalGateway.tsx
  └── PortalLayout.tsx
       └── PortalSidebar.tsx
            ├── useAuth.tsx --> supabase/client.ts
            └── useUserRole.tsx --> supabase/client.ts (user_roles table)
```

**Critical finding:** There is **no crypto-fiat bridge logic** anywhere in the repository. Specifically:
- `CryptoMarketTable.tsx` is an **empty file** (0 bytes of implementation)
- No transaction processing controllers or services exist
- No payment gateway integration code exists
- No HMAC validation logic exists
- All Global Gateway data is **static/mock** (hardcoded arrays, setTimeout-based "API" calls)

### What Needs to Be Built (Phase 3)

To realize the Nexus Gateway as a crypto-fiat bridge, the following must be created from scratch:
1. Database tables: `transactions`, `wallets`, `fiat_accounts`, `exchange_rates`, `transaction_audit_trail`
2. Edge functions: transaction processor, rate engine, settlement service
3. HMAC-signed webhook receiver for payment provider callbacks
4. Frontend: `CryptoMarketTable.tsx` implementation, transaction history, wallet management

---

## 3. Mobile-First Audit -- Legacy Layout Violations

### CRITICAL: Must Remove

| File | Issue | Impact |
|---|---|---|
| `src/App.css` (entire file) | Legacy Vite boilerplate: `#root { max-width: 1280px; margin: 0 auto; padding: 2rem; text-align: center; }` | **Constrains entire app** to centered 1280px box with hardcoded padding. Breaks all mobile layouts. |

### HIGH: Theme-Breaking Components

| File | Issue | Impact |
|---|---|---|
| `src/pages/portal/AllianceTrust.tsx` | 619 lines of **hardcoded light-theme styles**: `bg-white`, `text-slate-600`, `text-emerald-700`, `border-slate-900`, `shadow-sm` | Completely ignores Cyber-Noir design system. White backgrounds, slate text, emerald accents. Not dark-mode compatible. |
| `src/pages/portal/AllianceTrust.tsx` ContactForm | Uses `bg-white`, `rounded-[2rem]`, inline border/shadow classes | Does not use `glass-panel` or any design tokens |

### MEDIUM: Responsive Gaps

| File | Issue | Recommendation |
|---|---|---|
| `src/components/BentoGrid.tsx` | Jumps from `grid-cols-1` to `md:grid-cols-4` (no `sm:` step) | Add `sm:grid-cols-2` for tablet portrait |
| `src/components/Footer.tsx` | `grid-cols-2 md:grid-cols-6` -- 6 columns too dense for tablets | Add `sm:grid-cols-3 lg:grid-cols-6` |
| `src/components/ServiceTierComparison.tsx` | Dynamic class construction (`bg-${tier.color}/10`) **will be purged by Tailwind** | Replace with pre-defined class maps |
| `src/components/GemAssist.tsx` | Fixed `w-[420px]` chat panel -- slightly wide on small phones | Add `sm:w-[420px] w-full` with bottom-sheet on mobile |
| `src/components/HeroSection.tsx` | `grid-cols-3` stat cards with no `sm:` breakpoint | OK for now, but tight on 320px screens |

### LOW: Touch Optimization Gaps

| Area | Issue |
|---|---|
| Portal sidebar nav items | 2.5rem (40px) tap targets -- borderline for WCAG 2.5.8 (44px minimum) |
| Footer link items | `text-sm` links with `space-y-3` -- adequate but could use larger touch targets |
| Mobile nav accordion items | `py-3` (48px total) -- acceptable |

---

## 4. Cyber-Noir Theme Deviation Report

### Design System Token Coverage

The `index.css` design system is **well-structured** with:
- HSL CSS custom properties for all semantic colors
- Dark mode as default, light mode via `.light` class
- Glass effect tokens (`--glass-bg`, `--glass-border`, `--glass-blur`)
- Gradient tokens (`--gradient-primary`, `--gradient-accent`, `--gradient-mesh`)
- Shadow/glow tokens (`--shadow-glow`, `--shadow-glow-intense`)
- Bento card hover effects (`.bento-card`)
- Cyber grid pattern (`.cyber-grid`)
- Text gradient utilities (`.text-gradient-primary`)

### Files That VIOLATE the Design System

**1. `src/App.css` -- REMOVE ENTIRELY**
- Hardcoded colors: `#646cffaa`, `#61dafbaa`, `#888`
- Legacy Vite demo styles that serve no purpose

**2. `src/pages/portal/AllianceTrust.tsx` -- FULL REWRITE NEEDED**
Hardcoded violations found:
```
bg-white                    --> should be glass-panel or bg-card
text-slate-600              --> should be text-muted-foreground
text-slate-900              --> should be text-foreground
text-emerald-700            --> should be text-primary
border-slate-900            --> should be border-border
rounded-[2rem]              --> should use standard radius tokens
shadow-sm                   --> should use --shadow-sm token
bg-emerald-700              --> should be bg-primary
text-white (on emerald bg)  --> should be text-primary-foreground
```

**3. `src/components/ServiceTierComparison.tsx` -- Tailwind Purge Bug**
```tsx
// BROKEN: Dynamic class names get purged at build
className={`bg-${tier.color}/10`}
className={`text-${tier.color}`}
```
Must be replaced with a static class map like `categoryStyles` in BentoGrid.tsx.

---

## 5. Security Audit (OWASP Top 10 + Specific Flags)

### CRITICAL

| ID | File | Issue | OWASP | Remediation |
|---|---|---|---|---|
| SEC-01 | `supabase/functions/gem-assist/index.ts` | CORS `Access-Control-Allow-Origin: *` | A05:2021 Security Misconfiguration | Restrict to `gemcybersecurityassist.com` and preview domains |
| SEC-02 | `supabase/functions/contact-form/index.ts` | CORS `Access-Control-Allow-Origin: *` | A05:2021 | Same as SEC-01 |
| SEC-03 | `scripts/003_profile_trigger.sql` | Role from `raw_user_meta_data` is user-controlled | A01:2021 Broken Access Control | Ignore role from metadata; default to `client`, admin-only role assignment |
| SEC-04 | `scripts/002_rls_policies.sql` line 150 | `audit_logs_insert_all` allows ANY user to insert | A01:2021 | Restrict to `is_admin()` or service role only |

### HIGH

| ID | File | Issue | OWASP | Remediation |
|---|---|---|---|---|
| SEC-05 | Both edge functions | No rate limiting at function level | A04:2021 Insecure Design | Add per-IP or per-user rate limiting |
| SEC-06 | `contact-form/index.ts` | No CSRF token validation | A01:2021 | Add CSRF token or validate Origin header |
| SEC-07 | `gem-assist/index.ts` | No input length validation on `messages` array | A03:2021 Injection | Cap message count and content length |
| SEC-08 | No HMAC validation | Webhook endpoints have no request signature verification | A02:2021 Crypto Failures | Implement HMAC-SHA256 signature verification for all webhook receivers |

### MEDIUM

| ID | File | Issue | Remediation |
|---|---|---|---|
| SEC-09 | `src/integrations/supabase/client.ts` | `localStorage` for session storage | Consider `httpOnly` cookie via Supabase SSR package (already in deps) |
| SEC-10 | `src/components/GemAssist.tsx` | Anon key in `Authorization` header | Expected for Supabase, but ensure functions validate auth properly |
| SEC-11 | `GlobalGatewayMailchimp.tsx` | API key stored in component state, displayed as masked input | Mock data only, but real implementation must use server-side secrets vault |

---

## 6. Database Schema Gaps for Scaling

### Missing Tables (Required for Phase 3)

```sql
-- Asset Recovery Reporting (high-volume)
CREATE TABLE public.recovery_cases (...)
CREATE TABLE public.recovery_transactions (...)
CREATE TABLE public.recovery_reports (...)

-- Crypto-Fiat Bridge (Nexus Gateway)
CREATE TABLE public.wallets (...)
CREATE TABLE public.fiat_accounts (...)
CREATE TABLE public.exchange_rates (...)
CREATE TABLE public.bridge_transactions (...)
CREATE TABLE public.transaction_audit_trail (...)
```

### Missing Indexes for High-Volume Queries

```sql
-- Current indexes are basic single-column
-- Need composite indexes for reporting dashboards:
CREATE INDEX idx_kyc_applications_status_created ON public.kyc_applications(status, created_at DESC);
CREATE INDEX idx_support_tickets_status_priority ON public.support_tickets(status, priority);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_notifications_user_read ON public.notifications(user_id, is_read, created_at DESC);
```

---

## 7. Execution Plan (Phases 2-4)

### Phase 2: Frontend -- Mobile Pivot (12 files)

| Step | File | Action | Risk |
|---|---|---|---|
| 2.1 | `src/App.css` | **Delete entire file** | Low -- no component imports it meaningfully |
| 2.2 | `src/components/BentoGrid.tsx` | Add `sm:grid-cols-2` breakpoint | Low |
| 2.3 | `src/components/Footer.tsx` | Add `sm:grid-cols-3 lg:grid-cols-6` | Low |
| 2.4 | `src/components/ServiceTierComparison.tsx` | Replace dynamic classes with static map | Medium -- visual change |
| 2.5 | `src/components/GemAssist.tsx` | Mobile bottom-sheet pattern, responsive width | Medium |
| 2.6 | `src/pages/portal/AllianceTrust.tsx` | Full rewrite to Cyber-Noir design tokens | High -- 619 lines |
| 2.7 | `src/components/portal/PortalSidebar.tsx` | Increase touch targets to 44px minimum | Low |
| 2.8 | `src/components/HeroSection.tsx` | Add `sm:` breakpoint for stat cards | Low |
| 2.9 | `src/components/Navigation.tsx` | Verify mobile menu touch targets | Low |
| 2.10 | `index.html` | Add `<meta name="viewport">` verification | Low |
| 2.11 | `src/hooks/use-mobile.tsx` | No changes needed (already correct) | None |
| 2.12 | Build verification after each file | `npm run build` | Mandatory |

### Phase 3: Backend -- Nexus Gateway Scaling (8 deliverables)

| Step | Deliverable | Action |
|---|---|---|
| 3.1 | `scripts/005_recovery_reporting_schema.sql` | New tables for high-volume asset recovery reporting |
| 3.2 | `scripts/006_nexus_gateway_schema.sql` | Transaction, wallet, exchange rate tables |
| 3.3 | `scripts/007_composite_indexes.sql` | Performance indexes for 10x throughput |
| 3.4 | `scripts/008_rls_nexus_policies.sql` | RLS policies for new tables |
| 3.5 | Edge function: CORS lockdown | Restrict both functions to production origins |
| 3.6 | Edge function: rate limiting | Per-IP rate limiting middleware |
| 3.7 | Edge function: input validation | Message length caps, request body size limits |
| 3.8 | `scripts/003_profile_trigger.sql` fix | Remove role from user metadata, default to client |

### Phase 4: Final Verification (4 deliverables)

| Step | Deliverable |
|---|---|
| 4.1 | Standardize AllianceTrust to match portal design language |
| 4.2 | Verify service interface separation (AllianceTrust real estate vs fintech core) |
| 4.3 | Zero-bug sweep: build, lint, test pass |
| 4.4 | Security checklist sign-off |

---

## 8. Approval Gate

**This blueprint is the Phase 1 deliverable.**

No code changes will be made until explicit manual approval is received.

Changes proposed: ~12 frontend files, ~4 new SQL scripts, ~3 edge function patches, ~1 file deletion.

**Awaiting approval to proceed to Phase 2.**
