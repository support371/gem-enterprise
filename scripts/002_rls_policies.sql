-- GEM Enterprise Row Level Security Policies

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'reviewer', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_select_admin" ON public.profiles FOR SELECT USING (is_admin());
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_update_admin" ON public.profiles FOR UPDATE USING (is_admin());

-- Organizations Policies
CREATE POLICY "organizations_select_own" ON public.organizations FOR SELECT USING (primary_contact_id = auth.uid());
CREATE POLICY "organizations_select_admin" ON public.organizations FOR SELECT USING (is_admin());
CREATE POLICY "organizations_insert_own" ON public.organizations FOR INSERT WITH CHECK (primary_contact_id = auth.uid());
CREATE POLICY "organizations_update_own" ON public.organizations FOR UPDATE USING (primary_contact_id = auth.uid());
CREATE POLICY "organizations_update_admin" ON public.organizations FOR UPDATE USING (is_admin());

-- KYC Applications Policies
CREATE POLICY "kyc_applications_select_own" ON public.kyc_applications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "kyc_applications_select_admin" ON public.kyc_applications FOR SELECT USING (is_admin());
CREATE POLICY "kyc_applications_insert_own" ON public.kyc_applications FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "kyc_applications_update_own" ON public.kyc_applications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "kyc_applications_update_admin" ON public.kyc_applications FOR UPDATE USING (is_admin());

-- KYC Documents Policies
CREATE POLICY "kyc_documents_select_own" ON public.kyc_documents FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.kyc_applications WHERE id = kyc_application_id AND user_id = auth.uid()));
CREATE POLICY "kyc_documents_select_admin" ON public.kyc_documents FOR SELECT USING (is_admin());
CREATE POLICY "kyc_documents_insert_own" ON public.kyc_documents FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.kyc_applications WHERE id = kyc_application_id AND user_id = auth.uid()));
CREATE POLICY "kyc_documents_update_admin" ON public.kyc_documents FOR UPDATE USING (is_admin());

-- KYC Reviews Policies (Admin only)
CREATE POLICY "kyc_reviews_select_admin" ON public.kyc_reviews FOR SELECT USING (is_admin());
CREATE POLICY "kyc_reviews_insert_admin" ON public.kyc_reviews FOR INSERT WITH CHECK (is_admin());

-- Decisions Policies
CREATE POLICY "decisions_select_own" ON public.decisions FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.kyc_applications WHERE id = kyc_application_id AND user_id = auth.uid()));
CREATE POLICY "decisions_select_admin" ON public.decisions FOR SELECT USING (is_admin());
CREATE POLICY "decisions_insert_admin" ON public.decisions FOR INSERT WITH CHECK (is_admin());

-- Entitlements Policies
CREATE POLICY "entitlements_select_own" ON public.entitlements FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "entitlements_select_admin" ON public.entitlements FOR SELECT USING (is_admin());
CREATE POLICY "entitlements_insert_admin" ON public.entitlements FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "entitlements_update_admin" ON public.entitlements FOR UPDATE USING (is_admin());
CREATE POLICY "entitlements_delete_admin" ON public.entitlements FOR DELETE USING (is_admin());

-- Products Policies (Public read, admin write)
CREATE POLICY "products_select_all" ON public.products FOR SELECT USING (true);
CREATE POLICY "products_insert_admin" ON public.products FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "products_update_admin" ON public.products FOR UPDATE USING (is_admin());
CREATE POLICY "products_delete_admin" ON public.products FOR DELETE USING (is_admin());

-- Portfolios Policies
CREATE POLICY "portfolios_select_member" ON public.portfolios FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.portfolio_memberships WHERE portfolio_id = id AND user_id = auth.uid()));
CREATE POLICY "portfolios_select_admin" ON public.portfolios FOR SELECT USING (is_admin());
CREATE POLICY "portfolios_insert_admin" ON public.portfolios FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "portfolios_update_admin" ON public.portfolios FOR UPDATE USING (is_admin());

