-- GEM Enterprise: Asset Recovery Reporting & Nexus Gateway (Transaction Queue)
-- Phase 3 Step 2 — Production schema for high-volume automated asset recovery
-- and crypto-fiat bridge transaction processing.

-- ============================================================================
-- ASSET RECOVERY REPORTING
-- Standardized schema for legal submissions and recovery tracking
-- ============================================================================

-- Recovery Case Status
CREATE TYPE recovery_case_status AS ENUM (
  'intake',
  'investigation',
  'tracing',
  'legal_review',
  'recovery_in_progress',
  'partial_recovery',
  'full_recovery',
  'closed',
  'dismissed'
);

-- Recovery Cases Table
CREATE TABLE IF NOT EXISTS public.asset_recovery_cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_number TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_analyst_id UUID REFERENCES public.profiles(id),

  -- Case Details
  title TEXT NOT NULL,
  description TEXT,
  status recovery_case_status DEFAULT 'intake',
  priority ticket_priority DEFAULT 'medium',

  -- Asset Information
  asset_type TEXT NOT NULL,  -- 'crypto', 'fiat', 'real_estate', 'mixed'
  asset_description TEXT,
  estimated_value DECIMAL(15,2),
  currency TEXT DEFAULT 'USD',

  -- Blockchain / Digital Asset Fields
  blockchain_network TEXT,   -- 'ethereum', 'bitcoin', 'solana', etc.
  wallet_addresses TEXT[],   -- Array of involved wallet addresses
  transaction_hashes TEXT[], -- Array of relevant tx hashes

  -- Legal
  jurisdiction TEXT,
  legal_reference TEXT,
  law_enforcement_case_id TEXT,
  court_order_reference TEXT,

  -- Recovery Outcome
  recovered_amount DECIMAL(15,2) DEFAULT 0,
  recovery_percentage DECIMAL(5,2) DEFAULT 0,
  recovery_method TEXT,

  -- Timestamps
  reported_at TIMESTAMPTZ DEFAULT NOW(),
  investigation_started_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recovery Reports (legal submission documents)
