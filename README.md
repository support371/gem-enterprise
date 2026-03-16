# GEM Enterprise Platform

> Cybersecurity-first enterprise platform serving Financial and Real Estate divisions — built on Next.js 15 with end-to-end type safety, regulated KYC onboarding, and role-based access control.

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Quick Start](#quick-start)
5. [Route Map](#route-map)
6. [Legacy Redirects](#legacy-redirects)
7. [API Reference](#api-reference)
8. [Environment Variables](#environment-variables)
9. [Database](#database)
10. [Authentication Flow](#authentication-flow)
11. [KYC Flow](#kyc-flow)
12. [Deployment (Vercel)](#deployment-vercel)
13. [Admin Access](#admin-access)
14. [Smoke Checks](#smoke-checks)
15. [Contributing](#contributing)
16. [License](#license)

---

## Overview

GEM Enterprise is a secure, invite-only platform that provides institutional and qualified clients with access to curated financial products and real estate investment opportunities. The platform enforces a fully-gated onboarding pipeline:

- **Identity verification (KYC)** — individuals, businesses, trusts, and family offices
- **Compliance review** — manual and automated approval workflows
- **Entitlement gating** — product and portfolio access is granted only after approval
- **Audit trail** — every sensitive action is logged for regulatory compliance

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| ORM | Prisma 5 |
| Database | PostgreSQL 15+ |
| UI Components | shadcn/ui |
| Styling | Tailwind CSS 3 |
| Authentication | JWT (HTTP-only cookies) |
| Deployment | Vercel |

---

## Architecture

```
src/
├── app/                    # Next.js App Router — pages and layouts
│   ├── (public)/           # Marketing and informational pages
│   ├── (auth)/             # Login and session management
│   ├── kyc/                # KYC onboarding flow
│   ├── decision/           # Post-KYC decision screens
│   ├── app/                # Protected client portal
│   │   └── admin/          # Admin-only panel
│   ├── api/                # Route Handlers (REST API)
│   └── (compliance)/       # Legal and compliance pages
├── components/             # Shared React components
├── lib/                    # Utilities, auth helpers, Prisma client
└── types/                  # Shared TypeScript types
prisma/
├── schema.prisma           # Database schema
├── migrations/             # Prisma migration history
└── seed.ts                 # Database seed script
```

**Key architectural decisions:**

- **Server Components by default** — data fetching happens on the server; client components are opt-in via `"use client"`.
- **Route Handlers** — all API logic lives in `app/api/` and uses the Next.js Route Handler pattern.
- **Prisma ORM** — single source of truth for the database schema; migrations are version-controlled.
- **Middleware-based auth** — JWT validation runs in `middleware.ts` before protected routes are served.

---

## Quick Start

### Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL 15+ (local or remote)

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-org/gem-enterprise.git
cd gem-enterprise

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# Edit .env.local and fill in all required values

# 4. Push the Prisma schema to your database
npx prisma db push

# 5. Seed the database (creates admin user and reference data)
npx prisma db seed

# 6. Start the development server
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

---

## Route Map

### Public Routes

| Path | Label | Description | Auth Required |
|---|---|---|---|
| `/` | Home | Marketing landing page | No |
| `/intel` | Intel | Market intelligence and insights | No |
| `/assets` | Assets | Asset overview and listings | No |
| `/community` | Community | Community hub | No |
| `/hub` | Hub | Resource hub | No |
| `/about` | About | Company information | No |
| `/contact` | Contact | Contact form | No |
| `/resources` | Resources | Downloadable resources | No |
| `/services` | Services | Service offerings | No |
| `/company` | Company | Company profile | No |
| `/get-started` | Get Started | Onboarding entry point | No |
| `/eligibility` | Eligibility | Eligibility pre-check | No |

### Authentication Routes

| Path | Label | Description | Auth Required |
|---|---|---|---|
| `/client-login` | Client Login | Login form | No |
| `/portal` | Portal | Session entry redirect | No |
| `/access/continue` | Continue | Post-login routing gate | Partial |

### KYC Routes

| Path | Label | Description | Auth Required |
|---|---|---|---|
| `/kyc/start` | KYC Start | KYC flow entry point | Yes |
| `/kyc/individual` | Individual | Individual applicant form | Yes |
| `/kyc/business` | Business | Business entity form | Yes |
| `/kyc/trust` | Trust | Trust entity form | Yes |
| `/kyc/family-office` | Family Office | Family office form | Yes |
| `/kyc/upload` | Document Upload | Supporting document upload | Yes |
| `/kyc/review` | Review | Submission review and confirm | Yes |
| `/kyc/status` | KYC Status | Application status tracker | Yes |

### Decision Routes

| Path | Label | Description | Auth Required |
|---|---|---|---|
| `/decision/pending` | Pending | Application under review | Yes |
| `/decision/approved` | Approved | Approval confirmation | Yes |
| `/decision/rejected` | Rejected | Rejection notification | Yes |
| `/decision/manual-review` | Manual Review | Flagged for manual review | Yes |

### Protected Client Portal (`/app/*`)

| Path | Label | Description | Auth Required |
|---|---|---|---|
| `/app/dashboard` | Dashboard | Client overview dashboard | Yes — Client |
| `/app/products` | Products | Available investment products | Yes — Client |
| `/app/portfolios` | Portfolios | Portfolio management | Yes — Client |
| `/app/documents` | Documents | Document vault | Yes — Client |
| `/app/support` | Support | Support ticket system | Yes — Client |
| `/app/compliance` | Compliance | Compliance centre | Yes — Client |
| `/app/requests` | Requests | Service requests | Yes — Client |
| `/app/profile` | Profile | Profile management | Yes — Client |
| `/app/settings` | Settings | Account settings | Yes — Client |
| `/app/security` | Security | Security settings | Yes — Client |
| `/app/notifications` | Notifications | Notification centre | Yes — Client |
| `/app/messages` | Messages | Internal messaging | Yes — Client |

### Admin Routes (`/app/admin/*`)

| Path | Label | Description | Auth Required |
|---|---|---|---|
| `/app/admin` | Admin | Admin overview | Yes — Admin |
| `/app/admin/kyc` | KYC Management | Review KYC submissions | Yes — Admin |
| `/app/admin/approvals` | Approvals | Manage approval queue | Yes — Admin |
| `/app/admin/users` | Users | User management | Yes — Admin |
| `/app/admin/allocations` | Allocations | Product allocations | Yes — Admin |

### Compliance Routes

| Path | Label | Description | Auth Required |
|---|---|---|---|
| `/privacy` | Privacy Policy | Data privacy policy | No |
| `/terms` | Terms of Service | Terms and conditions | No |
| `/compliance-notice` | Compliance Notice | Regulatory disclosures | No |

---

## Legacy Redirects

The following redirects are configured to maintain backward compatibility:

| From (Legacy) | To (Canonical) | Type |
|---|---|---|
| `/login` | `/client-login` | 301 |
| `/register` | `/get-started` | 301 |
| `/apply` | `/kyc/start` | 301 |
| `/dashboard` | `/app/dashboard` | 301 |
| `/admin` | `/app/admin` | 301 |
| `/profile` | `/app/profile` | 301 |

---

## API Reference

### Health

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/health` | No | Liveness check — returns `{ status: "ok" }` |
| `GET` | `/api/routes` | No | Lists all registered API routes |

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | No | Authenticate with email and password; sets JWT cookie |
| `POST` | `/api/auth/logout` | Yes | Clears JWT cookie |
| `GET` | `/api/auth/session` | Yes | Returns current session user object |

### KYC

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/kyc` | Yes | Get current user's KYC submission status |
| `POST` | `/api/kyc/submit` | Yes | Submit a completed KYC application |
| `POST` | `/api/kyc/documents` | Yes | Upload supporting KYC documents (multipart) |

### User

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/users/profile` | Yes | Get authenticated user's profile |
| `PATCH` | `/api/users/profile` | Yes | Update authenticated user's profile |

### Notifications

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/notifications` | Yes | List notifications for current user |
| `PATCH` | `/api/notifications` | Yes | Mark notifications as read |

### Support

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/support` | Yes | List support tickets for current user |
| `POST` | `/api/support` | Yes | Create a new support ticket |

### Requests

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/requests` | Yes | List service requests for current user |
| `POST` | `/api/requests` | Yes | Submit a new service request |

### Admin

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/admin/kyc` | Yes — Admin | List all KYC submissions with filters |
| `PATCH` | `/api/admin/kyc` | Yes — Admin | Approve, reject, or flag a KYC submission |
| `GET` | `/api/admin/users` | Yes — Admin | List all users with filters and pagination |
| `PATCH` | `/api/admin/users` | Yes — Admin | Update user role or status |

### Contact

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/contact` | No | Submit a public contact form enquiry |

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | Yes | Canonical public URL of the application |
| `NEXT_PUBLIC_APP_NAME` | Yes | Display name used in UI and emails |
| `NODE_ENV` | Yes | `development`, `test`, or `production` |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret key for signing JWTs (min 32 chars) |
| `ADMIN_EMAIL` | Yes | Email address for the seeded admin account |
| `ADMIN_INITIAL_PASSWORD` | Yes | Initial password for the seeded admin account |
| `SMTP_HOST` | Yes | SMTP server hostname |
| `SMTP_PORT` | Yes | SMTP server port (typically `587` or `465`) |
| `SMTP_USER` | Yes | SMTP authentication username |
| `SMTP_PASS` | Yes | SMTP authentication password |
| `EMAIL_FROM` | Yes | From address used in outbound emails |
| `AUDIT_ENABLED` | No | Set to `true` to enable compliance audit logging |
| `VERCEL_URL` | Auto | Auto-injected by Vercel at build time |

See [`.env.example`](.env.example) for a copy-paste template.

---

## Database

### Schema Overview

The Prisma schema defines the following primary models:

| Model | Description |
|---|---|
| `User` | Platform user accounts with role, status, and KYC state |
| `KycSubmission` | KYC application data linked to a user |
| `KycDocument` | Uploaded documents associated with a KYC submission |
| `Notification` | In-app notification records per user |
| `SupportTicket` | Support request threads |
| `ServiceRequest` | Formal service requests from clients |
| `AuditLog` | Immutable compliance audit log entries |

### Migrations

```bash
# Generate and apply a new migration
npx prisma migrate dev --name describe-your-change

# Apply pending migrations in production (no schema changes)
npx prisma migrate deploy

# Inspect the current database schema
npx prisma db pull

# Open Prisma Studio (visual DB browser)
npx prisma studio
```

### Seed

The seed script (`prisma/seed.ts`) creates:

- Initial admin user using `ADMIN_EMAIL` and `ADMIN_INITIAL_PASSWORD`
- Reference data (roles, statuses, categories)

```bash
npx prisma db seed
```

---

## Authentication Flow

```
User submits credentials at /client-login
        │
        ▼
POST /api/auth/login
  ├── Invalid → 401, show error on /client-login
  └── Valid   → Set JWT cookie → Redirect to /access/continue
                        │
                        ▼
              /access/continue  (server-side routing gate)
                │
                ├── No KYC submission → /kyc/start
                ├── KYC pending       → /decision/pending
                ├── KYC rejected      → /decision/rejected
                ├── KYC manual review → /decision/manual-review
                └── KYC approved      → /app/dashboard  (or original destination)
```

All `/app/*` routes are protected by `middleware.ts`, which validates the JWT on every request and redirects unauthenticated users to `/client-login`.

---

## KYC Flow

```
/kyc/start
    │
    ├── Individual    → /kyc/individual
    ├── Business      → /kyc/business
    ├── Trust         → /kyc/trust
    └── Family Office → /kyc/family-office
              │
              ▼
        /kyc/upload   (supporting documents)
              │
              ▼
        /kyc/review   (confirm all data before submission)
              │
              ▼
    POST /api/kyc/submit
              │
              ▼
        /kyc/status   (polls submission status)
              │
              ▼
    Admin reviews at /app/admin/kyc
              │
              ├── Approve → /decision/approved
              ├── Reject  → /decision/rejected
              └── Flag    → /decision/manual-review
```

---

## Deployment (Vercel)

### 1. Connect Repository

1. Go to [vercel.com/new](https://vercel.com/new).
2. Import your GitHub repository.
3. Vercel auto-detects the Next.js framework from `vercel.json`.

### 2. Set Environment Variables in Vercel Dashboard

Navigate to **Project Settings → Environment Variables** and add the following secrets:

| Vercel Secret Name | Maps To |
|---|---|
| `database_url` | `DATABASE_URL` |
| `jwt_secret` | `JWT_SECRET` |
| `smtp_host` | `SMTP_HOST` |
| `smtp_port` | `SMTP_PORT` |
| `smtp_user` | `SMTP_USER` |
| `smtp_pass` | `SMTP_PASS` |

Also set the plain (non-secret) variables directly:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_APP_NAME`
- `ADMIN_EMAIL`
- `ADMIN_INITIAL_PASSWORD`
- `EMAIL_FROM`
- `AUDIT_ENABLED`

### 3. Deploy

Push to `main` to trigger a production deployment, or click **Deploy** in the Vercel dashboard.

### 4. Pull Environment Variables Locally

```bash
vercel env pull .env.local
```

This syncs the Vercel environment variables to your local `.env.local` file.

### Post-Deployment Database Setup

After the first deployment, run migrations and seed against the production database:

```bash
# Using the Vercel CLI or a direct connection
npx prisma migrate deploy
npx prisma db seed
```

---

## Admin Access

1. After running `npx prisma db seed`, an admin account is created using the values in `ADMIN_EMAIL` and `ADMIN_INITIAL_PASSWORD`.
2. Log in at `/client-login` with those credentials.
3. The auth middleware checks the `role` field on the user record; the admin is granted role `ADMIN`.
4. Navigate to `/app/admin` to access the administration panel.
5. **Change the admin password immediately** via `/app/settings` or `/app/security`.

---

## Smoke Checks

After every deployment, verify the following URLs return the expected responses:

| URL | Expected |
|---|---|
| `/api/health` | `200 { "status": "ok" }` |
| `/` | `200` — landing page renders |
| `/client-login` | `200` — login form renders |
| `/privacy` | `200` — privacy policy renders |
| `/terms` | `200` — terms page renders |
| `/get-started` | `200` — onboarding entry renders |
| `/app/dashboard` | `302` redirect to `/client-login` (unauthenticated) |
| `/app/admin` | `302` redirect to `/client-login` (unauthenticated) |
| `/kyc/start` | `302` redirect to `/client-login` (unauthenticated) |
| `POST /api/auth/login` (bad creds) | `401` |
| `GET /api/auth/session` (no cookie) | `401` |

---

## Contributing

1. Branch from `main` using the convention `feat/`, `fix/`, or `chore/` prefix.
2. Write or update tests for any changed behaviour.
3. Ensure `npm run build` passes with zero TypeScript errors.
4. Open a pull request with a clear description of the change and any compliance implications.
5. Obtain at least one approval before merging.

---

## License

Proprietary. All rights reserved. Unauthorised use, reproduction, or distribution of this software or any portion thereof is strictly prohibited.
