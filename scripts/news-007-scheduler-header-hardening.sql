-- Remove unnecessary public API credentials from the GEM News scheduler request.
-- The gateway validates ingestion with the private token held in Supabase Vault.
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
