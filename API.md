# API + Backend Notes

Current runtime backend is implemented as local app service in `src/lib/platform.ts` (session, KYC states, entitlements, requests, tickets, notifications).

## Core Flows
- Authentication: `signIn`, `signUp`, `signOut` in `src/hooks/useAuth.tsx`
- KYC lifecycle updates: `updateKycState`
- Access bridge: `evaluateAccessRedirect`
- Support/request creation: `/app/support`, `/app/requests`
- Admin visibility: `/app/admin*`

## Database
Relational schema and seed inserts are in `supabase/migrations/20260316090000_gem_enterprise_schema.sql`.
