-- GEM Intel — Seed curated RSS source list across all categories.
-- Uses stable slugs so re-running is idempotent.

INSERT INTO "news_sources"
  ("id","name","slug","feedUrl","siteUrl","category","description","isActive","pollIntervalMinutes","createdAt","updatedAt")
VALUES
  -- Crypto & Digital Assets
  ('src_coindesk','CoinDesk','coindesk','https://www.coindesk.com/arc/outboundfeeds/rss/','https://www.coindesk.com','crypto','Digital asset markets and on-chain intelligence',TRUE,360,NOW(),NOW()),
  ('src_the_block','The Block','the-block','https://www.theblock.co/rss.xml','https://www.theblock.co','crypto','Institutional-grade crypto research and news',TRUE,360,NOW(),NOW()),
  ('src_decrypt','Decrypt','decrypt','https://decrypt.co/feed','https://decrypt.co','crypto','Web3, DeFi, and NFT coverage',TRUE,360,NOW(),NOW()),
  ('src_cointelegraph','Cointelegraph','cointelegraph','https://cointelegraph.com/rss','https://cointelegraph.com','crypto','Global crypto and blockchain news',TRUE,360,NOW(),NOW()),

  -- Cybersecurity & Threat Intel
  ('src_krebs','Krebs on Security','krebs-on-security','https://krebsonsecurity.com/feed/','https://krebsonsecurity.com','cybersecurity','Investigative cybersecurity reporting',TRUE,360,NOW(),NOW()),
  ('src_bleepingcomputer','BleepingComputer','bleepingcomputer','https://www.bleepingcomputer.com/feed/','https://www.bleepingcomputer.com','cybersecurity','Breaches, vulnerabilities, and ransomware coverage',TRUE,360,NOW(),NOW()),
  ('src_the_record','The Record','the-record','https://therecord.media/feed','https://therecord.media','cybersecurity','Nation-state and threat actor intelligence',TRUE,360,NOW(),NOW()),
  ('src_dark_reading','Dark Reading','dark-reading','https://www.darkreading.com/rss.xml','https://www.darkreading.com','cybersecurity','Enterprise cybersecurity news and analysis',TRUE,360,NOW(),NOW()),

  -- Markets & Capital
  ('src_reuters_markets','Reuters Markets','reuters-markets','https://feeds.reuters.com/reuters/businessNews','https://www.reuters.com/business','markets','Global market-moving business news',TRUE,360,NOW(),NOW()),
  ('src_ft_markets','FT Markets','ft-markets','https://www.ft.com/markets?format=rss','https://www.ft.com/markets','markets','Financial Times markets coverage',TRUE,360,NOW(),NOW()),
  ('src_cnbc_markets','CNBC Markets','cnbc-markets','https://www.cnbc.com/id/10000664/device/rss/rss.html','https://www.cnbc.com/markets/','markets','Equities, rates, and commodities news',TRUE,360,NOW(),NOW()),

  -- Geopolitics & Sanctions
  ('src_reuters_world','Reuters World','reuters-world','https://feeds.reuters.com/Reuters/worldNews','https://www.reuters.com/world','geopolitics','Global political and security developments',TRUE,360,NOW(),NOW()),
  ('src_foreign_policy','Foreign Policy','foreign-policy','https://foreignpolicy.com/feed/','https://foreignpolicy.com','geopolitics','Diplomacy, sanctions, and great-power competition',TRUE,360,NOW(),NOW()),

  -- Policy & Regulation
  ('src_sec_press','SEC Press Releases','sec-press','https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&type=8-K&dateb=&owner=include&count=40&output=atom','https://www.sec.gov/news/pressreleases','policy','Securities and Exchange Commission announcements',TRUE,720,NOW(),NOW()),
  ('src_treasury_ofac','Treasury / OFAC','treasury-ofac','https://home.treasury.gov/news/press-releases/feed','https://home.treasury.gov/news/press-releases','policy','US Treasury and sanctions enforcement',TRUE,720,NOW(),NOW()),

  -- Real Estate & Alternatives
  ('src_bisnow','Bisnow','bisnow','https://www.bisnow.com/rss','https://www.bisnow.com','real_estate','Commercial real estate news and deals',TRUE,720,NOW(),NOW()),
  ('src_wsj_realestate','WSJ Real Estate','wsj-realestate','https://feeds.a.dj.com/rss/RSSRealEstate.xml','https://www.wsj.com/news/realestate','real_estate','Wall Street Journal real estate coverage',TRUE,720,NOW(),NOW())
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "feedUrl" = EXCLUDED."feedUrl",
  "siteUrl" = EXCLUDED."siteUrl",
  "category" = EXCLUDED."category",
  "description" = EXCLUDED."description",
  "updatedAt" = NOW();
