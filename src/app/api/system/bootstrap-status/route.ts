import { NextResponse } from "next/server";
import {
  bootstrapGatewayStatus,
  shouldUseSupabaseGateway,
} from "@/lib/supabase-gateway";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function configured(name: string) {
  return Boolean(process.env[name]?.trim());
}

function configuredAny(names: string[]) {
  return names.some(configured);
}

function hasMinLength(name: string, minimum: number) {
  return (process.env[name]?.trim().length ?? 0) >= minimum;
}

export async function GET() {
  const databaseUrlConfigured = configuredAny([
    "POSTGRES_PRISMA_URL",
    "DATABASE_URL",
    "POSTGRES_URL",
    "NEON_DATABASE_URL",
  ]);
  const directDatabaseUrlExplicitlyConfigured = configuredAny([
    "POSTGRES_URL_NON_POOLING",
    "DATABASE_URL_UNPOOLED",
    "POSTGRES_URL_NO_SSL",
  ]);
  const directDatabaseUrlEffective =
    directDatabaseUrlExplicitlyConfigured || databaseUrlConfigured;
  const jwtSecretConfigured = hasMinLength("JWT_SECRET", 32);
  const dedicatedPasswordResetSecretConfigured = hasMinLength(
    "PASSWORD_RESET_SECRET",
    32,
  );
  const passwordResetSecretConfigured =
    dedicatedPasswordResetSecretConfigured || jwtSecretConfigured;
  const appUrlConfigured = configured("NEXT_PUBLIC_APP_URL");
  const smtpConfigured =
    configured("SMTP_HOST") &&
    configured("SMTP_PORT") &&
    configured("SMTP_USER") &&
    configured("SMTP_PASS") &&
    configuredAny(["EMAIL_FROM", "SMTP_FROM", "MAIL_FROM"]);

  const gatewaySelected = shouldUseSupabaseGateway();
  let gatewayOperational = false;
  let gatewayAdministratorConfigured: boolean | null = null;
  let gatewayDiagnostic = gatewaySelected ? "not_checked" : "not_selected";

  if (gatewaySelected) {
    try {
      const gateway = await bootstrapGatewayStatus<{
        configured: boolean;
        admin: unknown | null;
      }>();
      gatewayOperational = true;
      gatewayAdministratorConfigured = gateway.configured;
      gatewayDiagnostic = "ok";
    } catch {
      gatewayDiagnostic = "unavailable";
    }
  }

  const localPrismaOperationalRequirements =
    databaseUrlConfigured && jwtSecretConfigured;
  const coreReady =
    appUrlConfigured &&
    (gatewayOperational || localPrismaOperationalRequirements);
  const activeBackend = gatewayOperational
    ? "supabase_gateway"
    : databaseUrlConfigured
      ? "prisma"
      : "none";

  const storageUrlConfigured = configuredAny([
    "SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
  ]);
  const serviceRoleConfigured = configured("SUPABASE_SERVICE_ROLE_KEY");
  const storageConfigured = storageUrlConfigured && serviceRoleConfigured;

  const explicitScannerRequestSecret = hasMinLength(
    "GEM_VERIFY_SCANNER_TOKEN",
    32,
  );
  const explicitScannerCallbackSecret = hasMinLength(
    "GEM_VERIFY_SCANNER_CALLBACK_SECRET",
    32,
  );
  const scannerRequestCredentialConfigured =
    explicitScannerRequestSecret || jwtSecretConfigured;
  const scannerCallbackCredentialConfigured =
    explicitScannerCallbackSecret || jwtSecretConfigured;
  const scannerConfigured =
    process.env.GEM_VERIFY_SCANNER_MODE === "first_party" &&
    configured("GEM_VERIFY_SCANNER_URL") &&
    scannerRequestCredentialConfigured &&
    scannerCallbackCredentialConfigured &&
    configuredAny([
      "GEM_VERIFY_PUBLIC_BASE_URL",
      "NEXT_PUBLIC_APP_URL",
      "VERCEL_PROJECT_PRODUCTION_URL",
    ]);
  const scannerCredentialSource =
    explicitScannerRequestSecret && explicitScannerCallbackSecret
      ? "explicit_overrides"
      : jwtSecretConfigured
        ? "jwt_derived_domain_separated"
        : "missing";

  const retentionApproved =
    process.env.GEM_VERIFY_RETENTION_APPROVED === "true";
  const operationallyApproved =
    process.env.GEM_VERIFY_EVIDENCE_APPROVED === "true";
  const uploadActivationRequested =
    process.env.GEM_VERIFY_DOCUMENT_UPLOAD_ACTIVE === "true";

  const missingCore: string[] = [];
  if (!appUrlConfigured) missingCore.push("NEXT_PUBLIC_APP_URL");
  if (!gatewayOperational && !databaseUrlConfigured) {
    missingCore.push("SUPABASE_GATEWAY_OR_POSTGRES_PRISMA_URL");
  }
  if (!gatewayOperational && databaseUrlConfigured && !jwtSecretConfigured) {
    missingCore.push("JWT_SECRET");
  }

  const requiredForEvidence = [
    { name: "SUPABASE_URL", configured: storageUrlConfigured },
    { name: "SUPABASE_SERVICE_ROLE_KEY", configured: serviceRoleConfigured },
    {
      name: "GEM_VERIFY_SCANNER_MODE",
      configured: process.env.GEM_VERIFY_SCANNER_MODE === "first_party",
    },
    {
      name: "GEM_VERIFY_SCANNER_URL",
      configured: configured("GEM_VERIFY_SCANNER_URL"),
    },
    {
      name: "JWT_SECRET_OR_SCANNER_OVERRIDES",
      configured:
        scannerRequestCredentialConfigured &&
        scannerCallbackCredentialConfigured,
    },
  ];

  const evidenceInfrastructureReady = storageConfigured && scannerConfigured;
  const evidenceActivationReady =
    evidenceInfrastructureReady &&
    retentionApproved &&
    operationallyApproved &&
    uploadActivationRequested;
  const missingEvidence = requiredForEvidence
    .filter((item) => !item.configured)
    .map((item) => item.name);

  return NextResponse.json(
    {
      ok: true,
      service: "gem-enterprise-bootstrap-status",
      evaluatedAt: new Date().toISOString(),
      deployment: {
        commitSha: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ?? null,
        environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? null,
        projectIdMatchesCanonical:
          !process.env.VERCEL_PROJECT_ID ||
          process.env.VERCEL_PROJECT_ID === "prj_VDGqnA7wZt2E65LLvT94ZOpnYc2Z",
      },
      core: {
        ready: coreReady,
        activeBackend,
        gateway: {
          selected: gatewaySelected,
          operational: gatewayOperational,
          diagnostic: gatewayDiagnostic,
          administratorConfigured: gatewayAdministratorConfigured,
        },
        prisma: {
          databaseUrlConfigured,
          runtimeReady: localPrismaOperationalRequirements,
          directDatabaseUrlEffective,
          directDatabaseUrlExplicitlyConfigured,
          databaseAdministrationReady:
            databaseUrlConfigured && directDatabaseUrlExplicitlyConfigured,
        },
        authenticationConfigured:
          gatewayOperational || jwtSecretConfigured,
        authenticationSource: gatewayOperational
          ? "supabase_gateway"
          : jwtSecretConfigured
            ? "local_jwt"
            : "missing",
        passwordResetSigningConfigured: passwordResetSecretConfigured,
        dedicatedPasswordResetSecretConfigured,
        appUrlConfigured,
        smtpConfigured,
        missing: missingCore,
      },
      evidenceVault: {
        infrastructureReady: evidenceInfrastructureReady,
        activationReady: evidenceActivationReady,
        storageConfigured,
        scannerConfigured,
        scannerCredentialSource,
        staleScanScheduler: {
          provider: "supabase_pg_cron",
          expectedIntervalMinutes: 10,
          requiresVercelSecret: false,
        },
        retentionApproved,
        operationallyApproved,
        uploadActivationRequested,
        uploadsFailClosed: !evidenceActivationReady,
        missing: missingEvidence,
      },
      scanner: {
        mode: process.env.GEM_VERIFY_SCANNER_MODE ?? "not_configured",
        expectedEndpoint:
          "https://www.gemcybersecurityassist.com/api/verify/evidence/internal-scanner",
        selfTestEndpoint:
          "https://www.gemcybersecurityassist.com/api/verify/evidence/internal-scanner/self-test",
        assurance: "structural_file_safety_only",
        antivirusEquivalent: false,
      },
      safety: {
        secretValuesExposed: false,
        demoDataEnabled: process.env.SEED_DEMO_DATA === "true",
        automaticDatabasePushEnabled: process.env.AUTO_DB_PUSH === "true",
        automaticDatabaseSeedEnabled: process.env.AUTO_DB_SEED === "true",
        automaticMigrationEnabled: process.env.RUN_DB_MIGRATIONS === "true",
      },
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}