-- Portfolio Memberships Policies
CREATE POLICY "portfolio_memberships_select_own" ON public.portfolio_memberships FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "portfolio_memberships_select_admin" ON public.portfolio_memberships FOR SELECT USING (is_admin());
CREATE POLICY "portfolio_memberships_insert_admin" ON public.portfolio_memberships FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "portfolio_memberships_update_admin" ON public.portfolio_memberships FOR UPDATE USING (is_admin());

-- Portfolio Products Policies
CREATE POLICY "portfolio_products_select_member" ON public.portfolio_products FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.portfolio_memberships WHERE portfolio_id = portfolio_products.portfolio_id AND user_id = auth.uid()));
CREATE POLICY "portfolio_products_select_admin" ON public.portfolio_products FOR SELECT USING (is_admin());
CREATE POLICY "portfolio_products_insert_admin" ON public.portfolio_products FOR INSERT WITH CHECK (is_admin());

-- Requests Policies
CREATE POLICY "requests_select_own" ON public.requests FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "requests_select_admin" ON public.requests FOR SELECT USING (is_admin());
CREATE POLICY "requests_insert_own" ON public.requests FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "requests_update_own" ON public.requests FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "requests_update_admin" ON public.requests FOR UPDATE USING (is_admin());

-- Support Tickets Policies
CREATE POLICY "support_tickets_select_own" ON public.support_tickets FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "support_tickets_select_admin" ON public.support_tickets FOR SELECT USING (is_admin());
CREATE POLICY "support_tickets_insert_own" ON public.support_tickets FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "support_tickets_update_own" ON public.support_tickets FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "support_tickets_update_admin" ON public.support_tickets FOR UPDATE USING (is_admin());

-- Ticket Messages Policies
CREATE POLICY "ticket_messages_select_own" ON public.ticket_messages FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.support_tickets WHERE id = ticket_id AND user_id = auth.uid()));
CREATE POLICY "ticket_messages_select_admin" ON public.ticket_messages FOR SELECT USING (is_admin());
CREATE POLICY "ticket_messages_insert_own" ON public.ticket_messages FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.support_tickets WHERE id = ticket_id AND user_id = auth.uid()));
CREATE POLICY "ticket_messages_insert_admin" ON public.ticket_messages FOR INSERT WITH CHECK (is_admin());

-- Notifications Policies
CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "notifications_insert_admin" ON public.notifications FOR INSERT WITH CHECK (is_admin() OR user_id = auth.uid());
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "notifications_delete_own" ON public.notifications FOR DELETE USING (user_id = auth.uid());

-- Messages Policies
CREATE POLICY "messages_select_own" ON public.messages FOR SELECT USING (sender_id = auth.uid() OR recipient_id = auth.uid());
CREATE POLICY "messages_insert_own" ON public.messages FOR INSERT WITH CHECK (sender_id = auth.uid());
CREATE POLICY "messages_update_recipient" ON public.messages FOR UPDATE USING (recipient_id = auth.uid());

-- Documents Policies
CREATE POLICY "documents_select_own" ON public.documents FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "documents_select_admin" ON public.documents FOR SELECT USING (is_admin());
CREATE POLICY "documents_insert_own" ON public.documents FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "documents_insert_admin" ON public.documents FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "documents_update_admin" ON public.documents FOR UPDATE USING (is_admin());
CREATE POLICY "documents_delete_admin" ON public.documents FOR DELETE USING (is_admin());

-- Audit Logs Policies (Admin only)
CREATE POLICY "audit_logs_select_admin" ON public.audit_logs FOR SELECT USING (is_admin());
CREATE POLICY "audit_logs_insert_all" ON public.audit_logs FOR INSERT WITH CHECK (true);

-- User Sessions Policies
CREATE POLICY "user_sessions_select_own" ON public.user_sessions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "user_sessions_insert_own" ON public.user_sessions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "user_sessions_delete_own" ON public.user_sessions FOR DELETE USING (user_id = auth.uid());
