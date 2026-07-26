-- Cross-platform social connector authorization foundation.
-- This migration is additive and does not enable any external publishing action.

CREATE TABLE "social_connectors" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'AUTHORIZATION_REQUIRED',
    "display_name" TEXT NOT NULL,
    "external_account_key" TEXT NOT NULL DEFAULT 'default',
    "external_account_id" TEXT,
    "granted_scopes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "safe_metadata" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "disabled_at" TIMESTAMP(3),
    "last_health_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "social_connectors_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "social_connectors_provider_check" CHECK (
      "provider" IN ('META', 'X', 'LINKEDIN', 'YOUTUBE', 'NEXTDOOR')
    ),
    CONSTRAINT "social_connectors_state_check" CHECK (
      "state" IN (
        'AUTHORIZATION_REQUIRED',
        'AUTHORIZATION_PENDING',
        'CONNECTED',
        'DEGRADED',
        'TOKEN_EXPIRED',
        'REAUTHORIZATION_REQUIRED',
        'DISCONNECTED',
        'PLATFORM_APPROVAL_REQUIRED',
        'BLOCKED'
      )
    )
);

CREATE TABLE "social_connector_credentials" (
    "id" TEXT NOT NULL,
    "connector_id" TEXT NOT NULL,
    "reference_type" TEXT NOT NULL,
    "secret_ref" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3),
    "refresh_expires_at" TIMESTAMP(3),
    "rotated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "social_connector_credentials_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "social_oauth_authorization_attempts" (
    "id" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "actor_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "encrypted_code_verifier" TEXT,
    "requested_scopes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "redirect_uri" TEXT NOT NULL,
    "redirect_after" TEXT NOT NULL DEFAULT '/app/command-center/social-media',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "consumed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "social_oauth_authorization_attempts_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "social_oauth_authorization_attempts_provider_check" CHECK (
      "provider" IN ('META', 'X', 'LINKEDIN', 'YOUTUBE', 'NEXTDOOR')
    ),
    CONSTRAINT "social_oauth_redirect_after_check" CHECK (
      "redirect_after" LIKE '/%'
      AND "redirect_after" NOT LIKE '//%'
      AND "redirect_after" NOT LIKE '%\\%'
    )
);

CREATE UNIQUE INDEX "social_connectors_workspace_provider_account_key"
ON "social_connectors"("workspace_id", "provider", "external_account_key");

CREATE INDEX "social_connectors_workspace_state_idx"
ON "social_connectors"("workspace_id", "state");

CREATE UNIQUE INDEX "social_connector_credentials_connector_reference_key"
ON "social_connector_credentials"("connector_id", "reference_type");

CREATE UNIQUE INDEX "social_oauth_authorization_attempts_nonce_key"
ON "social_oauth_authorization_attempts"("nonce");

CREATE INDEX "social_oauth_authorization_attempts_workspace_provider_idx"
ON "social_oauth_authorization_attempts"("workspace_id", "provider", "created_at");

ALTER TABLE "social_connectors"
ADD CONSTRAINT "social_connectors_workspace_id_fkey"
FOREIGN KEY ("workspace_id") REFERENCES "tokmetric_workspaces"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "social_connector_credentials"
ADD CONSTRAINT "social_connector_credentials_connector_id_fkey"
FOREIGN KEY ("connector_id") REFERENCES "social_connectors"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "social_oauth_authorization_attempts"
ADD CONSTRAINT "social_oauth_authorization_attempts_workspace_id_fkey"
FOREIGN KEY ("workspace_id") REFERENCES "tokmetric_workspaces"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "social_oauth_authorization_attempts"
ADD CONSTRAINT "social_oauth_authorization_attempts_actor_id_fkey"
FOREIGN KEY ("actor_id") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- These tables contain authorization state and encrypted credential material.
-- They are never exposed through PostgREST. The application accesses them only
-- through its server-side database connection and protected API routes.
ALTER TABLE "social_connectors" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "social_connector_credentials" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "social_oauth_authorization_attempts" ENABLE ROW LEVEL SECURITY;

REVOKE ALL PRIVILEGES ON TABLE "social_connectors" FROM PUBLIC;
REVOKE ALL PRIVILEGES ON TABLE "social_connector_credentials" FROM PUBLIC;
REVOKE ALL PRIVILEGES ON TABLE "social_oauth_authorization_attempts" FROM PUBLIC;

DO $gem_social_privileges$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL PRIVILEGES ON TABLE "social_connectors" FROM anon;
    REVOKE ALL PRIVILEGES ON TABLE "social_connector_credentials" FROM anon;
    REVOKE ALL PRIVILEGES ON TABLE "social_oauth_authorization_attempts" FROM anon;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL PRIVILEGES ON TABLE "social_connectors" FROM authenticated;
    REVOKE ALL PRIVILEGES ON TABLE "social_connector_credentials" FROM authenticated;
    REVOKE ALL PRIVILEGES ON TABLE "social_oauth_authorization_attempts" FROM authenticated;
  END IF;
END
$gem_social_privileges$;
