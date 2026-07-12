import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/api/auth-helpers";
import {
  GEM_VERIFY_ALLOWED_MIME_TYPES,
  GEM_VERIFY_EVIDENCE_BUCKET,
  GEM_VERIFY_MAX_FILE_BYTES,
  getEvidenceVaultRuntimeReadiness,
} from "@/lib/kyc/evidence-vault";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CountRow = { count: bigint | number | string };
type BucketRow = {
  id: string;
  name: string;
  public: boolean;
  file_size_limit: bigint | number | string | null;
  allowed_mime_types: string[] | null;
};
type RlsRow = { table_name: string; rls_enabled: boolean };
type ScanStatusRow = { status: string; count: bigint | number | string };
type SchedulerRow = {
  jobname: string;
  schedule: string;
  active: boolean;
};

function count(rows: CountRow[]) {
  return Number(rows[0]?.count ?? 0);
}

function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function GET() {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  const runtimeReadiness = getEvidenceVaultRuntimeReadiness();

  try {
    const [
      evidenceRows,
      eventRows,
      validationRows,
      scanJobRows,
      scanStatusRows,
      policyRows,
      activePolicyRows,
      objectRows,
      bucketRows,
      rlsRows,
      schedulerRows,
    ] = await Promise.all([
      db.$queryRaw<CountRow[]>`
        SELECT count(*)::bigint AS count
        FROM public.gem_verify_evidence_items
      `,
      db.$queryRaw<CountRow[]>`
        SELECT count(*)::bigint AS count
        FROM public.gem_verify_evidence_access_events
      `,
      db.$queryRaw<CountRow[]>`
        SELECT count(*)::bigint AS count
        FROM public.gem_verify_evidence_validations
      `,
      db.$queryRaw<CountRow[]>`
        SELECT count(*)::bigint AS count
        FROM public.gem_verify_evidence_scan_jobs
      `,
      db.$queryRaw<ScanStatusRow[]>`
        SELECT status, count(*)::bigint AS count
        FROM public.gem_verify_evidence_scan_jobs
        GROUP BY status
        ORDER BY status
      `,
      db.$queryRaw<CountRow[]>`
        SELECT count(*)::bigint AS count
        FROM public.gem_verify_retention_policies
      `,
      db.$queryRaw<CountRow[]>`
        SELECT count(*)::bigint AS count
        FROM public.gem_verify_retention_policies
        WHERE is_active = true
      `,
      db.$queryRaw<CountRow[]>`
        SELECT count(*)::bigint AS count
        FROM storage.objects
        WHERE bucket_id = ${GEM_VERIFY_EVIDENCE_BUCKET}
      `,
      db.$queryRaw<BucketRow[]>`
        SELECT id, name, public, file_size_limit, allowed_mime_types
        FROM storage.buckets
        WHERE id = ${GEM_VERIFY_EVIDENCE_BUCKET}
        LIMIT 1
      `,
      db.$queryRaw<RlsRow[]>`
        SELECT c.relname AS table_name, c.relrowsecurity AS rls_enabled
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public'
          AND c.relname IN (
            'gem_verify_evidence_items',
            'gem_verify_evidence_access_events',
            'gem_verify_evidence_validations',
            'gem_verify_evidence_scan_jobs',
            'gem_verify_retention_policies'
          )
        ORDER BY c.relname
      `,
      db.$queryRaw<SchedulerRow[]>`
        SELECT jobname, schedule, active
        FROM cron.job
        WHERE jobname = 'gem_verify_stale_scan_fail_closed'
        LIMIT 1
      `,
    ]);

    const bucket = bucketRows[0] ?? null;
    const scheduler = schedulerRows[0] ?? null;
    const schedulerReady = Boolean(
      scheduler && scheduler.active && scheduler.schedule === "*/10 * * * *",
    );
    const schemaReady = rlsRows.length === 5;
    const rlsReady = schemaReady && rlsRows.every((row) => row.rls_enabled);
    const bucketMimeTypes = new Set(bucket?.allowed_mime_types ?? []);
    const bucketReady = Boolean(
      bucket &&
        bucket.public === false &&
        Number(bucket.file_size_limit ?? 0) === GEM_VERIFY_MAX_FILE_BYTES &&
        GEM_VERIFY_ALLOWED_MIME_TYPES.every((value) => bucketMimeTypes.has(value)),
    );
    const activeRetentionPolicies = count(activePolicyRows);
    const retentionReady =
      runtimeReadiness.retentionApproved && activeRetentionPolicies > 0;
    const readyForUpload =
      schemaReady &&
      rlsReady &&
      bucketReady &&
      schedulerReady &&
      runtimeReadiness.supabaseUrlConfigured &&
      runtimeReadiness.serviceRoleConfigured &&
      runtimeReadiness.scannerConfigured &&
      retentionReady &&
      runtimeReadiness.operationallyApproved &&
      runtimeReadiness.uploadActivationRequested;
    const scanJobsByStatus = Object.fromEntries(
      scanStatusRows.map((row) => [row.status, Number(row.count)]),
    );

    return json({
      ok: true,
      evaluatedAt: new Date().toISOString(),
      viewerRole: gate.session.role,
      vault: {
        name: "GEM Verify Secure Evidence Vault",
        bucket: GEM_VERIFY_EVIDENCE_BUCKET,
        private: bucket?.public === false,
        maxFileBytes: GEM_VERIFY_MAX_FILE_BYTES,
        allowedMimeTypes: GEM_VERIFY_ALLOWED_MIME_TYPES,
        failClosed: true,
        readyForUpload,
      },
      foundation: {
        schemaReady,
        rlsReady,
        bucketReady,
        appendOnlyAccessHistory: true,
        publicStoragePoliciesCreated: false,
        quarantinePathRequired: true,
        checksumValidationRequired: true,
        cleanScanRequiredForReviewerAccess: true,
        staleScanManualHoldEnabled: schedulerReady,
        staleScanScheduler: "supabase_pg_cron",
        staleScanSchedulerReady: schedulerReady,
        staleScanSchedule: scheduler?.schedule ?? null,
        staleScanThresholdMinutes: 20,
      },
      runtime: {
        supabaseUrlConfigured: runtimeReadiness.supabaseUrlConfigured,
        serviceRoleConfigured: runtimeReadiness.serviceRoleConfigured,
        scannerMode: runtimeReadiness.scannerMode,
        firstPartyScannerSelected: runtimeReadiness.firstPartyScannerSelected,
        firstPartyScannerUrlExpected:
          runtimeReadiness.firstPartyScannerUrlExpected,
        firstPartyScannerUrlConfigured:
          runtimeReadiness.firstPartyScannerUrlConfigured,
        scannerEndpointConfigured:
          runtimeReadiness.scannerEndpointConfigured,
        scannerCallbackConfigured:
          runtimeReadiness.scannerCallbackConfigured,
        publicBaseUrlConfigured:
          runtimeReadiness.publicBaseUrlConfigured,
        scannerConfigured: runtimeReadiness.scannerConfigured,
        scannerAssurance: runtimeReadiness.scannerAssurance,
        antivirusEquivalent: runtimeReadiness.antivirusEquivalent,
        retentionApproved: runtimeReadiness.retentionApproved,
        operationallyApproved: runtimeReadiness.operationallyApproved,
        uploadActivationRequested:
          runtimeReadiness.uploadActivationRequested,
      },
      counts: {
        evidenceItems: count(evidenceRows),
        accessEvents: count(eventRows),
        validations: count(validationRows),
        scanJobs: count(scanJobRows),
        scanJobsByStatus,
        retentionPolicies: count(policyRows),
        activeRetentionPolicies,
        storedObjects: count(objectRows),
      },
      controls: [
        {
          id: "private-bucket",
          passed: bucketReady,
          detail: bucketReady
            ? "The evidence bucket is private and constrained to approved file types and size."
            : "The private evidence bucket is missing or misconfigured.",
        },
        {
          id: "row-level-security",
          passed: rlsReady,
          detail: rlsReady
            ? "RLS is enabled on all five evidence-control tables with no public policies."
            : "One or more evidence-control tables do not have RLS enabled.",
        },
        {
          id: "server-storage-credentials",
          passed:
            runtimeReadiness.supabaseUrlConfigured &&
            runtimeReadiness.serviceRoleConfigured,
          detail:
            runtimeReadiness.supabaseUrlConfigured &&
            runtimeReadiness.serviceRoleConfigured
              ? "Server-side storage credentials are configured."
              : "Server-side Supabase storage credentials are not configured in Vercel.",
        },
        {
          id: "first-party-scanner-selection",
          passed:
            runtimeReadiness.firstPartyScannerSelected &&
            runtimeReadiness.firstPartyScannerUrlConfigured,
          detail:
            runtimeReadiness.firstPartyScannerSelected &&
            runtimeReadiness.firstPartyScannerUrlConfigured
              ? "GEM's first-party scanner is selected at the approved internal route."
              : `Configure GEM_VERIFY_SCANNER_MODE=first_party and point GEM_VERIFY_SCANNER_URL to ${runtimeReadiness.firstPartyScannerUrlExpected}.`,
        },
        {
          id: "scanner-request-authentication",
          passed: runtimeReadiness.scannerEndpointConfigured,
          detail: runtimeReadiness.scannerEndpointConfigured
            ? "The scanning endpoint has a private request credential of the required length."
            : "The first-party scanner request credential is missing or too short.",
        },
        {
          id: "scanner-callback-authentication",
          passed:
            runtimeReadiness.scannerCallbackConfigured &&
            runtimeReadiness.publicBaseUrlConfigured,
          detail:
            runtimeReadiness.scannerCallbackConfigured &&
            runtimeReadiness.publicBaseUrlConfigured
              ? "Scanner callbacks use signed, time-limited authorization to the approved GEM origin."
              : "Scanner callback authentication or the public callback base URL is missing.",
        },
        {
          id: "scanner-assurance-disclosure",
          passed: runtimeReadiness.antivirusEquivalent === false,
          detail:
            "The scanner is correctly disclosed as structural file-safety validation, not antivirus-equivalent or identity-document authenticity proof.",
        },
        {
          id: "stale-scan-fail-closed",
          passed: schedulerReady,
          detail: schedulerReady
            ? "Supabase pg_cron checks every 10 minutes and moves scans incomplete beyond 20 minutes to manual hold without releasing evidence."
            : "The Supabase stale-scan fail-closed scheduler is missing, inactive, or on the wrong schedule.",
        },
        {
          id: "retention-policy",
          passed: retentionReady,
          detail: retentionReady
            ? `${activeRetentionPolicies} approved retention policy record(s) are active.`
            : "No approved active retention policy is available.",
        },
        {
          id: "operational-approval",
          passed: runtimeReadiness.operationallyApproved,
          detail: runtimeReadiness.operationallyApproved
            ? "Evidence intake has received explicit operational approval."
            : "Evidence intake has not received explicit operational approval.",
        },
        {
          id: "explicit-activation",
          passed: runtimeReadiness.uploadActivationRequested,
          detail: runtimeReadiness.uploadActivationRequested
            ? "The document upload activation flag is enabled."
            : "The document upload activation flag remains disabled.",
        },
      ],
    });
  } catch (error) {
    console.error("[GET /api/verify/evidence/status]", error);
    return json(
      {
        ok: false,
        error: "Secure Evidence Vault status could not be evaluated.",
        diagnostic: "database_unavailable",
        vault: {
          name: "GEM Verify Secure Evidence Vault",
          bucket: GEM_VERIFY_EVIDENCE_BUCKET,
          private: true,
          maxFileBytes: GEM_VERIFY_MAX_FILE_BYTES,
          allowedMimeTypes: GEM_VERIFY_ALLOWED_MIME_TYPES,
          failClosed: true,
          readyForUpload: false,
        },
        foundation: {
          staleScanScheduler: "supabase_pg_cron",
          staleScanSchedulerReady: false,
          staleScanThresholdMinutes: 20,
        },
        runtime: {
          supabaseUrlConfigured: runtimeReadiness.supabaseUrlConfigured,
          serviceRoleConfigured: runtimeReadiness.serviceRoleConfigured,
          scannerMode: runtimeReadiness.scannerMode,
          firstPartyScannerSelected: runtimeReadiness.firstPartyScannerSelected,
          firstPartyScannerUrlExpected:
            runtimeReadiness.firstPartyScannerUrlExpected,
          firstPartyScannerUrlConfigured:
            runtimeReadiness.firstPartyScannerUrlConfigured,
          scannerEndpointConfigured:
            runtimeReadiness.scannerEndpointConfigured,
          scannerCallbackConfigured:
            runtimeReadiness.scannerCallbackConfigured,
          publicBaseUrlConfigured:
            runtimeReadiness.publicBaseUrlConfigured,
          scannerConfigured: runtimeReadiness.scannerConfigured,
          scannerAssurance: runtimeReadiness.scannerAssurance,
          antivirusEquivalent: runtimeReadiness.antivirusEquivalent,
          retentionApproved: runtimeReadiness.retentionApproved,
          operationallyApproved: runtimeReadiness.operationallyApproved,
          uploadActivationRequested:
            runtimeReadiness.uploadActivationRequested,
        },
      },
      503,
    );
  }
}
