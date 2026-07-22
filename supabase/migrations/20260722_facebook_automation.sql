-- Facebook Automation System Tables
-- Version: 1.0

-- Meta Connectors
CREATE TABLE IF NOT EXISTS public.meta_connectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  business_portfolio_id TEXT NOT NULL,
  business_portfolio_name TEXT NOT NULL,
  page_id TEXT NOT NULL,
  page_name TEXT NOT NULL,
  page_type TEXT DEFAULT 'BUSINESS',
  user_access_token_encrypted TEXT NOT NULL,
  page_access_token_encrypted TEXT NOT NULL,
  granted_permissions TEXT[] NOT NULL DEFAULT '{}',
  token_expires_at TIMESTAMPTZ,
  token_refresh_at TIMESTAMPTZ,
  last_token_refresh TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'EXPIRED', 'REVOKED', 'ERROR')),
  error_message TEXT,
  last_verified_at TIMESTAMPTZ,
  emergency_locked BOOLEAN DEFAULT FALSE,
  emergency_locked_at TIMESTAMPTZ,
  emergency_locked_by UUID REFERENCES auth.users(id),
  emergency_lock_reason TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(workspace_id, page_id)
);

CREATE INDEX idx_meta_connectors_workspace ON public.meta_connectors(workspace_id);
CREATE INDEX idx_meta_connectors_status ON public.meta_connectors(status);

-- Facebook Content Items
CREATE TABLE IF NOT EXISTS public.facebook_content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  connector_id UUID NOT NULL REFERENCES public.meta_connectors(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('TEXT', 'IMAGE', 'VIDEO', 'CAROUSEL', 'ARTICLE')),
  category TEXT NOT NULL,
  current_version_id UUID,
  scheduled_publish_time TIMESTAMPTZ,
  timezone TEXT DEFAULT 'America/New_York',
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'IN_REVIEW', 'APPROVED', 'SCHEDULED', 'SUBMITTED', 'PUBLISHED', 'FAILED', 'CANCELLED')),
  external_post_id TEXT,
  external_post_url TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(external_post_id)
);

CREATE INDEX idx_facebook_content_workspace ON public.facebook_content_items(workspace_id);
CREATE INDEX idx_facebook_content_status ON public.facebook_content_items(status);
CREATE INDEX idx_facebook_content_scheduled ON public.facebook_content_items(scheduled_publish_time);

-- Facebook Content Versions
CREATE TABLE IF NOT EXISTS public.facebook_content_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id UUID NOT NULL REFERENCES public.facebook_content_items(id) ON DELETE CASCADE,
  caption TEXT NOT NULL,
  hashtags TEXT[] NOT NULL DEFAULT '{}',
  destination_url TEXT,
  accessibility_text TEXT,
  video_captions TEXT,
  media_ids UUID[] NOT NULL DEFAULT '{}',
  version_number INT NOT NULL,
  content_hash TEXT NOT NULL,
  approval_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (approval_status IN ('PENDING', 'APPROVED', 'REJECTED', 'INVALIDATED')),
  approval_required_reason TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(content_item_id, version_number)
);

CREATE INDEX idx_facebook_versions_content ON public.facebook_content_versions(content_item_id);
CREATE INDEX idx_facebook_versions_approval ON public.facebook_content_versions(approval_status);

-- Facebook Approvals
CREATE TABLE IF NOT EXISTS public.facebook_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  content_version_id UUID NOT NULL REFERENCES public.facebook_content_versions(id) ON DELETE CASCADE,
  decision TEXT NOT NULL CHECK (decision IN ('APPROVED', 'REJECTED', 'CHANGES_REQUESTED')),
  decision_reason TEXT,
  compliance_check_passed BOOLEAN NOT NULL DEFAULT FALSE,
  compliance_issues TEXT[],
  brand_check_passed BOOLEAN NOT NULL DEFAULT FALSE,
  brand_issues TEXT[],
  factual_check_passed BOOLEAN NOT NULL DEFAULT FALSE,
  factual_issues TEXT[],
  approved_by UUID NOT NULL REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  invalidated_at TIMESTAMPTZ,
  invalidation_reason TEXT,
  UNIQUE(content_version_id)
);

CREATE INDEX idx_facebook_approvals_workspace ON public.facebook_approvals(workspace_id);
CREATE INDEX idx_facebook_approvals_approved_at ON public.facebook_approvals(approved_at);