CREATE TABLE IF NOT EXISTS public.asset_recovery_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES public.asset_recovery_cases(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL,  -- 'initial_filing', 'progress_update', 'final_report', 'legal_submission'
  title TEXT NOT NULL,
  content TEXT,
  status TEXT DEFAULT 'draft',  -- 'draft', 'review', 'submitted', 'accepted'

  -- Metadata
  submitted_by UUID REFERENCES public.profiles(id),
  reviewed_by UUID REFERENCES public.profiles(id),
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,

  -- Attachments
  attachment_urls TEXT[],

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recovery Activity Log (audit trail per case)
CREATE TABLE IF NOT EXISTS public.asset_recovery_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES public.asset_recovery_cases(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- NEXUS GATEWAY — TRANSACTION QUEUE
-- Schema for crypto-fiat bridge with 10x throughput capacity
-- ============================================================================

-- Transaction Status
CREATE TYPE transaction_status AS ENUM (
  'pending',
  'validating',
  'processing',
  'settling',
  'completed',
  'failed',
  'cancelled',
  'reversed'
);

-- Transaction Type
CREATE TYPE transaction_type AS ENUM (
  'crypto_to_fiat',
  'fiat_to_crypto',
  'crypto_to_crypto',
  'fiat_transfer',
  'recovery_disbursement'
);

-- Transaction Queue (core bridge table)
CREATE TABLE IF NOT EXISTS public.transaction_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_ref TEXT UNIQUE NOT NULL,  -- External reference ID
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Transaction Details
  transaction_type transaction_type NOT NULL,
  status transaction_status DEFAULT 'pending',
  priority INTEGER DEFAULT 0,  -- Higher = processed first

  -- Source
  source_currency TEXT NOT NULL,        -- 'BTC', 'ETH', 'USD', etc.
  source_amount DECIMAL(18,8) NOT NULL,
  source_wallet_address TEXT,
  source_network TEXT,                  -- 'ethereum', 'bitcoin', 'bank_wire'

  -- Destination
  dest_currency TEXT NOT NULL,
  dest_amount DECIMAL(18,8),            -- Calculated after rate lock
  dest_wallet_address TEXT,
  dest_network TEXT,

  -- Rate & Fees
  exchange_rate DECIMAL(18,8),
  rate_locked_at TIMESTAMPTZ,
  rate_expires_at TIMESTAMPTZ,
  fee_amount DECIMAL(18,8) DEFAULT 0,
  fee_currency TEXT,

  -- Verification
  hmac_signature TEXT,                  -- HMAC-SHA256 signature for webhook verification
  idempotency_key TEXT UNIQUE,          -- Prevent duplicate processing
  ip_address INET,
  user_agent TEXT,

  -- Settlement
  settlement_tx_hash TEXT,
  settlement_network TEXT,
  settled_at TIMESTAMPTZ,

  -- Error Handling
  error_code TEXT,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  next_retry_at TIMESTAMPTZ,

  -- Compliance
  aml_check_status TEXT DEFAULT 'pending',  -- 'pending', 'passed', 'flagged', 'blocked'
  aml_check_completed_at TIMESTAMPTZ,
  risk_score INTEGER,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Transaction Audit Trail (immutable log of every state change)
CREATE TABLE IF NOT EXISTS public.transaction_audit_trail (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID NOT NULL REFERENCES public.transaction_queue(id) ON DELETE CASCADE,
  previous_status transaction_status,
  new_status transaction_status NOT NULL,
  actor_id UUID REFERENCES public.profiles(id),
  actor_type TEXT DEFAULT 'system',  -- 'system', 'user', 'admin', 'webhook'
  details JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exchange Rate Snapshots (for audit and rate-lock verification)
CREATE TABLE IF NOT EXISTS public.exchange_rate_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_currency TEXT NOT NULL,
  dest_currency TEXT NOT NULL,
  rate DECIMAL(18,8) NOT NULL,
  source_provider TEXT NOT NULL,  -- 'coingecko', 'binance', etc.
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES — Optimized for 10x throughput and reporting dashboards
-- ============================================================================

-- Asset Recovery indexes
CREATE INDEX idx_recovery_cases_user ON public.asset_recovery_cases(user_id);
CREATE INDEX idx_recovery_cases_status ON public.asset_recovery_cases(status);
CREATE INDEX idx_recovery_cases_status_created ON public.asset_recovery_cases(status, created_at DESC);
CREATE INDEX idx_recovery_cases_analyst ON public.asset_recovery_cases(assigned_analyst_id) WHERE assigned_analyst_id IS NOT NULL;
CREATE INDEX idx_recovery_cases_number ON public.asset_recovery_cases(case_number);
CREATE INDEX idx_recovery_reports_case ON public.asset_recovery_reports(case_id);
CREATE INDEX idx_recovery_reports_status ON public.asset_recovery_reports(status);
CREATE INDEX idx_recovery_activity_case ON public.asset_recovery_activity(case_id, created_at DESC);

-- Transaction Queue indexes (critical for throughput)
CREATE INDEX idx_tx_queue_status_priority ON public.transaction_queue(status, priority DESC, created_at ASC) WHERE status IN ('pending', 'validating', 'processing');
CREATE INDEX idx_tx_queue_user ON public.transaction_queue(user_id, created_at DESC);
CREATE INDEX idx_tx_queue_ref ON public.transaction_queue(transaction_ref);
CREATE INDEX idx_tx_queue_idempotency ON public.transaction_queue(idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE INDEX idx_tx_queue_settlement ON public.transaction_queue(status, next_retry_at) WHERE status = 'failed' AND retry_count < max_retries;
CREATE INDEX idx_tx_queue_aml ON public.transaction_queue(aml_check_status) WHERE aml_check_status IN ('pending', 'flagged');

-- Transaction Audit Trail indexes
CREATE INDEX idx_tx_audit_transaction ON public.transaction_audit_trail(transaction_id, created_at DESC);
CREATE INDEX idx_tx_audit_actor ON public.transaction_audit_trail(actor_id) WHERE actor_id IS NOT NULL;

-- Exchange Rate indexes
CREATE INDEX idx_exchange_rates_pair ON public.exchange_rate_snapshots(source_currency, dest_currency, valid_from DESC);

-- Existing table composite indexes (from Blueprint)
CREATE INDEX IF NOT EXISTS idx_kyc_applications_status_created ON public.kyc_applications(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status_priority ON public.support_tickets(status, priority);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read, created_at DESC);

-- ============================================================================
-- UPDATED_AT TRIGGERS for new tables
-- ============================================================================

CREATE TRIGGER update_recovery_cases_updated_at BEFORE UPDATE ON public.asset_recovery_cases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recovery_reports_updated_at BEFORE UPDATE ON public.asset_recovery_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tx_queue_updated_at BEFORE UPDATE ON public.transaction_queue FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.asset_recovery_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_recovery_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_recovery_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_audit_trail ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_rate_snapshots ENABLE ROW LEVEL SECURITY;

-- Recovery Cases: users see own, admins see all
CREATE POLICY "recovery_cases_select_own" ON public.asset_recovery_cases FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "recovery_cases_select_admin" ON public.asset_recovery_cases FOR SELECT USING (is_admin());
CREATE POLICY "recovery_cases_insert_own" ON public.asset_recovery_cases FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "recovery_cases_update_admin" ON public.asset_recovery_cases FOR UPDATE USING (is_admin());

-- Recovery Reports: linked to case ownership
CREATE POLICY "recovery_reports_select_own" ON public.asset_recovery_reports FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.asset_recovery_cases WHERE id = case_id AND user_id = auth.uid()));
CREATE POLICY "recovery_reports_select_admin" ON public.asset_recovery_reports FOR SELECT USING (is_admin());
CREATE POLICY "recovery_reports_insert_admin" ON public.asset_recovery_reports FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "recovery_reports_update_admin" ON public.asset_recovery_reports FOR UPDATE USING (is_admin());

-- Recovery Activity: linked to case ownership
CREATE POLICY "recovery_activity_select_own" ON public.asset_recovery_activity FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.asset_recovery_cases WHERE id = case_id AND user_id = auth.uid()));
CREATE POLICY "recovery_activity_select_admin" ON public.asset_recovery_activity FOR SELECT USING (is_admin());
CREATE POLICY "recovery_activity_insert_admin" ON public.asset_recovery_activity FOR INSERT WITH CHECK (is_admin() OR auth.uid() IS NOT NULL);

-- Transaction Queue: users see own, admins see all
CREATE POLICY "tx_queue_select_own" ON public.transaction_queue FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "tx_queue_select_admin" ON public.transaction_queue FOR SELECT USING (is_admin());
CREATE POLICY "tx_queue_insert_own" ON public.transaction_queue FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "tx_queue_update_admin" ON public.transaction_queue FOR UPDATE USING (is_admin());

-- Transaction Audit Trail: admin only (immutable log)
CREATE POLICY "tx_audit_select_admin" ON public.transaction_audit_trail FOR SELECT USING (is_admin());
CREATE POLICY "tx_audit_insert_system" ON public.transaction_audit_trail FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Exchange Rates: read by all authenticated, write by admin
CREATE POLICY "exchange_rates_select_auth" ON public.exchange_rate_snapshots FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "exchange_rates_insert_admin" ON public.exchange_rate_snapshots FOR INSERT WITH CHECK (is_admin());
