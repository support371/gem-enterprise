-- Native GEM News production hardening, source catalog and autonomous scheduler.
CREATE TABLE IF NOT EXISTS public.news_ingestion_authorizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash text NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.news_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_ingestion_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_ingestion_authorizations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.news_sources, public.news_articles, public.news_ingestion_runs, public.news_ingestion_authorizations FROM anon, authenticated;

CREATE INDEX IF NOT EXISTS news_articles_external_url_idx ON public.news_articles ("externalUrl");
CREATE INDEX IF NOT EXISTS news_articles_relevance_idx ON public.news_articles ("status", "relevanceScore" DESC, "publishedAt" DESC);

INSERT INTO public.news_sources (id,name,slug,"feedUrl","siteUrl",category,description,"isActive","pollIntervalMinutes","createdAt","updatedAt") VALUES
('src_cisa','CISA Alerts','cisa-alerts','https://www.cisa.gov/cybersecurity-advisories/all.xml','https://www.cisa.gov','cybersecurity','Official US cyber alerts and advisories',true,120,now(),now()),
('src_krebs','Krebs on Security','krebs-on-security','https://krebsonsecurity.com/feed/','https://krebsonsecurity.com','cybersecurity','Investigative cybersecurity reporting',true,180,now(),now()),
('src_bleepingcomputer','BleepingComputer','bleepingcomputer','https://www.bleepingcomputer.com/feed/','https://www.bleepingcomputer.com','cybersecurity','Threat, breach and vulnerability reporting',true,120,now(),now()),
('src_cnbc_markets','CNBC Markets','cnbc-markets','https://www.cnbc.com/id/10000664/device/rss/rss.html','https://www.cnbc.com/markets/','markets','Markets, business and economic coverage',true,120,now(),now()),
('src_bbc_world','BBC World','bbc-world','https://feeds.bbci.co.uk/news/world/rss.xml','https://www.bbc.com/news/world','geopolitics','Global affairs and breaking world coverage',true,120,now(),now()),
('src_bbc_business','BBC Business','bbc-business','https://feeds.bbci.co.uk/news/business/rss.xml','https://www.bbc.com/news/business','markets','Business and economic reporting',true,120,now(),now()),
('src_sec_news','SEC News','sec-news','https://www.sec.gov/news/pressreleases.rss','https://www.sec.gov/newsroom','policy','Official securities policy and enforcement news',true,360,now(),now()),
('src_treasury','US Treasury','us-treasury','https://home.treasury.gov/news/press-releases/feed','https://home.treasury.gov/news','policy','Official treasury and sanctions announcements',true,360,now(),now()),
('src_coindesk','CoinDesk','coindesk','https://www.coindesk.com/arc/outboundfeeds/rss/','https://www.coindesk.com','crypto','Digital assets and blockchain markets',true,180,now(),now()),
('src_wsj_realestate','WSJ Real Estate','wsj-realestate','https://feeds.a.dj.com/rss/RSSRealEstate.xml','https://www.wsj.com/real-estate','real_estate','Property markets and real estate reporting',true,360,now(),now()),
('src_nasa_video','NASA Video','nasa-video','https://www.nasa.gov/feeds/iotd-feed/','https://www.nasa.gov','general','Science and visual mission updates',true,360,now(),now())
ON CONFLICT (slug) DO UPDATE SET name=excluded.name,"feedUrl"=excluded."feedUrl","siteUrl"=excluded."siteUrl",category=excluded.category,description=excluded.description,"isActive"=true,"pollIntervalMinutes"=excluded."pollIntervalMinutes","updatedAt"=now();

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM vault.secrets WHERE name = 'gem_news_ingest_token') THEN
    PERFORM vault.create_secret(encode(extensions.gen_random_bytes(32), 'hex'), 'gem_news_ingest_token', 'Internal GEM News scheduler credential');
  END IF;
END $$;

INSERT INTO public.news_ingestion_authorizations (token_hash)
SELECT encode(extensions.digest(decrypted_secret, 'sha256'), 'hex') FROM vault.decrypted_secrets WHERE name = 'gem_news_ingest_token'
ON CONFLICT (token_hash) DO UPDATE SET is_active = true;

CREATE SCHEMA IF NOT EXISTS private;
CREATE OR REPLACE FUNCTION private.invoke_gem_news_ingest() RETURNS bigint
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE request_id bigint; ingest_token text;
BEGIN
  SELECT decrypted_secret INTO ingest_token FROM vault.decrypted_secrets WHERE name = 'gem_news_ingest_token';
  IF ingest_token IS NULL THEN RAISE EXCEPTION 'GEM News scheduler credential unavailable'; END IF;
  SELECT net.http_post(
    url := 'https://slzdjoqpzbkwzuaexlkj.supabase.co/functions/v1/gem-news-gateway',
    headers := jsonb_build_object('Content-Type','application/json'),
    body := jsonb_build_object('action','ingest','token',ingest_token), timeout_milliseconds := 120000
  ) INTO request_id;
  RETURN request_id;
END $$;
REVOKE ALL ON FUNCTION private.invoke_gem_news_ingest() FROM PUBLIC, anon, authenticated;

DO $$ DECLARE existing_job bigint; BEGIN
  SELECT jobid INTO existing_job FROM cron.job WHERE jobname = 'gem-news-ingest-every-two-hours';
  IF existing_job IS NOT NULL THEN PERFORM cron.unschedule(existing_job); END IF;
  PERFORM cron.schedule('gem-news-ingest-every-two-hours', '17 */2 * * *', 'select private.invoke_gem_news_ingest()');
END $$;
