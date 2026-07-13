-- GEM Enterprise Command Center operating layer proposal
--
-- IMPORTANT:
-- This file is intentionally stored under prisma/proposals rather than
-- prisma/migrations. It must not be applied automatically. Before promotion to
-- a real Prisma migration, review it together with prisma/schema.prisma,
-- generate a migration from the updated schema, test against a disposable
-- database, and obtain explicit production approval.

BEGIN;

CREATE TABLE IF NOT EXISTS enterprise_subscriptions (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  workspace_id TEXT,
  plan_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'trialing',
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  monthly_amount NUMERIC(18, 2),
  provider TEXT,
  provider_customer_reference TEXT,
  provider_subscription_reference TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT enterprise_subscriptions_status_check
    CHECK (status IN ('trialing', 'active', 'past_due', 'paused', 'cancelled', 'expired')),
  CONSTRAINT enterprise_subscriptions_monthly_amount_check
    CHECK (monthly_amount IS NULL OR monthly_amount >= 0),
  CONSTRAINT enterprise_subscriptions_organization_fk
    FOREIGN KEY (organization_id) REFERENCES tokmetric_organizations(id) ON DELETE CASCADE,
  CONSTRAINT enterprise_subscriptions_workspace_fk
    FOREIGN KEY (workspace_id) REFERENCES tokmetric_workspaces(id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS enterprise_subscriptions_provider_ref_uq
  ON enterprise_subscriptions(provider, provider_subscription_reference)
  WHERE provider IS NOT NULL AND provider_subscription_reference IS NOT NULL;
CREATE INDEX IF NOT EXISTS enterprise_subscriptions_org_status_idx
  ON enterprise_subscriptions(organization_id, status);
CREATE INDEX IF NOT EXISTS enterprise_subscriptions_workspace_idx
  ON enterprise_subscriptions(workspace_id);

CREATE TABLE IF NOT EXISTS enterprise_usage_records (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  workspace_id TEXT,
  metric TEXT NOT NULL,
  quantity NUMERIC(20, 6) NOT NULL,
  unit TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'internal',
  idempotency_key TEXT NOT NULL,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  safe_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT enterprise_usage_quantity_check CHECK (quantity >= 0),
  CONSTRAINT enterprise_usage_period_check CHECK (period_end > period_start),
  CONSTRAINT enterprise_usage_organization_fk
    FOREIGN KEY (organization_id) REFERENCES tokmetric_organizations(id) ON DELETE CASCADE,
  CONSTRAINT enterprise_usage_workspace_fk
    FOREIGN KEY (workspace_id) REFERENCES tokmetric_workspaces(id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS enterprise_usage_org_idempotency_uq
  ON enterprise_usage_records(organization_id, idempotency_key);
CREATE INDEX IF NOT EXISTS enterprise_usage_metric_period_idx
  ON enterprise_usage_records(organization_id, metric, period_start, period_end);
CREATE INDEX IF NOT EXISTS enterprise_usage_workspace_idx
  ON enterprise_usage_records(workspace_id);

CREATE TABLE IF NOT EXISTS enterprise_security_incidents (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  workspace_id TEXT,
  title TEXT NOT NULL,
  severity TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  source TEXT NOT NULL DEFAULT 'manual',
  correlation_id TEXT,
  assigned_user_id TEXT,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  safe_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT enterprise_security_severity_check
    CHECK (severity IN ('informational', 'low', 'medium', 'high', 'critical')),
  CONSTRAINT enterprise_security_status_check
    CHECK (status IN ('open', 'investigating', 'contained', 'resolved', 'closed', 'false_positive')),
  CONSTRAINT enterprise_security_organization_fk
    FOREIGN KEY (organization_id) REFERENCES tokmetric_organizations(id) ON DELETE CASCADE,
  CONSTRAINT enterprise_security_workspace_fk
    FOREIGN KEY (workspace_id) REFERENCES tokmetric_workspaces(id) ON DELETE SET NULL,
  CONSTRAINT enterprise_security_assignee_fk
    FOREIGN KEY (assigned_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS enterprise_security_org_correlation_uq
  ON enterprise_security_incidents(organization_id, correlation_id)
  WHERE correlation_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS enterprise_security_org_status_idx
  ON enterprise_security_incidents(organization_id, status, severity);
CREATE INDEX IF NOT EXISTS enterprise_security_detected_idx
  ON enterprise_security_incidents(detected_at DESC);

CREATE TABLE IF NOT EXISTS enterprise_compliance_controls (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  workspace_id TEXT,
  framework TEXT NOT NULL,
  control_code TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started',
  evidence_count INTEGER NOT NULL DEFAULT 0,
  owner_user_id TEXT,
  due_at TIMESTAMPTZ,
  last_reviewed_at TIMESTAMPTZ,
  safe_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT enterprise_compliance_status_check
    CHECK (status IN ('not_started', 'in_progress', 'ready', 'exception', 'failed', 'not_applicable')),
  CONSTRAINT enterprise_compliance_evidence_count_check CHECK (evidence_count >= 0),
  CONSTRAINT enterprise_compliance_organization_fk
    FOREIGN KEY (organization_id) REFERENCES tokmetric_organizations(id) ON DELETE CASCADE,
  CONSTRAINT enterprise_compliance_workspace_fk
    FOREIGN KEY (workspace_id) REFERENCES tokmetric_workspaces(id) ON DELETE SET NULL,
  CONSTRAINT enterprise_compliance_owner_fk
    FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS enterprise_compliance_control_uq
  ON enterprise_compliance_controls(organization_id, framework, control_code);
CREATE INDEX IF NOT EXISTS enterprise_compliance_status_due_idx
  ON enterprise_compliance_controls(organization_id, status, due_at);

CREATE TABLE IF NOT EXISTS enterprise_agents (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  workspace_id TEXT,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'disabled',
  autonomy_level TEXT NOT NULL DEFAULT 'recommend_only',
  requires_approval BOOLEAN NOT NULL DEFAULT TRUE,
  last_run_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ,
  last_error_code TEXT,
  safe_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT enterprise_agents_status_check
    CHECK (status IN ('disabled', 'ready', 'running', 'degraded', 'blocked')),
  CONSTRAINT enterprise_agents_autonomy_check
    CHECK (autonomy_level IN ('recommend_only', 'draft_only', 'approval_required', 'bounded_autonomous')),
  CONSTRAINT enterprise_agents_organization_fk
    FOREIGN KEY (organization_id) REFERENCES tokmetric_organizations(id) ON DELETE CASCADE,
  CONSTRAINT enterprise_agents_workspace_fk
    FOREIGN KEY (workspace_id) REFERENCES tokmetric_workspaces(id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS enterprise_agents_org_name_uq
  ON enterprise_agents(organization_id, name);
CREATE INDEX IF NOT EXISTS enterprise_agents_status_idx
  ON enterprise_agents(organization_id, status);

CREATE TABLE IF NOT EXISTS enterprise_integrations (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  workspace_id TEXT,
  provider TEXT NOT NULL,
  display_name TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'not_configured',
  granted_scopes TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  external_account_reference TEXT,
  last_health_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ,
  last_error_code TEXT,
  consecutive_failures INTEGER NOT NULL DEFAULT 0,
  safe_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT enterprise_integrations_state_check
    CHECK (state IN ('not_configured', 'authorization_required', 'connected', 'degraded', 'reauthorization_required', 'disabled', 'blocked')),
  CONSTRAINT enterprise_integrations_failures_check CHECK (consecutive_failures >= 0),
  CONSTRAINT enterprise_integrations_organization_fk
    FOREIGN KEY (organization_id) REFERENCES tokmetric_organizations(id) ON DELETE CASCADE,
  CONSTRAINT enterprise_integrations_workspace_fk
    FOREIGN KEY (workspace_id) REFERENCES tokmetric_workspaces(id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS enterprise_integrations_org_provider_ref_uq
  ON enterprise_integrations(organization_id, provider, external_account_reference)
  WHERE external_account_reference IS NOT NULL;
CREATE INDEX IF NOT EXISTS enterprise_integrations_state_idx
  ON enterprise_integrations(organization_id, state);
CREATE INDEX IF NOT EXISTS enterprise_integrations_health_idx
  ON enterprise_integrations(last_health_at DESC);

COMMIT;
