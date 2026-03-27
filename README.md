# gem-enterprise

Authenticated portal frontend for the GEM Enterprise platform.

## Stack

- **Vite** — build tool
- **React 18** — UI framework
- **TypeScript** — type safety
- **Tailwind CSS** — utility-first styling with custom design tokens
- **shadcn/ui** — component primitives
- **Supabase** — authentication and session management
- **Vercel** — production deployment

## Required environment variables

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

Create a `.env.local` file at the project root with both variables set.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Output goes to `dist/`. Preview with `npm run preview`.

## Routes

### Public
| Path | Page |
|------|------|
| `/` | Homepage |
| `/trust-center` | Trust Center |
| `/solutions` | Solutions |
| `/solutions/:slug` | Solution detail |
| `/pricing` | Pricing |
| `/resources` | Resources |
| `/blog` | Blog |
| `/blog/:slug` | Blog post |
| `/contact` | Contact |
| `/auth` | Login / sign-up |
| `/reset-password` | Password reset |

### Onboarding flow
| Path | Page |
|------|------|
| `/register` | Registration (public-only) |
| `/kyc` | KYC form (authenticated) |
| `/kyc/status` | KYC status (authenticated) |
| `/handoff` | Handoff to portal (authenticated) |

### Portal (authenticated, role-gated)
| Path | Roles |
|------|-------|
| `/portal` / `/portal/dashboard` | admin, manager, analyst, viewer |
| `/portal/services` | admin, manager, analyst, viewer |
| `/portal/community` | admin, manager, analyst, viewer |
| `/portal/workspace` | admin, manager, analyst, viewer |
| `/portal/tasks` | admin, manager, analyst |
| `/portal/incidents` | admin, manager, analyst |
| `/portal/team` | admin, manager |
| `/portal/activity` | admin, manager, analyst |
| `/portal/alliance-trust` | admin, manager, analyst, viewer |
| `/portal/settings` | admin |
| `/profile` | admin, manager, analyst, viewer |
| `/support` | admin, manager, analyst, viewer |

## Auth behaviour

- Unauthenticated access to any portal route → redirect to `/auth`
- Authenticated access to `/auth` or `/register` → redirect to `/portal`
- Supabase env vars missing → auth gracefully disabled, warning logged, no import-time crash
- Session persists across page refreshes via `localStorage`
