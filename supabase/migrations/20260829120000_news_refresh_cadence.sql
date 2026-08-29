-- Run a lightweight due-source check every 15 minutes. Individual publisher
-- intervals remain authoritative, so a scheduler tick never means every source
-- is fetched. Priority and video feeds may refresh every 30 minutes.
UPDATE public.news_sources
SET "pollIntervalMinutes" = 30, "updatedAt" = now()
WHERE slug IN (
  'cisa-alerts',
  'bleepingcomputer',
  'cnbc-markets',
  'bbc-world',
  'bbc-business',
  'bbc-news-video',
  'cnbc-video',
  'bloomberg-television'
);

DO $$
DECLARE existing_job record;
BEGIN
  FOR existing_job IN
    SELECT jobid FROM cron.job
    WHERE jobname IN ('gem-news-ingest-every-two-hours', 'gem-news-due-source-check')
  LOOP
    PERFORM cron.unschedule(existing_job.jobid);
  END LOOP;

  PERFORM cron.schedule(
    'gem-news-due-source-check',
    '*/15 * * * *',
    'select private.invoke_gem_news_ingest()'
  );
END $$;
