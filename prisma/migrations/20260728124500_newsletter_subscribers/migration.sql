-- Consent-based newsletter subscribers for GEM Security Intelligence Updates.
-- Public roles receive no direct table access; the application server is the only writer.

CREATE TABLE IF NOT EXISTS "newsletter_subscribers" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "source" TEXT NOT NULL DEFAULT 'gem_newsletter_page',
  "consent_text_version" TEXT NOT NULL,
  "consent_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "confirmed_at" TIMESTAMPTZ,
  "unsubscribed_at" TIMESTAMPTZ,
  "confirmation_token_hash" TEXT,
  "unsubscribe_token_hash" TEXT NOT NULL,
  "ip_hash" TEXT,
  "user_agent" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "newsletter_subscribers_status_check"
    CHECK ("status" IN ('pending', 'active', 'unsubscribed')),
  CONSTRAINT "newsletter_subscribers_email_lowercase_check"
    CHECK ("email" = LOWER("email"))
);

CREATE UNIQUE INDEX IF NOT EXISTS "newsletter_subscribers_email_key"
  ON "newsletter_subscribers" ("email");
CREATE UNIQUE INDEX IF NOT EXISTS "newsletter_subscribers_confirmation_token_hash_key"
  ON "newsletter_subscribers" ("confirmation_token_hash")
  WHERE "confirmation_token_hash" IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "newsletter_subscribers_unsubscribe_token_hash_key"
  ON "newsletter_subscribers" ("unsubscribe_token_hash");
CREATE INDEX IF NOT EXISTS "newsletter_subscribers_status_created_at_idx"
  ON "newsletter_subscribers" ("status", "created_at" DESC);

ALTER TABLE "newsletter_subscribers" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "newsletter_subscribers" FROM PUBLIC;
REVOKE ALL ON TABLE "newsletter_subscribers" FROM anon;
REVOKE ALL ON TABLE "newsletter_subscribers" FROM authenticated;
