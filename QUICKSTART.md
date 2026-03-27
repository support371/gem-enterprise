# Quick Start — GEM Enterprise Portal

## Prerequisites

- Node.js 18+
- npm 9+
- A Supabase project (for auth and data)

---

## 1. Clone and install

```bash
git clone https://github.com/support371/gem-enterprise.git
cd gem-enterprise
npm install
```

---

## 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in:

```env
VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your-anon-public-key>
```

Both values are available in your Supabase project dashboard under **Project Settings → API**.

These are client-safe public values. Do not add server secrets to `.env`.

---

## 3. Run the development server

```bash
npm run dev
```

App will be available at `http://localhost:8080`.

---

## 4. Test a full auth flow

1. Navigate to `http://localhost:8080/register` — create an account
2. Complete email confirmation if required
3. Navigate to `http://localhost:8080/auth` — sign in
4. You should be redirected to `/portal/dashboard`

---

## 5. Portal access and roles

Portal routes require a user to have a row in the `user_roles` table in Supabase.

Valid roles: `admin`, `manager`, `analyst`, `viewer`

To grant yourself a role during development, insert a row directly via the Supabase dashboard:

```sql
INSERT INTO user_roles (user_id, role) VALUES ('<your-user-id>', 'admin');
```

---

## 6. Build for production

```bash
npm run build
```

Output goes to `dist/`. Deploy to Vercel — see [DEPLOYMENT.md](./DEPLOYMENT.md).

---

## Key routes

| Route | Description |
|---|---|
| `/` | Public homepage |
| `/auth` | Login / signup |
| `/register` | New user registration |
| `/portal/dashboard` | Main portal dashboard (auth required) |
| `/portal/services` | Services (auth required) |
| `/portal/community` | Community (auth required) |
| `/portal/workspace` | Workspace (auth required) |
| `/profile` | User profile (auth required) |
| `/support` | Support page (auth required) |
| `/kyc` | KYC submission (auth required) |
| `/handoff` | Portal handoff after KYC approval |

---

## Troubleshooting

**Blank screen on load**
- Check that `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are set in `.env`
- Open browser DevTools console for error messages

**Stuck on loading spinner**
- Supabase may not be reachable — check your project URL and key
- Session bootstrap has a safe fallback: loading will settle to unauthenticated state

**Redirected to `/auth` after login**
- Your user account may not have a row in `user_roles` — see step 5 above

**Redirect loop**
- Clear localStorage (`supabase.auth.token`) and try again

---

## Scripts reference

| Command | Action |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint check |
| `npm test` | Run Vitest tests |
| `npm run preview` | Preview production build locally |
