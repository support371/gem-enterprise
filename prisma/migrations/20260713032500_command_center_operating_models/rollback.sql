-- Disposable-environment rollback for command-center operating models.
-- Do not run in production without an approved data-retention and forward-recovery decision.

DROP TABLE IF EXISTS "enterprise_integration_health";
DROP TABLE IF EXISTS "enterprise_agent_runs";
DROP TABLE IF EXISTS "enterprise_agents";
DROP TABLE IF EXISTS "enterprise_risks";
DROP TABLE IF EXISTS "enterprise_compliance_tasks";
DROP TABLE IF EXISTS "enterprise_compliance_evidence";
DROP TABLE IF EXISTS "enterprise_compliance_controls";
DROP TABLE IF EXISTS "enterprise_compliance_frameworks";
DROP TABLE IF EXISTS "enterprise_security_incidents";
DROP TABLE IF EXISTS "enterprise_security_assets";
DROP TABLE IF EXISTS "enterprise_usage_records";
DROP TABLE IF EXISTS "enterprise_subscriptions";

DROP TYPE IF EXISTS "EnterpriseIntegrationHealthStatus";
DROP TYPE IF EXISTS "EnterpriseAgentRunStatus";
DROP TYPE IF EXISTS "EnterpriseGovernedAgentStatus";
DROP TYPE IF EXISTS "EnterpriseRiskStatus";
DROP TYPE IF EXISTS "EnterpriseComplianceTaskStatus";
DROP TYPE IF EXISTS "EnterpriseComplianceControlStatus";
DROP TYPE IF EXISTS "EnterpriseSeverity";
DROP TYPE IF EXISTS "EnterpriseSecurityIncidentStatus";
DROP TYPE IF EXISTS "EnterpriseSecurityAssetStatus";
DROP TYPE IF EXISTS "EnterpriseUsageRecordStatus";
DROP TYPE IF EXISTS "EnterpriseBillingInterval";
DROP TYPE IF EXISTS "EnterpriseSubscriptionStatus";