-- Facebook Publishing Jobs
CREATE TABLE IF NOT EXISTS public.facebook_publishing_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  content_item_id UUID NOT NULL REFERENCES public.facebook_content_items(id) ON DELETE CASCADE,
  idempotency_key TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SUBMITTED', 'PUBLISHED', 'FAILED', 'CANCELLED')),
  attempt_number INT NOT NULL DEFAULT 1,
  max_retries INT NOT NULL DEFAULT 3,
  next_retry_at TIMESTAMPTZ,
  external_post_id TEXT,
  meta_response_code INT,
  meta_response_body JSONB,
  error_message TEXT,
  error_code TEXT,
  submitted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_facebook_jobs_workspace ON public.facebook_publishing_jobs(workspace_id);
CREATE INDEX idx_facebook_jobs_status ON public.facebook_publishing_jobs(status);
CREATE INDEX idx_facebook_jobs_idempotency ON public.facebook_publishing_jobs(idempotency_key);
CREATE INDEX idx_facebook_jobs_retry ON public.facebook_publishing_jobs(next_retry_at) WHERE status = 'PENDING';

-- Facebook Analytics Snapshots
CREATE TABLE IF NOT EXISTS public.facebook_analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  content_item_id UUID NOT NULL REFERENCES public.facebook_content_items(id) ON DELETE CASCADE,
  reach INT DEFAULT 0,
  impressions INT DEFAULT 0,
  clicks_all INT DEFAULT 0,
  link_clicks INT DEFAULT 0,
  reactions INT DEFAULT 0,
  comments INT DEFAULT 0,
  shares INT DEFAULT 0,
  video_plays_3sec INT DEFAULT 0,
  video_avg_watch_time_sec NUMERIC DEFAULT 0,
  snapshot_taken_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  days_since_publish INT,
  UNIQUE(content_item_id, snapshot_taken_at)
);

CREATE INDEX idx_facebook_analytics_workspace ON public.facebook_analytics_snapshots(workspace_id);
CREATE INDEX idx_facebook_analytics_content ON public.facebook_analytics_snapshots(content_item_id);

-- Facebook Audit Logs
CREATE TABLE IF NOT EXISTS public.facebook_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  details JSONB,
  actor_id UUID REFERENCES auth.users(id),
  actor_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_facebook_audit_workspace ON public.facebook_audit_logs(workspace_id);
CREATE INDEX idx_facebook_audit_created ON public.facebook_audit_logs(created_at);
CREATE INDEX idx_facebook_audit_action ON public.facebook_audit_logs(action_type);

-- Facebook Media Assets
CREATE TABLE IF NOT EXISTS public.facebook_media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('IMAGE', 'VIDEO')),
  mime_type TEXT NOT NULL,
  file_size_bytes INT,
  storage_path TEXT NOT NULL,
  storage_url TEXT NOT NULL,
  width INT,
  height INT,
  duration_seconds NUMERIC,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_facebook_media_workspace ON public.facebook_media_assets(workspace_id);

-- Facebook OAuth States
CREATE TABLE IF NOT EXISTS public.facebook_oauth_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state TEXT NOT NULL UNIQUE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_facebook_oauth_states_state ON public.facebook_oauth_states(state);
CREATE INDEX idx_facebook_oauth_states_expires ON public.facebook_oauth_states(expires_at);

-- Enable RLS
ALTER TABLE public.meta_connectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facebook_content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facebook_content_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facebook_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facebook_publishing_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facebook_analytics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facebook_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facebook_media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facebook_oauth_states ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view connectors in their workspace"
  ON public.meta_connectors FOR SELECT
  USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can view content in their workspace"
  ON public.facebook_content_items FOR SELECT
  USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can view versions in their workspace"
  ON public.facebook_content_versions FOR SELECT
  USING (content_item_id IN (SELECT id FROM public.facebook_content_items WHERE workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())));

CREATE POLICY "Users can view approvals in their workspace"
  ON public.facebook_approvals FOR SELECT
  USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can view jobs in their workspace"
  ON public.facebook_publishing_jobs FOR SELECT
  USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can view analytics in their workspace"
  ON public.facebook_analytics_snapshots FOR SELECT
  USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can view audit logs in their workspace"
  ON public.facebook_audit_logs FOR SELECT
  USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can view media in their workspace"
  ON public.facebook_media_assets FOR SELECT
  USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can view oauth states in their workspace"
  ON public.facebook_oauth_states FOR SELECT
  USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));
