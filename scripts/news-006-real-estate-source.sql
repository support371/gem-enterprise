UPDATE public.news_sources SET "isActive" = false, "updatedAt" = now() WHERE slug = 'real-estate-headlines';
INSERT INTO public.news_sources (id,name,slug,"feedUrl","siteUrl",category,description,"isActive","pollIntervalMinutes","createdAt","updatedAt") VALUES
('src_housingwire','HousingWire','housingwire','https://www.housingwire.com/feed/','https://www.housingwire.com','real_estate','Housing, mortgage and property market reporting',true,120,now(),now())
ON CONFLICT (slug) DO UPDATE SET "feedUrl"=excluded."feedUrl","siteUrl"=excluded."siteUrl",category=excluded.category,description=excluded.description,"isActive"=true,"pollIntervalMinutes"=excluded."pollIntervalMinutes","updatedAt"=now();
