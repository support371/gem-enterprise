-- GEM Enterprise Seed Data

-- Seed Products
INSERT INTO public.products (name, slug, description, category, required_entitlement, min_investment, risk_level, is_active) VALUES
('Cyber Shield Enterprise', 'cyber-shield-enterprise', 'Comprehensive enterprise cybersecurity protection with 24/7 SOC monitoring, threat detection, and incident response.', 'cybersecurity', 'cyber', 50000.00, 'low', true),
('Threat Intelligence Platform', 'threat-intel-platform', 'Advanced threat intelligence gathering and analysis platform for proactive security posture.', 'cybersecurity', 'cyber', 75000.00, 'low', true),
('Penetration Testing Suite', 'pentest-suite', 'Continuous penetration testing and vulnerability assessment services.', 'cybersecurity', 'cyber', 25000.00, 'low', true),
('Private Equity Fund I', 'pe-fund-i', 'Diversified private equity fund focusing on technology and healthcare sectors.', 'financial', 'financial', 500000.00, 'high', true),
('Fixed Income Portfolio', 'fixed-income', 'Conservative fixed income portfolio with investment-grade bonds and stable returns.', 'financial', 'financial', 250000.00, 'low', true),
('Growth Equity Fund', 'growth-equity', 'High-growth equity fund targeting emerging market leaders.', 'financial', 'financial', 350000.00, 'high', true),
('Commercial Real Estate Trust', 'commercial-reit', 'Diversified commercial real estate investment trust with Class A properties.', 'real_estate', 'real_estate', 1000000.00, 'medium', true),
('Residential Development Fund', 'residential-dev', 'Multi-family residential development fund focusing on urban growth markets.', 'real_estate', 'real_estate', 750000.00, 'medium', true),
('Industrial Logistics Portfolio', 'industrial-logistics', 'Industrial and logistics real estate portfolio positioned for e-commerce growth.', 'real_estate', 'real_estate', 500000.00, 'medium', true)
ON CONFLICT (slug) DO NOTHING;

-- Seed Portfolios
INSERT INTO public.portfolios (id, name, description, portfolio_type, target_return, risk_profile, is_active) VALUES
('00000000-0000-0000-0000-000000000001', 'Conservative Growth Portfolio', 'Balanced portfolio with emphasis on capital preservation and steady growth.', 'balanced', 8.50, 'conservative', true),
('00000000-0000-0000-0000-000000000002', 'Aggressive Growth Portfolio', 'High-growth portfolio targeting maximum returns with higher risk tolerance.', 'growth', 15.00, 'aggressive', true),
('00000000-0000-0000-0000-000000000003', 'Income Focus Portfolio', 'Income-generating portfolio with dividend stocks and fixed income securities.', 'income', 6.00, 'conservative', true),
('00000000-0000-0000-0000-000000000004', 'Real Assets Portfolio', 'Diversified real assets including real estate and infrastructure investments.', 'real_assets', 10.00, 'moderate', true),
('00000000-0000-0000-0000-000000000005', 'Cyber Defense Portfolio', 'Focused cybersecurity investment portfolio for comprehensive digital protection.', 'specialty', 0.00, 'low', true)
ON CONFLICT (id) DO NOTHING;
