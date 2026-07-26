# Canonical recovery readiness watch

This monitor replaces the GitHub-hosted scheduled workflow for issue #200. It runs inside the existing GEM Enterprise production deployment and remains fail-closed.

## Behaviour

`/api/internal/recovery-readiness-watch` first reads the public canonical readiness endpoint.

- When `emailDeliveryConfigured` is not `true`, it returns a successful silent no-op. It does not call GitHub, does not send a recovery email, does not comment, and does not close issue #200.
- When readiness becomes `true`, it verifies the deployment currently serving the canonical production alias matches GitHub `main`, smoke-tests the recovery and login surfaces without following redirects, checks unauthenticated API boundaries, verifies SMTP transport and provider acceptance, compares known and unknown recovery responses and timing, inspects the production database revocation controls, verifies the retired Supabase gateway, and validates the complete Vercel runtime-log stream.
- It writes an idempotent production audit decision, comments exact evidence, and closes issue #200 only after every verification passes.

## Required Vercel production variables

Store these only in Vercel Project Settings. Never commit their values.

- `CRON_SECRET` — a random value of at least 32 characters. Vercel automatically sends this value as the cron `Authorization: Bearer` credential.
- Optional `RECOVERY_WATCH_SECRET` — a separate random value of at least 32 characters for Supabase Cron or manual calls. The route accepts either configured secret.
- `GITHUB_RECOVERY_WATCH_TOKEN` — fine-grained GitHub token restricted to `support371/gem-enterprise` with Contents read and Issues read/write.
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_PROJECT_REF`
- `SUPABASE_ANON_KEY`
- Existing production database variables used by Prisma.

The Vercel access token display name can be `gem-enterprise-recovery-monitor`. The Vercel variable name must remain `VERCEL_TOKEN`.

## Free scheduling

The repository includes a once-daily Vercel Hobby fallback at 06:47 UTC. Vercel Hobby does not permit an hourly cron expression.

Use Supabase Cron for the primary hourly check. It runs at minute 17, avoiding overlap with the Vercel fallback. A second Supabase Cron job at minute 22 validates the asynchronous `pg_net` HTTP result so a queued request is not mistaken for a healthy monitor.

### 1. Store the endpoint and Supabase caller secret in Vault

Run this in the canonical Supabase SQL editor. The caller secret can be the dedicated `RECOVERY_WATCH_SECRET`, or the same `CRON_SECRET` used by Vercel.

```sql
select vault.create_secret(
  'https://www.gemcybersecurityassist.com/api/internal/recovery-readiness-watch',
  'gem_recovery_watch_url'
);

select vault.create_secret(
  'REPLACE_WITH_THE_32_PLUS_CHARACTER_CALLER_SECRET',
  'gem_recovery_watch_secret'
);
```

If either Vault secret already exists, update it in the Supabase Vault interface rather than creating a duplicate.

### 2. Create request tracking and the hourly caller

```sql
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

create table if not exists public.gem_recovery_watch_http_runs (
  request_id bigint primary key,
  requested_at timestamptz not null default now()
);

revoke all on table public.gem_recovery_watch_http_runs
  from public, anon, authenticated;

select cron.unschedule(jobid)
from cron.job
where jobname in (
  'gem_recovery_readiness_watch',
  'gem_recovery_readiness_watch_response_check'
);

select cron.schedule(
  'gem_recovery_readiness_watch',
  '17 * * * *',
  $job$
  with queued as (
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
      ),
      timeout_milliseconds := 30000
    ) as request_id
  )
  insert into public.gem_recovery_watch_http_runs (request_id)
  select request_id from queued;
  $job$
);
```

### 3. Fail the checker job on a missing or non-2xx response

```sql
create or replace function public.gem_recovery_watch_assert_latest_http_result()
returns void
language plpgsql
security definer
set search_path = public, net
as $$
declare
  latest_request public.gem_recovery_watch_http_runs%rowtype;
  response_status integer;
  response_error text;
begin
  select * into latest_request
  from public.gem_recovery_watch_http_runs
  order by requested_at desc
  limit 1;

  if latest_request.request_id is null then
    raise exception 'No recovery-watch pg_net request has been recorded';
  end if;

  select status_code, error_msg
  into response_status, response_error
  from net._http_response
  where id = latest_request.request_id;

  if not found then
    raise exception 'No pg_net response for recovery-watch request %', latest_request.request_id;
  end if;

  if response_status < 200 or response_status >= 300 then
    raise exception 'Recovery-watch request % returned HTTP %: %',
      latest_request.request_id,
      response_status,
      coalesce(response_error, 'no error text');
  end if;
end;
$$;

revoke all on function public.gem_recovery_watch_assert_latest_http_result()
  from public, anon, authenticated;

select cron.schedule(
  'gem_recovery_readiness_watch_response_check',
  '22 * * * *',
  'select public.gem_recovery_watch_assert_latest_http_result();'
);
```

The response checker runs five minutes after the HTTP request. A 401, 503, timeout, missing response, or other non-2xx result appears as a failed run in `cron.job_run_details`.

### 4. Confirm scheduling and HTTP health

```sql
select jobid, jobname, schedule, active
from cron.job
where jobname in (
  'gem_recovery_readiness_watch',
  'gem_recovery_readiness_watch_response_check'
)
order by jobname;

select
  tracked.request_id,
  tracked.requested_at,
  response.status_code,
  response.error_msg,
  response.created
from public.gem_recovery_watch_http_runs tracked
left join net._http_response response
  on response.id = tracked.request_id
order by tracked.requested_at desc
limit 10;

select jobid, status, return_message, start_time, end_time
from cron.job_run_details
where jobid in (
  select jobid from cron.job
  where jobname in (
    'gem_recovery_readiness_watch',
    'gem_recovery_readiness_watch_response_check'
  )
)
order by start_time desc
limit 20;
```

The endpoint returns `notified: false` while mail is unavailable. That is the expected healthy application result; the HTTP status must still be 2xx.

## Manual test

Use a terminal without exposing the secret in shell history where possible:

```bash
curl --request POST \
  --header "Authorization: Bearer $RECOVERY_WATCH_SECRET" \
  --header "Content-Type: application/json" \
  --data '{"source":"manual"}' \
  https://www.gemcybersecurityassist.com/api/internal/recovery-readiness-watch
```

Use `CRON_SECRET` in that command when no dedicated recovery-watch secret is configured. Do not run the controlled activation test merely to probe the token after mail readiness becomes true; at that point a successful request can send the administrator recovery email and close issue #200.

## Rollback

1. Unschedule both `gem_recovery_readiness_watch` jobs in Supabase Cron.
2. Drop `public.gem_recovery_watch_assert_latest_http_result()` and the private tracking table if they are no longer needed.
3. Remove the recovery-watch entry from `vercel.json`.
4. Remove the internal route and its dedicated Vercel variables.
5. Leave issue #200 open unless its acceptance evidence was already recorded and every gate passed.
