# Deploy to Vercel

## 1) Import repository
Create a new Vercel project from this repository.

## 2) Build settings
- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`

## 3) Environment Variables
Set variables from `.env.example`:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 4) Database migrations
Apply SQL files in `supabase/migrations` to your Supabase project.

## 5) Verify
After deploy:
- Public routes resolve
- `/client-login` login works
- `/access/continue` redirects by KYC/entitlements
- `/app/admin/*` restricted to admin users
