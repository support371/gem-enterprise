# Canonical recovery readiness watch

This monitor replaces the GitHub-hosted scheduled workflow for issue #200. It runs inside the existing GEM Enterprise production deployment and remains fail-closed.

## Behaviour

`/api/internal/recovery-readiness-watch` first reads the public canonical readiness endpoint.

- When `emailDeliveryConfigured` is not `true`, it returns a successful silent no-op. It does not call GitHub, does not send a recovery email, does not comment, and does not close issue #200.
- When readiness becomes `true`, it verifies the READY Vercel production deployment matches GitHub `main`, smoke-tests the recovery and login surfaces, checks unauthenticated API boundaries, compares known and unknown recovery responses, performs the controlled administrator recovery request, inspects the database revocation controls, verifies the retired Supabase gateway, and inspects recent Vercel runtime logs.
- It comments exact evidence and closes issue #200 only after every verification passes.

## Required Vercel production variables

Store these only in Vercel Project Settings. Never commit their values.

- `CRON_SECRET` — one random value of at least 32 characters, shared by the Vercel fallback and the Supabase Cron request. Vercel automatically sends this value as the cron `Authorization: Bearer` credential.
- `GITHUB_RECOVERY_WATCH_TOKEN` — fine-grained GitHub token restricted to `support371/gem-enterprise` with Contents read and Issues read/write.
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_PROJECT_REF`
- `SUPABASE_ANON_KEY`
- Existing production database variables used by Prisma.

Do not configure a separate `RECOVERY_WATCH_SECRET` while using the Vercel fallback. The current route intentionally prefers that value when present, which would cause Vercel's automatic `CRON_SECRET` credential to be rejected. Using the existing `CRON_SECRET` for both free schedulers keeps the fallback functional.

The Vercel access token display name can be `gem-enterprise-recovery-monitor`. The Vercel variable name must remain `VERCEL_TOKEN`.

## Free scheduling

The repository includes a once-daily Vercel Hobby fallback at 06:47 UTC. Vercel Hobby does not permit an hourly cron expression.

Use Supabase Cron for the primary hourly check. It runs at minute 17, avoiding overlap with the Vercel fallback. Supabase Cron and `pg_net` already fit the project's established scheduler pattern.

### 1. Store the endpoint and shared cron secret in Supabase Vault

Run this in the canonical Supabase SQL editor after replacing the placeholder with the same `CRON_SECRET` stored in Vercel:

```sql
select vault.create_secret(
  'https://www.gemcybersecurityassist.com/api/internal/recovery-readiness-watch',
  'gem_recovery_watch_url'
);

select vault.create_secret(
  'REPLACE_WITH_THE_32_PLUS_CHARACTER_CRON_SECRET',
  'gem_recovery_watch_secret'
);
```

If either Vault secret already exists, update it in the Supabase Vault interface rather than creating a duplicate.

### 2. Create the hourly job

```sql
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

select cron.unschedule(jobid)
from cron.job
where jobname = 'gem_recovery_readiness_watch';

select cron.schedule(
  'gem_recovery_readiness_watch',
  '17 * * * *',
  $job$
  select net.http_post(
    url := (
      select decrypted_secret
      from vault.decrypted_secrets
      where name = 'gem_recovery_watch_url'
      limit 1
    ),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (
        select decrypted_secret
        from vault.decrypted_secrets
        where name = 'gem_recovery_watch_secret'
        limit 1
      )
    ),
    body := jsonb_build_object(
      'source', 'supabase_pg_cron',
      'requestedAt', now()
    )
  );
  $job$
);
```

### 3. Confirm the job

```sql
select jobid, jobname, schedule, active
from cron.job
where jobname = 'gem_recovery_readiness_watch';
```

Job history is available in `cron.job_run_details`. The endpoint returns `notified: false` while mail is unavailable. That is the expected healthy state.

## Manual test

Use a terminal without exposing the secret in shell history where possible:

```bash
curl --request POST \
  --header "Authorization: Bearer $CRON_SECRET" \
  --header "Content-Type: application/json" \
  --data '{"source":"manual"}' \
  https://www.gemcybersecurityassist.com/api/internal/recovery-readiness-watch
```

Do not run the controlled activation test merely to probe the token after mail readiness becomes true; at that point a successful request can send the administrator recovery email and close issue #200.

## Rollback

1. Unschedule `gem_recovery_readiness_watch` in Supabase Cron.
2. Remove the recovery-watch entry from `vercel.json`.
3. Remove the internal route and its dedicated Vercel variables.
4. Leave issue #200 open unless its acceptance evidence was already recorded and every gate passed.
