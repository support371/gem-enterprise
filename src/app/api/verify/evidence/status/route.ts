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
      policyRows,
      activePolicyRows,
      objectRows,
      bucketRows,
      rlsRows,
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
            'gem_verify_retention_policies'
          )
        ORDER BY c.relname
      `,
    ]);

    const bucket = bucketRows[0] ?? null;
    const schemaReady = rlsRows.length === 4;
    const rlsReady = schemaReady && rlsRows.every((row) => row.rls_enabled);
    const bucketReady = Boolean(
      bucket &&
        bucket.public === false &&
        Number(bucket.file_size_limit ?? 0) === GEM_VERIFY_MAX_FILE_BYTES,
    );
    const activeRetentionPolicies = count(activePolicyRows);
    const retentionReady =
      runtimeReadiness.retentionApproved && activeRetentionPolicies > 0;
    const readyForUpload =
      schemaReady &&
      rlsReady &&
      bucketReady &&
      runtimeReadiness.supabaseUrlConfigured &&
      runtimeReadiness.serviceRoleConfigured &&
      runtimeReadiness.scannerConfigured &&
      retentionReady &&
      runtimeReadiness.operationallyApproved &&
      runtimeReadiness.uploadActivationRequested;

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
      },
      runtime: {
        supabaseUrlConfigured: runtimeReadiness.supabaseUrlConfigured,
        serviceRoleConfigured: runtimeReadiness.serviceRoleConfigured,
        scannerConfigured: runtimeReadiness.scannerConfigured,
        retentionApproved: runtimeReadiness.retentionApproved,
        operationallyApproved: runtimeReadiness.operationallyApproved,
        uploadActivationRequested:
          runtimeReadiness.uploadActivationRequested,
      },
      counts: {
        evidenceItems: count(evidenceRows),
        accessEvents: count(eventRows),
        validations: count(validationRows),
        retentionPolicies: count(policyRows),
        activeRetentionPolicies,
        storedObjects: count(objectRows),
      },
      controls: [
        {
          id: "private-bucket",
          passed: bucketReady,
          detail: bucketReady
            ? "The evidence bucket is private and constrained to the approved file limit."
            : "The private evidence bucket is missing or misconfigured.",
        },
        {
          id: "row-level-security",
          passed: rlsReady,
          detail: rlsReady
            ? "RLS is enabled on all evidence-control tables with no public policies."
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
          id: "malware-scanning",
          passed: runtimeReadiness.scannerConfigured,
          detail: runtimeReadiness.scannerConfigured
            ? "A scanning worker is configured."
            : "A malware-scanning worker has not been configured.",
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
        runtime: {
          supabaseUrlConfigured: runtimeReadiness.supabaseUrlConfigured,
          serviceRoleConfigured: runtimeReadiness.serviceRoleConfigured,
          scannerConfigured: runtimeReadiness.scannerConfigured,
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
