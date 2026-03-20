# Deployment – GEM Enterprise Portal (Vercel)

## Overview

This guide provides instructions for deploying and managing the GEM Enterprise authenticated portal on Vercel. The frontend is a **Vite + React SPA** (Single Page Application). The backend relies on **Supabase Edge Functions** for server-side operations (contact form submissions, AI assistant).

## Vercel Project Mapping

-   **Repository:** `support371/gem-enterprise`
-   **Framework:** Vite
-   **Production Branch:** `main`
-   **Preview Branches:** All Pull Request branches automatically generate Preview deployments.

## Branching & Release Workflow

The project follows a standard Git flow:

1.  Create a feature branch from `main`.
2.  Submit a Pull Request to `main`.
3.  The PR is automatically deployed to a Preview environment on Vercel for review.
4.  Once approved, the PR is merged into `main`, which triggers a Production deployment.

## Required Environment Variables

### Client-side (Vercel / `.env`)

The following variables must be configured in your Vercel project settings (and locally in `.env` for development):

| Variable | Description |
| :--- | :--- |
| `VITE_SUPABASE_URL` | Supabase project URL (e.g. `https://<project-id>.supabase.co`) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project ID (used for configuration reference) |

These are **client-side** variables (prefixed with `VITE_`) and are embedded into the build output. Do **not** store server-side secrets as `VITE_` variables.

### Server-side (Supabase Edge Functions)

The following secrets are managed in the **Supabase Dashboard** (not in Vercel) under Project Settings → Edge Functions → Secrets:

| Variable | Used By | Description |
| :--- | :--- | :--- |
| `SUPABASE_URL` | `contact-form` | Auto-injected by Supabase runtime |
| `SUPABASE_SERVICE_ROLE_KEY` | `contact-form` | Auto-injected by Supabase runtime |
| `LOVABLE_API_KEY` | `gem-assist` | API key for the AI gateway (`ai.gateway.lovable.dev`) |

> **Important:** Do not commit a `.env` file to the repository. Client-side environment variables should be configured in Vercel project settings. The `.env.example` file documents the required client-side variables.

## Local Run Instructions

1.  **Install Dependencies:**
    ```bash
    npm install
    ```
2.  **Create a local `.env` file** (copy from the example):
    ```bash
    cp .env.example .env
    # Then fill in your Supabase URL and anon key
    ```
3.  **Run Development Server:**
    ```bash
    npm run dev
    ```
4.  **Build for Production:**
    ```bash
    npm run build
    ```
5.  **Run Tests:**
    ```bash
    npm test
    ```

## Vercel Deployment Steps (Dashboard)

1.  **Connect Repository:** In the Vercel dashboard, import the `support371/gem-enterprise` GitHub repository.
2.  **Configure Project:**
    -   Set the **Framework Preset** to "Vite".
    -   Set the **Build Command** to `npm run build`.
    -   Set the **Output Directory** to `dist`.
    -   Set the **Production Branch** to `main`.
3.  **Add Environment Variables:** In the project settings under "Environment Variables," add `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, and `VITE_SUPABASE_PROJECT_ID`.
4.  **Deploy:** Trigger a deployment. Subsequent pushes to `main` will automatically deploy to Production.

## SPA Routing

The `vercel.json` configures a rewrite rule so that all non-asset requests are served by `index.html`. This is required for client-side routing with `react-router-dom` to work correctly. Without this, direct navigation to routes like `/portal/dashboard` would return a 404.

## Supabase Edge Functions

The app depends on two Supabase Edge Functions deployed to the same Supabase project:

### `contact-form`
-   **Triggered by:** `/contact` page form submission via `supabase.functions.invoke("contact-form", ...)`
-   **Purpose:** Validates and saves contact form submissions to the `contact_submissions` table.
-   **Secrets:** Uses auto-injected `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.

### `gem-assist`
-   **Triggered by:** The GEM AI Assistant chat widget (`GemAssist.tsx`) via direct `fetch` to `${VITE_SUPABASE_URL}/functions/v1/gem-assist`.
-   **Purpose:** Streams AI chat completions (powered by Gemini via the Lovable AI gateway).
-   **Secrets:** Requires `LOVABLE_API_KEY` to be set in Supabase Edge Function secrets.

Edge Functions are defined in `supabase/functions/` and deployed via the Supabase CLI (`supabase functions deploy`).

## Post-Deploy Verification Checklist

### Public routes
-   [ ] Homepage (`/`) loads correctly.
-   [ ] `/solutions`, `/trust-center`, `/pricing`, `/resources`, `/contact` pages are accessible.
-   [ ] `/blog` listing page loads.

### Authentication
-   [ ] `/auth` login page loads and email/password sign-in works.
-   [ ] `/register` page loads for new user registration.
-   [ ] Logout works and redirects to a public page.
-   [ ] Password reset flow (`/reset-password`) works.
-   [ ] Session persists after page refresh.

### Onboarding flow
-   [ ] `/kyc` is accessible after registration.
-   [ ] `/kyc/status` displays KYC review state.
-   [ ] `/handoff` transitions approved users to the portal.

### Portal (authenticated)
-   [ ] `/portal/dashboard` loads after login.
-   [ ] `/portal/services`, `/portal/community`, `/portal/workspace` are accessible.
-   [ ] `/profile`, `/support`, `/settings` pages load correctly.
-   [ ] Unauthenticated access to portal routes redirects to `/auth`.

### Backend (Supabase Edge Functions)
-   [ ] `/contact` form submission succeeds (invokes `contact-form` Edge Function).
-   [ ] GEM AI Assistant chat widget responds (invokes `gem-assist` Edge Function).

### UX
-   [ ] Loading spinner appears during auth bootstrap (no blank screen).
-   [ ] Theme toggle (light/dark) works and persists across page loads.
-   [ ] No redirect loops between auth and portal routes.

## Security Notes

-   Do not commit `.env` files to the repository. The `.gitignore` already excludes them.
-   `VITE_` prefixed variables are embedded in the client bundle and are **publicly visible**. Only use them for non-secret values (Supabase URL and anon key are designed to be public).
-   Redeploy the application in Vercel after making any changes to environment variables.
-   Keep Preview and Production environment variables separate and appropriately configured for each environment.
