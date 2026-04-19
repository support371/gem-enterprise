-- GEM Intel — News Ingestion Pipeline schema
-- Creates NewsSource, NewsArticle, NewsIngestionRun tables and supporting enums.
-- Idempotent: safe to re-run.

-- ── Enums ───────────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE "NewsCategory" AS ENUM (
    'crypto','cybersecurity','markets','geopolitics','policy','real_estate','alternatives','general'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "NewsMediaType" AS ENUM ('none','image','video');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "NewsArticleStatus" AS ENUM ('draft','published','archived','rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "NewsIngestionStatus" AS ENUM ('running','success','partial','failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── news_sources ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "news_sources" (
  "id"                    TEXT PRIMARY KEY,
  "name"                  TEXT NOT NULL,
  "slug"                  TEXT NOT NULL UNIQUE,
  "feedUrl"               TEXT NOT NULL UNIQUE,
  "siteUrl"               TEXT,
  "category"              "NewsCategory" NOT NULL,
  "description"           TEXT,
  "isActive"              BOOLEAN NOT NULL DEFAULT TRUE,
  "pollIntervalMinutes"   INTEGER NOT NULL DEFAULT 360,
  "lastFetchedAt"         TIMESTAMP(3),
  "lastSuccessAt"         TIMESTAMP(3),
  "lastErrorAt"           TIMESTAMP(3),
  "lastError"             TEXT,
  "consecutiveFailures"   INTEGER NOT NULL DEFAULT 0,
  "createdAt"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "news_sources_category_isActive_idx"
  ON "news_sources" ("category", "isActive");

-- ── news_articles ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "news_articles" (
  "id"             TEXT PRIMARY KEY,
  "sourceId"       TEXT,
  "externalGuid"   TEXT NOT NULL UNIQUE,
  "externalUrl"    TEXT NOT NULL,
  "slug"           TEXT NOT NULL UNIQUE,
  "title"          TEXT NOT NULL,
  "summary"        TEXT,
  "aiSummary"      TEXT,
  "body"           TEXT,
  "category"       "NewsCategory" NOT NULL,
  "tags"           TEXT[] NOT NULL DEFAULT '{}',
  "author"         TEXT,

  "mediaType"      "NewsMediaType" NOT NULL DEFAULT 'none',
  "imageUrl"       TEXT,
  "imageAlt"       TEXT,
  "videoUrl"       TEXT,
  "videoThumbnail" TEXT,
  "videoProvider"  TEXT,

  "status"         "NewsArticleStatus" NOT NULL DEFAULT 'published',
  "isFeatured"     BOOLEAN NOT NULL DEFAULT FALSE,
  "isEditorsPick"  BOOLEAN NOT NULL DEFAULT FALSE,
  "relevanceScore" INTEGER NOT NULL DEFAULT 0,

  "publishedAt"    TIMESTAMP(3) NOT NULL,
  "ingestedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "news_articles_sourceId_fkey"
    FOREIGN KEY ("sourceId") REFERENCES "news_sources"("id") ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS "news_articles_category_status_publishedAt_idx"
  ON "news_articles" ("category", "status", "publishedAt" DESC);

CREATE INDEX IF NOT EXISTS "news_articles_status_publishedAt_idx"
  ON "news_articles" ("status", "publishedAt" DESC);

CREATE INDEX IF NOT EXISTS "news_articles_isFeatured_publishedAt_idx"
  ON "news_articles" ("isFeatured", "publishedAt" DESC);

-- ── news_ingestion_runs ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "news_ingestion_runs" (
  "id"               TEXT PRIMARY KEY,
  "status"           "NewsIngestionStatus" NOT NULL DEFAULT 'running',
  "triggeredBy"      TEXT NOT NULL,
  "sourcesAttempted" INTEGER NOT NULL DEFAULT 0,
  "sourcesSucceeded" INTEGER NOT NULL DEFAULT 0,
  "sourcesFailed"    INTEGER NOT NULL DEFAULT 0,
  "articlesFound"    INTEGER NOT NULL DEFAULT 0,
  "articlesCreated"  INTEGER NOT NULL DEFAULT 0,
  "articlesUpdated"  INTEGER NOT NULL DEFAULT 0,
  "articlesSkipped"  INTEGER NOT NULL DEFAULT 0,
  "aiEnrichments"    INTEGER NOT NULL DEFAULT 0,
  "aiFailures"       INTEGER NOT NULL DEFAULT 0,
  "durationMs"       INTEGER,
  "errorSummary"     TEXT,
  "metadata"         JSONB,
  "startedAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt"      TIMESTAMP(3)
);

CREATE INDEX IF NOT EXISTS "news_ingestion_runs_startedAt_idx"
  ON "news_ingestion_runs" ("startedAt" DESC);
