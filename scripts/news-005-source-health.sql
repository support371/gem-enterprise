-- Replace publisher feeds that reject automated retrieval with a reliable attributed feed.
UPDATE public.news_sources SET "isActive" = false, "updatedAt" = now()
WHERE slug IN ('us-treasury', 'wsj-realestate');

INSERT INTO public.news_sources (id,name,slug,"feedUrl","siteUrl",category,description,"isActive","pollIntervalMinutes","createdAt","updatedAt") VALUES
('src_google_realestate','Real Estate Headlines','real-estate-headlines','https://news.google.com/rss/search?q=real%20estate%20markets&hl=en-US&gl=US&ceid=US:en','https://news.google.com','real_estate','Source-attributed property and real estate market headlines',true,120,now(),now())
ON CONFLICT (slug) DO UPDATE SET "feedUrl"=excluded."feedUrl","siteUrl"=excluded."siteUrl",category=excluded.category,description=excluded.description,"isActive"=true,"pollIntervalMinutes"=excluded."pollIntervalMinutes","updatedAt"=now();
